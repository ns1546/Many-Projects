"""
J.A.R.V.I.S. Multi-Party Group Meeting Intelligence & Autonomous Action Engine
Transforms J.A.R.V.I.S. into an elite Executive Secretary and Meeting Co-Pilot:
- Selective Directed-Speech Detection (Silent Scribe vs Direct Interlocutor)
- Speaker-Attributed Chronological Dialogue Logging (Cocktail Party Separation)
- Real-Time Decision Extraction & Consensus Tracking
- SMART Action Item Accountability Matrix (Owner, Deliverable, Deadline, Priority)
- Autonomous Task Delegation into TaskManager & DailyLifeTools Calendar
- Publication of Executive Meeting Minutes Artifacts (.md)
"""

import time
import os
import re
import json
from dataclasses import dataclass, field
from typing import List, Dict, Any, Optional, Tuple

from core.memory.omni_memory import OmniMemory
from core.task_manager import TaskManager
from speech.speaker_id import SpeakerIdentifier
from speech.acoustic_filter import AcousticNoiseFilter


@dataclass
class MeetingUtterance:
    """An individual spoken turn during a meeting."""
    speaker: str
    text: str
    is_boss: bool
    timestamp: float = field(default_factory=time.time)
    is_directed_at_jarvis: bool = False
    extracted_action: Optional[str] = None
    extracted_decision: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        return {
            "speaker": self.speaker,
            "text": self.text,
            "is_boss": self.is_boss,
            "timestamp": round(self.timestamp, 2),
            "is_directed_at_jarvis": self.is_directed_at_jarvis,
            "extracted_action": self.extracted_action,
            "extracted_decision": self.extracted_decision
        }


@dataclass
class MeetingActionItem:
    """A SMART commitment made by a meeting participant."""
    task_description: str
    owner: str
    deadline: str = "TBD"
    priority: str = "Medium"
    status: str = "Pending"
    task_id: Optional[str] = None
    created_at: float = field(default_factory=time.time)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "task_description": self.task_description,
            "owner": self.owner,
            "deadline": self.deadline,
            "priority": self.priority,
            "status": self.status,
            "task_id": self.task_id,
            "created_at": round(self.created_at, 2)
        }


@dataclass
class MeetingSession:
    """The complete lifecycle of an active or concluded group meeting."""
    session_id: str
    title: str
    start_time: float
    end_time: Optional[float] = None
    attendees: List[str] = field(default_factory=list)
    utterances: List[MeetingUtterance] = field(default_factory=list)
    decisions: List[str] = field(default_factory=list)
    action_items: List[MeetingActionItem] = field(default_factory=list)
    status: str = "ACTIVE" # ACTIVE, PAUSED, CONCLUDED


class DirectedSpeechClassifier:
    """
    Classifies whether a spoken utterance is directed at J.A.R.V.I.S. or is
    ambient peer-to-peer communication between human meeting attendees.
    """

    JARVIS_WAKE_TERMS = [
        r"\bjarvis\b", r"\bhey jarvis\b", r"\bj\.a\.r\.v\.i\.s\b",
        r"\bassistant\b", r"\bsystem\b", r"\bcomputer\b"
    ]

    DIRECTED_COMMAND_PATTERNS = [
        r"\b(?:jarvis\s*,?\s*)?(?:take\s+a\s+note|take\s+note|note\s+this|log\s+this)\b",
        r"\b(?:jarvis\s*,?\s*)?(?:assign\s+(?:a\s+)?task|create\s+(?:a\s+)?task|add\s+(?:a\s+)?task)\b",
        r"\b(?:jarvis\s*,?\s*)?(?:schedule\s+(?:a\s+)?meeting|set\s+a\s+reminder|remind\s+us)\b",
        r"\b(?:jarvis\s*,?\s*)?(?:what\s+is\s+our|what's\s+our|show\s+me|summarize\s+the)\b",
        r"\b(?:jarvis\s*,?\s*)?(?:who\s+owns|what\s+are\s+the\s+action\s+items|wrap\s+up\s+the\s+meeting)\b"
    ]

    @classmethod
    def is_directed(cls, text: str, is_boss: bool = False) -> Tuple[bool, str]:
        """
        Returns (is_directed_at_jarvis, clean_prompt_without_wake_word).
        """
        clean_text = text.strip()
        lower = clean_text.lower()

        # 1. Check explicit wake terms
        for term in cls.JARVIS_WAKE_TERMS:
            m = re.search(term, lower)
            if m:
                # Strip the wake term to isolate directive
                stripped = re.sub(term, "", clean_text, flags=re.IGNORECASE).strip()
                stripped = re.sub(r"^[,:\-\s]+", "", stripped)
                return True, (stripped if stripped else clean_text)

        # 2. Check directed assistant-specific patterns
        for pat in cls.DIRECTED_COMMAND_PATTERNS:
            if re.search(pat, lower):
                return True, clean_text

        # Otherwise, ambient inter-human dialogue
        return False, clean_text


class GroupMeetingIntelligence:
    """
    Core engine managing multi-party meeting transcription, decision logging,
    selective attention, and automated action delegation.
    """

    def __init__(
        self,
        task_manager: Optional[TaskManager] = None,
        omni_memory: Optional[OmniMemory] = None,
        daily_life_tools: Optional[Any] = None,
        speaker_id: Optional[SpeakerIdentifier] = None,
        meetings_dir: Optional[str] = None
    ):
        self.task_manager = task_manager or TaskManager()
        self.omni_memory = omni_memory or OmniMemory()
        self.daily_life_tools = daily_life_tools
        self.speaker_id = speaker_id or SpeakerIdentifier()
        self.meetings_dir = meetings_dir or os.path.abspath(
            os.path.join(os.path.dirname(__file__), "..", "data", "meetings")
        )
        os.makedirs(self.meetings_dir, exist_ok=True)

        self.current_session: Optional[MeetingSession] = None
        self.meeting_history: List[MeetingSession] = []

    # =========================================================================
    # 1. MEETING LIFECYCLE MANAGEMENT
    # =========================================================================
    def start_meeting(
        self,
        title: str = "Executive Strategy Session",
        attendees: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """Initiates a new group meeting session."""
        if self.current_session and self.current_session.status == "ACTIVE":
            return {
                "success": False,
                "message": f"A meeting is already active: '{self.current_session.title}'. Please conclude or pause it first."
            }

        session_id = f"mtg_{int(time.time())}"
        att_list = attendees or ["Boss", "Team"]
        if "Boss" not in att_list:
            att_list.insert(0, "Boss")

        self.current_session = MeetingSession(
            session_id=session_id,
            title=title.strip(),
            start_time=time.time(),
            attendees=att_list,
            status="ACTIVE"
        )

        speech = (
            f"Meeting session initiated: '{title}'. I have entered Silent Scribe Mode, sir. "
            f"I will quietly log decisions and action items between attendees, "
            f"and respond whenever addressed directly."
        )
        return {
            "success": True,
            "session_id": session_id,
            "title": title,
            "attendees": att_list,
            "speech": speech
        }

    def pause_meeting(self) -> Dict[str, Any]:
        """Temporarily pauses the active meeting session."""
        if not self.current_session or self.current_session.status != "ACTIVE":
            return {"success": False, "message": "No active meeting session to pause."}

        self.current_session.status = "PAUSED"
        return {"success": True, "message": f"Meeting '{self.current_session.title}' paused."}

    def resume_meeting(self) -> Dict[str, Any]:
        """Resumes a paused meeting session."""
        if not self.current_session or self.current_session.status != "PAUSED":
            return {"success": False, "message": "No paused meeting session to resume."}

        self.current_session.status = "ACTIVE"
        return {"success": True, "message": f"Meeting '{self.current_session.title}' resumed."}

    # =========================================================================
    # 2. UTTERANCE PROCESSING & SELECTIVE ATTENTION
    # =========================================================================
    def process_utterance(
        self,
        speaker_name: str,
        text: str,
        is_boss: bool = False,
        audio_data: Optional[Any] = None
    ) -> Dict[str, Any]:
        """
        Processes an incoming spoken turn during a meeting.
        Distinguishes between:
        1. Ambient Peer-to-Peer speech (transcribes, extracts actions, stays silent)
        2. Directed speech at J.A.R.V.I.S. (executes action, responds out loud)
        """
        if not self.current_session or self.current_session.status != "ACTIVE":
            return {
                "active_meeting": False,
                "is_directed": True,
                "message": "No active meeting session."
            }

        # Track attendee in session
        if speaker_name not in self.current_session.attendees:
            self.current_session.attendees.append(speaker_name)

        is_directed, directive = DirectedSpeechClassifier.is_directed(text, is_boss=is_boss)

        # 1. Passive Extraction: Scan utterance for commitments and decisions
        extracted_decision = self._extract_decision(text, speaker_name)
        extracted_action = self._extract_action_item(text, speaker_name)

        utterance = MeetingUtterance(
            speaker=speaker_name,
            text=text,
            is_boss=is_boss,
            is_directed_at_jarvis=is_directed,
            extracted_action=extracted_action.task_description if extracted_action else None,
            extracted_decision=extracted_decision
        )
        self.current_session.utterances.append(utterance)

        if extracted_decision:
            self.current_session.decisions.append(extracted_decision)

        if extracted_action:
            self._register_action_item(extracted_action)

        # 2. Directed Attention Handling
        if is_directed:
            response = self._handle_directed_meeting_directive(directive, speaker_name, is_boss)
            return {
                "active_meeting": True,
                "is_directed": True,
                "speaker": speaker_name,
                "directive": directive,
                "speech": response.get("speech", "Acknowledged, sir."),
                "action_taken": response.get("action_taken"),
                "extracted_decision": extracted_decision,
                "extracted_action": extracted_action.to_dict() if extracted_action else None
            }
        else:
            # Ambient peer speech: J.A.R.V.I.S. remains silent
            return {
                "active_meeting": True,
                "is_directed": False,
                "speaker": speaker_name,
                "speech": None, # Silent Scribe: No spoken interruption
                "extracted_decision": extracted_decision,
                "extracted_action": extracted_action.to_dict() if extracted_action else None
            }

    # =========================================================================
    # 3. DECISION & SMART ACTION ITEM EXTRACTION
    # =========================================================================
    def _extract_decision(self, text: str, speaker: str) -> Optional[str]:
        """Extracts agreed strategic decisions from dialogue."""
        dec_patterns = [
            r"\b(?:we\s+agreed|we've\s+agreed|we\s+decided|agreed\s+that|decision\s+is|consensus\s+is)\s+(?:that\s+)?(.+)",
            r"\b(?:it's\s+decided|resolution\s+is|we're\s+going\s+with|we\s+approved)\s+(.+)"
        ]
        for pat in dec_patterns:
            m = re.search(pat, text, re.IGNORECASE)
            if m:
                decision = m.group(1).strip()
                # Clean punctuation
                decision = re.sub(r"[.!?]+$", "", decision)
                return f"{decision} (Noted by {speaker})"
        return None

    def _extract_action_item(self, text: str, speaker: str) -> Optional[MeetingActionItem]:
        """Extracts SMART commitments (Owner, Action, Deadline) from natural speech."""
        clean_text = text.strip().rstrip(".!?,; ")
        lower = clean_text.lower()
        
        # Pattern A: "[Name] will/is going to/agreed to [do something] by/on [date]"
        # e.g., "David will finish the API integration by Friday"
        pat_a = r"\b([A-Z][a-zA-Z0-9_\-]+)\s+(?:will|to|shall|is\s+going\s+to|committed\s+to|promised\s+to)\s+([^.,;!?]+?)(?:\s+(?:by|before|on|due)\s+([A-Za-z0-9\s]+))?$"
        m_a = re.search(pat_a, clean_text)
        if m_a:
            owner = m_a.group(1).strip()
            deliverable = m_a.group(2).strip()
            deadline = m_a.group(3).strip() if m_a.group(3) else "EOD Friday"
            
            # Avoid matching common words as owners
            if owner.lower() not in ["it", "this", "that", "there", "we", "i", "you", "who", "what"]:
                prio = "High" if any(w in deliverable.lower() for w in ["critical", "urgent", "asap", "security", "bug"]) else "Medium"
                return MeetingActionItem(
                    task_description=deliverable,
                    owner=owner,
                    deadline=deadline,
                    priority=prio
                )

        # Pattern B: "I will [do something] by [date]" (First person commitment)
        pat_b = r"\b(?:i\s+will|i'll|i\s+can|i'm\s+taking|i\s+will\s+handle)\s+([^.,;!?]+?)(?:\s+(?:by|before|on|due)\s+([A-Za-z0-9\s]+))?$"
        m_b = re.search(pat_b, clean_text, re.IGNORECASE)
        if m_b:
            deliverable = m_b.group(1).strip()
            deadline = m_b.group(2).strip() if m_b.group(2) else "Next check-in"
            prio = "High" if any(w in deliverable.lower() for w in ["critical", "urgent", "asap"]) else "Medium"
            return MeetingActionItem(
                task_description=deliverable,
                owner=speaker,
                deadline=deadline,
                priority=prio
            )

        # Pattern C: Explicit delegation ("Jarvis, assign task to Sarah: review code")
        pat_c = r"\b(?:assign|create\s+task\s+for|delegate\s+to)\s+([A-Za-z]+)(?:\s*[:\-to]+\s*|\s+to\s+)([^.,;!?]+?)(?:\s+(?:by|due)\s+([A-Za-z0-9\s]+))?$"
        m_c = re.search(pat_c, text, re.IGNORECASE)
        if m_c:
            owner = m_c.group(1).strip()
            deliverable = m_c.group(2).strip()
            deadline = m_c.group(3).strip() if m_c.group(3) else "Upcoming sprint"
            return MeetingActionItem(
                task_description=deliverable,
                owner=owner,
                deadline=deadline,
                priority="High"
            )

        return None

    def _register_action_item(self, action_item: MeetingActionItem):
        """Registers extracted action item into session and TaskManager."""
        # Avoid duplicate task items
        for existing in self.current_session.action_items:
            if existing.task_description.lower() == action_item.task_description.lower() and existing.owner.lower() == action_item.owner.lower():
                return

        # Add to session
        self.current_session.action_items.append(action_item)

        # Create real task in TaskManager
        try:
            full_desc = f"[{self.current_session.title}] {action_item.owner}: {action_item.task_description} (Due: {action_item.deadline})"
            prio_val = 1 if action_item.priority == "High" else 2
            task_obj = self.task_manager.add_task(description=full_desc, priority=prio_val)
            action_item.task_id = str(getattr(task_obj, "id", getattr(task_obj, "task_id", "1")))
        except Exception as e:
            print(f" [!] Error registering meeting task in TaskManager: {e}")

    # =========================================================================
    # 4. DIRECTED MEETING DIRECTIVE HANDLER
    # =========================================================================
    def _handle_directed_meeting_directive(
        self,
        directive: str,
        speaker_name: str,
        is_boss: bool
    ) -> Dict[str, Any]:
        """Executes an intentional instruction spoken directly to J.A.R.V.I.S."""
        title = "sir" if is_boss else speaker_name
        lower = directive.lower()

        # A. Query Action Items ("what are the action items?", "who owns what?")
        if any(w in lower for w in ["action items", "who owns what", "list tasks", "what are our commitments"]):
            items = self.current_session.action_items
            if not items:
                speech = f"No action items have been registered yet in this session, {title}."
                return {"speech": speech, "action_taken": "query_action_items"}
            bullets = [f"{it.owner} is responsible for {it.task_description} by {it.deadline}" for it in items]
            speech = f"We have {len(items)} action items logged, {title}: " + "; ".join(bullets) + "."
            return {"speech": speech, "action_taken": "query_action_items", "count": len(items)}

        # B. Query Decisions ("what have we agreed on?", "summarize decisions")
        if any(w in lower for w in ["decisions", "what have we agreed", "consensus"]):
            decs = self.current_session.decisions
            if not decs:
                speech = f"No formal strategic decisions recorded thus far, {title}."
                return {"speech": speech, "action_taken": "query_decisions"}
            speech = f"Agreed decisions to date, {title}: " + "; ".join(decs) + "."
            return {"speech": speech, "action_taken": "query_decisions", "decisions": decs}

        # C. Meeting Status / Interim Summary ("summarize meeting so far")
        if any(w in lower for w in ["summarize", "recap", "status of meeting", "meeting so far"]):
            utter_count = len(self.current_session.utterances)
            item_count = len(self.current_session.action_items)
            dec_count = len(self.current_session.decisions)
            speech = (
                f"Meeting recap for '{self.current_session.title}', {title}: "
                f"{utter_count} conversational turns recorded across {len(self.current_session.attendees)} attendees. "
                f"We have finalized {dec_count} decision{'s' if dec_count != 1 else ''} and "
                f"{item_count} assigned action item{'s' if item_count != 1 else ''}."
            )
            return {"speech": speech, "action_taken": "summarize_meeting"}

        # D. Conclude / End Meeting
        if any(w in lower for w in ["end meeting", "wrap up meeting", "conclude meeting", "finish meeting"]):
            return self.end_meeting(speaker_name=speaker_name, is_boss=is_boss)

        # E. Explicit Note / Fact Logging
        note_match = re.search(r"\b(?:note|log|record)\s+(?:that\s+)?(.+)", directive, re.IGNORECASE)
        if note_match:
            note_content = note_match.group(1).strip()
            self.current_session.decisions.append(f"Noted: {note_content} (Requested by {speaker_name})")
            speech = f"Duly recorded in the official meeting minutes, {title}."
            return {"speech": speech, "action_taken": "log_meeting_note"}

        # F. Generic Fallback
        speech = f"Understood, {title}. Directive '{directive}' captured in our active session log."
        return {"speech": speech, "action_taken": "capture_directive"}

    # =========================================================================
    # 5. MEETING CONCLUSION & EXECUTIVE MINUTES SYNTHESIS
    # =========================================================================
    def end_meeting(self, speaker_name: str = "Boss", is_boss: bool = True) -> Dict[str, Any]:
        """
        Concludes active meeting session, produces executive minutes (.md artifact),
        registers final actions into TaskManager, and stores recap into OmniMemory.
        """
        if not self.current_session or self.current_session.status not in ["ACTIVE", "PAUSED"]:
            return {"success": False, "speech": "No active meeting session to conclude, sir."}

        session = self.current_session
        session.end_time = time.time()
        session.status = "CONCLUDED"
        self.meeting_history.append(session)
        self.current_session = None

        title = "sir" if is_boss else speaker_name
        duration_minutes = round((session.end_time - session.start_time) / 60.0, 1)

        # Synthesize Executive Minutes Markdown Artifact
        minutes_md = self._generate_minutes_markdown(session, duration_minutes)
        minutes_filename = f"meeting_{session.session_id}_{re.sub(r'[^a-zA-Z0-9]', '_', session.title.lower())}.md"
        minutes_path = os.path.join(self.meetings_dir, minutes_filename)

        try:
            with open(minutes_path, "w", encoding="utf-8") as f:
                f.write(minutes_md)
        except Exception as e:
            print(f" [!] Error saving meeting minutes: {e}")

        # Store Executive Summary into OmniMemory
        recap_content = (
            f"Meeting '{session.title}' concluded ({duration_minutes}m). "
            f"Decisions: {len(session.decisions)}. "
            f"Action Items: {len(session.action_items)}. "
            f"Attendees: {', '.join(session.attendees)}."
        )
        self.omni_memory.store_memory(recap_content, category="meeting", importance=4)

        speech = (
            f"Meeting '{session.title}' formally concluded after {duration_minutes} minutes, {title}. "
            f"I have codified {len(session.decisions)} strategic decision{'s' if len(session.decisions) != 1 else ''} "
            f"and dispatched {len(session.action_items)} action item{'s' if len(session.action_items) != 1 else ''} "
            f"into the active execution queue. Executive minutes artifact generated."
        )

        return {
            "success": True,
            "speech": speech,
            "session_id": session.session_id,
            "title": session.title,
            "duration_minutes": duration_minutes,
            "decisions_count": len(session.decisions),
            "action_items_count": len(session.action_items),
            "minutes_path": minutes_path,
            "minutes_markdown": minutes_md
        }

    def _generate_minutes_markdown(self, session: MeetingSession, duration_minutes: float) -> str:
        """
        Formats executive meeting minutes conforming strictly to the
        meeting-synthesis-action-delegation specification.
        """
        date_str = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(session.start_time))
        attendees_str = ", ".join(session.attendees) if session.attendees else "Boss, Team"

        lines = [
            f"# 📋 Executive Meeting Summary: {session.title}",
            f"- **Date & Time**: {date_str} ({duration_minutes} min duration)",
            f"- **Attendees**: {attendees_str}",
            f"- **Session ID**: `{session.session_id}`",
            "",
            "## 🎯 Key Strategic Decisions Agreed",
        ]

        if session.decisions:
            for i, dec in enumerate(session.decisions, 1):
                lines.append(f"{i}. {dec}")
        else:
            lines.append("1. Operational alignment maintained across active initiatives.")

        lines.extend([
            "",
            "## ⚡ SMART Action Item Accountability Table",
            "| Task / Commitment | Owner | Deadline | Priority | Status |",
            "| :--- | :--- | :---: | :---: | :---: |"
        ])

        if session.action_items:
            for item in session.action_items:
                lines.append(
                    f"| {item.task_description} | {item.owner} | {item.deadline} | {item.priority} | {item.status} |"
                )
        else:
            lines.append("| Review meeting transcript and telemetry | Boss | Next Session | Normal | Complete |")

        lines.extend([
            "",
            "## ✉️ Draft Follow-Up Broadcast",
            f'> "Team, thank you for today\'s session on \'{session.title}\'. Our key decisions and action matrix are logged in J.A.R.V.I.S. Please confirm ownership of your assigned deliverables. Best regards, Boss"',
            "",
            "## 📝 Chronological Dialogue Transcript Log",
            "```"
        ])

        for u in session.utterances:
            dir_tag = " [DIRECTED TO JARVIS]" if u.is_directed_at_jarvis else ""
            lines.append(f"[{time.strftime('%H:%M:%S', time.localtime(u.timestamp))}] {u.speaker}{dir_tag}: {u.text}")

        lines.extend([
            "```",
            "",
            "---",
            "*Generated autonomously by J.A.R.V.I.S. Cognitive Assistant & Meeting Intelligence Engine.*"
        ])

        return "\n".join(lines)

    def get_active_meeting_status(self) -> Dict[str, Any]:
        """Returns the status and stats of the currently active session."""
        if not self.current_session:
            return {"active": False, "status": "INACTIVE"}

        elapsed = round((time.time() - self.current_session.start_time) / 60.0, 1)
        return {
            "active": True,
            "session_id": self.current_session.session_id,
            "title": self.current_session.title,
            "status": self.current_session.status,
            "elapsed_minutes": elapsed,
            "attendees": self.current_session.attendees,
            "utterance_count": len(self.current_session.utterances),
            "decisions_count": len(self.current_session.decisions),
            "action_items_count": len(self.current_session.action_items)
        }
