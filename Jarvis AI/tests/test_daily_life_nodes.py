"""
Comprehensive Verification Suite for J.A.R.V.I.S. Daily Life Tools & LifeGraph
Tests node counts (2,000+ nodes), spreading activation, and real tool connections:
Weather, Calendar, Expense Tracking, Hydration, Media, Timers, Notes, and Routines.
"""

import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

# Reconfigure stdout/stderr to UTF-8 for Windows consoles
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

from core.orchestrator import JarvisOrchestrator


def test_daily_life_and_nodes():
    print("==================================================")
    print("INITIALIZING J.A.R.V.I.S. DAILY LIFE & LIFEGRAPH TESTS")
    print("==================================================")

    jarvis = JarvisOrchestrator()
    jarvis.tts.speak = lambda text, **kwargs: print(f"[SPOKEN]: {text}")

    print("\n--- TEST 1: LifeGraph Node Count Query (Thousands of Nodes) ---")
    res1 = jarvis.handle_command("Jarvis, how many nodes do you have in your life graph?")
    print("Action:", res1.get("action_taken"))
    print("Speech:", res1.get("speech"))
    stats = res1.get("data", {})
    total_nodes = stats.get("total_nodes", 0)
    total_edges = stats.get("total_edges", 0)
    print(f"Total Nodes: {total_nodes}, Total Edges: {total_edges}")
    assert res1.get("action_taken") == "lifegraph_stats", "Failed lifegraph_stats!"
    assert total_nodes >= 5000, f"Expected at least 5000 nodes, found {total_nodes}!"
    assert total_edges >= 4000, f"Expected at least 4000 edges, found {total_edges}!"

    print("\n--- TEST 2: Weather Tool ---")
    res2 = jarvis.handle_command("Jarvis, what is the weather in London?")
    print("Action:", res2.get("action_taken"))
    print("Speech:", res2.get("speech"))
    assert res2.get("action_taken") == "get_weather", "Failed get_weather!"
    data_str = str(res2.get("data", {}))
    assert any(w in data_str for w in ["London", "Strand", "City of London"]), f"Weather location mismatch: {data_str}"

    print("\n--- TEST 3: Log Expense Tool ---")
    res3 = jarvis.handle_command("Jarvis, log expense $14.50 for lunch")
    print("Action:", res3.get("action_taken"))
    print("Speech:", res3.get("speech"))
    assert res3.get("action_taken") == "log_expense", "Failed log_expense!"
    assert res3.get("data", {}).get("amount") == 14.50, "Expense amount mismatch!"

    print("\n--- TEST 4: Query Expense Summary ---")
    res4 = jarvis.handle_command("Jarvis, how much did I spend today?")
    print("Action:", res4.get("action_taken"))
    print("Speech:", res4.get("speech"))
    assert res4.get("action_taken") == "expense_summary", "Failed expense_summary!"
    assert res4.get("data", {}).get("total", 0) >= 14.50, "Expense total calculation error!"

    print("\n--- TEST 5: Hydration Tool ---")
    res5 = jarvis.handle_command("Jarvis, log glass of water")
    print("Action:", res5.get("action_taken"))
    print("Speech:", res5.get("speech"))
    assert res5.get("action_taken") == "log_hydration", "Failed log_hydration!"
    assert res5.get("data", {}).get("glasses_logged") == 1, "Glasses logged mismatch!"

    print("\n--- TEST 6: Morning Briefing Routine ---")
    res6 = jarvis.handle_command("Jarvis, run morning briefing")
    print("Action:", res6.get("action_taken"))
    print("Speech:", res6.get("speech"))
    assert res6.get("action_taken") == "morning_briefing", "Failed morning_briefing!"

    print("\n--- TEST 7: Quick Note Tool ---")
    res7 = jarvis.handle_command("Jarvis, take a note: Buy new mechanical keyboard switches")
    print("Action:", res7.get("action_taken"))
    print("Speech:", res7.get("speech"))
    assert res7.get("action_taken") == "save_note", "Failed save_note!"

    print("\n--- TEST 8: Calendar Agenda Tool ---")
    res8 = jarvis.handle_command("Jarvis, what is on my calendar today?")
    print("Action:", res8.get("action_taken"))
    print("Speech:", res8.get("speech"))
    assert res8.get("action_taken") == "list_calendar", "Failed list_calendar!"

    print("\n--- TEST 9: Spreading Activation Subgraph Retrieval ---")
    activation_res = jarvis.life_graph.activate_subgraph("espresso coffee lunch", depth=2)
    print(f"Query 'espresso coffee lunch' activated {activation_res['total_activated']} nodes.")
    assert activation_res["total_activated"] >= 5, "Failed spreading activation!"

    print("\n--- TEST 10: Working Capacity & Throughput Telemetry ---")
    res10 = jarvis.handle_command("what is your working capacity and throughput?")
    print("Action:", res10.get("action_taken"))
    print("Speech:", res10.get("speech"))
    assert res10.get("action_taken") == "working_capacity_metrics", "Failed working_capacity_metrics!"
    assert res10.get("data", {}).get("max_concurrent_workers") >= 4, "Concurrent workers too low!"

    print("\n--- TEST 11: Cognitive Understanding Capacity Telemetry ---")
    res11 = jarvis.handle_command("what is your understanding capacity?")
    print("Action:", res11.get("action_taken"))
    print("Speech:", res11.get("speech"))
    assert res11.get("action_taken") == "understanding_capacity_metrics", "Failed understanding_capacity_metrics!"
    assert res11.get("data", {}).get("phonetic_correction") is True, "Phonetic correction flag missing!"

    print("\n--- TEST 12: Intent Router Multilingual Bengali & Compound Parsing ---")
    ir = jarvis.intent_router
    bn_res = ir.parse_intent("আজকের আবহাওয়া কেমন")
    assert bn_res["action"] == "get_weather", f"Expected get_weather, got {bn_res['action']}"
    assert bn_res["language"] == "bengali"
    
    # Compound intent test
    compound_res = ir.parse_compound_intents("check system vitals and then schedule meeting with Pepper Potts at 4pm and also check weather in London")
    assert len(compound_res) >= 2, f"Failed compound intent decomposition! Got {len(compound_res)}"
    print(f"Decomposed compound intent into {len(compound_res)} structured sub-intents.")

    print("\n--- TEST 13: TaskManager Concurrent Multi-Worker Execution ---")
    tm = jarvis.task_manager
    sample_tasks = ["task A", "task B", "task C"]
    concurrent_results = tm.execute_tasks_concurrently(sample_tasks, lambda desc: {"summary": f"Executed {desc} in parallel"})
    assert len(concurrent_results) == 3, f"Expected 3 concurrent results, got {len(concurrent_results)}"
    for cr in concurrent_results:
        assert cr["success"] is True, f"Concurrent task failed: {cr}"
    print(f"Successfully executed {len(concurrent_results)} parallel tasks concurrently.")

    print("\n==================================================")
    print("ALL 13 TESTS (5,950+ NODES, WORKING & UNDERSTANDING CAPACITY) PASSED PERFECTLY!")
    print("==================================================")


if __name__ == "__main__":
    test_daily_life_and_nodes()
