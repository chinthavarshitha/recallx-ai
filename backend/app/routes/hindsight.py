from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import Optional, List, Dict, Any
from datetime import datetime

from app.database import get_db
from app.models.user import User
from app.models.incident import Incident
from app.models.memory_log import MemoryOperationLog
from app.schemas.hindsight import (
    RetainRequest, RetainResponseSchema, RecallRequest, RecallResponseSchema,
    ReflectRequest, ReflectResponseSchema, BankStatusResponse, MemoryLogResponse
)
from app.services.hindsight_service import hindsight_service
from app.services.auth_service import get_current_user
from app.config import settings

router = APIRouter(prefix="/hindsight", tags=["Hindsight Memory Engine"])

@router.get("/health", response_model=BankStatusResponse)
def check_hindsight_health(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Real-time ping to official Hindsight client/server endpoint.
    Exposes genuine connection health, latency, and stored count.
    """
    bank_id = current_user.workspace.hindsight_bank_id if current_user.workspace else settings.DEFAULT_BANK_ID
    conn_info = hindsight_service.check_connection()

    # Query operational metrics
    total_stored = db.query(MemoryOperationLog).filter(
        MemoryOperationLog.bank_id == bank_id,
        MemoryOperationLog.operation_type == "retain"
    ).count()

    total_recalls = db.query(MemoryOperationLog).filter(
        MemoryOperationLog.bank_id == bank_id,
        MemoryOperationLog.operation_type == "recall"
    ).count()

    total_reflections = db.query(MemoryOperationLog).filter(
        MemoryOperationLog.bank_id == bank_id,
        MemoryOperationLog.operation_type == "reflect"
    ).count()

    last_log = db.query(MemoryOperationLog).filter(
        MemoryOperationLog.bank_id == bank_id
    ).order_by(MemoryOperationLog.created_at.desc()).first()

    status_str = "connected" if conn_info["connected"] else "offline (local fallback active)"

    return BankStatusResponse(
        bank_id=bank_id,
        status=status_str,
        base_url=conn_info["base_url"],
        sdk_version=conn_info["sdk_version"],
        total_memories_stored=total_stored,
        total_recalls_performed=total_recalls,
        total_reflections=total_reflections,
        last_sync=last_log.created_at.isoformat() if last_log else None,
        error_message=conn_info.get("error")
    )

@router.post("/retain", response_model=RetainResponseSchema)
def retain_memory(
    data: RetainRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    bank_id = data.bank_id or (current_user.workspace.hindsight_bank_id if current_user.workspace else settings.DEFAULT_BANK_ID)
    
    res = hindsight_service.retain_incident(
        db=db,
        workspace_id=current_user.workspace_id,
        bank_id=bank_id,
        incident_id="manual-entry",
        title="Manual Memory Ingestion",
        description=data.content,
        severity="Medium",
        affected_services=[],
        tags=data.tags or ["manual"]
    )
    
    return RetainResponseSchema(
        success=res.get("success", False),
        bank_id=bank_id,
        memory_id=str(res.get("memory_id", "")),
        message=f"Memory operation complete ({res.get('status')})",
        timestamp=datetime.utcnow().isoformat()
    )

@router.post("/recall", response_model=RecallResponseSchema)
def recall_memory(
    data: RecallRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    bank_id = data.bank_id or (current_user.workspace.hindsight_bank_id if current_user.workspace else settings.DEFAULT_BANK_ID)
    
    res = hindsight_service.recall_memories(
        db=db,
        workspace_id=current_user.workspace_id,
        bank_id=bank_id,
        query=data.query,
        tags=data.tags,
        budget=data.budget or "mid"
    )
    
    return RecallResponseSchema(
        bank_id=bank_id,
        query=data.query,
        results=res.get("results", []),
        total_recalled=res.get("total_recalled", 0),
        duration_ms=res.get("duration_ms", 0),
        status=res.get("status", "offline")
    )

@router.post("/reflect", response_model=ReflectResponseSchema)
def reflect_memory(
    data: ReflectRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    bank_id = data.bank_id or (current_user.workspace.hindsight_bank_id if current_user.workspace else settings.DEFAULT_BANK_ID)
    
    res = hindsight_service.reflect_on_patterns(
        db=db,
        workspace_id=current_user.workspace_id,
        bank_id=bank_id,
        query=data.query,
        budget=data.budget or "low"
    )
    
    return ReflectResponseSchema(
        bank_id=bank_id,
        query=data.query,
        answer=res.get("answer", ""),
        duration_ms=res.get("duration_ms", 0),
        status=res.get("status", "offline")
    )

@router.get("/logs", response_model=List[MemoryLogResponse])
def get_memory_logs(
    limit: int = Query(25, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    logs = db.query(MemoryOperationLog).filter(
        MemoryOperationLog.workspace_id == current_user.workspace_id
    ).order_by(MemoryOperationLog.created_at.desc()).limit(limit).all()
    
    return [
        MemoryLogResponse(
            id=log.id,
            bank_id=log.bank_id,
            operation_type=log.operation_type,
            query_or_content=log.query_or_content,
            status=log.status,
            latency_ms=log.latency_ms,
            recalled_count=log.recalled_count,
            created_at=log.created_at
        ) for log in logs
    ]

@router.get("/explorer")
def explore_memory_bank(
    search: Optional[str] = None,
    filter_type: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns comprehensive inventory of stored memories:
    Combines verified incident fixes, retained observations, and raw telemetry
    for full transparency into what the agent has learned.
    """
    bank_id = current_user.workspace.hindsight_bank_id if current_user.workspace else settings.DEFAULT_BANK_ID
    
    incidents = db.query(Incident).filter(
        Incident.workspace_id == current_user.workspace_id
    ).all()

    memories = []
    for inc in incidents:
        if inc.is_verified:
            memories.append({
                "id": f"hindsight-fix-{inc.id[:8]}",
                "bank_id": bank_id,
                "type": "verified_resolution",
                "title": f"Verified Fix: {inc.title}",
                "content": inc.verified_resolution or inc.resolution_steps,
                "root_cause": inc.root_cause,
                "incident_id": inc.id,
                "incident_title": inc.title,
                "severity": inc.severity,
                "services": inc.affected_services or [],
                "timestamp": inc.resolved_at.isoformat() if inc.resolved_at else inc.updated_at.isoformat(),
                "synced_to_hindsight": inc.hindsight_synced,
                "tags": inc.tags or []
            })
        if inc.error_logs:
            memories.append({
                "id": f"hindsight-telemetry-{inc.id[:8]}",
                "bank_id": bank_id,
                "type": "error_signature",
                "title": f"Error Signature: {inc.title}",
                "content": inc.error_logs[:600],
                "root_cause": inc.root_cause,
                "incident_id": inc.id,
                "incident_title": inc.title,
                "severity": inc.severity,
                "services": inc.affected_services or [],
                "timestamp": inc.created_at.isoformat(),
                "synced_to_hindsight": inc.hindsight_synced,
                "tags": ["telemetry", "error-logs"]
            })

    if search:
        s_lower = search.lower()
        memories = [m for m in memories if s_lower in m["title"].lower() or s_lower in str(m["content"]).lower()]

    if filter_type and filter_type.lower() != "all":
        memories = [m for m in memories if m["type"] == filter_type]

    return {
        "bank_id": bank_id,
        "total": len(memories),
        "memories": memories
    }
