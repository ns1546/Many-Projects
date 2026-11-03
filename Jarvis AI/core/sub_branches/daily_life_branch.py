"""
J.A.R.V.I.S. Daily Life Logistics & Bio-Wellness Branch
Specialized sub-branch for Cognitive LifeGraph semantic navigation (2,000+ nodes),
circadian routines, hydration and bio-wellness monitoring, 90-min deep work cycles,
and personal expense auditing.
"""

import time
import re
from typing import Dict, Any, List, Optional
from core.sub_branches.base_branch import BaseSubBranch, BranchResult


class DailyLifeBranch(BaseSubBranch):
    """
    Sub-Branch 5: Daily Life Logistics & Bio-Wellness Division.
    Manages human daily life balance, LifeGraph semantic relations, health rhythms, and financial records.
    """

    def __init__(
        self,
        daily_life_tools: Any,
        life_graph: Any
    ):
        super().__init__(
            branch_id="daily_life",
            branch_name="Daily Life Logistics & Bio-Wellness Division",
            description="Cognitive LifeGraph navigation (2,000+ nodes), circadian routines, bio-wellness tracking, deep work sprints, and expense auditing."
        )
        self.daily_life_tools = daily_life_tools
        self.life_graph = life_graph

    @property
    def capabilities(self) -> List[str]:
        return [
            "lifegraph_semantic_node_traversal",
            "circadian_morning_and_evening_routines",
            "bio_wellness_and_hydration_sentinel",
            "ultradian_deep_work_focus_sprints",
            "personal_expense_and_budget_tracking",
            "environmental_weather_intelligence"
        ]

    @property
    def specialist_roles(self) -> List[str]:
        return [
            "Cognitive LifeGraph Navigator",
            "Bio-Wellness & Ergonomic Sentinel",
            "Circadian Routine Director",
            "Personal Wealth & Expense Auditor"
        ]

    def can_handle(self, text: str, context: Optional[Dict[str, Any]] = None) -> bool:
        lower = text.lower()
        triggers = [
            "life graph", "how many nodes", "knowledge graph", "semantic node",
            "morning briefing", "morning routine", "evening debrief", "evening routine",
            "weather", "hydration", "drink water", "log water", "health status",
            "bio status", "eye break", "deep work", "focus sprint", "timer",
            "expense", "spent", "budget", "log note", "scratchpad"
        ]
        return any(trig in lower for trig in triggers)

    def execute(self, text: str, context: Optional[Dict[str, Any]] = None) -> BranchResult:
        start_time = time.time()
        self.total_executions += 1
        lower = text.lower()
        context = context or {}
        speaker_name = context.get("speaker_name", "Boss")
        is_boss = context.get("is_boss", True)
        title = "sir" if is_boss else speaker_name

        try:
            # 1. Cognitive LifeGraph Stats & Semantic Query
            if any(w in lower for w in ["how many nodes", "life graph", "nodes do you have", "lifegraph nodes"]):
                stats = self.life_graph.get_stats()
                speech = (
                    f"Our Cognitive LifeGraph maintains {stats.get('total_nodes', 0)} active semantic nodes "
                    f"and {stats.get('total_edges', 0)} relational edges across {len(stats.get('nodes_by_category', {}))} life categories, {title}."
                )
                self.successful_executions += 1
                return BranchResult(
                    success=True,
                    speech=speech,
                    action_taken="lifegraph_stats",
                    data=stats,
                    branch_id=self.branch_id,
                    branch_name=self.branch_name,
                    execution_time_ms=(time.time() - start_time) * 1000
                )

            # 2. Morning Briefing
            if any(w in lower for w in ["morning briefing", "morning routine", "start my morning", "good morning"]):
                res = self.daily_life_tools.run_morning_briefing()
                self.successful_executions += 1
                return BranchResult(
                    success=True,
                    speech=res["speech"],
                    action_taken="morning_briefing",
                    data=res,
                    branch_id=self.branch_id,
                    branch_name=self.branch_name,
                    execution_time_ms=(time.time() - start_time) * 1000
                )

            # 3. Evening Debrief
            if any(w in lower for w in ["evening debrief", "evening routine", "nightly debrief", "end my day", "good night"]):
                res = self.daily_life_tools.run_evening_debrief()
                self.successful_executions += 1
                return BranchResult(
                    success=True,
                    speech=res["speech"],
                    action_taken="evening_debrief",
                    data=res,
                    branch_id=self.branch_id,
                    branch_name=self.branch_name,
                    execution_time_ms=(time.time() - start_time) * 1000
                )

            # 4. Weather Intelligence
            if "weather" in lower:
                match_city = re.search(r"weather(?:\s+(?:in|for|at))?\s+([a-zA-Z\s]+)", lower)
                city = match_city.group(1).strip() if match_city else ""
                w_res = self.daily_life_tools.get_weather(city)
                self.successful_executions += 1
                return BranchResult(
                    success=True,
                    speech=w_res["speech"],
                    action_taken="get_weather",
                    data=w_res,
                    branch_id=self.branch_id,
                    branch_name=self.branch_name,
                    execution_time_ms=(time.time() - start_time) * 1000
                )

            # 5. Hydration & Bio-Wellness
            if any(w in lower for w in ["log water", "drank water", "had water", "drink water"]):
                h_res = self.daily_life_tools.log_hydration(1)
                self.successful_executions += 1
                return BranchResult(
                    success=True,
                    speech=h_res["speech"],
                    action_taken="log_hydration",
                    data=h_res,
                    branch_id=self.branch_id,
                    branch_name=self.branch_name,
                    execution_time_ms=(time.time() - start_time) * 1000
                )

            if any(w in lower for w in ["health status", "bio status", "check hydration", "how much water"]):
                h_res = self.daily_life_tools.get_health_status()
                self.successful_executions += 1
                return BranchResult(
                    success=True,
                    speech=h_res["speech"],
                    action_taken="health_status",
                    data=h_res,
                    branch_id=self.branch_id,
                    branch_name=self.branch_name,
                    execution_time_ms=(time.time() - start_time) * 1000
                )

            if any(w in lower for w in ["eye break", "20 20 20"]):
                eye_res = self.daily_life_tools.log_eye_break()
                self.successful_executions += 1
                return BranchResult(
                    success=True,
                    speech=eye_res["speech"],
                    action_taken="eye_break",
                    data=eye_res,
                    branch_id=self.branch_id,
                    branch_name=self.branch_name,
                    execution_time_ms=(time.time() - start_time) * 1000
                )

            # 6. Deep Work 90m Focus Sprint
            if any(w in lower for w in ["deep work", "focus sprint", "focus mode"]):
                self.daily_life_tools.play_focus_music("lofi")
                t_res = self.daily_life_tools.set_timer(90.0, "Deep Work 90m Sprint")
                speech = f"Deep work protocol engaged, {title}. 90-minute countdown initiated with focus stream streaming."
                self.successful_executions += 1
                return BranchResult(
                    success=True,
                    speech=speech,
                    action_taken="deep_work",
                    data=t_res,
                    branch_id=self.branch_id,
                    branch_name=self.branch_name,
                    execution_time_ms=(time.time() - start_time) * 1000
                )

            # 7. Expense Logging & Summaries
            match_exp = re.search(r"\b(?:log\s+expense|spent|paid|bought)[:\s]+(?:\$|usd\s*)?([0-9]+(?:\.[0-9]+)?)\s*(?:dollars?)?\s*(?:for|on|under)?\s*(.+)?", text, re.IGNORECASE)
            if match_exp:
                amt = float(match_exp.group(1))
                desc = (match_exp.group(2) or "Miscellaneous").strip()
                cat = "general"
                for candidate in ["food", "coffee", "transport", "groceries", "subscription", "bills"]:
                    if candidate in desc.lower():
                        cat = candidate
                        break
                exp_res = self.daily_life_tools.log_expense(amount=amt, category=cat, description=desc)
                self.successful_executions += 1
                return BranchResult(
                    success=True,
                    speech=exp_res["speech"],
                    action_taken="log_expense",
                    data=exp_res,
                    branch_id=self.branch_id,
                    branch_name=self.branch_name,
                    execution_time_ms=(time.time() - start_time) * 1000
                )

            if any(w in lower for w in ["expenses", "spending summary", "how much did i spend"]):
                exp_res = self.daily_life_tools.get_expense_summary()
                self.successful_executions += 1
                return BranchResult(
                    success=True,
                    speech=exp_res["speech"],
                    action_taken="expense_summary",
                    data=exp_res,
                    branch_id=self.branch_id,
                    branch_name=self.branch_name,
                    execution_time_ms=(time.time() - start_time) * 1000
                )

            # Fallback
            speech = f"Daily Life Logistics division standing by for schedule, health, or financial directives, {title}."
            self.successful_executions += 1
            return BranchResult(
                success=True,
                speech=speech,
                action_taken="daily_life_standby",
                data={},
                branch_id=self.branch_id,
                branch_name=self.branch_name,
                execution_time_ms=(time.time() - start_time) * 1000
            )

        except Exception as e:
            err_speech = f"Daily Life Logistics division encountered an error: {str(e)}, {title}."
            return BranchResult(
                success=False,
                speech=err_speech,
                action_taken="daily_life_error",
                data={"error": str(e)},
                branch_id=self.branch_id,
                branch_name=self.branch_name,
                execution_time_ms=(time.time() - start_time) * 1000
            )
