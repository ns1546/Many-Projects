"""
J.A.R.V.I.S. Personal Operations & Chief of Staff Branch
Specialized sub-branch for executive agenda coordination, strategic opinions,
meeting management, priority matrix classification, and diplomatic protocol.
"""

import time
import re
from typing import Dict, Any, List, Optional
from core.sub_branches.base_branch import BaseSubBranch, BranchResult


class PersonalOpsBranch(BaseSubBranch):
    """
    Sub-Branch 1: Executive Chief of Staff & Personal Operations.
    Coordinates the user's high-level workflow, strategic advice, and calendar.
    """

    def __init__(
        self,
        assistant_brain: Any,
        daily_life_tools: Any,
        task_manager: Any,
        speaker_id: Optional[Any] = None,
        meeting_intelligence: Optional[Any] = None,
        personalization: Optional[Any] = None
    ):
        super().__init__(
            branch_id="personal_ops",
            branch_name="Executive Chief of Staff & Personal Operations Division",
            description="Autonomous management of executive briefings, strategic opinions, agenda scheduling, group meetings, and personalization protocols."
        )
        self.assistant_brain = assistant_brain
        self.daily_life_tools = daily_life_tools
        self.task_manager = task_manager
        self.speaker_id = speaker_id
        self.meeting_intelligence = meeting_intelligence
        self.personalization = personalization

    @property
    def capabilities(self) -> List[str]:
        return [
            "urgent_topics_briefing",
            "strategic_advisory_and_opinions",
            "eisenhower_agenda_prioritization",
            "meeting_scheduling_and_calendar",
            "open_loop_workload_coordination",
            "speaker_voice_authorization",
            "group_meeting_intelligence",
            "meeting_minutes_synthesis",
            "smart_action_item_delegation",
            "hyper_personalization_profiling"
        ]

    @property
    def specialist_roles(self) -> List[str]:
        return [
            "Executive Chief of Staff",
            "Strategic Decision Advisor",
            "Master Calendar Coordinator",
            "Group Meeting Co-Pilot & Scribe",
            "Hyper-Personalization Architect",
            "Diplomatic Protocol Officer"
        ]

    def can_handle(self, text: str, context: Optional[Dict[str, Any]] = None) -> bool:
        lower = text.lower()
        triggers = [
            "urgent", "brief me", "sit-rep", "executive briefing", "inform me",
            "opinion", "what do you think", "advise me", "advice on", "should i",
            "manage all works", "manage works", "organize my day", "plan my day",
            "schedule meeting", "book meeting", "schedule event", "calendar",
            "agenda", "prioritize tasks", "eisenhower matrix", "who is speaking",
            "start meeting", "end meeting", "wrap up meeting", "pause meeting",
            "resume meeting", "meeting status", "meeting recap", "action items",
            "who owns what", "in meeting", "set priority", "core priorities",
            "add vip", "set preference", "how well do you know me", "what do you know about me"
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
            # 1. Urgent Topics / Sit-Rep Briefing
            if any(w in lower for w in ["urgent", "sit-rep", "brief me", "briefing"]):
                briefing = self.assistant_brain.get_urgent_topics_briefing(
                    speaker_name=speaker_name,
                    is_boss=is_boss
                )
                self.successful_executions += 1
                return BranchResult(
                    success=True,
                    speech=briefing["speech"],
                    action_taken="urgent_topics_briefing",
                    data=briefing,
                    branch_id=self.branch_id,
                    branch_name=self.branch_name,
                    execution_time_ms=(time.time() - start_time) * 1000
                )

            # 2. Strategic Opinions & Advisory
            if any(w in lower for w in ["opinion", "think about", "advise", "advice", "should i", "should we"]):
                op = self.assistant_brain.generate_opinion(
                    text,
                    speaker_name=speaker_name,
                    is_boss=is_boss
                )
                self.successful_executions += 1
                return BranchResult(
                    success=True,
                    speech=op["speech"],
                    action_taken="strategic_advisory",
                    data=op,
                    branch_id=self.branch_id,
                    branch_name=self.branch_name,
                    execution_time_ms=(time.time() - start_time) * 1000
                )

            # 3. Eisenhower Matrix Prioritization & Agenda Optimization
            if any(w in lower for w in ["prioritize", "eisenhower", "organize my day", "manage all works", "manage works"]):
                matrix = self._compute_eisenhower_matrix()
                speech = (
                    f"Workload prioritized across the Eisenhower matrix, {title}. "
                    f"You have {len(matrix['quadrant_1_urgent_important'])} critical items in Quadrant 1 requiring immediate action, "
                    f"and {len(matrix['quadrant_2_important_not_urgent'])} high-leverage strategic objectives in Quadrant 2."
                )
                self.successful_executions += 1
                return BranchResult(
                    success=True,
                    speech=speech,
                    action_taken="eisenhower_prioritization",
                    data=matrix,
                    branch_id=self.branch_id,
                    branch_name=self.branch_name,
                    execution_time_ms=(time.time() - start_time) * 1000
                )

            # 4. Schedule Meeting / Calendar Coordination
            match_sched = re.search(
                r"\b(?:schedule|book|create)\s+(?:a\s+)?(?:meeting|event|appointment)\s+(?:with\s+|for\s+)?(.+)",
                text,
                re.IGNORECASE
            )
            if match_sched:
                raw_event = match_sched.group(1).strip()
                meeting_time = "09:00"
                meeting_title = raw_event
                time_match = re.search(r"\s+(?:at|on)\s+([0-9:apm\s]+)$", raw_event, re.IGNORECASE)
                if time_match:
                    meeting_time = time_match.group(1).strip()
                    meeting_title = raw_event[:time_match.start()].strip()

                cal_res = self.daily_life_tools.add_calendar_event(
                    title=meeting_title,
                    event_date="today",
                    event_time=meeting_time
                )
                speech = f"Meeting '{meeting_title}' coordinated for {meeting_time}, {title}."
                self.successful_executions += 1
                return BranchResult(
                    success=True,
                    speech=speech,
                    action_taken="schedule_meeting",
                    data=cal_res,
                    branch_id=self.branch_id,
                    branch_name=self.branch_name,
                    execution_time_ms=(time.time() - start_time) * 1000
                )

            # 5. Group Meeting Intelligence Lifecycle Controls
            if self.meeting_intelligence:
                # A. Start Group Meeting
                match_start_mtg = re.search(r"\bstart\s+(?:a\s+)?(?:group\s+)?meeting(?:\s+(?:about|on|titled|for)\s+)?(.*)", lower)
                if "start meeting" in lower or match_start_mtg:
                    title_arg = match_start_mtg.group(1).strip() if match_start_mtg and match_start_mtg.group(1).strip() else "Executive Strategy Session"
                    res = self.meeting_intelligence.start_meeting(title=title_arg)
                    self.successful_executions += 1
                    return BranchResult(
                        success=res["success"],
                        speech=res["speech"] if res["success"] else res["message"],
                        action_taken="start_meeting",
                        data=res,
                        branch_id=self.branch_id,
                        branch_name=self.branch_name,
                        execution_time_ms=(time.time() - start_time) * 1000
                    )

                # B. End / Wrap up Group Meeting
                if any(w in lower for w in ["end meeting", "wrap up meeting", "conclude meeting", "finish meeting"]):
                    res = self.meeting_intelligence.end_meeting(speaker_name=speaker_name, is_boss=is_boss)
                    self.successful_executions += 1
                    return BranchResult(
                        success=res["success"],
                        speech=res["speech"],
                        action_taken="end_meeting",
                        data=res,
                        branch_id=self.branch_id,
                        branch_name=self.branch_name,
                        execution_time_ms=(time.time() - start_time) * 1000
                    )

                # C. Pause / Resume Meeting
                if "pause meeting" in lower:
                    res = self.meeting_intelligence.pause_meeting()
                    return BranchResult(
                        success=res["success"],
                        speech=f"{res['message']}, {title}.",
                        action_taken="pause_meeting",
                        data=res,
                        branch_id=self.branch_id,
                        branch_name=self.branch_name,
                        execution_time_ms=(time.time() - start_time) * 1000
                    )
                if "resume meeting" in lower:
                    res = self.meeting_intelligence.resume_meeting()
                    return BranchResult(
                        success=res["success"],
                        speech=f"{res['message']}, {title}.",
                        action_taken="resume_meeting",
                        data=res,
                        branch_id=self.branch_id,
                        branch_name=self.branch_name,
                        execution_time_ms=(time.time() - start_time) * 1000
                    )

                # D. Meeting Status & Action Items
                if any(w in lower for w in ["meeting status", "meeting recap", "who owns what", "action items"]):
                    if self.meeting_intelligence.current_session:
                        res = self.meeting_intelligence._handle_directed_meeting_directive(text, speaker_name, is_boss)
                        self.successful_executions += 1
                        return BranchResult(
                            success=True,
                            speech=res["speech"],
                            action_taken=res.get("action_taken", "meeting_query"),
                            data=res,
                            branch_id=self.branch_id,
                            branch_name=self.branch_name,
                            execution_time_ms=(time.time() - start_time) * 1000
                        )

                # E. Spoken Meeting Utterance Feed ("in meeting [speaker]: [utterance]")
                match_in_mtg = re.search(r"\bin\s+meeting\s*(?:[:,\-]\s*)?(?:\[([A-Za-z0-9_\s]+)\]|([A-Za-z0-9_\-]+))\s*[:,\-]\s*(.+)", text, re.IGNORECASE)
                if match_in_mtg:
                    utt_spk = (match_in_mtg.group(1) or match_in_mtg.group(2) or speaker_name).strip()
                    utt_body = match_in_mtg.group(3).strip()
                    utt_is_boss = (utt_spk.lower() in ["boss", "tony", "sir"])
                    utt_res = self.meeting_intelligence.process_utterance(
                        speaker_name=utt_spk,
                        text=utt_body,
                        is_boss=utt_is_boss
                    )
                    speech_out = utt_res["speech"] or f"Turn logged for {utt_spk} in meeting transcript."
                    self.successful_executions += 1
                    return BranchResult(
                        success=True,
                        speech=speech_out,
                        action_taken="process_meeting_utterance",
                        data=utt_res,
                        branch_id=self.branch_id,
                        branch_name=self.branch_name,
                        execution_time_ms=(time.time() - start_time) * 1000
                    )

            # 6. Hyper-Personalization Engine Controls
            if self.personalization:
                # A. Set Strategic Priority
                match_prio = re.search(r"\b(?:set|add)\s+(?:core\s+|my\s+)?priority[:\s]+(.+)", text, re.IGNORECASE)
                if match_prio:
                    prio_val = match_prio.group(1).strip()
                    msg = self.personalization.set_priority(prio_val)
                    self.successful_executions += 1
                    return BranchResult(
                        success=True,
                        speech=msg,
                        action_taken="set_core_priority",
                        data={"priority": prio_val},
                        branch_id=self.branch_id,
                        branch_name=self.branch_name,
                        execution_time_ms=(time.time() - start_time) * 1000
                    )

                # B. Add VIP Contact
                match_vip = re.search(r"\badd\s+vip\s+(?:contact\s+)?([A-Za-z\s]+?)\s+(?:as|relation)\s+([A-Za-z\s]+)", text, re.IGNORECASE)
                if match_vip:
                    vip_name = match_vip.group(1).strip()
                    vip_rel = match_vip.group(2).strip()
                    msg = self.personalization.add_vip_contact(vip_name, vip_rel)
                    self.successful_executions += 1
                    return BranchResult(
                        success=True,
                        speech=msg,
                        action_taken="add_vip_contact",
                        data={"name": vip_name, "relation": vip_rel},
                        branch_id=self.branch_id,
                        branch_name=self.branch_name,
                        execution_time_ms=(time.time() - start_time) * 1000
                    )

                # C. Personalization Status / Self-Knowledge Query
                if any(w in lower for w in ["how well do you know me", "what do you know about me", "my profile summary", "personalization summary"]):
                    summ = self.personalization.get_personalization_summary()
                    p_list = ", ".join(summ.get("priorities", []))
                    speech = (
                        f"Personalization overview, {title}: You are Commander {summ['user_name']}. "
                        f"Your core priorities are {p_list}. I track {len(summ.get('vip_network', []))} inner circle VIPs "
                        f"and {summ['stored_memories_count']} episodic memories in permanent storage."
                    )
                    self.successful_executions += 1
                    return BranchResult(
                        success=True,
                        speech=speech,
                        action_taken="personalization_summary",
                        data=summ,
                        branch_id=self.branch_id,
                        branch_name=self.branch_name,
                        execution_time_ms=(time.time() - start_time) * 1000
                    )

            # 7. Fallback Workload Coordination
            works = self.assistant_brain.manage_all_works(speaker_name=speaker_name, is_boss=is_boss)
            self.successful_executions += 1
            return BranchResult(
                success=True,
                speech=works["speech"],
                action_taken="manage_works",
                data=works,
                branch_id=self.branch_id,
                branch_name=self.branch_name,
                execution_time_ms=(time.time() - start_time) * 1000
            )

        except Exception as e:
            err_speech = f"Personal Operations division encountered an anomaly: {str(e)}, {title}."
            return BranchResult(
                success=False,
                speech=err_speech,
                action_taken="personal_ops_error",
                data={"error": str(e)},
                branch_id=self.branch_id,
                branch_name=self.branch_name,
                execution_time_ms=(time.time() - start_time) * 1000
            )

    def _compute_eisenhower_matrix(self) -> Dict[str, Any]:
        """Classifies all pending tasks into the 4 Eisenhower decision quadrants."""
        pending = self.task_manager.get_pending_tasks()
        q1 = []  # Urgent & Important
        q2 = []  # Important & Not Urgent
        q3 = []  # Urgent & Not Important
        q4 = []  # Neither

        urgent_patterns = ["urgent", "asap", "critical", "deadline", "immediate", "emergency"]
        important_patterns = ["client", "core", "architecture", "security", "boss", "release", "system"]

        for t in pending:
            desc = t.description.lower()
            is_urgent = any(p in desc for p in urgent_patterns)
            is_important = any(p in desc for p in important_patterns) or len(desc) > 30

            if is_urgent and is_important:
                q1.append({"id": t.id, "desc": t.description})
            elif not is_urgent and is_important:
                q2.append({"id": t.id, "desc": t.description})
            elif is_urgent and not is_important:
                q3.append({"id": t.id, "desc": t.description})
            else:
                q4.append({"id": t.id, "desc": t.description})

        return {
            "quadrant_1_urgent_important": q1,
            "quadrant_2_important_not_urgent": q2,
            "quadrant_3_urgent_not_important": q3,
            "quadrant_4_neither": q4,
            "total_evaluated": len(pending)
        }
