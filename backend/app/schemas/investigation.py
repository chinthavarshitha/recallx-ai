from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class RootCauseCard(BaseModel):
    title: str
    probability: float
    description: str
    is_verified_historical: bool = False
    historical_incident_id: Optional[str] = None
    historical_resolution: Optional[str] = None
    evidence: str

class SuggestedAction(BaseModel):
    id: str
    title: str
    action_cmd: Optional[str] = None
    explanation: str
    priority: str = "High"  # Critical, High, Medium, Low
    confidence: float = 0.9

class RecalledMemoryItem(BaseModel):
    id: str
    text: str
    type: str = "observation"  # observation, experience, fact, reflection
    score: Optional[float] = None
    timestamp: Optional[str] = None
    is_verified_fix: bool = False
    source_incident: Optional[str] = None

class InvestigationStartRequest(BaseModel):
    incident_id: str
    with_memory: bool = True
    custom_query: Optional[str] = None

class InvestigationMessageRequest(BaseModel):
    incident_id: str
    session_id: Optional[str] = None
    message: str
    with_memory: bool = True

class InvestigationResponse(BaseModel):
    session_id: str
    incident_id: str
    with_memory: bool
    summary: str
    reply: str
    root_causes: List[RootCauseCard] = []
    suggested_actions: List[SuggestedAction] = []
    recalled_memories: List[RecalledMemoryItem] = []
    evidence_notes: List[str] = []
    hindsight_status: str  # active, offline, empty
    llm_model: str
    created_at: datetime

class CompareMemoryRequest(BaseModel):
    incident_id: str

class CompareMemoryResponse(BaseModel):
    incident_id: str
    without_memory: InvestigationResponse
    with_memory: InvestigationResponse
    key_differences: List[str]
    time_saved_estimate: str
    accuracy_delta: str
