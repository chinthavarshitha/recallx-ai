from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File
from sqlalchemy.orm import Session
from typing import Optional, List
import io

from app.database import get_db
from app.models.user import User
from app.schemas.incident import (
    IncidentCreate, IncidentUpdate, IncidentResponse, IncidentListResponse,
    VerifyResolutionRequest, TimelineEvent
)
from app.services.incident_service import incident_service
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/incidents", tags=["Incidents"])

@router.get("/", response_model=IncidentListResponse)
def list_incidents(
    status: Optional[str] = Query(None, description="Filter by status (Detected, Investigating, Mitigating, Resolved, or all)"),
    severity: Optional[str] = Query(None, description="Filter by severity (Critical, High, Medium, Low, or all)"),
    search: Optional[str] = Query(None, description="Search term for title or description"),
    sort_by: str = Query("created_at", description="Sort field"),
    sort_order: str = Query("desc", description="Sort order: asc or desc"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    result = incident_service.get_incidents(
        db=db,
        workspace_id=current_user.workspace_id,
        status=status,
        severity=severity,
        search=search,
        sort_by=sort_by,
        sort_order=sort_order,
        skip=skip,
        limit=limit
    )
    return IncidentListResponse(
        total=result["total"],
        items=[IncidentResponse.model_validate(inc) for inc in result["items"]]
    )

@router.get("/{incident_id}", response_model=IncidentResponse)
def get_incident(
    incident_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    incident = incident_service.get_incident(db, incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    return IncidentResponse.model_validate(incident)

@router.post("/", response_model=IncidentResponse, status_code=status.HTTP_201_CREATED)
def create_incident(
    data: IncidentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    incident = incident_service.create_incident(
        db=db,
        workspace_id=current_user.workspace_id,
        data=data,
        author_name=current_user.full_name
    )
    return IncidentResponse.model_validate(incident)

@router.put("/{incident_id}", response_model=IncidentResponse)
def update_incident(
    incident_id: str,
    data: IncidentUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    incident = incident_service.update_incident(
        db=db,
        incident_id=incident_id,
        data=data,
        author_name=current_user.full_name
    )
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    return IncidentResponse.model_validate(incident)

@router.delete("/{incident_id}")
def delete_incident(
    incident_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    success = incident_service.delete_incident(db, incident_id)
    if not success:
        raise HTTPException(status_code=404, detail="Incident not found")
    return {"success": True, "message": "Incident deleted successfully"}

@router.post("/{incident_id}/verify", response_model=IncidentResponse)
def verify_incident_resolution(
    incident_id: str,
    data: VerifyResolutionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    incident = incident_service.verify_resolution(
        db=db,
        incident_id=incident_id,
        data=data,
        author_name=current_user.full_name
    )
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    return IncidentResponse.model_validate(incident)

@router.post("/{incident_id}/timeline", response_model=IncidentResponse)
def add_timeline_note(
    incident_id: str,
    event: TimelineEvent,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    incident = incident_service.add_timeline_event(
        db=db,
        incident_id=incident_id,
        message=event.message,
        author=current_user.full_name,
        event_type=event.type or "note"
    )
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    return IncidentResponse.model_validate(incident)

@router.post("/{incident_id}/upload-logs")
async def upload_log_file(
    incident_id: str,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    content = await file.read()
    text = content.decode("utf-8", errors="replace")
    
    incident = incident_service.get_incident(db, incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    
    current_logs = incident.error_logs or ""
    incident.error_logs = f"{current_logs}\n--- Uploaded File: {file.filename} ---\n{text[:5000]}"
    db.commit()
    db.refresh(incident)
    return {"success": True, "filename": file.filename, "size_bytes": len(content)}
