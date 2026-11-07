from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.services.incident_service import incident_service
from app.services.export_service import export_service
from app.services.agent_service import agent_service
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/export", tags=["Incident Export"])

@router.get("/incident/{incident_id}/pdf")
def export_incident_pdf(
    incident_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    incident = incident_service.get_incident(db, incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    pdf_buffer = export_service.generate_pdf_report(incident)
    safe_filename = f"RECALLX_Incident_{incident.id[:8]}.pdf"
    
    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={safe_filename}"}
    )

@router.get("/incident/{incident_id}/markdown")
def export_incident_markdown(
    incident_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    incident = incident_service.get_incident(db, incident_id)
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    md = agent_service.generate_postmortem(db, incident)
    return {
        "incident_id": incident.id,
        "filename": f"postmortem-{incident.id[:8]}.md",
        "content": md
    }
