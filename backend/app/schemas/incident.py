from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class TimelineEvent(BaseModel):
    timestamp: str
    author: str
    message: str
    type: str = "note"  # note, status_change, verified_resolution, memory_retained, agent_action

class IncidentBase(BaseModel):
    title: str
    description: str
    severity: str = "High"  # Critical, High, Medium, Low
    status: str = "Detected"  # Detected, Investigating, Mitigating, Resolved
    affected_services: List[str] = []
    infrastructure_details: Optional[str] = None
    error_logs: Optional[str] = None
    stack_trace: Optional[str] = None
    tags: List[str] = []
    assignee_id: Optional[str] = None

class IncidentCreate(IncidentBase):
    pass

class IncidentUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    severity: Optional[str] = None
    status: Optional[str] = None
    affected_services: Optional[List[str]] = None
    infrastructure_details: Optional[str] = None
    error_logs: Optional[str] = None
    stack_trace: Optional[str] = None
    root_cause: Optional[str] = None
    resolution_steps: Optional[str] = None
    verified_resolution: Optional[str] = None
    is_verified: Optional[bool] = None
    assignee_id: Optional[str] = None
    investigation_notes: Optional[str] = None
    tags: Optional[List[str]] = None

class VerifyResolutionRequest(BaseModel):
    verified_resolution: str
    root_cause: Optional[str] = None
    resolution_steps: Optional[str] = None
    retain_to_hindsight: bool = True

class IncidentResponse(IncidentBase):
    id: str
    workspace_id: str
    root_cause: Optional[str] = None
    resolution_steps: Optional[str] = None
    verified_resolution: Optional[str] = None
    is_verified: bool = False
    hindsight_memory_id: Optional[str] = None
    hindsight_synced: bool = False
    investigation_notes: Optional[str] = None
    timeline: List[Dict[str, Any]] = []
    created_at: datetime
    updated_at: datetime
    resolved_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class IncidentListResponse(BaseModel):
    total: int
    items: List[IncidentResponse]
