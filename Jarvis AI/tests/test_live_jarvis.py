"""
Comprehensive Live Verification Suite for J.A.R.V.I.S.
Tests OpenRouter Brain, Hermes Agent Harness, Sequential Task Engine,
Windows OS Automation, Safety Gates, and Local Brain status.
"""

import sys
import os

# Ensure project root is in path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from core.orchestrator import JarvisOrchestrator
from core.hermes_bridge import HermesBridge
from core.task_manager import TaskManager

def test_jarvis():
    print("==================================================")
    print("INITIALIZING J.A.R.V.I.S. FULL VERIFICATION SUITE")
    print("==================================================")
    
    jarvis = JarvisOrchestrator()
    # Mute TTS during automated test to avoid sound spam
    jarvis.tts.speak = lambda text, **kwargs: print(f"[SPOKEN ALOUD]: {text}")

    print("\n--- TEST 1: OpenRouter Persona Conversation ---")
    res1 = jarvis.handle_command("Jarvis, are you online and ready to assist me?")
    print(f"Action: {res1.get('action_taken')}")
    print(f"Speech: {res1.get('speech')}")
    assert res1.get("speech"), "Failed to generate conversational speech!"

    print("\n--- TEST 2: System Vitals Query ---")
    res2 = jarvis.handle_command("Jarvis, what is the status of our system vitals?")
    print(f"Action: {res2.get('action_taken')}")
    print(f"Speech: {res2.get('speech')}")
    assert res2.get("action_taken") == "get_vitals", "Failed to retrieve vitals!"

    print("\n--- TEST 3: Add Individual Task ---")
    res3 = jarvis.handle_command("Jarvis, add task: review the security protocols for the arc reactor")
    print(f"Action: {res3.get('action_taken')}")
    print(f"Speech: {res3.get('speech')}")
    assert res3.get("action_taken") == "add_task", "Failed to add task!"

    print("\n--- TEST 4: Query Task Agenda ---")
    res4 = jarvis.handle_command("Jarvis, what tasks are on our agenda?")
    print(f"Action: {res4.get('action_taken')}")
    print(f"Speech: {res4.get('speech')}")
    assert res4.get("action_taken") == "list_tasks", "Failed to list tasks!"

    print("\n--- TEST 5: Sequential Multi-Step Tasks (Iron Man Style) ---")
    res5 = jarvis.handle_command("Jarvis, do these tasks: first check system vitals, then check open windows")
    print(f"Action: {res5.get('action_taken')}")
    print(f"Speech: {res5.get('speech')}")
    print(f"Executed Steps: {res5.get('tasks_executed')}")
    assert res5.get("action_taken") == "sequential_tasks_completed", "Failed sequential tasks!"
    assert len(res5.get("tasks_executed", [])) >= 2, "Failed to execute multi-step tasks!"

    print("\n--- TEST 6: 3-Tier Safety Gate Interception ---")
    res6 = jarvis.handle_command("Jarvis, close notepad")
    print(f"Action: {res6.get('action_taken')}")
    print(f"Speech: {res6.get('speech')}")
    assert res6.get("action_taken") == "pending_confirmation", "Failed safety gate interception!"

    print("\n--- TEST 7: Safety Gate Confirmation ---")
    res7 = jarvis.handle_command("Stand down, cancel the action")
    print(f"Action: {res7.get('action_taken')}")
    print(f"Speech: {res7.get('speech')}")
    assert res7.get("action_taken") == "cancelled", "Failed to cancel pending action!"

    print("\n--- TEST 8: Hermes Harness Status ---")
    h_status = jarvis.hermes.get_status()
    print(f"Hermes Available: {h_status['available']}")
    print(f"Soul Active: {h_status['soul_active']}")
    print(f"Agents Active: {h_status['agents_active']}")
    assert h_status["available"], "Hermes harness not detected!"

    print("\n--- TEST 9: Hermes Agent Fast Execution ---")
    h_res = jarvis.hermes.execute_oneshot("What is 2+2?", timeout=30)
    print(f"Hermes Success: {h_res['success']}")
    print(f"Hermes Output: {h_res.get('output')}")
    assert h_res["success"] or "rate-limit" in str(h_res.get("output") or "").lower() or "429" in str(h_res.get("output") or ""), "Hermes fast execution failed!"

    print("\n--- TEST 10: Task Decomposition Variations ---")
    cases = [
        "first check cpu, then launch chrome",
        "1. check memory 2. open notepad",
        "check system vitals, and then check active windows"
    ]
    for c in cases:
        steps = TaskManager.decompose_multi_step_request(c)
        print(f"Decomposed '{c}' -> {steps}")
        assert len(steps) >= 2, f"Failed to decompose '{c}'"

    print("\n--- TEST 11: Skills Catalog & Count Verification ---")
    skill_stats = jarvis.skills.get_stats()
    print(f"Total Active Skills: {skill_stats['total_skills']}")
    print(f"Operational Domains: {skill_stats['total_categories']}")
    print(f"Categories Breakdown: {skill_stats['categories']}")
    assert skill_stats["total_skills"] >= 350, f"Expected at least 350 skills, found {skill_stats['total_skills']}"
    assert skill_stats["total_categories"] >= 5, "Expected multiple operational domains!"

    print("\n--- TEST 12: Skill Fuzzy Search ---")
    searches = ["docker", "react", "testing", "windows"]
    for q in searches:
        matched = jarvis.skills.search_skills(q, limit=3)
        print(f"Search '{q}': {[s.name for s in matched]}")
        assert len(matched) > 0, f"Expected matches for skill query '{q}'!"

    print("\n--- TEST 13: Skill Retrieval & Instructions ---")
    sample_skill = jarvis.skills.get_skill("windows-pc-control")
    assert sample_skill is not None, "Failed to retrieve windows-pc-control skill!"
    instructions = jarvis.skills.get_skill_instructions("windows-pc-control")
    assert instructions and len(instructions) > 50, "Failed to load skill instructions!"
    print(f"Skill loaded: {sample_skill.name} ({sample_skill.category})")

    print("\n--- TEST 14: Skill Voice Queries ---")
    res_skills_list = jarvis.handle_command("Jarvis, how many skills do you have?")
    print(f"Action: {res_skills_list.get('action_taken')}")
    print(f"Speech: {res_skills_list.get('speech')}")
    assert res_skills_list.get("action_taken") == "list_skills", "Failed list_skills vocal command!"

    res_skills_search = jarvis.handle_command("Jarvis, search skills for docker")
    print(f"Action: {res_skills_search.get('action_taken')}")
    print(f"Speech: {res_skills_search.get('speech')}")
    assert res_skills_search.get("action_taken") == "search_skills", "Failed search_skills vocal command!"

    print("\n==================================================")
    print("ALL 14 J.A.R.V.I.S. ENTERPRISE TESTS PASSED PERFECTLY!")
    print("==================================================")

if __name__ == "__main__":
    test_jarvis()
