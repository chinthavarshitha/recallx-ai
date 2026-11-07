import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Integer, DateTime, ForeignKey, JSON
from app.database import Base

class MemoryOperationLog(Base):
    __tablename__ = "memory_operation_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    workspace_id = Column(String(36), ForeignKey("workspaces.id"), nullable=False, index=True)
    bank_id = Column(String(255), nullable=False, index=True)
    
    operation_type = Column(String(50), nullable=False)  # retain, recall, reflect, bank_sync
    query_or_content = Column(Text, nullable=False)
    status = Column(String(50), nullable=False)  # success, error, simulated, offline
    
    latency_ms = Column(Integer, default=0)
    recalled_count = Column(Integer, default=0)
    
    memory_id = Column(String(255), nullable=True)
    raw_response = Column(JSON, nullable=True)
    error_message = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
