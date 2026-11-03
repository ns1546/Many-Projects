"""
Verification Test Suite for J.A.R.V.I.S. Autonomous WhatsApp Customer Care,
Child-Like Epistemic Learning Engine, Voice Note Generation,
and Autonomous Call Receptionist Protocol.
"""

import sys
import os
import time

# Ensure project root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from communication.whatsapp_customer_care import ChildLearningEngine, WhatsAppCustomerCareService
from core.orchestrator import JarvisOrchestrator
from speech.tts_engine import TTSEngine
from core.task_manager import TaskManager

def run_tests():
    print("=" * 70)
    print("RUNNING J.A.R.V.I.S. WHATSAPP CUSTOMER CARE & CHILD LEARNING TEST SUITE")
    print("=" * 70)

    # Isolated test database
    test_db = os.path.join(os.path.dirname(__file__), "test_care_memory.db")
    if os.path.exists(test_db):
        try:
            os.remove(test_db)
        except Exception:
            pass

    # -------------------------------------------------------------------------
    # TEST 1: Child-Like Continuous Learning & Concept Generalization
    # -------------------------------------------------------------------------
    print("\n--- [TEST 1] Child-Like Continuous Learning & Semantic Synonyms ---")
    engine = ChildLearningEngine(db_path=test_db)

    # 1. Teach Rule 1: Return Policy
    res1 = engine.learn("Our return policy is 14 days with original receipt")
    assert res1["success"], "Failed to learn return policy!"
    assert res1["topic"] == "refund_and_return_policy"
    print(f" [PASS] Learned Rule 1: Topic='{res1['topic']}' with {len(res1['triggers'])} expanded triggers.")

    # 2. Teach Rule 2: Delivery charges
    res2 = engine.learn("Delivery fee is $15 for outside city")
    assert res2["success"], "Failed to learn delivery rule!"
    assert res2["topic"] == "shipping_and_delivery"
    print(f" [PASS] Learned Rule 2: Topic='{res2['topic']}'.")

    # 3. Teach Rule 3: Operating Hours
    res3 = engine.learn("We are open from 9 AM to 8 PM Monday to Saturday")
    assert res3["success"], "Failed to learn operating hours!"
    assert res3["topic"] == "operating_hours"
    print(f" [PASS] Learned Rule 3: Topic='{res3['topic']}'.")

    # 4. Semantic Concept Generalization Check (Customer uses words never seen in instruction)
    # Customer asks for 'refund', but rule was taught with 'return'
    match_refund = engine.find_knowledge("Can I get a refund for my suit?")
    assert match_refund is not None, "Failed to match 'refund' to 'return' policy via child synonym lattice!"
    assert match_refund["topic"] == "refund_and_return_policy"
    print(f" [PASS] Generalization 1: 'Can I get a refund' correctly matched '{match_refund['topic']}' (Score: {match_refund['match_score']}).")

    # Customer asks for 'shipping cost', rule was taught with 'delivery fee'
    match_shipping = engine.find_knowledge("How much does shipping cost?")
    assert match_shipping is not None, "Failed to match 'shipping cost' to 'delivery fee'!"
    assert match_shipping["topic"] == "shipping_and_delivery"
    print(f" [PASS] Generalization 2: 'shipping cost' correctly matched '{match_shipping['topic']}'.")

    # Customer asks for 'working hours'
    match_hours = engine.find_knowledge("What are your working hours?")
    assert match_hours is not None, "Failed to match 'working hours' to 'operating hours'!"
    assert match_hours["topic"] == "operating_hours"
    print(f" [PASS] Generalization 3: 'working hours' correctly matched '{match_hours['topic']}'.")

    # 5. Rule Correction (Updating knowledge like a child correcting a mistake)
    corr_res = engine.correct("return", "Our updated return policy is 30 days with receipt")
    assert corr_res["success"], "Failed to correct rule!"
    match_updated = engine.find_knowledge("What is the return time limit?")
    assert "30 days" in match_updated["response_content"], "Updated instruction not reflected!"
    print(" [PASS] Rule Correction: Successfully revised return policy to 30 days.")

    # 6. Praise & Reinforcement
    init_conf = match_updated["confidence"]
    new_conf = engine.reinforce(match_updated["topic"], positive=True)
    assert new_conf > init_conf, "Reinforcement failed to increase confidence!"
    print(f" [PASS] Confidence Reinforcement: Grew from {init_conf} to {new_conf}.")

    # -------------------------------------------------------------------------
    # TEST 2: Autonomous WhatsApp Customer Care Service (Text & Voice Notes)
    # -------------------------------------------------------------------------
    print("\n--- [TEST 2] WhatsApp Customer Care Text & Neural Voice Note Engine ---")
    tts = TTSEngine()
    task_mgr = TaskManager()
    service = WhatsAppCustomerCareService(
        tts_engine=tts,
        task_manager=task_mgr,
        business_name="Stark Industries"
    )
    # Link test engine
    service.learning_engine = engine

    # Process Known Customer Inquiry
    msg_res = service.process_incoming_text(
        customer_phone="+1-555-0144",
        customer_name="Peter Parker",
        message_text="Hi, can I get a refund if the web-shooters do not fit?",
        prefer_voice=True
    )
    assert msg_res["success"], "Failed to process customer text!"
    assert msg_res["status"] == "resolved", f"Expected resolved status, got {msg_res['status']}"
    assert "Stark Industries" in msg_res["reply_text"]
    assert "https://web.whatsapp.com/send?phone=15550144" in msg_res["dispatch_url"]
    print(f" [PASS] Resolved Inquiry: Generated reply: '{msg_res['reply_text'][:70]}...'")
    
    # Check Voice Note generation
    if msg_res["voice_file"]:
        assert os.path.exists(msg_res["voice_file"]), f"Voice file does not exist: {msg_res['voice_file']}"
        assert os.path.getsize(msg_res["voice_file"]) > 0, "Voice file is empty!"
        print(f" [PASS] Neural Voice Note Generated: {os.path.basename(msg_res['voice_file'])} ({os.path.getsize(msg_res['voice_file'])} bytes).")
    else:
        print(" [NOTE] Voice generation skipped or offline fallback triggered.")

    # Process Unhandled / Personal Inquiry -> Escalation to Boss
    esc_res = service.process_incoming_text(
        customer_phone="+1-555-0199",
        customer_name="Colonel Rhodes",
        message_text="Tony, I need to discuss the War Machine armor upgrades directly.",
        prefer_voice=False
    )
    assert esc_res["success"], "Failed to process message!"
    assert esc_res["status"] == "escalated_to_boss", f"Expected escalated_to_boss, got {esc_res['status']}"
    assert esc_res["escalated_to_boss"] is True
    # Verify high priority task was queued in TaskManager for Boss
    pending_tasks = task_mgr.list_tasks(status="pending")
    assert any("Colonel Rhodes" in t["description"] for t in pending_tasks), "Escalated inquiry not logged in TaskManager!"
    print(" [PASS] Inquiry Escalation: Properly escalated unknown/personal inquiry to Boss TaskManager.")

    # -------------------------------------------------------------------------
    # TEST 3: Autonomous Call Attendance on Behalf of Boss
    # -------------------------------------------------------------------------
    print("\n--- [TEST 3] Autonomous WhatsApp Call Attendance Protocol ---")
    # Boss instructs J.A.R.V.I.S. to attend calls on his behalf
    service.set_receptionist_mode(True)
    assert service.receptionist_mode_enabled is True, "Receptionist mode failed to enable!"
    print(" [PASS] Receptionist mode successfully activated on Boss instruction.")

    # Case A: Call with inquiry answerable by learned knowledge
    call1 = service.attend_call(
        caller_phone="+1-555-0177",
        caller_name="Happy Hogan",
        caller_speech="What time do you guys close today?"
    )
    assert call1["success"], "Failed to attend call!"
    assert call1["outcome"] == "inquiry_resolved_on_call", f"Expected inquiry_resolved_on_call, got {call1['outcome']}"
    assert "8 PM" in call1["reply_speech"] or "open from" in call1["reply_speech"]
    print(f" [PASS] Call Attended (Resolved): J.A.R.V.I.S. spoke: '{call1['reply_speech'][:80]}...'")

    # Case B: Call with personal message for Tony Stark
    call2 = service.attend_call(
        caller_phone="+1-555-0188",
        caller_name="Pepper Potts",
        caller_speech="Please tell Tony that the board meeting was moved to 3 PM."
    )
    assert call2["success"], "Failed to attend call!"
    assert call2["outcome"] == "message_taken_for_boss", f"Expected message_taken_for_boss, got {call2['outcome']}"
    assert call2["escalated_to_boss"] is True
    # Check callback task added to TaskManager
    pending_tasks = task_mgr.list_tasks(status="pending")
    assert any("CALLBACK REQUIRED" in t["description"] and "Pepper Potts" in t["description"] for t in pending_tasks)
    print(" [PASS] Call Attended (Message Taken): Handled message for Boss & logged urgent callback task.")

    # Dashboard Metrics
    dash = service.get_service_dashboard()
    assert dash["total_interactions"] >= 4, f"Expected at least 4 interactions, got {dash['total_interactions']}"
    assert dash["calls_attended"] >= 2, f"Expected at least 2 calls, got {dash['calls_attended']}"
    print(f" [PASS] Customer Care Dashboard: Interactions={dash['total_interactions']}, Resolved={dash['resolved_tickets']}, Escalated={dash['escalated_tickets']}.")

    # -------------------------------------------------------------------------
    # TEST 4: End-to-End JarvisOrchestrator Natural Language Integration
    # -------------------------------------------------------------------------
    print("\n--- [TEST 4] JarvisOrchestrator End-to-End Directive Execution ---")
    orchestrator = JarvisOrchestrator()
    # Inject our active service
    orchestrator.customer_care = service
    orchestrator.comm_hub.customer_care = service

    # 1. Natural NL Receptionist Command ("attend call on my behalf")
    cmd1 = orchestrator.handle_command("Jarvis, attend call on my behalf", speaker_name="Boss", is_boss=True)
    assert cmd1["action_taken"] == "enable_whatsapp_receptionist"
    assert "active" in cmd1["speech"].lower()
    print(" [PASS] Orchestrator: 'attend call on my behalf' activated receptionist mode.")

    # 2. Natural NL Teaching Command ("Jarvis, learn for customer care: ...")
    cmd2 = orchestrator.handle_command(
        "Jarvis, learn for customer care: Stark suits come with lifetime arc reactor warranty",
        speaker_name="Boss",
        is_boss=True
    )
    assert cmd2["action_taken"] == "learn_customer_care_rule"
    print(" [PASS] Orchestrator: Taught warranty rule dynamically in natural language.")

    # 3. Simulate Incoming WhatsApp Customer Query via Orchestrator
    cmd3 = orchestrator.handle_command(
        "simulate incoming whatsapp message from Thor: 'What warranty do I get with the armor?'",
        speaker_name="Boss",
        is_boss=True
    )
    assert cmd3["action_taken"] == "process_whatsapp_customer_message"
    assert "processed" in cmd3["speech"].lower()
    print(" [PASS] Orchestrator: Processed incoming WhatsApp message for Thor.")

    # 4. Simulate Incoming WhatsApp Call via Orchestrator
    cmd4 = orchestrator.handle_command(
        "simulate incoming call from Nick Fury saying: 'Tony, we have an emergency at the Triskelion'",
        speaker_name="Boss",
        is_boss=True
    )
    assert cmd4["action_taken"] == "attend_whatsapp_call"
    assert "message_taken_for_boss" in cmd4["data"]["outcome"]
    print(" [PASS] Orchestrator: Attended call from Nick Fury on Boss's behalf.")

    # 5. Customer Care Dashboard via Orchestrator
    cmd5 = orchestrator.handle_command("customer care dashboard", speaker_name="Boss", is_boss=True)
    assert cmd5["action_taken"] == "customer_care_dashboard"
    assert "interactions logged" in cmd5["speech"].lower()
    print(f" [PASS] Orchestrator: Dashboard briefing: '{cmd5['speech']}'")

    # 6. Deactivate Receptionist
    cmd6 = orchestrator.handle_command("Jarvis, stop attending calls", speaker_name="Boss", is_boss=True)
    assert cmd6["action_taken"] == "disable_whatsapp_receptionist"
    print(" [PASS] Orchestrator: Deactivated receptionist mode on command.")

    # Cleanup test db
    if os.path.exists(test_db):
        try:
            os.remove(test_db)
        except Exception:
            pass

    print("\n" + "=" * 70)
    print("ALL J.A.R.V.I.S. WHATSAPP CUSTOMER CARE & CHILD LEARNING TESTS PASSED (100%)")
    print("=" * 70)

if __name__ == "__main__":
    run_tests()
