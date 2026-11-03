"""
Comprehensive Automated Verification Test Suite for J.A.R.V.I.S.
Sub-Branch Architecture & Departmental Division Autonomy.
Tests:
1. SubBranchRegistry Registration & Fleet Status Metrics
2. PersonalOpsBranch (Chief of Staff, Eisenhower Matrix, Strategic Opinions, Meetings)
3. EngineeringBranch (AST Syntax Audit, File/Folder Synthesis, Skill Discovery, Hermes)
4. CyberSentinelBranch (Hardware Telemetry, Anomaly Detection, Safety Gate, Lockdown)
5. CommunicationsBranch (WhatsApp 24/7 Daemon, Bilingual Care, Receptionist, Voice Notes)
6. DailyLifeBranch (Cognitive LifeGraph Nodes, Circadian Briefings, Bio-Wellness, Expenses)
7. PerceptionBranch (Active Screen Inspection, Screenshots, Window Focus)
8. JarvisOrchestrator Integration & Branch Delegation
"""

import sys
import os
import time
from typing import Dict, Any

# Ensure project root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# Reconfigure stdout/stderr to UTF-8 for Windows consoles
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

from core.sub_branches import (
    SubBranchRegistry,
    PersonalOpsBranch,
    EngineeringBranch,
    CyberSentinelBranch,
    CommunicationsBranch,
    DailyLifeBranch,
    PerceptionBranch,
    BranchResult
)
from core.orchestrator import JarvisOrchestrator


def run_sub_branch_tests():
    print("=" * 70)
    print("RUNNING J.A.R.V.I.S. SUB-BRANCH ARCHITECTURE VERIFICATION SUITE")
    print("=" * 70)

    # Initialize the Orchestrator with all subsystems
    orchestrator = JarvisOrchestrator()

    # -------------------------------------------------------------------------
    # TEST 1: SubBranchRegistry Fleet Overview & Integrity
    # -------------------------------------------------------------------------
    print("\n--- [TEST 1] SubBranchRegistry Fleet Overview & Integrity ---")
    registry = orchestrator.sub_branches
    fleet = registry.get_fleet_status()

    assert fleet["total_branches"] == 6, f"Expected 6 branches, found {fleet['total_branches']}"
    assert fleet["total_capabilities"] >= 20, f"Expected >= 20 capabilities, found {fleet['total_capabilities']}"
    assert fleet["total_specialist_roles"] >= 15, f"Expected >= 15 specialist roles, found {fleet['total_specialist_roles']}"

    speech_overview = registry.format_speech_overview(title="sir")
    assert "sub-branches are online" in speech_overview.lower(), "Speech overview failed"
    print(f" [PASS] Fleet contains {fleet['total_branches']} branches with {fleet['total_capabilities']} capabilities across {fleet['total_specialist_roles']} roles.")
    print(f" [PASS] Speech overview: {speech_overview}")

    # -------------------------------------------------------------------------
    # TEST 2: PersonalOpsBranch Execution (Chief of Staff & Eisenhower Matrix)
    # -------------------------------------------------------------------------
    print("\n--- [TEST 2] PersonalOpsBranch (Chief of Staff & Agenda Matrix) ---")
    p_branch = orchestrator.personal_ops_branch

    # A. Eisenhower Matrix Prioritization
    # Add a mock urgent task
    orchestrator.task_manager.add_task("Urgent critical system deployment for client release")
    orchestrator.task_manager.add_task("Review research paper on quantum neural networks")

    res_matrix = p_branch.execute("prioritize my tasks with eisenhower matrix", {"is_boss": True, "speaker_name": "Boss"})
    assert res_matrix.success, "Eisenhower prioritization failed!"
    assert res_matrix.action_taken == "eisenhower_prioritization"
    assert "quadrant_1_urgent_important" in res_matrix.data
    assert len(res_matrix.data["quadrant_1_urgent_important"]) >= 1, "Failed to classify urgent task into Q1"
    print(f" [PASS] Eisenhower matrix classified {res_matrix.data['total_evaluated']} tasks into 4 quadrants.")

    # B. Strategic Opinion & Advisory
    res_opinion = p_branch.execute("what do you think about migrating our database to distributed Cassandra?", {"is_boss": True})
    assert res_opinion.success, "Opinion advisory failed!"
    assert len(res_opinion.speech) > 20, "Opinion speech empty"
    print(f" [PASS] Strategic opinion generated: {res_opinion.speech[:90]}...")

    # C. Meeting Scheduling
    res_meet = p_branch.execute("schedule meeting with Pepper Potts at 14:00", {"is_boss": True})
    assert res_meet.success, "Meeting scheduling failed!"
    assert "Pepper Potts" in res_meet.speech, "Meeting title missing from speech"
    print(f" [PASS] Meeting scheduled: {res_meet.speech}")

    # -------------------------------------------------------------------------
    # TEST 3: EngineeringBranch Execution (Syntax Audit & Skills Engine)
    # -------------------------------------------------------------------------
    print("\n--- [TEST 3] EngineeringBranch (Syntax Validation & Skills) ---")
    eng_branch = orchestrator.engineering_branch

    # A. Valid Python Syntax Audit
    valid_code = "```python\ndef calculate_thrust(mass: float, accel: float) -> float:\n    return mass * accel\n```"
    res_syntax_pass = eng_branch.execute(f"verify syntax for this code:\n{valid_code}")
    assert res_syntax_pass.success, "Syntax verification failed on valid code!"
    assert res_syntax_pass.data["valid"] is True, "Expected valid AST status"
    print(f" [PASS] Valid AST syntax test passed: {res_syntax_pass.speech}")

    # B. Invalid Python Syntax Detection
    invalid_code = "```python\ndef broken_function(:\n    return 42\n```"
    res_syntax_fail = eng_branch.execute(f"verify syntax for this code:\n{invalid_code}")
    assert res_syntax_fail.data["valid"] is False, "Failed to catch syntax error!"
    print(f" [PASS] Caught invalid AST syntax successfully.")

    # C. Skill Search & Discovery
    res_skills = eng_branch.execute("search skills for testing")
    assert res_skills.success, "Skill search failed!"
    print(f" [PASS] Skill discovery returned: {res_skills.speech}")

    # -------------------------------------------------------------------------
    # TEST 4: CyberSentinelBranch Execution (Telemetry, Anomaly & Safety)
    # -------------------------------------------------------------------------
    print("\n--- [TEST 4] CyberSentinelBranch (Hardware Telemetry & Threat Scan) ---")
    sentinel_branch = orchestrator.cyber_sentinel_branch

    # A. Vitals Query
    res_vitals = sentinel_branch.execute("check vitals and system health", {"is_boss": True})
    assert res_vitals.success, "Vitals query failed!"
    assert "cpu_percent" in res_vitals.data, "CPU percent missing from telemetry"
    print(f" [PASS] Hardware telemetry online: CPU={res_vitals.data['cpu_percent']}%, RAM={res_vitals.data['ram_percent']}%")

    # B. Threat & Anomaly Scan
    res_scan = sentinel_branch.execute("perform threat scan for runaway anomalies", {"is_boss": True})
    assert res_scan.success, "Anomaly scan failed!"
    assert res_scan.action_taken == "anomaly_scan"
    print(f" [PASS] Anomaly scan completed: {res_scan.speech}")

    # C. Safety Gate Interception on Process Termination
    res_kill = sentinel_branch.execute("kill critical_database_service.exe", {"is_boss": True})
    assert res_kill.success, "Safety gate evaluation failed!"
    assert res_kill.action_taken == "pending_confirmation", f"Expected pending_confirmation, got {res_kill.action_taken}"
    print(f" [PASS] Tier-3 safety gate intercepted termination: {res_kill.speech}")

    # -------------------------------------------------------------------------
    # TEST 5: CommunicationsBranch Execution (24/7 Daemon & Bilingual Care)
    # -------------------------------------------------------------------------
    print("\n--- [TEST 5] CommunicationsBranch (WhatsApp Daemon & Bilingual NLP) ---")
    comm_branch = orchestrator.communications_branch

    # A. WhatsApp Daemon Status Check
    res_daemon_status = comm_branch.execute("whatsapp daemon status", {"is_boss": True})
    assert res_daemon_status.success, "Daemon status check failed!"
    print(f" [PASS] WhatsApp daemon status query: {res_daemon_status.speech}")

    # B. Receptionist Mode Enable / Disable
    res_rec_on = comm_branch.execute("attend call on my behalf", {"is_boss": True})
    assert res_rec_on.success, "Receptionist activation failed!"
    assert res_rec_on.action_taken == "enable_receptionist"
    print(f" [PASS] Receptionist mode engaged.")

    res_rec_off = comm_branch.execute("disable receptionist mode", {"is_boss": True})
    assert res_rec_off.success, "Receptionist deactivation failed!"
    assert res_rec_off.action_taken == "disable_receptionist"
    print(f" [PASS] Receptionist mode disengaged.")

    # C. Bilingual Bengali Customer Inquiry Processing
    bengali_inquiry = "আপনার ডেলিভারি চার্জ কত এবং কত দিন লাগবে?"
    res_bn_care = comm_branch.execute(bengali_inquiry, {"is_boss": True})
    assert res_bn_care.success, "Bengali inquiry processing failed!"
    assert res_bn_care.data["language"] == "bengali", f"Language misclassified: {res_bn_care.data['language']}"
    assert "টাকা" in res_bn_care.data["reply_text"] or "ডেলিভারি" in res_bn_care.data["reply_text"], "Bengali reply incomplete"
    print(f" [PASS] Autonomous Bengali care replied: '{res_bn_care.data['reply_text'][:80]}...'")

    # D. Continuous Child-Like Learning Rule
    res_teach = comm_branch.execute("teach customer care: our warranty period is two full years for electronics")
    assert res_teach.success, "Teaching customer care failed!"
    print(f" [PASS] Taught customer care policy: {res_teach.speech}")

    # -------------------------------------------------------------------------
    # TEST 6: DailyLifeBranch Execution (LifeGraph, Routines & Bio-Wellness)
    # -------------------------------------------------------------------------
    print("\n--- [TEST 6] DailyLifeBranch (Cognitive LifeGraph & Bio-Wellness) ---")
    life_branch = orchestrator.daily_life_branch

    # A. LifeGraph 2,000+ Nodes Query
    res_nodes = life_branch.execute("how many nodes in our life graph", {"is_boss": True})
    assert res_nodes.success, "LifeGraph nodes query failed!"
    assert res_nodes.data["total_nodes"] >= 1000, f"Expected >= 1000 nodes, got {res_nodes.data['total_nodes']}"
    print(f" [PASS] Cognitive LifeGraph verified with {res_nodes.data['total_nodes']} nodes.")

    # B. Hydration Logging & Health Status
    res_water = life_branch.execute("drank a glass of water", {"is_boss": True})
    assert res_water.success, "Hydration logging failed!"
    print(f" [PASS] Hydration logged: {res_water.speech}")

    res_health = life_branch.execute("check bio status and health", {"is_boss": True})
    assert res_health.success, "Health status check failed!"
    print(f" [PASS] Bio status query: {res_health.speech}")

    # C. Expense Logging & Summary
    res_exp = life_branch.execute("log expense: $18.50 for lunch and coffee", {"is_boss": True})
    assert res_exp.success, "Expense logging failed!"
    print(f" [PASS] Expense logged: {res_exp.speech}")

    # -------------------------------------------------------------------------
    # TEST 7: PerceptionBranch Execution (Screen Awareness & Telemetry)
    # -------------------------------------------------------------------------
    print("\n--- [TEST 7] PerceptionBranch (Screen Vision & Situational Digest) ---")
    percept_branch = orchestrator.perception_branch

    # A. Screen Situational Awareness
    res_screen = percept_branch.execute("what is on my screen right now", {"is_boss": True})
    assert res_screen.success, "Screen awareness query failed!"
    assert res_screen.action_taken == "screen_situational_awareness"
    print(f" [PASS] Screen perception digest: {res_screen.speech}")

    # B. Screen Resolution Calibrations
    res_gui = percept_branch.execute("check gui status", {"is_boss": True})
    assert res_gui.success, "GUI resolution check failed!"
    print(f" [PASS] Screen resolution calibrated: {res_gui.data['resolution']}")

    # -------------------------------------------------------------------------
    # TEST 8: JarvisOrchestrator End-to-End Sub-Branch Directives & Delegation
    # -------------------------------------------------------------------------
    print("\n--- [TEST 8] JarvisOrchestrator Integration & Branch Delegation ---")

    # A. Querying sub-branch fleet overview via orchestrator
    cmd_fleet = orchestrator.handle_command("how many branches do you have?")
    assert "sub-branches are online" in cmd_fleet["speech"].lower(), "Fleet overview speech failed"
    assert cmd_fleet["action_taken"] == "list_sub_branches"
    print(f" [PASS] Orchestrator answered fleet query: {cmd_fleet['speech']}")

    # B. Explicit delegation: "engineering branch: verify syntax"
    cmd_eng = orchestrator.handle_command("engineering branch: verify syntax for x = 100")
    assert cmd_eng["action_taken"] == "code_syntax_audit", f"Expected code_syntax_audit, got {cmd_eng['action_taken']}"
    print(f" [PASS] Explicit engineering delegation resolved: {cmd_eng['speech']}")

    # C. Explicit delegation: "sentinel branch: check vitals"
    cmd_sentinel = orchestrator.handle_command("sentinel branch: check vitals")
    assert cmd_sentinel["action_taken"] == "hardware_telemetry", f"Expected hardware_telemetry, got {cmd_sentinel['action_taken']}"
    print(f" [PASS] Explicit sentinel delegation resolved: {cmd_sentinel['speech']}")

    # D. Explicit delegation: "communications branch: whatsapp daemon status"
    cmd_comm = orchestrator.handle_command("communications branch: whatsapp daemon status")
    assert cmd_comm["action_taken"] == "whatsapp_daemon_status", f"Expected whatsapp_daemon_status, got {cmd_comm['action_taken']}"
    print(f" [PASS] Explicit communications delegation resolved: {cmd_comm['speech']}")

    # E. Explicit delegation: "personal ops: brief me on urgent topics"
    cmd_personal = orchestrator.handle_command("personal ops: brief me on urgent topics")
    assert cmd_personal["action_taken"] == "urgent_topics_briefing", f"Expected urgent_topics_briefing, got {cmd_personal['action_taken']}"
    print(f" [PASS] Explicit personal ops delegation resolved: {cmd_personal['speech']}")

    print("\n" + "=" * 70)
    print("ALL 8 TEST PHASES CONCLUDED WITH 100% SUCCESSFUL ASSERTIONS!")
    print("=" * 70)


if __name__ == "__main__":
    run_sub_branch_tests()
