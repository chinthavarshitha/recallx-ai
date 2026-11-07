import sys
import os
import time

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.database import init_db, SessionLocal
from app.services.incident_service import incident_service
from app.services.hindsight_service import hindsight_service
from app.services.agent_service import agent_service
from app.services.export_service import export_service
from app.services.auth_service import hash_password, verify_password, create_access_token
from app.schemas.incident import IncidentCreate, IncidentUpdate, VerifyResolutionRequest

def test_full_platform_suite():
    print("=" * 60)
    print("RECALLX AI — ENTERPRISE VERIFICATION TEST SUITE")
    print("=" * 60)

    # 1. DB Init
    print("\n[TEST 1] Initializing Database & Seed Telemetry...")
    t0 = time.time()
    init_db()
    db = SessionLocal()
    incident_service.seed_initial_demo_data(db)
    print(f"  [OK] Database & Seed initial data ready ({time.time()-t0:.2f}s)")

    # 2. Auth Service
    print("\n[TEST 2] Testing Cryptographic Authentication...")
    pwd = "EnterpriseSecurePassword2026!"
    hashed = hash_password(pwd)
    assert verify_password(pwd, hashed) is True
    assert verify_password("WrongPassword", hashed) is False
    token = create_access_token({"sub": "test-user-id", "email": "commander@recallx.ai", "role": "Commander"})
    assert isinstance(token, str) and len(token) > 20
    print("  [OK] Password hashing, verification & JWT tokens validated")

    # 3. Incident Retrieval & Filtering
    print("\n[TEST 3] Testing Incident Management & Query Engine...")
    from app.models.workspace import Workspace
    ws = db.query(Workspace).first()
    workspace_id = ws.id if ws else "default"
    
    incidents = incident_service.get_incidents(db, workspace_id)
    assert incidents["total"] >= 2
    assert len(incidents["items"]) >= 2
    titles = [i.title for i in incidents["items"]]
    print(f"  [OK] Retrieved {incidents['total']} incidents:")
    for t in titles[:3]:
        print(f"    - {t}")

    # 4. Incident CRUD
    print("\n[TEST 4] Testing Incident Creation & Update...")
    created_inc = incident_service.create_incident(
        db=db,
        workspace_id=workspace_id,
        data=IncidentCreate(
            title="INC-9999: Automated Test Circuit Breaker Trip",
            description="High error rate triggered circuit breaker trip across payment microservices.",
            severity="High",
            status="Detected",
            affected_services=["payment-api", "circuit-breaker"],
            error_logs="CircuitBreakerOpenException: Failure rate 65% exceeded threshold 50%",
            tags=["test", "circuit-breaker"]
        ),
        author_name="Verification Suite"
    )
    assert created_inc.id is not None
    print(f"  [OK] Incident created successfully (ID: {created_inc.id[:8]}...)")

    updated_inc = incident_service.update_incident(
        db=db,
        incident_id=created_inc.id,
        data=IncidentUpdate(status="Investigating", description="Investigation started by AI Agent"),
        author_name="AI Agent"
    )
    assert updated_inc.status == "Investigating"
    print("  [OK] Incident status and timeline updated")

    # 5. Hindsight Health & Offline Resilience
    print("\n[TEST 5] Testing Hindsight Memory Integration Layer...")
    health = hindsight_service.check_connection()
    assert "connected" in health
    assert "sdk_version" in health
    print(f"  [OK] Hindsight SDK version: {health['sdk_version']} | Connected: {health['connected']} | Base URL: {health['base_url']}")

    # 6. Hindsight Retain & Recall Primitives
    print("\n[TEST 6] Testing Hindsight Retain & Recall Primitives...")
    retain_res = hindsight_service.retain_incident(
        db=db,
        workspace_id=workspace_id,
        bank_id="test-bank",
        incident_id=created_inc.id,
        title=created_inc.title,
        description=created_inc.description,
        severity=created_inc.severity,
        affected_services=created_inc.affected_services,
        error_logs=created_inc.error_logs,
        root_cause="Circuit breaker threshold was misconfigured for promo traffic surge.",
        verified_resolution="Scaled failure threshold to 80% and increased reset timeout from 5s to 30s.",
        is_verified=True
    )
    assert "status" in retain_res
    print(f"  [OK] Hindsight Retain completed with status: {retain_res['status']} ({retain_res['duration_ms']}ms)")

    recall_res = hindsight_service.recall_memories(
        db=db,
        workspace_id=workspace_id,
        bank_id="test-bank",
        query="Circuit breaker failure rate exceeded payment"
    )
    assert "results" in recall_res
    assert len(recall_res["results"]) > 0
    print(f"  [OK] Hindsight Recall retrieved {len(recall_res['results'])} matching memories (Top score: {recall_res['results'][0]['score']})")

    # 7. AI Investigation Engine (With vs Without Memory)
    print("\n[TEST 7] Testing AI Investigation Engine & Grounded Reasoning...")
    target_inc = next(i for i in incidents["items"] if "INC-2041" in i.title or "INC-2048" in i.title)
    
    inv_with_mem = agent_service.investigate_incident(db, target_inc, with_memory=True)
    assert len(inv_with_mem["root_causes"]) > 0
    assert len(inv_with_mem["suggested_actions"]) > 0
    print(f"  [OK] Investigation (With Hindsight): Generated {len(inv_with_mem['root_causes'])} root causes and {len(inv_with_mem['suggested_actions'])} actions")
    print(f"    - Summary: {inv_with_mem['summary'][:100]}...")

    inv_no_mem = agent_service.investigate_incident(db, target_inc, with_memory=False)
    assert len(inv_no_mem["root_causes"]) > 0
    print(f"  [OK] Investigation (Without Memory): Baseline hypotheses isolated correctly")

    # 8. BEFORE vs AFTER Hackathon Demonstration Engine
    print("\n[TEST 8] Testing Hackathon BEFORE vs AFTER Comparison Engine...")
    comp = agent_service.compare_investigation(db, target_inc)
    assert "without_memory" in comp
    assert "with_memory" in comp
    assert len(comp["key_differences"]) > 0
    print(f"  [OK] Demonstration Comparison Generated:")
    print(f"    - Time Saved Estimate: {comp['time_saved_estimate']}")
    print(f"    - Accuracy Delta: {comp['accuracy_delta']}")
    for diff in comp["key_differences"]:
        print(f"    - Diff: {diff}")

    # 9. Verify Resolution Workflow
    print("\n[TEST 9] Testing Engineering Verification & Memory Permanence...")
    verified_inc = incident_service.verify_resolution(
        db=db,
        incident_id=created_inc.id,
        data=VerifyResolutionRequest(
            verified_resolution="Updated circuit breaker failure rate threshold to 80% and deployed canary.",
            root_cause="Burst traffic triggered false-positive trip.",
            retain_to_hindsight=True
        ),
        author_name="Lead Commander"
    )
    assert verified_inc.is_verified is True
    assert verified_inc.status == "Resolved"
    print(f"  [OK] Incident verified, resolved, and retained into Hindsight memory bank")

    # 10. AI Postmortem Generation
    print("\n[TEST 10] Testing AI Postmortem Generator...")
    postmortem = agent_service.generate_postmortem(db, verified_inc)
    assert "# INCIDENT POSTMORTEM REPORT" in postmortem
    assert "Root Cause Analysis" in postmortem
    print("  [OK] Markdown postmortem successfully compiled")

    # 11. PDF Report Compilation
    print("\n[TEST 11] Testing ReportLab PDF Generation...")
    pdf_buffer = export_service.generate_pdf_report(verified_inc)
    pdf_bytes = pdf_buffer.getvalue()
    assert pdf_bytes.startswith(b"%PDF")
    assert len(pdf_bytes) > 1000
    print(f"  [OK] Enterprise PDF generated successfully ({len(pdf_bytes)} bytes)")

    # 12. Cleanup
    incident_service.delete_incident(db, created_inc.id)
    print("\n[TEST 12] Cleanup completed.")

    db.close()
    print("\n" + "="*60)
    print("ALL 12 VERIFICATION TESTS PASSED PERFECTLY!")
    print("="*60)

if __name__ == "__main__":
    test_full_platform_suite()
