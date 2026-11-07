from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.investigation import (
    InvestigationStartRequest, InvestigationMessageRequest,
    InvestigationResponse, CompareMemoryRequest, CompareMemoryResponse
)
from app.services.agent_service import agent_service
from app.services.incident_service import incident_service
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/investigation", tags=["AI Investigation Engine"])

@router.post("/start", response_model=InvestigationResponse)
def start_investigation(
    data: InvestigationStartRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    incident = incident_service.get_incident(db, data.incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    result = agent_service.investigate_incident(
        db=db,
        incident=incident,
        with_memory=data.with_memory,
        custom_query=data.custom_query
    )
    return InvestigationResponse(**result)

@router.post("/message", response_model=InvestigationResponse)
def send_investigation_message(
    data: InvestigationMessageRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    incident = incident_service.get_incident(db, data.incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    result = agent_service.investigate_incident(
        db=db,
        incident=incident,
        with_memory=data.with_memory,
        custom_query=data.message
    )
    return InvestigationResponse(**result)

@router.post("/compare", response_model=CompareMemoryResponse)
def compare_investigation_with_and_without_memory(
    data: CompareMemoryRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    CRITICAL DEMO ENDPOINT:
    Runs both ungrounded baseline reasoning (without historical memory)
    and Hindsight memory recall on the incident, returning side-by-side
    analysis, verified fixes, and key differences.
    """
    incident = incident_service.get_incident(db, data.incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    comparison = agent_service.compare_investigation(db=db, incident=incident)
    return CompareMemoryResponse(**comparison)

@router.post("/{incident_id}/postmortem")
def generate_incident_postmortem(
    incident_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    incident = incident_service.get_incident(db, incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    postmortem_markdown = agent_service.generate_postmortem(db=db, incident=incident)
    return {
        "incident_id": incident.id,
        "title": incident.title,
        "postmortem_markdown": postmortem_markdown
    }
