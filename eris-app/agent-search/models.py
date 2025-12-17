"""
Pydantic models for structured LLM output
"""
from typing import List, Optional
from pydantic import BaseModel, Field


class SearchIntent(BaseModel):
    """Structured output from Gemini for understanding search intent"""
    
    entity_type: Optional[str] = Field(
        default=None,
        description="Single entity type: CRM, PMO, Training, Purchase, or null"
    )
    
    entity_types: List[str] = Field(
        default_factory=list,
        description="Entity types to search: CRM, PMO, Training, Purchase"
    )
    
    keywords: List[str] = Field(
        default_factory=list,
        description="Important keywords extracted from query"
    )
    
    status_filter: Optional[str] = Field(
        default=None,
        description="Status to filter by: Pending, Approved, In Progress, etc"
    )
    
    department_filter: Optional[str] = Field(
        default=None,
        description="Department to filter by: IT, Sales, HR, PMO, etc"
    )
    
    owner_filter: Optional[str] = Field(
        default=None,
        description="Owner name to filter by"
    )
    
    amount_filter: Optional[str] = Field(
        default=None,
        description="Amount filter expression like '>1000000' or '<500000'"
    )
    
    amount_filter: Optional[str] = Field(
        default=None,
        description="Amount filter expression like '>1000000' or '<500000'"
    )


class SearchResult(BaseModel):
    """Individual search result"""
    id: str
    referenceNo: str
    objectType: str
    title: str
    subtitle: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    ownerName: Optional[str] = None
    department: Optional[str] = None
    amount: Optional[float] = None
    relevance_score: float = 0.0


class SearchResponse(BaseModel):
    """Complete search response"""
    query: str
    intent: SearchIntent
    results: List[SearchResult]
    total_count: int
    duration_ms: int
