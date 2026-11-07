from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc

from app.models.incident import Incident
from app.models.workspace import Workspace
from app.models.user import User, UserRole
from app.schemas.incident import IncidentCreate, IncidentUpdate, VerifyResolutionRequest
from app.services.hindsight_service import hindsight_service
from app.services.auth_service import hash_password
from app.config import settings

class IncidentService:
    def get_incidents(
        self,
        db: Session,
        workspace_id: str,
        status: Optional[str] = None,
        severity: Optional[str] = None,
        search: Optional[str] = None,
        sort_by: str = "created_at",
        sort_order: str = "desc",
        skip: int = 0,
        limit: int = 50
    ) -> Dict[str, Any]:
        query = db.query(Incident).filter(Incident.workspace_id == workspace_id)

        if status and status.lower() != "all":
            query = query.filter(Incident.status == status)

        if severity and severity.lower() != "all":
            query = query.filter(Incident.severity == severity)

        if search:
            search_filter = or_(
                Incident.title.ilike(f"%{search}%"),
                Incident.description.ilike(f"%{search}%"),
                Incident.root_cause.ilike(f"%{search}%")
            )
            query = query.filter(search_filter)

        # Sorting
        sort_col = getattr(Incident, sort_by, Incident.created_at)
        if sort_order.lower() == "asc":
            query = query.order_by(asc(sort_col))
        else:
            query = query.order_by(desc(sort_col))

        total = query.count()
        items = query.offset(skip).limit(limit).all()
        return {"total": total, "items": items}

    def get_incident(self, db: Session, incident_id: str) -> Optional[Incident]:
        return db.query(Incident).filter(Incident.id == incident_id).first()

    def create_incident(
        self,
        db: Session,
        workspace_id: str,
        data: IncidentCreate,
        author_name: str = "DevOps Engineer"
    ) -> Incident:
        now_str = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
        initial_timeline = [
            {
                "timestamp": now_str,
                "author": author_name,
                "message": f"Incident declared with severity {data.severity}.",
                "type": "status_change"
            }
        ]
        if data.error_logs:
            initial_timeline.append({
                "timestamp": now_str,
                "author": "System Monitor",
                "message": "Telemetry and error stack traces ingested.",
                "type": "telemetry"
            })

        incident = Incident(
            workspace_id=workspace_id,
            title=data.title,
            description=data.description,
            severity=data.severity,
            status=data.status,
            affected_services=data.affected_services,
            infrastructure_details=data.infrastructure_details,
            error_logs=data.error_logs,
            stack_trace=data.stack_trace,
            assignee_id=data.assignee_id,
            tags=data.tags,
            timeline=initial_timeline
        )
        db.add(incident)
        db.commit()
        db.refresh(incident)
        return incident

    def update_incident(
        self,
        db: Session,
        incident_id: str,
        data: IncidentUpdate,
        author_name: str = "DevOps Engineer"
    ) -> Optional[Incident]:
        incident = self.get_incident(db, incident_id)
        if not incident:
            return None

        update_dict = data.model_dump(exclude_unset=True)
        timeline = list(incident.timeline or [])
        now_str = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")

        if "status" in update_dict and update_dict["status"] != incident.status:
            timeline.append({
                "timestamp": now_str,
                "author": author_name,
                "message": f"Status updated from '{incident.status}' to '{update_dict['status']}'.",
                "type": "status_change"
            })
            if update_dict["status"] == "Resolved" and not incident.resolved_at:
                incident.resolved_at = datetime.utcnow()

        if "severity" in update_dict and update_dict["severity"] != incident.severity:
            timeline.append({
                "timestamp": now_str,
                "author": author_name,
                "message": f"Severity escalated/adjusted from '{incident.severity}' to '{update_dict['severity']}'.",
                "type": "status_change"
            })

        for key, value in update_dict.items():
            setattr(incident, key, value)

        incident.timeline = timeline
        incident.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(incident)
        return incident

    def delete_incident(self, db: Session, incident_id: str) -> bool:
        incident = self.get_incident(db, incident_id)
        if not incident:
            return False
        db.delete(incident)
        db.commit()
        return True

    def verify_resolution(
        self,
        db: Session,
        incident_id: str,
        data: VerifyResolutionRequest,
        author_name: str = "Incident Commander"
    ) -> Optional[Incident]:
        """
        Marks an incident as verified by an engineer, sets status to Resolved,
        and retains the verified resolution into the Hindsight memory layer.
        """
        incident = self.get_incident(db, incident_id)
        if not incident:
            return None

        incident.verified_resolution = data.verified_resolution
        if data.root_cause:
            incident.root_cause = data.root_cause
        if data.resolution_steps:
            incident.resolution_steps = data.resolution_steps

        incident.is_verified = True
        incident.status = "Resolved"
        if not incident.resolved_at:
            incident.resolved_at = datetime.utcnow()

        now_str = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
        timeline = list(incident.timeline or [])
        timeline.append({
            "timestamp": now_str,
            "author": author_name,
            "message": "Verified resolution officially confirmed and certified by engineer.",
            "type": "verified_resolution"
        })

        # Hindsight Retain Step
        if data.retain_to_hindsight:
            workspace = incident.workspace
            bank_id = workspace.hindsight_bank_id if workspace else settings.DEFAULT_BANK_ID
            retain_res = hindsight_service.retain_incident(
                db=db,
                workspace_id=incident.workspace_id,
                bank_id=bank_id,
                incident_id=incident.id,
                title=incident.title,
                description=incident.description,
                severity=incident.severity,
                affected_services=incident.affected_services or [],
                error_logs=incident.error_logs,
                stack_trace=incident.stack_trace,
                root_cause=incident.root_cause,
                verified_resolution=incident.verified_resolution,
                is_verified=True,
                tags=incident.tags or []
            )
            incident.hindsight_memory_id = str(retain_res.get("memory_id", ""))
            incident.hindsight_synced = retain_res.get("success", False)
            
            timeline.append({
                "timestamp": now_str,
                "author": "Hindsight Memory Agent",
                "message": f"Verified resolution retained into Hindsight bank '{bank_id}'. Status: {retain_res.get('status')}.",
                "type": "memory_retained"
            })

        incident.timeline = timeline
        incident.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(incident)
        return incident

    def add_timeline_event(
        self,
        db: Session,
        incident_id: str,
        message: str,
        author: str = "DevOps Engineer",
        event_type: str = "note"
    ) -> Optional[Incident]:
        incident = self.get_incident(db, incident_id)
        if not incident:
            return None
        timeline = list(incident.timeline or [])
        timeline.append({
            "timestamp": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
            "author": author,
            "message": message,
            "type": event_type
        })
        incident.timeline = timeline
        incident.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(incident)
        return incident

    def seed_initial_demo_data(self, db: Session):
        """
        Seeds enterprise demo workspace, users, and the exact First vs Second incident scenario
        for the Hackathon presentation!
        """
        # 1. Create or get default workspace
        workspace = db.query(Workspace).filter(Workspace.slug == "sre-enterprise").first()
        if not workspace:
            workspace = Workspace(
                name="SRE & Core Infrastructure Team",
                slug="sre-enterprise",
                hindsight_bank_id=settings.DEFAULT_BANK_ID
            )
            db.add(workspace)
            db.commit()
            db.refresh(workspace)

        # 2. Create users
        commander = db.query(User).filter(User.email == "commander@recallx.ai").first()
        if not commander:
            commander = User(
                email="commander@recallx.ai",
                full_name="Sarah Chen (Lead Incident Commander)",
                hashed_password=hash_password("recallx2026"),
                role=UserRole.INCIDENT_COMMANDER.value,
                workspace_id=workspace.id,
                avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80"
            )
            db.add(commander)

        devops = db.query(User).filter(User.email == "alex.rivera@recallx.ai").first()
        if not devops:
            devops = User(
                email="alex.rivera@recallx.ai",
                full_name="Alex Rivera (Senior DevOps Engineer)",
                hashed_password=hash_password("recallx2026"),
                role=UserRole.DEVOPS_ENGINEER.value,
                workspace_id=workspace.id,
                avatar_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80"
            )
            db.add(devops)
        db.commit()

        # 3. Check if incidents exist
        existing_count = db.query(Incident).filter(Incident.workspace_id == workspace.id).count()
        if existing_count > 0:
            return

        # INCIDENT 1: THE PREVIOUS RESOLVED INCIDENT (Stored in Hindsight Memory)
        # Payment service fails with DB connection timeout -> verified fix retained.
        inc1_created = datetime.utcnow() - timedelta(days=2, hours=4)
        inc1_resolved = inc1_created + timedelta(minutes=48)
        inc1 = Incident(
            workspace_id=workspace.id,
            title="INC-2041: Payment Service Database Connection Pool Timeout",
            description="High checkout transaction volume during flash sale caused payment-api to fail acquiring database connections. Latency spiked from 45ms to 32,000ms, resulting in 504 Gateway Timeouts across Stripe and PayPal gateway workers.",
            severity="Critical",
            status="Resolved",
            affected_services=["payment-api", "postgres-primary", "checkout-web"],
            infrastructure_details="AWS EKS cluster prod-us-east-1 | RDS Aurora PostgreSQL 15.4 | PgBouncer sidecar",
            error_logs="""2026-11-05T14:22:01Z [payment-api] ERROR [org.hibernate.engine.jdbc.connections.internal.DatasourceConnectionProviderImpl] - Could not obtain connection to query metadata
org.postgresql.util.PSQLException: FATAL: remaining connection slots are reserved for non-replication superuser connections
2026-11-05T14:22:03Z [payment-api] ERROR [c.r.p.PaymentProcessor] - Connection acquisition timeout: elapsed 30005ms, active_connections=50, max_connections=50, queue_length=842
2026-11-05T14:22:07Z [envoy] 'POST /v2/charge' 504 upstream_request_timeout 30001ms""",
            stack_trace="""org.postgresql.util.PSQLException: FATAL: remaining connection slots are reserved for non-replication superuser connections
    at org.postgresql.core.v3.ConnectionFactoryImpl.doAuthentication(ConnectionFactoryImpl.java:643)
    at org.postgresql.core.v3.ConnectionFactoryImpl.tryConnect(ConnectionFactoryImpl.java:189)
    at com.zaxxer.hikari.pool.PoolBase.newConnection(PoolBase.java:359)
    at com.zaxxer.hikari.pool.HikariPool.checkEnginePool(HikariPool.java:428)""",
            root_cause="PgBouncer connection pool was throttled at 50 max_client_conn without transaction pooling. Flash sale surge exhausted all available slots while unjittered retry loops exacerbated saturation.",
            resolution_steps="1. Scaled PgBouncer deployment pool size.\n2. Enabled pool_mode = transaction.\n3. Updated application database configuration with exponential backoff and jitter.",
            verified_resolution="Scaled PgBouncer MAX_CLIENT_CONN from 50 to 250 in Helm values. Enabled transaction-level connection pooling and deployed exponential jitter in checkout-api database client library.",
            is_verified=True,
            hindsight_memory_id="mem-hindsight-inc-2041",
            hindsight_synced=True,
            assignee_id=commander.id,
            tags=["payment", "database", "pgbouncer", "timeout", "verified-fix"],
            timeline=[
                {"timestamp": (inc1_created).strftime("%Y-%m-%d %H:%M:%S UTC"), "author": "DataDog Alert", "message": "Triggered: Payment Gateway 504 spike (>15% failure rate).", "type": "status_change"},
                {"timestamp": (inc1_created + timedelta(minutes=12)).strftime("%Y-%m-%d %H:%M:%S UTC"), "author": "Sarah Chen", "message": "Investigating RDS Aurora connection metrics.", "type": "note"},
                {"timestamp": (inc1_created + timedelta(minutes=35)).strftime("%Y-%m-%d %H:%M:%S UTC"), "author": "Alex Rivera", "message": "Patched PgBouncer pool sizing in staging and confirmed 0 dropped connections.", "type": "agent_action"},
                {"timestamp": (inc1_resolved).strftime("%Y-%m-%d %H:%M:%S UTC"), "author": "Sarah Chen", "message": "Verified in production. Confirmed resolution stored to Hindsight Memory layer.", "type": "verified_resolution"}
            ],
            created_at=inc1_created,
            updated_at=inc1_resolved,
            resolved_at=inc1_resolved
        )
        db.add(inc1)

        # INCIDENT 2: THE NEW / SECOND SESSION INCIDENT (Similar error signature!)
        # Perfect for demonstrating that RECALLX recalls INC-2041 immediately.
        inc2_created = datetime.utcnow() - timedelta(minutes=18)
        inc2 = Incident(
            workspace_id=workspace.id,
            title="INC-2048: Checkout Payment Gateway Database Connection Timeout",
            description="Recurring database connection drop in European region deployment. Checkout-service pods are throwing connection acquisition timeouts to Postgres replica cluster under newly launched seasonal promo traffic.",
            severity="Critical",
            status="Investigating",
            affected_services=["payment-api", "checkout-web", "postgres-eu-replica"],
            infrastructure_details="GCP GKE cluster prod-europe-west1 | Cloud SQL PostgreSQL 15 | PgBouncer proxy",
            error_logs="""2026-11-07T14:15:11Z [checkout-service] ERROR [c.r.p.DatabasePoolManager] - ConnectionTimeoutException: Unable to acquire connection from pool within 30000ms!
Active connections: 50 / 50. Pending requests in backlog: 619.
2026-11-07T14:15:13Z [checkout-service] WARN [org.postgresql.Driver] - FATAL: sorry, too many clients already connected
2026-11-07T14:15:15Z [ingress-gateway] POST /v1/checkout/finalize returned HTTP 504 Gateway Timeout""",
            stack_trace="""com.zaxxer.hikari.pool.HikariPool$PoolInitializationException: Failed to initialize pool
org.postgresql.util.PSQLException: FATAL: sorry, too many clients already
    at com.zaxxer.hikari.pool.PoolBase.newConnection(PoolBase.java:364)
    at com.zaxxer.hikari.pool.HikariPool.getConnection(HikariPool.java:162)""",
            assignee_id=devops.id,
            tags=["payment", "checkout", "postgres", "connection-timeout"],
            timeline=[
                {"timestamp": inc2_created.strftime("%Y-%m-%d %H:%M:%S UTC"), "author": "PagerDuty", "message": "P1 Incident triggered: Checkout Payment Gateway Latency > 15,000ms.", "type": "status_change"},
                {"timestamp": (inc2_created + timedelta(minutes=4)).strftime("%Y-%m-%d %H:%M:%S UTC"), "author": "RECALLX AI Agent", "message": "Telemetry indexed. Hindsight Memory queried for matching historical root causes.", "type": "telemetry"}
            ],
            created_at=inc2_created,
            updated_at=datetime.utcnow()
        )
        db.add(inc2)

        # INCIDENT 3: REDIS CACHE EVICTION STORM
        inc3_created = datetime.utcnow() - timedelta(days=5, hours=2)
        inc3_resolved = inc3_created + timedelta(minutes=32)
        inc3 = Incident(
            workspace_id=workspace.id,
            title="INC-1992: Redis Cluster Eviction Storm and OOM Cascade",
            description="Session store Redis cluster maxmemory hit 100% capacity due to unindexed token sessions without TTL expiry, triggering aggressive volatile-lru thrashing.",
            severity="High",
            status="Resolved",
            affected_services=["redis-cluster", "auth-service", "session-store"],
            infrastructure_details="AWS ElastiCache Redis 7.0 Cluster Mode Enabled | 6 shards",
            error_logs="""OOM command not allowed when used memory > 'maxmemory'
Redis memory usage: 12.8GB / 12.8GB (100.0%)
evicted_keys rate: 42,000 keys/sec""",
            root_cause="User session JWT refresh tokens were written without TTL expirations, causing unbounded memory growth.",
            verified_resolution="Enforced 7-day TTL policy on all session tokens in Auth middleware and executed flush of orphaned legacy tokens.",
            is_verified=True,
            hindsight_memory_id="mem-hindsight-inc-1992",
            hindsight_synced=True,
            assignee_id=devops.id,
            tags=["redis", "cache", "oom", "auth", "verified-fix"],
            timeline=[
                {"timestamp": inc3_created.strftime("%Y-%m-%d %H:%M:%S UTC"), "author": "Monitor", "message": "Redis cluster maxmemory threshold alarm.", "type": "status_change"},
                {"timestamp": inc3_resolved.strftime("%Y-%m-%d %H:%M:%S UTC"), "author": "Alex Rivera", "message": "Patched token TTL. Stored verified fix in Hindsight.", "type": "verified_resolution"}
            ],
            created_at=inc3_created,
            updated_at=inc3_resolved,
            resolved_at=inc3_resolved
        )
        db.add(inc3)

        # INCIDENT 4: KAFKA CONSUMER LAG
        inc4_created = datetime.utcnow() - timedelta(hours=6)
        inc4 = Incident(
            workspace_id=workspace.id,
            title="INC-2045: Kafka Consumer Group Lag on Order Ingestion Queue",
            description="Order processing throughput fell behind ingestion rate. Consumer lag exceeded 1.2M messages on partition 4 and 7 due to slow external inventory service calls.",
            severity="High",
            status="Mitigating",
            affected_services=["kafka-cluster", "order-processor", "inventory-api"],
            infrastructure_details="Confluent Cloud Kafka | Topic: orders.created.v2",
            error_logs="Consumer group 'order-workers' lag: 1,241,890 messages. Rebalance in progress.",
            assignee_id=commander.id,
            tags=["kafka", "streaming", "consumer-lag", "orders"],
            timeline=[
                {"timestamp": inc4_created.strftime("%Y-%m-%d %H:%M:%S UTC"), "author": "Kafka Monitor", "message": "Lag alert exceeded SLA threshold of 100k messages.", "type": "status_change"}
            ],
            created_at=inc4_created,
            updated_at=datetime.utcnow()
        )
        db.add(inc4)

        db.commit()

incident_service = IncidentService()
