from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List

from app.database import get_db
from app.models.user import User
from app.models.workspace import Workspace
from app.services.auth_service import get_current_user
from app.config import settings
from app.services.hindsight_service import hindsight_service

router = APIRouter(prefix="/workspace", tags=["Workspace & Settings"])

class SettingsUpdate(BaseModel):
    name: Optional[str] = None
    hindsight_bank_id: Optional[str] = None
    hindsight_api_url: Optional[str] = None
    hindsight_api_key: Optional[str] = None
    groq_api_key: Optional[str] = None
    groq_model: Optional[str] = None

@router.get("/settings")
def get_workspace_settings(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    ws = current_user.workspace
    bank_id = ws.hindsight_bank_id if ws else settings.DEFAULT_BANK_ID
    
    # Mask API keys for security
    groq_masked = f"{settings.GROQ_API_KEY[:4]}...{settings.GROQ_API_KEY[-4:]}" if len(settings.GROQ_API_KEY) > 8 else ("Configured" if settings.GROQ_API_KEY else "Not configured")
    hindsight_key_masked = f"{settings.HINDSIGHT_API_KEY[:4]}...{settings.HINDSIGHT_API_KEY[-4:]}" if len(settings.HINDSIGHT_API_KEY) > 8 else ("Configured" if settings.HINDSIGHT_API_KEY else "Not configured")

    return {
        "workspace_id": ws.id if ws else "default",
        "workspace_name": ws.name if ws else "SRE Enterprise",
        "hindsight_bank_id": bank_id,
        "hindsight_api_url": settings.HINDSIGHT_API_URL,
        "hindsight_api_key_status": hindsight_key_masked,
        "groq_api_key_status": groq_masked,
        "groq_model": settings.GROQ_MODEL,
        "current_user_role": current_user.role,
        "current_user_email": current_user.email
    }

@router.put("/settings")
def update_workspace_settings(
    data: SettingsUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    ws = current_user.workspace
    if ws and data.name:
        ws.name = data.name
    if ws and data.hindsight_bank_id:
        ws.hindsight_bank_id = data.hindsight_bank_id

    # Update runtime settings
    if data.hindsight_api_url:
        settings.HINDSIGHT_API_URL = data.hindsight_api_url
        hindsight_service.base_url = data.hindsight_api_url.rstrip('/')
    if data.hindsight_api_key:
        settings.HINDSIGHT_API_KEY = data.hindsight_api_key
        hindsight_service.api_key = data.hindsight_api_key
    if data.groq_api_key:
        settings.GROQ_API_KEY = data.groq_api_key
        from app.services.agent_service import agent_service
        agent_service.groq_api_key = data.groq_api_key
        from groq import Groq
        agent_service.client = Groq(api_key=data.groq_api_key)
    if data.groq_model:
        settings.GROQ_MODEL = data.groq_model
        from app.services.agent_service import agent_service
        agent_service.model = data.groq_model

    if ws:
        db.commit()
        db.refresh(ws)

    return {"success": True, "message": "Settings updated successfully"}

@router.get("/team")
def get_team_members(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    users = db.query(User).filter(User.workspace_id == current_user.workspace_id).all()
    return [
        {
            "id": u.id,
            "full_name": u.full_name,
            "email": u.email,
            "role": u.role,
            "avatar_url": u.avatar_url,
            "is_active": u.is_active,
            "created_at": u.created_at
        } for u in users
    ]
