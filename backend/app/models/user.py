import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
import enum
from app.database import Base

class UserRole(str, enum.Enum):
    ADMIN = "Admin"
    SRE_LEAD = "SRE_Lead"
    INCIDENT_COMMANDER = "Incident_Commander"
    DEVOPS_ENGINEER = "DevOps_Engineer"
    OBSERVER = "Observer"

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), default=UserRole.DEVOPS_ENGINEER.value, nullable=False)
    is_active = Column(Boolean, default=True)
    workspace_id = Column(String(36), ForeignKey("workspaces.id"), nullable=True)
    avatar_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    workspace = relationship("Workspace", back_populates="users")
    assigned_incidents = relationship("Incident", back_populates="assignee")
