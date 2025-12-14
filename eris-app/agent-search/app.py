"""
LangChain Agent Search - FastAPI service with Gemini + pgvector semantic search
"""
import os
import time
from typing import List, Optional
from contextlib import asynccontextmanager

import psycopg2
from psycopg2.extras import RealDictCursor
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain_core.prompts import ChatPromptTemplate

from models import SearchIntent, SearchResult, SearchResponse

# Global Embedding Model (Gemini)
EMBEDDING_MODEL = None

load_dotenv()

# Database connection
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://eris:eris.1234@postgres:5432/dashboard")
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

# Global LLM instance
llm = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize LLM and Embedding models on startup"""
    global llm, EMBEDDING_MODEL
    
    if GOOGLE_API_KEY:
        # 1. Initialize LLM (Gemini 2.5 Flash)
        llm = ChatGoogleGenerativeAI(
            model=GEMINI_MODEL,
            google_api_key=GOOGLE_API_KEY,
            temperature=0,
        )
        print(f"✅ Gemini LLM initialized: {GEMINI_MODEL}")
        
        # 2. Initialize Embeddings (Gemini Embeddings-001)
        try:
            EMBEDDING_MODEL = GoogleGenerativeAIEmbeddings(
                model="models/embedding-001",
                google_api_key=GOOGLE_API_KEY
            )
            print("✅ Gemini Embeddings initialized")
        except Exception as e:
            print(f"⚠️ Failed to init Embeddings: {e}")
    else:
        print("⚠️ No GOOGLE_API_KEY, running in fallback mode")
        
    yield
    print("🔴 Shutting down agent-search")


app = FastAPI(
    title="Agent Search",
    description="LangChain-powered semantic search with Gemini + pgvector",
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


# System prompt for understanding search intent
INTENT_PROMPT = ChatPromptTemplate.from_messages([
    ("system", """You are a search intent analyzer for an enterprise system. 
Analyze the user's search query and extract structured intent.

Available entity types: CRM, PMO, Training, Purchase
Available statuses: Pending, Approved, In Progress, In Planning, Completed, New, Qualified, Won, Proposal, Negotiation, active, prospect, In Review
Available departments: Sales, IT, HR, PMO, Finance, Procurement, Facilities

Rules:
- Extract entity_types based on context (pembelian/purchase/beli → Purchase, kursus/training/pelatihan → Training, proyek/project/konstruksi → PMO, pelanggan/customer/klien → CRM)
- Extract status if mentioned (pending, approved, completed, etc)
- Extract department if mentioned (IT, Sales, HR, etc)
- IMPORTANT: Keywords should ONLY contain specific search terms like product names (office equipment, data center, laptop, software). 
- Do NOT include words already mapped to entity_types (project, proyek, pembelian, purchase, kursus, training, customer, pelanggan)
- Do NOT include common words (yang, untuk, dan, semua, all, tampilkan, nilai, value, diatas, dibawah)
- Keywords should be in English to match database content. Translate Indonesian terms (peralatan kantor → office equipment)

Return JSON format only."""),
    ("human", "{query}")
])


def parse_intent_with_llm(query: str) -> SearchIntent:
    """Use Gemini to understand search intent"""
    global llm
    
    if not llm:
        # Fallback: basic keyword extraction
        return SearchIntent(
            keywords=query.lower().split(),
            entity_types=[]
        )
    
    try:
        # Use structured output
        structured_llm = llm.with_structured_output(SearchIntent)
        chain = INTENT_PROMPT | structured_llm
        intent = chain.invoke({"query": query})
        return intent
    except Exception as e:
        print(f"LLM error: {e}")
        return SearchIntent(keywords=query.lower().split())


def generate_embedding(text: str) -> Optional[List[float]]:
    """Generate embedding using sentence-transformers"""
    if EMBEDDING_MODEL is None:
        return None
    try:
        embedding = EMBEDDING_MODEL.encode(text, convert_to_numpy=True)
        return embedding.tolist()
    except Exception as e:
        print(f"Embedding error: {e}")
        return None


def execute_hybrid_search(intent: SearchIntent, query: str, limit: int = 100) -> List[dict]:
    """Execute hybrid search: pgvector semantic + SQL filters from LLM intent"""
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        # Build WHERE conditions from LLM intent
        conditions = []
        params = []
        
        # Entity type filter
        if intent.entity_types:
            placeholders = ", ".join(["%s"] * len(intent.entity_types))
            conditions.append(f'object_type IN ({placeholders})')
            params.extend(intent.entity_types)
        
        # Status filter
        if intent.status_filter:
            conditions.append('status ILIKE %s')
            params.append(f"%{intent.status_filter}%")
        
        # Department filter
        if intent.department_filter:
            conditions.append('department ILIKE %s')
            params.append(f"%{intent.department_filter}%")
        
        # Owner filter
        if intent.owner_filter:
            conditions.append('owner_name ILIKE %s')
            params.append(f"%{intent.owner_filter}%")
        
        # Amount filter - parse operator and value (e.g., "<8000000", ">1000000")
        if intent.amount_filter:
            import re
            match = re.match(r'([<>=]+)\s*(\d+)', intent.amount_filter)
            if match:
                operator = match.group(1)
                amount_value = int(match.group(2))
                # Map to valid SQL operators
                if operator in ['<', '>', '<=', '>=', '=']:
                    conditions.append(f'amount {operator} %s')
                    params.append(amount_value)
        
        # Keyword filter - apply to title, description, search_text
        if intent.keywords:
            for kw in intent.keywords:
                conditions.append('(title ILIKE %s OR description ILIKE %s OR search_text ILIKE %s)')
                params.extend([f"%{kw}%", f"%{kw}%", f"%{kw}%"])
        
        where_clause = " AND ".join(conditions) if conditions else "TRUE"
        
        # Try pgvector semantic search if embeddings available
        query_embedding = generate_embedding(query)
        
        if query_embedding:
            # Hybrid: pgvector similarity + LLM filters
            embedding_str = "[" + ",".join(map(str, query_embedding)) + "]"
            
            sql = f"""
                SELECT 
                    id, reference_no, object_type, title, subtitle,
                    description, status, owner_name, department, amount,
                    1 - (embedding <=> %s::vector) as similarity
                FROM search_index
                WHERE {where_clause} AND embedding IS NOT NULL
                ORDER BY embedding <=> %s::vector
                LIMIT %s
            """
            # Params order: embedding for SELECT, filters for WHERE, embedding for ORDER BY, limit
            cursor.execute(sql, [embedding_str] + params + [embedding_str, limit])
        else:
            # Fallback: keyword search with LLM filters
            keyword_condition = ""
            if intent.keywords:
                keyword_parts = []
                for kw in intent.keywords:
                    keyword_parts.append('search_text ILIKE %s')
                    params.append(f"%{kw}%")
                keyword_condition = " AND (" + " OR ".join(keyword_parts) + ")"
            
            sql = f"""
                SELECT 
                    id, reference_no, object_type, title, subtitle,
                    description, status, owner_name, department, amount,
                    1.0 as similarity
                FROM search_index
                WHERE {where_clause}{keyword_condition}
                ORDER BY updated_at DESC
                LIMIT %s
            """
            cursor.execute(sql, params + [limit])
        
        results = cursor.fetchall()
        cursor.close()
        conn.close()
        
        return [dict(row) for row in results]
    except Exception as e:
        print(f"Database error: {e}")
        import traceback
        traceback.print_exc()
        return []


@app.post("/embed")
async def generate_embeddings(request: dict):
    """
    Generate embeddings for a list of texts (used by Node.js indexer)
    Payload: {"texts": ["text1", "text2"]}
    """
    if not EMBEDDING_MODEL:
        raise HTTPException(status_code=503, detail="Embedding model not initialized")
        
    try:
        texts = request.get("texts", [])
        if not texts:
            return {"embeddings": []}
            
        print(f"🔤 Generating embeddings for {len(texts)} items")
        embeddings = EMBEDDING_MODEL.embed_documents(texts)
        return {"embeddings": embeddings}
    except Exception as e:
        print(f"❌ Embedding generation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/search", response_model=SearchResponse)
async def search(request: SearchRequest):
    """Main search endpoint using LLM for intent + pgvector for semantic matching"""
    start_time = time.time()
    
    query = request.query.strip()
    if not query:
        raise HTTPException(status_code=400, detail="Query cannot be empty")
    
    # Step 1: Parse intent with LLM
    intent = parse_intent_with_llm(query)
    print(f"🧠 Intent: {intent.model_dump_json()}")
    
    # Step 2: Execute hybrid search (pgvector + filters)
    raw_results = execute_hybrid_search(intent, query)
    print(f"🔍 Found {len(raw_results)} results")
    
    # Step 3: Convert to response format
    results = []
    for row in raw_results:
        results.append(SearchResult(
            id=row["id"],
            referenceNo=row["reference_no"],
            objectType=row["object_type"],
            title=row["title"],
            subtitle=row.get("subtitle"),
            description=row.get("description"),
            status=row.get("status"),
            ownerName=row.get("owner_name"),
            department=row.get("department"),
            amount=float(row["amount"]) if row.get("amount") else None,
            relevance_score=float(row.get("similarity", 1.0))
        ))
    
    # Pagination
    start_idx = (request.page - 1) * request.size
    end_idx = start_idx + request.size
    paginated_results = results[start_idx:end_idx]
    
    duration_ms = int((time.time() - start_time) * 1000)
    
    return SearchResponse(
        query=query,
        intent=intent,
        results=paginated_results,
        total_count=len(results),
        duration_ms=duration_ms
    )


@app.get("/health")
async def health():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "llm_available": llm is not None,
        "embeddings_available": EMBEDDING_MODEL is not None,
        "model": GEMINI_MODEL if llm else None
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port="8000")
