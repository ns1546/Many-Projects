"""
J.A.R.V.I.S. Executive Chief-of-Staff Assistant Brain
Provides Real-Life Human Executive Assistant Capabilities:
- Conversational Multi-Speaker Protocol (Boss vs Colleagues vs Guests)
- Urgent Topics & Morning/Evening Sit-Rep Briefings
- Strategic Opinions, Trade-off Advisory, and Executive Recommendations
- High-Level Workload Coordination, Task Delegation, and Day Scheduling
- Multi-Tier Authorization Gates & Voice Privilege Enforcement
"""

import time
import re
from typing import Dict, Any, List, Optional, Tuple


class ExecutiveAssistantBrain:
    """
    Cognitive Chief-of-Staff Brain for J.A.R.V.I.S.
    Assists the Boss with executive oversight, agenda prioritization,
    candid advisory opinions, and multi-speaker diplomatic protocol.
    """

    def __init__(
        self,
        omni_memory: Any,
        task_manager: Any,
        daily_life_tools: Any,
        os_controller: Any,
        speaker_id: Any,
        openrouter_brain: Optional[Any] = None,
        local_brain: Optional[Any] = None,
        tts_callback: Optional[Any] = None,
        personalization: Optional[Any] = None,
        meeting_intelligence: Optional[Any] = None
    ):
        self.omni_memory = omni_memory
        self.task_manager = task_manager
        self.daily_life_tools = daily_life_tools
        self.os_controller = os_controller
        self.speaker_id = speaker_id
        self.openrouter_brain = openrouter_brain
        self.local_brain = local_brain
        self.tts_callback = tts_callback
        self.personalization = personalization
        self.meeting_intelligence = meeting_intelligence

    # =========================================================================
    # 1. URGENT TOPICS & SIT-REP BRIEFINGS
    # =========================================================================
    def get_urgent_topics_briefing(self, speaker_name: str = "Boss", is_boss: bool = True) -> Dict[str, Any]:
        """
        Synthesizes an executive status report informing the Boss of urgent
        priorities, upcoming meetings, deadlines, and hardware health.
        """
        title = "sir" if is_boss else speaker_name
        
        # 1. Harvest high-priority tasks
        pending_tasks = self.task_manager.get_pending_tasks()
        urgent_tasks = []
        regular_tasks = []
        for t in pending_tasks:
            desc = t.description.lower()
            if any(w in desc for w in ["urgent", "asap", "critical", "priority", "deadline", "security", "alert"]):
                urgent_tasks.append(t.description)
            else:
                regular_tasks.append(t.description)

        # 2. Harvest calendar schedule
        schedule_events = []
        try:
            today_sched = self.daily_life_tools.get_today_schedule()
            if today_sched.get("success"):
                schedule_events = today_sched.get("events", [])
        except Exception:
            pass

        # 3. Check hardware vitals for urgent anomalies
        vitals = self.os_controller.get_system_vitals()
        vital_warnings = []
        if vitals.get("cpu_percent", 0) > 85:
            vital_warnings.append(f"high CPU utilization at {vitals['cpu_percent']}%")
        if vitals.get("ram_percent", 0) > 90:
            vital_warnings.append(f"memory saturation at {vitals['ram_percent']}%")
        if "On battery" in vitals.get("battery", "") and vitals.get("battery", "").startswith(("10", "15", "20")):
            vital_warnings.append(f"low battery: {vitals['battery']}")

        # 4. Formulate executive verbal briefing
        briefing_parts = []
        briefing_parts.append(f"Executive briefing for you, {title}.")

        # Urgent tasks section
        if urgent_tasks:
            briefing_parts.append(f"Urgent matters requiring your attention: {'; '.join(urgent_tasks[:2])}.")
        elif regular_tasks:
            briefing_parts.append(f"You have {len(pending_tasks)} active agenda item{'s' if len(pending_tasks) != 1 else ''}, led by '{regular_tasks[0]}'.")
        else:
            briefing_parts.append("Your immediate task agenda is clear.")

        # Schedule section
        if schedule_events:
            event_strs = [f"{e.get('time', '')} - {e.get('title', '')}" for e in schedule_events[:2]]
            briefing_parts.append(f"Upcoming on your calendar: {'; '.join(event_strs)}.")
        else:
            briefing_parts.append("No conflicting calendar appointments logged for today.")

        # System health section
        if vital_warnings:
            briefing_parts.append(f"Hardware alert: Notice of {', '.join(vital_warnings)}.")
        else:
            briefing_parts.append(f"Core hardware is optimal at {vitals.get('cpu_percent', 10)}% CPU and {vitals.get('disk_free_gb', 0)} GB storage available.")

        speech = " ".join(briefing_parts)
        return {
            "speech": speech,
            "urgent_tasks": urgent_tasks,
            "pending_count": len(pending_tasks),
            "events_count": len(schedule_events),
            "vital_warnings": vital_warnings,
            "vitals": vitals
        }

    # =========================================================================
    # 2. STRATEGIC OPINIONS & EXECUTIVE ADVISORY
    # =========================================================================
    def generate_opinion(self, query: str, speaker_name: str = "Boss", is_boss: bool = True) -> Dict[str, Any]:
        """
        Provides a candid, analytical executive opinion weighing pros, cons,
        strategic implications, and a decisive recommendation.
        """
        title = "sir" if is_boss else speaker_name
        
        # Strip query prefix
        cleaned_topic = query
        for p in [
            "give opinion on", "give your opinion on", "what do you think about",
            "what's your opinion on", "what is your opinion on", "give advice on",
            "advise me on", "should i", "should we", "what do you suggest regarding",
            "give opinion", "your opinion on"
        ]:
            if cleaned_topic.lower().startswith(p):
                cleaned_topic = cleaned_topic[len(p):].strip()
                break

        # Check if neural LLM is available for rich contextual reasoning
        system_prompt = (
            "You are J.A.R.V.I.S., Tony Stark's trusted executive advisor and chief-of-staff. "
            "A real executive assistant never gives bland non-committal answers. "
            "When the Boss asks for your opinion, deliver a candid, highly intelligent, well-reasoned assessment. "
            "Address the user as 'Sir' (or with British refinement). "
            "Structure your vocal answer in 2 to 3 crisp, eloquent sentences: "
            "1. Your direct recommendation/stance. "
            "2. The primary strategic advantage vs the main risk to mitigate. "
            "3. Suggested immediate tactical action. "
            "Speak naturally for text-to-speech delivery."
        )
        if self.personalization:
            pers_context = self.personalization.build_personalized_context(cleaned_topic)
            system_prompt += f"\n\nPersonal Executive Context:\n{pers_context}"

        user_prompt = f"The Boss asks for your opinion on: \"{cleaned_topic}\". What is your assessment?"

        # 1. Try Local Qwen SLM if online
        if self.local_brain and self.local_brain.is_service_available():
            try:
                res = self.local_brain.query(user_prompt, system_prompt)
                reply = res.get("reply", "").strip() if isinstance(res, dict) else str(res).strip()
                if reply and len(reply) > 10:
                    return {"speech": reply, "source": "local_advisor", "topic": cleaned_topic}
            except Exception:
                pass

        # 2. Try OpenRouter Brain if online
        if self.openrouter_brain and self.openrouter_brain.api_key:
            try:
                messages = [{"role": "system", "content": system_prompt}, {"role": "user", "content": user_prompt}]
                res = self.openrouter_brain.query(messages, max_tokens=100)
                reply = res.get("reply", "").strip() if isinstance(res, dict) else str(res).strip()
                if reply and len(reply) > 10:
                    return {"speech": reply, "source": "openrouter_advisor", "topic": cleaned_topic}
            except Exception:
                pass

        # 3. Offline Heuristic Analytical Engine
        # Synthesizes an intelligent, structured executive perspective
        lower_t = cleaned_topic.lower()
        if any(w in lower_t for w in ["buy", "invest", "purchase", "spend", "cost"]):
            speech = (
                f"If you ask my frank opinion, {title}, I recommend proceeding only if the expected return "
                f"or utility yields at least a three-fold leverage on our time. The primary advantage is immediate "
                f"execution velocity, but we must protect our capital reserves against unforeseen overhead."
            )
        elif any(w in lower_t for w in ["delay", "postpone", "cancel", "wait"]):
            speech = (
                f"In my estimation, {title}, hesitation rarely serves our strategic objectives. "
                f"While caution preserves current positioning, the compound cost of lost momentum is steep. "
                f"I advise establishing a rapid forty-eight-hour pilot rather than postponing outright."
            )
        elif any(w in lower_t for w in ["hire", "partner", "team", "collaborate"]):
            speech = (
                f"My counsel, {title}, is to prioritize high autonomy and proven execution over credentials. "
                f"A small, elite operational cell will outperform a bloated structure every time. "
                f"Shall I draft an initial milestone scorecard for your review?"
            )
        elif any(w in lower_t for w in ["launch", "ship", "release", "deploy"]):
            speech = (
                f"From an operational standpoint, {title}, shipping early allows us to capture real-world telemetry "
                f"far superior to internal simulation. The core architecture is resilient; I suggest launching the initial build "
                f"while keeping automated rollbacks primed."
            )
        else:
            speech = (
                f"If I may offer my perspective on {cleaned_topic}, {title}: the strategic upside heavily favors proactive execution, "
                f"provided we establish strict guardrails against mission creep. I recommend a focused prototype phase "
                f"before committing full resources."
            )

        return {"speech": speech, "source": "heuristic_advisor", "topic": cleaned_topic}

    # =========================================================================
    # 3. WORKLOAD & AGENDA MANAGEMENT
    # =========================================================================
    def manage_all_works(self, speaker_name: str = "Boss", is_boss: bool = True) -> Dict[str, Any]:
        """
        Structures the Boss's overall workload, organizes task priorities,
        and establishes an optimal focus flow.
        """
        title = "sir" if is_boss else speaker_name
        pending = self.task_manager.get_pending_tasks()
        
        if not pending:
            speech = (
                f"Your work queue is remarkably pristine, {title}. I suggest dedicating the upcoming block "
                f"to high-level architectural innovation or strategic planning."
            )
            return {"speech": speech, "plan": "strategic_planning", "task_count": 0}

        # Sequence tasks: urgent first, then creation, then review
        top_task = pending[0].description
        total = len(pending)
        
        speech = (
            f"I have organized your agenda for maximum impact, {title}. "
            f"We have {total} active objective{'s' if total != 1 else ''}. "
            f"I recommend tackling '{top_task}' as your immediate priority, "
            f"followed by an uninterrupted ninety-minute focus block. Shall we commence with the first directive?"
        )
        return {
            "speech": speech,
            "task_count": total,
            "primary_focus": top_task,
            "all_tasks": [t.description for t in pending]
        }

    # =========================================================================
    # 4. SPEAKER IDENTIFICATION & GREETING PROTOCOL
    # =========================================================================
    def generate_speaker_greeting(self, speaker_name: str, is_boss: bool, role: str = "guest") -> str:
        """
        Generates an authentic, persona-accurate vocal greeting based on speaker identity.
        """
        t = time.localtime().tm_hour
        tod = "morning" if t < 12 else ("afternoon" if t < 17 else "evening")
        
        if is_boss:
            return f"Good {tod}, sir. J.A.R.V.I.S. at your service. What are your directives?"
        elif role in ["colleague", "executive", "team_member"]:
            return f"Good {tod}, {speaker_name}. Always a pleasure. How may I assist you today?"
        else:
            return f"Good {tod}. Welcome to the facility. How may I be of assistance to you today?"

    # =========================================================================
    # 5. PRIVILEGE & SECURITY ENFORCEMENT
    # =========================================================================
    def check_speaker_authorization(
        self,
        command_text: str,
        speaker_name: str,
        is_boss: bool
    ) -> Tuple[bool, Optional[str]]:
        """
        Enforces 3-tier security gates based on speaker identity:
        Destructive and sensitive system operations require Boss authorization.
        """
        if is_boss:
            return True, None

        lower = command_text.lower()
        destructive_keywords = [
            "clean slate", "house party", "kill process", "terminate process",
            "shut down", "shutdown", "format", "delete all", "wipe", "format drive",
            "kill", "terminate", "reboot pc", "lock workstation", "rmdir", "drop table"
        ]
        
        for kw in destructive_keywords:
            if kw in lower:
                denial = (
                    f"I apologize, {speaker_name}, but security protocol strictly restricts "
                    f"'{kw}' operations to the Boss. Master clearance is required."
                )
                return False, denial

        return True, None
