from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class RetainRequest(BaseModel):
    bank_id: Optional[str] = None
    content: str
    context: Optional[str] = None
    metadata: Optional[Dict[str, str]] = None
    tags: Optional[List[str]] = None

class RetainResponseSchema(BaseModel):
    success: bool
    bank_id: str
    memory_id: Optional[str] = None
    message: str
    timestamp: str

class RecallRequest(BaseModel):
    bank_id: Optional[str] = None
    query: str
    types: Optional[List[str]] = None
    budget: Optional[str] = "mid"
    tags: Optional[List[str]] = None

class RecallItemSchema(BaseModel):
    id: str
    text: str
    type: str = "observation"
    score: Optional[float] = None
    timestamp: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class RecallResponseSchema(BaseModel):
    bank_id: str
    query: str
    results: List[RecallItemSchema]
    total_recalled: int
    duration_ms: int
    status: str

class ReflectRequest(BaseModel):
    bank_id: Optional[str] = None
    query: str
    budget: Optional[str] = "low"

class ReflectResponseSchema(BaseModel):
    bank_id: str
    query: str
    answer: str
    duration_ms: int
    status: str

class BankStatusResponse(BaseModel):
    bank_id: str
    status: str  # connected, unreachable, simulated
    base_url: str
    sdk_version: str
    total_memories_stored: int
    total_recalls_performed: int
    total_reflections: int
    last_sync: Optional[str] = None
    error_message: Optional[str] = None

class MemoryLogResponse(BaseModel):
    id: str
    bank_id: str
    operation_type: str
    query_or_content: str
    status: str
    latency_ms: int
    recalled_count: int
    created_at: datetime
