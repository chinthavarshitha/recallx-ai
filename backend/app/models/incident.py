import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database import Base

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    workspace_id = Column(String(36), ForeignKey("workspaces.id"), nullable=False, index=True)
    
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    severity = Column(String(20), nullable=False, default="High")  # Critical, High, Medium, Low
    status = Column(String(20), nullable=False, default="Detected")  # Detected, Investigating, Mitigating, Resolved
    
    affected_services = Column(JSON, default=list)  # list of service names, e.g. ["payment-api", "postgres-primary"]
    infrastructure_details = Column(Text, nullable=True)  # e.g. Kubernetes v1.28, AWS us-east-1, RDS Aurora
    error_logs = Column(Text, nullable=True)
    stack_trace = Column(Text, nullable=True)
    
    # Root cause & resolution
    root_cause = Column(Text, nullable=True)
    resolution_steps = Column(Text, nullable=True)
    verified_resolution = Column(Text, nullable=True)
    is_verified = Column(Boolean, default=False)
    
    # Hindsight metadata
    hindsight_memory_id = Column(String(255), nullable=True)
    hindsight_synced = Column(Boolean, default=False)
    
    # Assignee & tracking
    assignee_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    investigation_notes = Column(Text, nullable=True)
    
    # Tags & Structured Timeline
    tags = Column(JSON, default=list)
    timeline = Column(JSON, default=list)  # List of { timestamp, author, message, type }
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)

    workspace = relationship("Workspace", back_populates="incidents")
    assignee = relationship("User", back_populates="assigned_incidents")
    investigations = relationship("InvestigationSession", back_populates="incident", cascade="all, delete-orphan")
