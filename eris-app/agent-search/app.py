"""
LangChain Agent Search - FastAPI service with Intent Parsing
Uses Gemini 2.0 Flash for FAST intent parsing + Direct SQL queries
Two-stage approach: LLM Intent → Direct DB Query
"""
import os
import time
import json
import re
from typing import List, Dict, Any, Optional
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings

from models import SearchResponse, SearchResult, SearchIntent

load_dotenv()

# Database setup
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://eris:eris.1234@postgres:5432/dashboard")
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
# Use Gemini 2.0 Flash for SPEED
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")

# Global instances
llm = None
db_engine = None
embeddings = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize LLM and DB on startup"""
    global llm, db_engine, embeddings
    
    if GOOGLE_API_KEY:
        print(f"🔄 Initializing Fast Search Service with {GEMINI_MODEL}...")
        
        # 1. Initialize LLM (Gemini 2.0 Flash - FAST)
        llm = ChatGoogleGenerativeAI(
            model=GEMINI_MODEL,
            google_api_key=GOOGLE_API_KEY,
            temperature=0,
        )
        
        # 2. Initialize Embeddings (for /embed endpoint)
        embeddings = GoogleGenerativeAIEmbeddings(
            model="models/embedding-001",
            google_api_key=GOOGLE_API_KEY
        )
        
        # 3. Initialize Database Engine directly (no LangChain SQLDatabase)
        import sqlalchemy
        db_engine = sqlalchemy.create_engine(DATABASE_URL)
        
        print("✅ Fast Search Service initialized successfully")
    else:
        print("⚠️ No GOOGLE_API_KEY, Search will fail")
        
    yield
    print("🔴 Shutting down agent-search")


app = FastAPI(
    title="Agent Search (Fast Intent)",
    description="Fast Intent Parsing + Direct SQL",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class SearchRequest(BaseModel):
    query: str
    page: int = 1
    size: int = 20

class EmbedRequest(BaseModel):
    texts: List[str]


# ===== INTENT PARSING PROMPT (Small & Fast) =====
INTENT_PROMPT = """Parse this search query into structured intent. Return JSON only.

Available entity types: Purchase, Training, PMO, CRM
Available statuses: pending, completed, rejected, progress, approved, active

Indonesian translations:
- pembelian/beli = Purchase
- pelatihan/training = Training  
- proyek/project = PMO
- pelanggan/customer = CRM
- selesai = completed
- tertunda/pending = pending
- ditolak = rejected
- berjalan/progress = progress

Query: "{query}"

Return JSON:
{{"entity_type": "<type or null>", "status": "<status or null>", "keywords": ["word1", "word2"]}}

Rules:
1. entity_type: detected type or null if generic search
2. status: detected status filter or null
3. keywords: remaining search terms (translated to English)

Examples:
- "pembelian pending" → {{"entity_type": "Purchase", "status": "pending", "keywords": []}}
- "training completed" → {{"entity_type": "Training", "status": "completed", "keywords": []}}
- "office furniture" → {{"entity_type": null, "status": null, "keywords": ["office", "furniture"]}}
- "proyek progress" → {{"entity_type": "PMO", "status": "progress", "keywords": []}}

JSON only, no explanation:"""


def parse_intent(query: str) -> dict:
    """Use LLM to parse search intent (fast, small prompt)"""
    if not llm:
        return {"entity_type": None, "status": None, "keywords": query.split()}
    
    try:
        prompt = INTENT_PROMPT.format(query=query)
        response = llm.invoke(prompt)
        content = response.content.strip()
        
        # Clean JSON from markdown
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0]
        elif "```" in content:
            content = content.split("```")[1].split("```")[0]
        
        intent = json.loads(content)
        print(f"🎯 Parsed Intent: {intent}")
        return intent
    except Exception as e:
        print(f"⚠️ Intent parse error: {e}")
        return {"entity_type": None, "status": None, "keywords": query.split()}


def build_sql(intent: dict, limit: int = 20) -> str:
    """Build SQL query from parsed intent (no LLM, fast)"""
    entity_type = intent.get("entity_type")
    status = intent.get("status")
    keywords = intent.get("keywords", [])
    
    # Base query from search_index (already indexed, fast)
    conditions = []
    
    if entity_type:
        conditions.append(f"object_type = '{entity_type}'")
    
    if status:
        conditions.append(f"status ILIKE '%{status}%'")
    
    if keywords:
        keyword_conditions = []
        for kw in keywords:
            keyword_conditions.append(f"(title ILIKE '%{kw}%' OR search_text ILIKE '%{kw}%')")
        if keyword_conditions:
            conditions.append(f"({' OR '.join(keyword_conditions)})")
    
    where_clause = " AND ".join(conditions) if conditions else "1=1"
    
    sql = f"""
    SELECT 
        id,
        object_id,
        object_type as "objectType",
        reference_no as "referenceNo", 
        title,
        subtitle,
        description,
        status,
        owner_name as "ownerName",
        department,
        amount,
        updated_at
    FROM search_index
    WHERE {where_clause}
    ORDER BY updated_at DESC
    LIMIT {limit}
    """
    
    return sql.strip()


@app.post("/search", response_model=SearchResponse)
def search(request: SearchRequest):
    """
    Two-stage search:
    1. LLM parses intent (fast, small prompt with Gemini Flash)
    2. Direct SQL query (no LLM SQL generation)
    """
    start_time = time.time()
    
    if not db_engine:
        raise HTTPException(status_code=503, detail="Search service not initialized")

    query = request.query.strip()
    
    # Stage 1: Parse Intent with LLM (fast)
    intent_start = time.time()
    intent = parse_intent(query)
    intent_ms = int((time.time() - intent_start) * 1000)
    print(f"⚡ Intent parsing: {intent_ms}ms")
    
    # Stage 2: Build & Execute SQL (no LLM)
    sql_start = time.time()
    sql = build_sql(intent, request.size)
    print(f"📜 SQL: {sql}")
    
    try:
        import sqlalchemy
        with db_engine.connect() as conn:
            result = conn.execute(sqlalchemy.text(sql))
            rows = [dict(row._mapping) for row in result.fetchall()]
    except Exception as e:
        print(f"❌ SQL Error: {e}")
        rows = []
    
    sql_ms = int((time.time() - sql_start) * 1000)
    print(f"⚡ SQL execution: {sql_ms}ms")
    
    # Format Results
    search_results = []
    for row in rows:
        search_results.append(SearchResult(
            id=str(row.get("id", "")),
            referenceNo=str(row.get("referenceNo", "") or ""),
            objectType=str(row.get("objectType", "") or ""),
            title=str(row.get("title", "") or "Untitled"),
            subtitle=str(row.get("subtitle", "") or ""),
            description=str(row.get("description", "") or ""),
            status=str(row.get("status", "") or ""),
            ownerName=str(row.get("ownerName", "") or ""),
            department=str(row.get("department", "") or ""),
            amount=float(row.get("amount") or 0),
            relevance_score=1.0
        ))

    duration_ms = int((time.time() - start_time) * 1000)
    
    return SearchResponse(
        query=query,
        intent=SearchIntent(
            keywords=intent.get("keywords", []),
            entity_type=intent.get("entity_type"),
            status_filter=intent.get("status")
        ),
        results=search_results,
        total_count=len(search_results),
        duration_ms=duration_ms
    )


@app.post("/embed")
async def embed_text(request: EmbedRequest):
    """Generate embeddings for list of texts."""
    if not embeddings:
        raise HTTPException(status_code=503, detail="Embeddings service not initialized")
    
    try:
        vectors = embeddings.embed_documents(request.texts)
        return {"embeddings": vectors}
    except Exception as e:
        print(f"❌ Embed Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
async def health():
    return {
        "status": "healthy", 
        "llm_ready": llm is not None, 
        "db_ready": db_engine is not None,
        "mode": "Fast Intent Parser"
    }

@app.get("/test")
async def test_llm():
    if not llm: 
        return {"error": "LLM not initialized"}
    try:
        resp = llm.invoke("Hi")
        return {"response": resp.content}
    except Exception as e:
        return {"error": str(e)}
