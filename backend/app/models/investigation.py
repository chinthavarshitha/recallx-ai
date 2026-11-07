import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database import Base

class InvestigationSession(Base):
    __tablename__ = "investigation_sessions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    incident_id = Column(String(36), ForeignKey("incidents.id", ondelete="CASCADE"), nullable=False, index=True)
    workspace_id = Column(String(36), ForeignKey("workspaces.id"), nullable=False)
    
    title = Column(String(255), default="AI Agent Investigation")
    with_memory = Column(Boolean, default=True)  # True = With Hindsight, False = Baseline
    
    messages = Column(JSON, default=list)  # [ { role: 'user'|'assistant'|'system', content: str, timestamp: str, metadata: {} } ]
    root_causes = Column(JSON, default=list)  # [ { title, probability, description, is_verified_historical, evidence, past_incident_id } ]
    suggested_actions = Column(JSON, default=list)  # [ { id, title, action_cmd, explanation, priority, confidence } ]
    recalled_memories = Column(JSON, default=list)  # [ { id, text, type, score, timestamp, metadata } ]
    evidence_links = Column(JSON, default=list)  # [ { title, source, snippet, verification_status } ]
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    incident = relationship("Incident", back_populates="investigations")
