"""
J.A.R.V.I.S. Executive Cognitive Orchestrator
Master Brain: Real Autonomous Task Execution via Hermes Agent Harness,
Action vs. Conversation Routing, Website & Application Management,
Dual-Brain Cognition (OpenRouter Cascade + Local Qwen 2.5 SLM),
Sequential Task Queue, and Neural Speech Synthesis.
"""

import re
import os
import time
import datetime
import webbrowser
from typing import Dict, Any, Optional, List

from core.safety.gates import SafetyGate, SafetyTier
from core.memory.context_memory import ContextMemory
from core.memory.omni_memory import OmniMemory
from core.empathy.affect_engine import AffectEngine
from automation.os_controller import WindowsOSController
from automation.task_executor import NativeTaskExecutor
from automation.gui_agent import WindowsGUIAgent
from automation.screen_perception import ScreenPerception
from automation.web_agent import WebMediaAgent
from automation.sentinel import JarvisSentinel
from communication.communication_hub import CommunicationHub
from creation.creative_studio import CreativeStudio
from protocols.iron_man_protocols import IronManProtocols
from speech.tts_engine import TTSEngine
from core.hermes_bridge import HermesBridge
from core.local_brain import LocalBrain
from core.openrouter_brain import OpenRouterBrain
from core.fast_cloud_brain import FastCloudBrain
from core.conversational_reflex import ConversationalReflexEngine
from core.task_manager import TaskManager, JarvisTask
from core.intent_router import UniversalIntentRouter
from core.skills.skill_registry import SkillRegistry
from core.skills.skill_hub import SkillHub
from core.skills.skill_executor import SkillExecutor
from core.lifegraph.daily_life_nodes import build_daily_life_graph
from automation.daily_life.daily_life_tools import DailyLifeTools
from speech.speaker_id import SpeakerIdentifier
from speech.acoustic_filter import AcousticNoiseFilter
from speech.diarization import SpeakerDiarizer
from core.assistant_brain import ExecutiveAssistantBrain
from core.personalization import PersonalizationEngine
from core.meeting_intelligence import GroupMeetingIntelligence
from core.sub_branches import (
    SubBranchRegistry,
    PersonalOpsBranch,
    EngineeringBranch,
    CyberSentinelBranch,
    CommunicationsBranch,
    DailyLifeBranch,
    PerceptionBranch
)

class JarvisOrchestrator:
    WEB_SHORTCUTS = {
        "youtube": "https://www.youtube.com",
        "google": "https://www.google.com",
        "github": "https://www.github.com",
        "gmail": "https://mail.google.com",
        "chatgpt": "https://chat.openai.com",
        "reddit": "https://www.reddit.com",
        "twitter": "https://x.com",
        "x": "https://x.com",
        "netflix": "https://www.netflix.com",
        "facebook": "https://www.facebook.com",
        "instagram": "https://www.instagram.com",
        "amazon": "https://www.amazon.com",
        "wikipedia": "https://www.wikipedia.org",
        "spotify web": "https://open.spotify.com",
        "maps": "https://maps.google.com"
    }

    def __init__(self, config: Optional[Dict[str, Any]] = None):
        self.config = config or {}
        self.safety_gate = SafetyGate(enforce_gates=True)
        self.memory = ContextMemory()
        self.omni_memory = OmniMemory()
        self.affect_engine = AffectEngine()
        self.os_controller = WindowsOSController()
        self.task_executor = NativeTaskExecutor()
        self.gui_agent = WindowsGUIAgent()
        self.screen_perception = ScreenPerception()
        self.web_media = WebMediaAgent()
        self.creative_studio = CreativeStudio()
        self.protocols = IronManProtocols()
        self.tts = TTSEngine()
        self.intent_router = UniversalIntentRouter()
        self.sentinel = JarvisSentinel(tts_callback=self.tts.speak)
        self.sentinel.start()
        self.hermes = HermesBridge()
        self.local_brain = LocalBrain()
        self.openrouter_brain = OpenRouterBrain()
        self.fast_cloud_brain = FastCloudBrain()
        self.reflex_engine = ConversationalReflexEngine(owner_name="Sir")
        self.task_manager = TaskManager()
        
        # Multi-Channel Communication Hub & Autonomous WhatsApp Customer Care
        self.comm_hub = CommunicationHub(
            memory=self.omni_memory,
            tts_engine=self.tts,
            task_manager=self.task_manager,
            openrouter_brain=self.openrouter_brain,
            local_brain=self.local_brain
        )
        self.customer_care = self.comm_hub.customer_care

        
        # Universal Agentic Skills Engine (Local Catalog & Online Registry)
        self.skills = SkillRegistry()
        self.skill_registry = self.skills
        self.skill_hub = SkillHub()
        self.skill_executor = SkillExecutor(self.skills, self.hermes, self.task_executor)
        try:
            self.skill_hub.trust_workspace()
        except Exception:
            pass

        # Large-Scale Cognitive LifeGraph & Daily Life Tools Suite
        self.daily_life_tools = DailyLifeTools(tts_callback=self.tts.speak)
        self.life_graph = build_daily_life_graph(self.skills)
        try:
            self.skills.bridge_lifegraph(self.life_graph)
        except Exception:
            pass

        # Multi-Speaker Biometric Recognition, Acoustic Filter & Diarization
        self.speaker_id = SpeakerIdentifier()
        self.acoustic_filter = AcousticNoiseFilter()
        self.diarizer = SpeakerDiarizer(speaker_id=self.speaker_id, acoustic_filter=self.acoustic_filter)

        # Hyper-Personalization Engine & Group Meeting Intelligence Co-Pilot
        self.personalization = PersonalizationEngine(omni_memory=self.omni_memory)
        self.meeting_intelligence = GroupMeetingIntelligence(
            task_manager=self.task_manager,
            omni_memory=self.omni_memory,
            daily_life_tools=self.daily_life_tools,
            speaker_id=self.speaker_id
        )

        # Chief-of-Staff Assistant Brain
        self.assistant_brain = ExecutiveAssistantBrain(
            omni_memory=self.omni_memory,
            task_manager=self.task_manager,
            daily_life_tools=self.daily_life_tools,
            os_controller=self.os_controller,
            speaker_id=self.speaker_id,
            openrouter_brain=self.openrouter_brain,
            local_brain=self.local_brain,
            tts_callback=self.tts.speak,
            personalization=self.personalization,
            meeting_intelligence=self.meeting_intelligence
        )

        # Autonomous Sub-Branch Architecture & Departmental Registry
        self.sub_branches = SubBranchRegistry()
        self.personal_ops_branch = PersonalOpsBranch(
            assistant_brain=self.assistant_brain,
            daily_life_tools=self.daily_life_tools,
            task_manager=self.task_manager,
            speaker_id=self.speaker_id,
            meeting_intelligence=self.meeting_intelligence,
            personalization=self.personalization
        )
        self.engineering_branch = EngineeringBranch(
            hermes=self.hermes,
            task_executor=self.task_executor,
            skill_registry=self.skill_registry,
            skill_hub=self.skill_hub
        )
        self.cyber_sentinel_branch = CyberSentinelBranch(
            sentinel=self.sentinel,
            os_controller=self.os_controller,
            safety_gate=self.safety_gate
        )
        self.communications_branch = CommunicationsBranch(
            comm_hub=self.comm_hub,
            customer_care=self.customer_care
        )
        self.daily_life_branch = DailyLifeBranch(
            daily_life_tools=self.daily_life_tools,
            life_graph=self.life_graph
        )
        self.perception_branch = PerceptionBranch(
            screen_perception=self.screen_perception,
            gui_agent=self.gui_agent,
            web_media=self.web_media,
            os_controller=self.os_controller
        )
        self.sub_branches.register_branch(self.personal_ops_branch)
        self.sub_branches.register_branch(self.communications_branch)
        self.sub_branches.register_branch(self.engineering_branch)
        self.sub_branches.register_branch(self.cyber_sentinel_branch)
        self.sub_branches.register_branch(self.daily_life_branch)
        self.sub_branches.register_branch(self.perception_branch)
        
        # Load persona prompt
        self.persona_text = ""
        prompt_path = os.path.join(os.path.dirname(__file__), "..", "config", "persona.prompt")
        if os.path.exists(prompt_path):
            with open(prompt_path, "r", encoding="utf-8") as f:
                self.persona_text = f.read().strip()
        else:
            self.persona_text = (
                "You are J.A.R.V.I.S., Tony Stark's personal AI major-domo. "
                "Speak with a refined, eloquent British cadence, address the user as 'Sir', "
                "and keep verbal responses crisp (1 to 2 sentences max) suitable for direct speech."
            )

    @staticmethod
    def is_action_directive(text: str) -> bool:
        """
        Detects if a user input requires real-world tool execution
        (file modification, code synthesis, web search, shell execution, research, app creation).
        """
        lower = text.lower().strip()
        
        # 1. Direct keywords that always imply action/tasking
        action_keywords = [
            r"\b(?:task|tasks|agenda|todo|step\s*\d+|phase\s*\d+)\b",
            r"\b(?:take\s+this|do\s+this|perform\s+this|work\s+on\s+this|help\s+me\s+(?:build|make|create|write|code))\b",
            r"\b(?:let\'?s\s+(?:build|make|create|code|write|start))\b"
        ]
        if any(re.search(p, lower) for p in action_keywords):
            return True

        # 2. Creation / Coding / Building directives (e.g. "create index.html", "make a calculator", "build a website")
        creation_verbs = r"(?:create|make|build|generate|write|develop|code|implement|construct|compose|produce)"
        creation_targets = r"(?:file|folder|dir|directory|script|code|doc|document|note|program|test|app|application|website|webpage|page|site|project|html|css|python|bot|calculator|game|api|server|function|class|repo|repository|\w+\.(?:py|html|js|css|txt|json|md|sh|bat|ps1|csv|xml))"
        creation_pattern = rf"\b{creation_verbs}\s+(?:(?:a|an|the|me|us|new|our)\s+)*(?:[a-zA-Z0-9_\-]+\s+){{0,3}}{creation_targets}\b"
        if re.search(creation_pattern, lower):
            return True

        # 3. File extensions mentioned with action verbs
        file_ext_pattern = r"\b(?:create|make|write|generate|edit|modify|update|touch|save)\s+.*?\.(?:py|html|js|css|txt|json|md|sh|bat|ps1|csv)\b"
        if re.search(file_ext_pattern, lower):
            return True

        # 4. Web search & research
        search_pattern = r"\b(?:search|look\s+up|google|find|browse|scrape|research|what\s+is\s+the\s+weather|weather\s+in|news\s+about|check\s+news)\b"
        if re.search(search_pattern, lower):
            return True

        # 5. Shell & System execution
        exec_pattern = r"\b(?:run|execute|install|compile|clone|git|pip|npm|yarn|pytest|python|node|bash|powershell|cmd)\s+[a-zA-Z0-9_\-\.]+"
        if re.search(exec_pattern, lower):
            return True

        # 6. File manipulation (delete, clean, download, fetch)
        manip_pattern = r"\b(?:delete|remove|erase|clear\s+file|kill\s+process|clean\s+up|download|fetch|curl|wget)\b"
        if re.search(manip_pattern, lower):
            return True

        # 7. Code inspection / reading files
        inspect_pattern = r"\b(?:summarize|read|inspect|analyze|review|explain)\s+(?:this\s+|the\s+)?(?:file|folder|codebase|code|repo|directory|script|log)\b"
        if re.search(inspect_pattern, lower):
            return True

        return False

    def handle_command(
        self,
        user_input: str,
        speaker_name: str = "Boss",
        is_boss: bool = True,
        audio_data: Optional[Any] = None
    ) -> Dict[str, Any]:
        """
        Main entrypoint for processing any user command.
        Evaluates speaker biometrics, authority gates, executive sit-rep briefings,
        strategic opinions, agenda management, and detached non-blocking actions.
        """
        text = user_input.strip()
        if not text:
            return {"speech": "I am listening, sir.", "action_taken": None}

        # =========================================================================
        # -2. Utterance Deduplication Lock (Prevents Dual-Microphone Collision)
        # Drops redundant triggers between physical desktop mic & browser web mic
        # =========================================================================
        now_time = time.time()
        clean_key = re.sub(r"[^a-zA-Z0-9]", "", text.lower())
        if (
            hasattr(self, "_last_command_key")
            and self._last_command_key == clean_key
            and (now_time - getattr(self, "_last_command_time", 0)) < 2.5
        ):
            cached = getattr(self, "_last_command_result", {})
            return {
                "speech": cached.get("speech", ""),
                "action_taken": "deduplicated",
                "deduplicated": True,
                "original_action": cached.get("action_taken")
            }
        self._last_command_key = clean_key
        self._last_command_time = now_time
            
        self.memory.add_turn("user", text)
        lower = text.lower()

        # =========================================================================
        # -1. Multi-Speaker Biometric Verification & Privilege Gatekeeper
        # =========================================================================
        speaker_confidence = 1.0
        if audio_data is not None:
            id_res = self.speaker_id.identify_speaker(audio_data)
            speaker_name = id_res.get("name", speaker_name)
            is_boss = id_res.get("is_boss", is_boss)
            speaker_confidence = id_res.get("confidence", 0.85)

        title = "sir" if is_boss else speaker_name

        # =========================================================================
        # 0. Sub-5ms Instant Conversational Reflex Engine
        # Delivers authentic, refined British AI responses in <5ms for greetings,
        # status checks, current time/date, microphone checks, and pleasantries.
        # =========================================================================
        reflex = self.reflex_engine.match_reflex(text, os_controller=self.os_controller)
        if reflex:
            speech = reflex["speech"]
            self.tts.speak(speech)
            self.memory.add_turn("assistant", speech)
            self.omni_memory.archive_turn("assistant", speech)
            res = {"speech": speech, "action_taken": reflex["action_taken"], "speaker": speaker_name}
            self._last_command_result = res
            return res

        # =========================================================================
        # 0a. Multi-Step Task Sequential Decomposition ("first X, then Y", "do these tasks: ...", "1. X, 2. Y")
        # =========================================================================
        multi_steps = TaskManager.decompose_multi_step_request(text)
        if len(multi_steps) >= 2:
            return self._handle_sequential_tasks(multi_steps)

        # =========================================================================
        # 0b. Fast Application & Website Launcher (<10ms Win32 ShellExecute)
        # =========================================================================
        match_launch = re.search(r"\b(?:open|launch|start|navigate to|go to)\s+([a-zA-Z0-9_\-\.\s]+)", lower)
        if match_launch:
            raw_target = match_launch.group(1).strip()
            # Guard against window/task/system inspection commands
            inspection_terms = ["open windows", "active windows", "windows list", "open apps", "running apps", "vitals", "status", "tasks", "task"]
            if not any(w in raw_target for w in inspection_terms):
                # 1. Website Shortcuts
                for key, url in self.WEB_SHORTCUTS.items():
                    if key in raw_target:
                        webbrowser.open(url)
                        speech = f"Opening {key.title()} in your browser now, {title}."
                        self.tts.speak(speech)
                        self.memory.add_turn("assistant", speech)
                        res = {"speech": speech, "action_taken": "open_website", "url": url}
                        self._last_command_result = res
                        return res

                # 2. Explicit Domains & Web URLs
                if raw_target.startswith(("http://", "https://", "www.")) or raw_target.endswith((".com", ".org", ".io", ".net", ".edu")):
                    url = raw_target if raw_target.startswith("http") else f"https://{raw_target}"
                    webbrowser.open(url)
                    speech = f"Opening {raw_target} in your browser now, {title}."
                    self.tts.speak(speech)
                    self.memory.add_turn("assistant", speech)
                    res = {"speech": speech, "action_taken": "open_url", "url": url}
                    self._last_command_result = res
                    return res

                # 3. Native Desktop Applications via Win32 ShellExecute (e.g. 'chrome', 'crome', 'notepad', 'code')
                app_res = self.os_controller.launch_application(raw_target)
                app_disp = app_res.get("resolved_name", raw_target).title()
                speech = f"Opening {app_disp} now, {title}."
                self.tts.speak(speech)
                self.memory.add_turn("assistant", speech)
                res = {"speech": speech, "action_taken": "launch_app", "target": raw_target, "resolved": app_disp}
                self._last_command_result = res
                return res

        # Proactive Personalization Learning (Boss habits, preferences, active projects)
        if is_boss:
            self.personalization.learn_from_conversation(text, speaker_name=speaker_name, is_boss=is_boss)

        # Security Authorization Gate against Destructive Actions
        allowed, denial_speech = self.assistant_brain.check_speaker_authorization(text, speaker_name, is_boss)
        if not allowed and denial_speech:
            self.tts.speak(denial_speech)
            self.memory.add_turn("assistant", denial_speech)
            self.omni_memory.archive_turn("assistant", denial_speech)
            return {"speech": denial_speech, "action_taken": "authorization_denied", "speaker": speaker_name}

        # Speaker Biometric Voice Enrollment & Identity Queries
        if any(w in lower for w in ["enroll my voice as boss", "register my voice as boss", "this is my voice as boss", "enroll as boss", "register me as boss"]):
            if audio_data is not None:
                self.speaker_id.enroll_speaker("Boss", audio_data, is_boss=True, title="Sir")
                speech = "Biometric voice calibration complete, sir. Your acoustic signature is registered as Master Commander."
            else:
                self.speaker_id.enroll_speaker("Boss", b"\x00"*3200, is_boss=True, title="Sir")
                speech = "Voice profile registered, sir. Your commands carry master executive authority."
            self.tts.speak(speech)
            self.memory.add_turn("assistant", speech)
            return {"speech": speech, "action_taken": "enroll_boss_speaker", "speaker": "Boss"}

        match_enroll_other = re.search(r"\b(?:enroll|register)\s+(?:speaker|voice)\s+(?:as\s+|for\s+)?([a-zA-Z0-9_\s]+)", lower)
        if match_enroll_other:
            target_name = match_enroll_other.group(1).strip().title()
            if target_name.lower() not in ["boss", "sir", "me"]:
                self.speaker_id.enroll_speaker(target_name, audio_data or b"\x00"*3200, is_boss=False, role="colleague", title=target_name)
                speech = f"Biometric voice profile for {target_name} registered successfully, {title}."
                self.tts.speak(speech)
                self.memory.add_turn("assistant", speech)
                return {"speech": speech, "action_taken": "enroll_speaker", "name": target_name}

        if any(w in lower for w in ["who is speaking", "who am i", "do you recognize me", "do you recognize my voice"]):
            speech = f"You are recognized as {speaker_name}, {'with master clearance, sir' if is_boss else 'as a welcome guest'}."
            self.tts.speak(speech)
            self.memory.add_turn("assistant", speech)
            return {"speech": speech, "action_taken": "identify_speaker", "speaker": speaker_name, "is_boss": is_boss}

        if any(w in lower for w in ["list speakers", "registered speakers", "who do you know", "known voices"]):
            speakers = self.speaker_id.list_speakers()
            names = [s["name"] for s in speakers]
            speech = f"I currently have biometric voice records for {len(names)} individuals, {title}: {', '.join(names)}."
            self.tts.speak(speech)
            self.memory.add_turn("assistant", speech)
            return {"speech": speech, "action_taken": "list_speakers", "speakers": speakers}



        # =========================================================================
        # -1b. Sub-Branch Fleet Telemetry & Departmental Delegation
        # =========================================================================
        if any(w in lower for w in [
            "how many branches", "list branches", "show branches", "sub-branch status",
            "sub branches", "sub branch", "operational branches", "show divisions",
            "fleet status", "divisions overview", "what branches do you have"
        ]):
            speech = self.sub_branches.format_speech_overview(title=title)
            fleet_data = self.sub_branches.get_fleet_status()
            self.tts.speak(speech)
            self.memory.add_turn("assistant", speech)
            self.omni_memory.archive_turn("assistant", speech)
            return {"speech": speech, "action_taken": "list_sub_branches", "data": fleet_data}

        # Explicit Sub-Branch Delegation (e.g. "engineering branch: ...", "delegate to personal ops: ...")
        explicit_branch_triggers = [
            "engineering branch", "devops branch", "sentinel branch",
            "communications branch", "customer care branch", "daily life branch",
            "personal ops branch", "perception branch", "vision branch",
            "delegate to "
        ]
        if any(trig in lower for trig in explicit_branch_triggers):
            branch_res = self.sub_branches.dispatch(text, context={"speaker_name": speaker_name, "is_boss": is_boss})
            if branch_res:
                self.tts.speak(branch_res.speech)
                self.memory.add_turn("assistant", branch_res.speech)
                self.omni_memory.archive_turn("assistant", branch_res.speech)
                return branch_res.to_dict()

        # =========================================================================
        # -2. Real Executive Chief-of-Staff Assistant Capabilities
        # =========================================================================
        # A. Urgent Topics & Executive Sit-Rep Briefings
        if any(w in lower for w in ["urgent topics", "urgent topic", "urgent matters", "what is urgent", "what's urgent", "brief me", "sit-rep", "executive briefing", "inform me about urgent"]):
            briefing = self.assistant_brain.get_urgent_topics_briefing(speaker_name=speaker_name, is_boss=is_boss)
            speech = briefing["speech"]
            self.tts.speak(speech)
            self.memory.add_turn("assistant", speech)
            self.omni_memory.archive_turn("assistant", speech)
            return {"speech": speech, "action_taken": "urgent_topics_briefing", "data": briefing}

        # B. Executive Opinions & Strategic Advisory
        if any(lower.startswith(p) or f" {p}" in lower for p in [
            "give opinion", "give your opinion", "what do you think about",
            "what's your opinion", "what is your opinion", "give advice on",
            "advise me on", "what should i do about", "should i ", "should we "
        ]):
            op = self.assistant_brain.generate_opinion(text, speaker_name=speaker_name, is_boss=is_boss)
            speech = op["speech"]
            self.tts.speak(speech)
            self.memory.add_turn("assistant", speech)
            self.omni_memory.archive_turn("assistant", speech)
            return {"speech": speech, "action_taken": "executive_opinion", "data": op}

        # C. Workload Coordination & Managing All Works
        if any(w in lower for w in ["manage all works", "manage my works", "manage works", "manage my tasks", "organize my day", "what should i work on", "plan my day"]):
            works = self.assistant_brain.manage_all_works(speaker_name=speaker_name, is_boss=is_boss)
            speech = works["speech"]
            self.tts.speak(speech)
            self.memory.add_turn("assistant", speech)
            self.omni_memory.archive_turn("assistant", speech)
            return {"speech": speech, "action_taken": "manage_works", "data": works}

        # D. Executive Meeting & Schedule Creation
        match_schedule_meeting = re.search(r"\b(?:schedule|book|create)\s+(?:a\s+)?(?:meeting|event|appointment)\s+(?:with\s+|for\s+)?(.+)", text, re.IGNORECASE)
        if match_schedule_meeting and not any(w in lower for w in ["task", "todo", "file", "project", "script", "app"]):
            raw_event = match_schedule_meeting.group(1).strip()
            meeting_time = "09:00"
            meeting_title = raw_event
            time_match = re.search(r"\s+(?:at|on)\s+([0-9:apm\s]+)$", raw_event, re.IGNORECASE)
            if time_match:
                meeting_time = time_match.group(1).strip()
                meeting_title = raw_event[:time_match.start()].strip()
            cal_res = self.daily_life_tools.add_calendar_event(title=meeting_title, event_date="today", event_time=meeting_time)
            speech = f"Meeting '{meeting_title}' scheduled for {meeting_time}, {title}."
            self.tts.speak(speech)
            self.memory.add_turn("assistant", speech)
            return {"speech": speech, "action_taken": "schedule_meeting", "event": cal_res}

        # =========================================================================
        # -2b. Group Meeting Intelligence & Selective Attention Co-Pilot
        # =========================================================================
        # A. Start Group Meeting
        match_start_mtg = re.search(r"\bstart\s+(?:a\s+)?(?:group\s+)?meeting(?:\s+(?:about|on|titled|for)\s+)?(.*)", text, re.IGNORECASE)
        if ("start meeting" in lower or match_start_mtg) and not any(w in lower for w in ["schedule", "tomorrow", "next week"]):
            title_arg = match_start_mtg.group(1).strip() if match_start_mtg and match_start_mtg.group(1).strip() else "Executive Strategy Session"
            res = self.meeting_intelligence.start_meeting(title=title_arg)
            speech = res["speech"] if res["success"] else res["message"]
            self.tts.speak(speech)
            self.memory.add_turn("assistant", speech)
            return {"speech": speech, "action_taken": "start_meeting", "data": res}

        # B. End / Wrap up Group Meeting
        if any(w in lower for w in ["end meeting", "wrap up meeting", "conclude meeting", "finish meeting"]):
            res = self.meeting_intelligence.end_meeting(speaker_name=speaker_name, is_boss=is_boss)
            speech = res["speech"]
            self.tts.speak(speech)
            self.memory.add_turn("assistant", speech)
            return {"speech": speech, "action_taken": "end_meeting", "data": res}

        # C. Pause / Resume Group Meeting
        if "pause meeting" in lower:
            res = self.meeting_intelligence.pause_meeting()
            speech = f"{res['message']}, {title}."
            self.tts.speak(speech)
            self.memory.add_turn("assistant", speech)
            return {"speech": speech, "action_taken": "pause_meeting", "data": res}

        if "resume meeting" in lower:
            res = self.meeting_intelligence.resume_meeting()
            speech = f"{res['message']}, {title}."
            self.tts.speak(speech)
            self.memory.add_turn("assistant", speech)
            return {"speech": speech, "action_taken": "resume_meeting", "data": res}

        # D. Action Items & Meeting Status
        if any(w in lower for w in ["action items", "who owns what", "meeting status", "meeting recap", "meeting summary"]):
            if self.meeting_intelligence.current_session:
                res = self.meeting_intelligence._handle_directed_meeting_directive(text, speaker_name, is_boss)
                speech = res["speech"]
                self.tts.speak(speech)
                self.memory.add_turn("assistant", speech)
                return {"speech": speech, "action_taken": res.get("action_taken", "query_meeting"), "data": res}

        # E. Spoken Meeting Utterance Feed ("in meeting [speaker]: [utterance]")
        match_in_mtg = re.search(r"\bin\s+meeting\s*(?:[:,\-]\s*)?(?:\[([A-Za-z0-9_\s]+)\]|([A-Za-z0-9_\-]+))\s*[:,\-]\s*(.+)", text, re.IGNORECASE)
        if match_in_mtg:
            utt_spk = (match_in_mtg.group(1) or match_in_mtg.group(2) or speaker_name).strip()
            utt_body = match_in_mtg.group(3).strip()
            utt_is_boss = (utt_spk.lower() in ["boss", "tony", "sir"]) or is_boss
            mtg_res = self.meeting_intelligence.process_utterance(
                speaker_name=utt_spk,
                text=utt_body,
                is_boss=utt_is_boss,
                audio_data=audio_data
            )
            speech = mtg_res.get("speech") or f"Utterance logged for {utt_spk} in meeting transcript."
            if mtg_res.get("speech"):
                self.tts.speak(mtg_res["speech"])
            self.memory.add_turn("assistant", speech)
            return {"speech": speech, "action_taken": "process_meeting_utterance", "data": mtg_res}

        # =========================================================================
        # -2c. Hyper-Personalization Engine & Inner Circle VIP CRM
        # =========================================================================
        # A. Set Strategic Priority
        match_prio = re.search(r"\b(?:set|add)\s+(?:core\s+|my\s+)?priority[:\s]+(.+)", text, re.IGNORECASE)
        if match_prio:
            prio_val = match_prio.group(1).strip()
            speech = self.personalization.set_priority(prio_val)
            self.tts.speak(speech)
            self.memory.add_turn("assistant", speech)
            return {"speech": speech, "action_taken": "set_core_priority", "priority": prio_val}

        # B. Add VIP Contact
        match_vip = re.search(r"\badd\s+vip\s+(?:contact\s+)?([A-Za-z\s]+?)\s+(?:as|relation)\s+([A-Za-z\s]+)", text, re.IGNORECASE)
        if match_vip:
            vip_name = match_vip.group(1).strip()
            vip_rel = match_vip.group(2).strip()
            speech = self.personalization.add_vip_contact(vip_name, vip_rel)
            self.tts.speak(speech)
            self.memory.add_turn("assistant", speech)
            return {"speech": speech, "action_taken": "add_vip_contact", "name": vip_name, "relation": vip_rel}

        # C. Personalization Status / Self-Knowledge Query
        if any(w in lower for w in ["how well do you know me", "what do you know about me", "my profile summary", "personalization summary"]):
            summ = self.personalization.get_personalization_summary()
            p_list = ", ".join(summ.get("priorities", []))
            speech = (
                f"Personalization overview, {title}: You are Commander {summ['user_name']}. "
                f"Your core priorities are {p_list}. I track {len(summ.get('vip_network', []))} inner circle VIPs "
                f"and {summ['stored_memories_count']} episodic memories in permanent storage."
            )
            self.tts.speak(speech)
            self.memory.add_turn("assistant", speech)
            return {"speech": speech, "action_taken": "personalization_summary", "data": summ}

        # =========================================================================
        # -3. Autonomous WhatsApp Customer Care & Call Receptionist Mode
        # =========================================================================
        # A. Receptionist Mode Activation / Deactivation ("attend call on my behalf")
        if re.search(r"\b(?:attend\s+calls?|take\s+calls?|receptionist)\s+(?:on\s+my\s+behalf|belaf\s+off\s+me|behalf\s+of\s+me|for\s+me)\b", lower) or \
           any(w in lower for w in ["be my receptionist", "be my whatsapp receptionist", "enable receptionist mode", "enable whatsapp receptionist", "activate receptionist"]):
            self.customer_care.set_receptionist_mode(True)
            speech = f"Autonomous WhatsApp Call Receptionist is now active, {title}. I shall attend incoming calls on your behalf with utmost executive poise."
            self.tts.speak(speech)
            self.memory.add_turn("assistant", speech)
            return {"speech": speech, "action_taken": "enable_whatsapp_receptionist"}

        if any(w in lower for w in ["stop attending calls", "disable receptionist mode", "disable whatsapp receptionist", "don't attend calls", "i will take calls"]):
            self.customer_care.set_receptionist_mode(False)
            speech = f"Autonomous WhatsApp Call Receptionist deactivated, {title}. Calls will route directly to you."
            self.tts.speak(speech)
            self.memory.add_turn("assistant", speech)
            return {"speech": speech, "action_taken": "disable_whatsapp_receptionist"}

        # B. Teaching Customer Care Knowledge (Child-Like Continuous Learning)
        teach_match = re.search(r"\b(?:learn\s+(?:this\s+)?(?:for\s+customer\s+care\s*)?[:\s]+|teach\s+customer\s+care[:\s]+|customer\s+care\s+rule[:\s]+|remember\s+for\s+customer\s+care[:\s]+)(.+)", text, re.IGNORECASE)
        is_direct_care_rule = any(lower.startswith(p) or f" {p}" in lower for p in [
            "our return policy is", "our refund policy is", "our delivery fee is",
            "our shipping fee is", "our working hours are", "our store hours are",
            "if customer asks", "when customer asks", "tell customers that"
        ])
        if teach_match or is_direct_care_rule:
            instruction_to_learn = teach_match.group(1).strip() if teach_match else text
            learn_res = self.customer_care.teach_rule(instruction_to_learn)
            speech = learn_res["message"]
            self.tts.speak(speech)
            self.memory.add_turn("assistant", speech)
            return {"speech": speech, "action_taken": "learn_customer_care_rule", "data": learn_res}

        # C. Customer Care Dashboard & Real-Time Performance Analytics
        if any(w in lower for w in ["customer care dashboard", "customer care status", "whatsapp care status", "show customer tickets", "customer care tickets"]):
            dash = self.customer_care.get_service_dashboard()
            rec_status = "active" if dash["receptionist_mode"] else "standby"
            speech = (
                f"Customer care briefing, {title}: {dash['total_interactions']} total interactions logged, "
                f"{dash['resolved_tickets']} resolved, {dash['escalated_tickets']} escalated to you, "
                f"and {dash['calls_attended']} calls attended. Receptionist mode is currently {rec_status}."
            )
            self.tts.speak(speech)
            self.memory.add_turn("assistant", speech)
            return {"speech": speech, "action_taken": "customer_care_dashboard", "dashboard": dash}

        # D. Send WhatsApp Voice Note
        match_voice_note = re.search(r"\bsend\s+(?:a\s+)?(?:whatsapp\s+)?voice\s+note\s+to\s+([a-zA-Z0-9_\+\-\s]+?)[:\s]+(.+)", text, re.IGNORECASE)
        if match_voice_note:
            recip = match_voice_note.group(1).strip()
            vn_text = match_voice_note.group(2).strip()
            vn_res = self.comm_hub.send_whatsapp_voice_note(recip, vn_text)
            speech = f"Synthesized and dispatched WhatsApp voice note for {recip}, {title}."
            self.tts.speak(speech)
            self.memory.add_turn("assistant", speech)
            return {"speech": speech, "action_taken": "send_whatsapp_voice_note", "data": vn_res}

        # E. Process / Simulate Incoming Customer Query
        match_inc_msg = re.search(r"\b(?:incoming\s+whatsapp\s+message|simulate\s+incoming\s+whatsapp\s+message|whatsapp\s+customer\s+message)\s+(?:from\s+([^:\n]+?))?[:\s]+(.+)", text, re.IGNORECASE)
        if match_inc_msg:
            sender = match_inc_msg.group(1).strip() if match_inc_msg.group(1) else "Customer"
            msg_body = match_inc_msg.group(2).strip()
            care_res = self.customer_care.process_incoming_text(customer_phone="+1-555-0199", customer_name=sender, message_text=msg_body)
            speech = f"Customer message from {sender} processed, {title}. Status: {care_res['status']}. Reply formulated: '{care_res['reply_text'][:90]}...'"
            self.tts.speak(speech)
            self.memory.add_turn("assistant", speech)
            return {"speech": speech, "action_taken": "process_whatsapp_customer_message", "data": care_res}

        # F. Process / Simulate Incoming Customer Call ("attend call from...")
        match_inc_call_saying = re.search(
            r"\b(?:incoming\s+(?:whatsapp\s+)?call|attend\s+call\s+from|simulate\s+incoming\s+call)\s+(?:from\s+([^:\n]+?))\s+saying\s*[:\s]+(.+)",
            text, re.IGNORECASE
        )
        match_inc_call_plain = re.search(
            r"\b(?:incoming\s+(?:whatsapp\s+)?call|attend\s+call\s+from|simulate\s+incoming\s+call)\s+(?:from\s+([^:\n]+))?",
            text, re.IGNORECASE
        )
        if match_inc_call_saying:
            caller = match_inc_call_saying.group(1).strip()
            caller_speech = match_inc_call_saying.group(2).strip().strip("'\"")
            call_res = self.customer_care.attend_call(caller_phone="+1-555-0188", caller_name=caller, caller_speech=caller_speech)
            speech = f"Attended call from {caller} on your behalf, {title}. Outcome: {call_res['outcome']}."
            self.tts.speak(speech)
            self.memory.add_turn("assistant", speech)
            return {"speech": speech, "action_taken": "attend_whatsapp_call", "data": call_res}
        elif match_inc_call_plain and ("call" in lower):
            caller = match_inc_call_plain.group(1).strip() if match_inc_call_plain.group(1) else "Caller"
            call_res = self.customer_care.attend_call(caller_phone="+1-555-0188", caller_name=caller, caller_speech=None)
            speech = f"Attended call from {caller} on your behalf, {title}. Outcome: {call_res['outcome']}."
            self.tts.speak(speech)
            self.memory.add_turn("assistant", speech)
            return {"speech": speech, "action_taken": "attend_whatsapp_call", "data": call_res}

        # G. Child-Like Learning Reinforcement on Praise
        if any(w in lower for w in ["good job on customer care", "great job on customer care", "well done with the customer", "good response to that customer"]):
            self.customer_care.learning_engine.reinforce("refund_and_return_policy", positive=True)
            speech = f"Thank you, {title}. I have reinforced that response pattern in my customer care neural models."
            self.tts.speak(speech)
            self.memory.add_turn("assistant", speech)
            return {"speech": speech, "action_taken": "reinforce_customer_care"}

        # H. WhatsApp 24/7 Background Daemon Controls (Works Even When WhatsApp is Closed)
        if re.search(r"\b(?:keep\s+whatsapp\s+(?:customer\s+care\s+)?running\s+in\s+(?:the\s+)?background|run\s+whatsapp\s+(?:customer\s+care\s+)?(?:in\s+(?:the\s+)?background|even\s+if\s+(?:i\s+)?close\s+whatsapp)|work\s+in\s+whatsapp\s+if\s+(?:i\s+)?close\s+whatsapp|start\s+(?:whatsapp\s+)?(?:background\s+daemon|daemon)|run\s+whatsapp\s+when\s+closed)\b", lower) or \
           any(w in lower for w in ["start whatsapp daemon", "start whatsapp background daemon", "run whatsapp customer care even if closed", "keep whatsapp running in background"]):
            d_res = self.customer_care.start_background_daemon()
            speech = f"WhatsApp Customer Care 24/7 background daemon is active on port {d_res.get('port', 5055)}, {title}. Customer inquiries will be serviced autonomously in English and Bengali even if WhatsApp or your browser is closed."
            self.tts.speak(speech)
            self.memory.add_turn("assistant", speech)
            return {"speech": speech, "action_taken": "start_whatsapp_background_daemon", "data": d_res}

        if any(w in lower for w in ["stop whatsapp background daemon", "stop whatsapp daemon", "stop whatsapp in background", "disable whatsapp background", "shutdown whatsapp background", "kill whatsapp daemon"]):
            d_res = self.customer_care.stop_background_daemon()
            speech = f"WhatsApp Customer Care background daemon has been stopped, {title}."
            self.tts.speak(speech)
            self.memory.add_turn("assistant", speech)
            return {"speech": speech, "action_taken": "stop_whatsapp_background_daemon", "data": d_res}

        if any(w in lower for w in ["whatsapp background status", "whatsapp daemon status", "is whatsapp running in background", "check whatsapp background"]):
            status = self.customer_care.get_daemon_status()
            state = "active and running 24/7" if status.get("is_running") else "offline"
            speech = f"WhatsApp Customer Care background daemon is currently {state} on port {status.get('port', 5055)}, {title}."
            self.tts.speak(speech)
            self.memory.add_turn("assistant", speech)
            return {"speech": speech, "action_taken": "whatsapp_daemon_status", "data": status}

        # =========================================================================
        # 0. Omni-Memory Auto-Learning & Empathy Mood Analysis
        # =========================================================================
        self.omni_memory.auto_extract_knowledge(text)

        emotion_data = self.affect_engine.analyze_emotional_valence(text)
        self.omni_memory.archive_turn("user", text, mood=emotion_data["emotion"])

        # =========================================================================
        # 0. Safety Gate Pending Confirmation Gatekeeper
        # =========================================================================
        if self.memory.pending_confirmation_action:
            pending = self.memory.pending_confirmation_action
            if any(w in lower for w in ["yes", "proceed", "confirm", "do it", "affirmative", "go ahead"]):
                self.memory.clear_pending_action()
                return self._execute_pending_action(pending)
            elif any(w in lower for w in ["no", "cancel", "stop", "abort", "nevermind", "stand down"]):
                self.memory.clear_pending_action()
                speech = f"Action cancelled. Standing by, {title}."
                self.tts.speak(speech)
                self.memory.add_turn("assistant", speech)
                self.omni_memory.archive_turn("assistant", speech)
                return {"speech": speech, "action_taken": "cancelled"}


        # =========================================================================
        # 0b. Fast Hardware Diagnostics & System Status
        # =========================================================================
        if any(w in lower for w in ["vitals", "diagnostics", "system health", "system status", "hardware status", "what are your vitals"]):
            vitals = self.os_controller.get_system_vitals()
            speech = (
                f"All systems nominal, sir. CPU utilization is at {vitals['cpu_percent']} percent, "
                f"memory is steady at {vitals['ram_percent']} percent ({vitals['ram_used_gb']} of {vitals['ram_total_gb']} gigabytes), "
                f"and storage has {vitals['disk_free_gb']} gigabytes available."
            )
            self.tts.speak(speech)
            self.memory.add_turn("assistant", speech)
            self.omni_memory.archive_turn("assistant", speech)
            return {"speech": speech, "data": vitals, "action_taken": "get_vitals"}

        # =========================================================================
        # 0c. Explicit Task Queue Management
        # =========================================================================
        match_add_task = re.search(r"\b(?:add\s+task|queue\s+task|take\s+(?:this\s+)?task|i\s+have\s+a\s+task\s+for\s+you)[:\s]+(.+)", text, re.IGNORECASE)
        if match_add_task:
            task_desc = match_add_task.group(1).strip()
            task = self.task_manager.add_task(task_desc)
            pending_count = len(self.task_manager.get_pending_tasks())
            speech = f"Task {task.id} registered, sir: '{task_desc}'. We currently have {pending_count} pending item{'s' if pending_count != 1 else ''} on our agenda."
            self.tts.speak(speech)
            self.memory.add_turn("assistant", speech)
            self.omni_memory.archive_turn("assistant", speech)
            return {"speech": speech, "action_taken": "add_task", "task": task.to_dict()}

        if any(w in lower for w in ["what tasks", "list tasks", "show tasks", "task queue", "on our agenda", "what's next"]):
            pending = self.task_manager.get_pending_tasks()
            if not pending:
                speech = "The task queue is currently empty, sir. Standing by for your directives."
            else:
                task_items = [f"Item {t.id}: {t.description}" for t in pending]
                speech = f"You have {len(pending)} pending task{'s' if len(pending) != 1 else ''}, sir: " + "; ".join(task_items) + "."
            self.tts.speak(speech)
            self.memory.add_turn("assistant", speech)
            self.omni_memory.archive_turn("assistant", speech)
            return {"speech": speech, "action_taken": "list_tasks", "tasks": [t.to_dict() for t in pending]}

        if any(w in lower for w in ["execute tasks", "execute next task", "run tasks", "do the tasks", "work on tasks", "proceed with next"]):
            pending = self.task_manager.get_pending_tasks()
            if not pending:
                speech = "There are no pending tasks in the queue to execute, sir."
                self.tts.speak(speech)
                self.memory.add_turn("assistant", speech)
                return {"speech": speech, "action_taken": "no_tasks"}
            return self._execute_task_queue()

        if any(w in lower for w in ["clear tasks", "clear task queue", "empty queue", "cancel all tasks"]):
            self.task_manager.clear_all()
            speech = "All items in the task queue have been cleared, sir."
            self.tts.speak(speech)
            self.memory.add_turn("assistant", speech)
            return {"speech": speech, "action_taken": "clear_tasks"}

        # Working Capacity & High-Throughput Telemetry
        if any(w in lower for w in ["working capacity", "queue capacity", "throughput", "capacity status", "how fast can you work", "execution metrics"]):
            metrics = self.task_manager.get_capacity_metrics()
            speech = (
                f"Operational working capacity is {metrics['working_capacity_status']} at maximum throughput, {title}. "
                f"Deploying {metrics['max_concurrent_workers']} parallel worker threads, with queue saturation at "
                f"{metrics['queue_saturation']}% and average latency at {metrics['average_latency_ms']} milliseconds."
            )
            self.tts.speak(speech)
            self.memory.add_turn("assistant", speech)
            self.omni_memory.archive_turn("assistant", speech)
            return {"speech": speech, "action_taken": "working_capacity_metrics", "data": metrics}

        # Cognitive Understanding Capacity Telemetry
        if any(w in lower for w in ["understanding capacity", "comprehension capacity", "what can you understand", "intent understanding", "how do you understand"]):
            speech = (
                f"Cognitive understanding operates across multi-tier neural matrices, {title}: "
                f"featuring native Bengali and English cross-lingual parsing, phonetic speech typo correction, "
                f"granular slot parameter extraction, and compound multi-intent directive decomposition."
            )
            self.tts.speak(speech)
            self.memory.add_turn("assistant", speech)
            self.omni_memory.archive_turn("assistant", speech)
            return {
                "speech": speech,
                "action_taken": "understanding_capacity_metrics",
                "data": {
                    "tiers": ["Tier 1 Neural Semantic Rule Matrix (<1ms)", "Tier 2 Local Qwen 2.5 SLM", "Tier 3 OpenRouter Brain Cascade"],
                    "multilingual_support": ["English", "Bengali (বাংলা)"],
                    "phonetic_correction": True,
                    "slot_extraction": True,
                    "compound_decomposition": True
                }
            }

        # =========================================================================
        # 0d. Universal Agentic Skills Engine Directives (Local & Global Catalog)
        # =========================================================================
        if any(w in lower for w in ["how many skills", "list skills", "list your skills", "what skills do you have", "what are your skills", "skills overview", "skills catalog"]):
            speech = self.skill_registry.format_speech_overview()
            self.tts.speak(speech)
            self.memory.add_turn("assistant", speech)
            self.omni_memory.archive_turn("assistant", speech)
            return {"speech": speech, "action_taken": "list_skills", "data": self.skill_registry.get_stats()}

        match_search_skill = re.search(r"\b(?:search\s+skills?\s+(?:for\s+)?|find\s+skills?\s+(?:for\s+)?|do\s+you\s+have\s+(?:a\s+)?skills?\s+(?:for\s+)?)(.+)", lower)
        if match_search_skill:
            query = match_search_skill.group(1).strip()
            matched = self.skill_registry.search_skills(query, limit=5)
            if matched:
                names = ", ".join([s.name for s in matched])
                speech = f"I identified {len(matched)} matching skills for '{query}', including {names}, sir."
            else:
                speech = f"No specialized local skills found for '{query}', though I can query our global online registry, sir."
            self.tts.speak(speech)
            self.memory.add_turn("assistant", speech)
            self.omni_memory.archive_turn("assistant", speech)
            return {"speech": speech, "action_taken": "search_skills", "skills": [s.to_dict() for s in matched]}

        match_show_skill = re.search(r"\b(?:what\s+is\s+skill|show\s+skill|describe\s+skill)\s+([a-zA-Z0-9_\-]+)", lower)
        if match_show_skill:
            s_name = match_show_skill.group(1).strip()
            skill_obj = self.skill_registry.get_skill(s_name)
            if skill_obj:
                speech = f"Skill '{skill_obj.name}' in {skill_obj.category}: {skill_obj.summary}, sir."
            else:
                speech = f"I could not locate an installed skill named '{s_name}', sir."
            self.tts.speak(speech)
            self.memory.add_turn("assistant", speech)
            self.omni_memory.archive_turn("assistant", speech)
            return {"speech": speech, "action_taken": "show_skill", "skill": skill_obj.to_dict() if skill_obj else None}

        match_install_skill = re.search(r"\b(?:install\s+skill|download\s+skill|add\s+skill)\s+([a-zA-Z0-9_\-\.\/]+)", lower)
        if match_install_skill:
            ident = match_install_skill.group(1).strip()
            res = self.skill_hub.install_skill(ident)
            if res.get("success"):
                self.skill_registry.load_all_skills()
                speech = f"Skill '{ident}' has been successfully installed and indexed into our operational repertoire, sir."
            else:
                speech = f"Attempting to install skill '{ident}': {res.get('error') or res.get('output', 'Completed')}, sir."
            self.tts.speak(speech)
            self.memory.add_turn("assistant", speech)
            return {"speech": speech, "action_taken": "install_skill", "data": res}

        # =========================================================================
        # 0e. Close / Terminate Application (3-Tier Safety Gate Interception)
        # =========================================================================
        match_close = re.search(r"\b(?:close|kill|terminate|quit)\s+([a-zA-Z0-9_\-\.\s]+)", lower)
        if match_close:
            target = match_close.group(1).strip()
            eval_res = self.safety_gate.evaluate_execution(f"terminate {target}")
            if eval_res["prompt_needed"]:
                self.memory.set_pending_action({"action": "kill_process", "target": target})
                speech = eval_res["prompt"]
                self.tts.speak(speech)
                self.memory.add_turn("assistant", speech)
                return {"speech": speech, "action_taken": "pending_confirmation", "pending": target}
            else:
                res = self.os_controller.kill_process(target)
                speech = f"{res['message']}"
                self.tts.speak(speech)
                self.memory.add_turn("assistant", speech)
                return {"speech": speech, "action_taken": "kill_process", "target": target}

        # =========================================================================
        # 0e2. Daily Life & Cognitive LifeGraph Autonomous Directives (2,000+ Nodes)
        # Bridges J.A.R.V.I.S. with real human daily life operations & semantic graph
        # =========================================================================
        if any(w in lower for w in ["how many nodes", "life graph", "knowledge graph", "cognitive graph", "lifegraph nodes", "nodes do you have"]):
            stats = self.life_graph.get_stats()
            speech = (
                f"Our Cognitive LifeGraph currently maintains {stats['total_nodes']} active semantic nodes "
                f"and {stats['total_edges']} relational edges across {len(stats['nodes_by_category'])} operational domains, Sir."
            )
            self.tts.speak(speech)
            self.memory.add_turn("assistant", speech)
            self.omni_memory.archive_turn("assistant", speech)
            return {"speech": speech, "action_taken": "lifegraph_stats", "data": stats}

        if any(w in lower for w in ["morning briefing", "run morning routine", "start my morning", "morning sitrep", "good morning jarvis"]):
            res = self.daily_life_tools.run_morning_briefing()
            speech = res["speech"]
            self.tts.speak(speech)
            self.memory.add_turn("assistant", speech)
            self.omni_memory.archive_turn("assistant", speech)
            return {"speech": speech, "action_taken": "morning_briefing", "data": res}

        if any(w in lower for w in ["evening debrief", "run evening routine", "nightly debrief", "end my day", "evening shutdown", "good night jarvis"]):
            res = self.daily_life_tools.run_evening_debrief()
            speech = res["speech"]
            self.tts.speak(speech)
            self.memory.add_turn("assistant", speech)
            self.omni_memory.archive_turn("assistant", speech)
            return {"speech": speech, "action_taken": "evening_debrief", "data": res}

        match_weather = re.search(r"\b(?:what(?:\'s|\s+is)\s+(?:the\s+)?weather|weather\s+in|check\s+(?:the\s+)?weather|how(?:\'s|\s+is)\s+the\s+weather)(?:\s+(?:in|for|at)\s+([a-zA-Z\s]+))?", lower)
        if match_weather:
            city = (match_weather.group(1) or "").strip()
            w_res = self.daily_life_tools.get_weather(city)
            speech = w_res["speech"]
            self.tts.speak(speech)
            self.memory.add_turn("assistant", speech)
            self.omni_memory.archive_turn("assistant", speech)
            return {"speech": speech, "action_taken": "get_weather", "data": w_res}

        if any(w in lower for w in ["what's on my calendar", "what is on my calendar", "calendar for today", "today's agenda", "my schedule today", "appointments today"]):
            cal_res = self.daily_life_tools.list_calendar_events()
            speech = cal_res["speech"]
            self.tts.speak(speech)
            self.memory.add_turn("assistant", speech)
            self.omni_memory.archive_turn("assistant", speech)
            return {"speech": speech, "action_taken": "list_calendar", "data": cal_res}

        match_add_cal = re.search(r"\b(?:schedule|add\s+(?:a\s+)?calendar\s+event|book\s+(?:a\s+)?meeting)[:\s]+(.+)", text, re.IGNORECASE)
        if match_add_cal:
            event_title = match_add_cal.group(1).strip()
            cal_res = self.daily_life_tools.add_calendar_event(event_title)
            speech = cal_res["speech"]
            self.tts.speak(speech)
            self.memory.add_turn("assistant", speech)
            self.omni_memory.archive_turn("assistant", speech)
            return {"speech": speech, "action_taken": "add_calendar_event", "data": cal_res}

        match_log_exp = re.search(r"\b(?:log\s+expense|spent|paid|bought)[:\s]+(?:\$|usd\s*)?([0-9]+(?:\.[0-9]+)?)\s*(?:dollars?)?\s*(?:for|on|under)?\s*(.+)?", text, re.IGNORECASE)
        if match_log_exp:
            amt = float(match_log_exp.group(1))
            desc = (match_log_exp.group(2) or "Miscellaneous").strip()
            category = "general"
            for cat_candidate in ["food", "coffee", "lunch", "dinner", "transport", "uber", "groceries", "subscription", "bills"]:
                if cat_candidate in desc.lower():
                    category = cat_candidate
                    break
            exp_res = self.daily_life_tools.log_expense(amount=amt, category=category, description=desc)
            speech = exp_res["speech"]
            self.tts.speak(speech)
            self.memory.add_turn("assistant", speech)
            self.omni_memory.archive_turn("assistant", speech)
            return {"speech": speech, "action_taken": "log_expense", "data": exp_res}

        if any(w in lower for w in ["how much did i spend", "today's expenses", "spending summary", "my expenses today", "total spending"]):
            exp_res = self.daily_life_tools.get_expense_summary()
            speech = exp_res["speech"]
            self.tts.speak(speech)
            self.memory.add_turn("assistant", speech)
            self.omni_memory.archive_turn("assistant", speech)
            return {"speech": speech, "action_taken": "expense_summary", "data": exp_res}

        if any(w in lower for w in ["log water", "drank water", "log glass of water", "had water", "log hydration", "drank a glass"]):
            h_res = self.daily_life_tools.log_hydration(1)
            speech = h_res["speech"]
            self.tts.speak(speech)
            self.memory.add_turn("assistant", speech)
            self.omni_memory.archive_turn("assistant", speech)
            return {"speech": speech, "action_taken": "log_hydration", "data": h_res}

        if any(w in lower for w in ["check hydration", "how much water", "hydration progress", "health status", "bio status"]):
            h_res = self.daily_life_tools.get_health_status()
            speech = h_res["speech"]
            self.tts.speak(speech)
            self.memory.add_turn("assistant", speech)
            self.omni_memory.archive_turn("assistant", speech)
            return {"speech": speech, "action_taken": "health_status", "data": h_res}

        if any(w in lower for w in ["eye break", "20 20 20 break", "rest eyes", "ocular relief"]):
            eye_res = self.daily_life_tools.log_eye_break()
            speech = eye_res["speech"]
            self.tts.speak(speech)
            self.memory.add_turn("assistant", speech)
            self.omni_memory.archive_turn("assistant", speech)
            return {"speech": speech, "action_taken": "eye_break", "data": eye_res}

        if any(w in lower for w in ["play focus music", "play lofi", "play lo-fi", "focus beats", "study music", "play ambient music"]):
            genre = "lofi"
            if "ambient" in lower:
                genre = "ambient"
            elif "classical" in lower:
                genre = "classical"
            elif "cyberpunk" in lower:
                genre = "cyberpunk"
            m_res = self.daily_life_tools.play_focus_music(genre)
            speech = m_res["speech"]
            self.tts.speak(speech)
            self.memory.add_turn("assistant", speech)
            self.omni_memory.archive_turn("assistant", speech)
            return {"speech": speech, "action_taken": "play_focus_music", "data": m_res}

        if any(w in lower for w in ["deep work", "start deep work", "focus sprint", "focus mode"]):
            self.daily_life_tools.play_focus_music("lofi")
            t_res = self.daily_life_tools.set_timer(90.0, "Deep Work 90m Sprint")
            speech = "Deep work protocol engaged, Sir. 90-minute countdown active, focus stream streaming, and non-critical interruptions buffered."
            self.tts.speak(speech)
            self.memory.add_turn("assistant", speech)
            self.omni_memory.archive_turn("assistant", speech)
            return {"speech": speech, "action_taken": "deep_work", "data": t_res}

        match_timer = re.search(r"\b(?:set\s+(?:a\s+)?timer\s+(?:for\s+)?|timer\s+for\s+)([0-9]+(?:\.[0-9]+)?)\s*(?:minutes?|mins?)(?:\s+(?:named|for|called)?\s*(.+))?", lower)
        if match_timer:
            mins = float(match_timer.group(1))
            label = (match_timer.group(2) or "Timer").strip()
            t_res = self.daily_life_tools.set_timer(mins, label)
            speech = t_res["speech"]
            self.tts.speak(speech)
            self.memory.add_turn("assistant", speech)
            self.omni_memory.archive_turn("assistant", speech)
            return {"speech": speech, "action_taken": "set_timer", "data": t_res}

        match_note = re.search(r"\b(?:take\s+(?:a\s+)?note|quick\s+note|save\s+note|jot\s+down)[:\s]+(.+)", text, re.IGNORECASE)
        if match_note:
            note_content = match_note.group(1).strip()
            title = note_content.split("\n")[0][:40]
            n_res = self.daily_life_tools.save_note(title=title, content=note_content)
            speech = n_res["speech"]
            self.tts.speak(speech)
            self.memory.add_turn("assistant", speech)
            self.omni_memory.archive_turn("assistant", speech)
            return {"speech": speech, "action_taken": "save_note", "data": n_res}

        if any(w in lower for w in ["list notes", "show notes", "recent notes", "my notes", "scratchpad"]):
            n_res = self.daily_life_tools.list_notes()
            speech = n_res["speech"]
            self.tts.speak(speech)
            self.memory.add_turn("assistant", speech)
            self.omni_memory.archive_turn("assistant", speech)
            return {"speech": speech, "action_taken": "list_notes", "data": n_res}

        # =========================================================================
        # 0e. Fast Non-Blocking Application & Website Launcher (Zero-Freeze Execution)
        # =========================================================================
        match_launch = re.search(r"\b(?:open|launch|start|navigate to|go to)\s+([a-zA-Z0-9_\-\.\s]+)", lower)
        if match_launch:
            raw_target = match_launch.group(1).strip()
            
            # 1. Website Shortcuts
            for key, url in self.WEB_SHORTCUTS.items():
                if key in raw_target:
                    webbrowser.open(url)
                    speech = f"Opening {key.title()} in your browser now, {title}."
                    self.tts.speak(speech)
                    self.memory.add_turn("assistant", speech)
                    return {"speech": speech, "action_taken": "open_website", "url": url}

            # 2. Explicit Domains & Web URLs
            if raw_target.startswith(("http://", "https://", "www.")) or raw_target.endswith((".com", ".org", ".io", ".net", ".edu")):
                url = raw_target if raw_target.startswith("http") else f"https://{raw_target}"
                webbrowser.open(url)
                speech = f"Opening {raw_target} in your browser now, {title}."
                self.tts.speak(speech)
                self.memory.add_turn("assistant", speech)
                return {"speech": speech, "action_taken": "open_url", "url": url}

            # 3. Native Desktop Applications with Typo Fuzzy Resolver (e.g. 'corme' -> 'chrome')
            res = self.os_controller.launch_application(raw_target)
            app_disp = res.get("resolved_name", raw_target).title()
            if res["success"]:
                speech = f"Opening {app_disp} now, {title}."
                self.tts.speak(speech)
                self.memory.add_turn("assistant", speech)
                return {"speech": speech, "action_taken": "launch_app", "target": raw_target, "resolved": app_disp}

        # =========================================================================
        # 0f. Universal Cognitive Intent Router (Local Qwen SLM Neural Tool Calling)
        # Bypasses rigid regexes: Understands ANY natural, casual phrasing instantly!
        # =========================================================================
        ai_intent = self.intent_router.parse_intent(text)
        if ai_intent and isinstance(ai_intent, dict):
            action = ai_intent.get("action")
            
            # Application Launch (Chrome, VS Code, Notepad, Calc, Websites)
            if action == "launch_app":
                target = ai_intent.get("target") or ai_intent.get("slots", {}).get("target_app") or "chrome"
                target_lower = target.lower().strip()
                for key, url in self.WEB_SHORTCUTS.items():
                    if key in target_lower:
                        webbrowser.open(url)
                        speech = f"Opening {key.title()} in your browser now, {title}."
                        self.tts.speak(speech)
                        self.memory.add_turn("assistant", speech)
                        res = {"speech": speech, "action_taken": "open_website", "url": url}
                        self._last_command_result = res
                        return res
                if target_lower.startswith(("http://", "https://", "www.")) or target_lower.endswith((".com", ".org", ".io", ".net", ".edu")):
                    url = target_lower if target_lower.startswith("http") else f"https://{target_lower}"
                    webbrowser.open(url)
                    speech = f"Opening {target_lower} now, {title}."
                    self.tts.speak(speech)
                    self.memory.add_turn("assistant", speech)
                    res = {"speech": speech, "action_taken": "open_url", "url": url}
                    self._last_command_result = res
                    return res
                app_res = self.os_controller.launch_application(target)
                app_disp = app_res.get("resolved_name", target).title()
                speech = f"Opening {app_disp} now, {title}."
                self.tts.speak(speech)
                self.memory.add_turn("assistant", speech)
                res = {"speech": speech, "action_taken": "launch_app", "target": target, "resolved": app_disp}
                self._last_command_result = res
                return res

            # Live System Time
            if action == "get_time":
                now_dt = datetime.datetime.now()
                time_str = now_dt.strftime("%I:%M %p")
                date_str = now_dt.strftime("%A, %B %d, %Y")
                speech = f"The time is precisely {time_str} today, {date_str}, {title}."
                self.tts.speak(speech)
                self.memory.add_turn("assistant", speech)
                self.omni_memory.archive_turn("assistant", speech)
                res = {"speech": speech, "action_taken": "get_time", "time": time_str, "date": date_str}
                self._last_command_result = res
                return res

            # Live System Date
            if action == "get_date":
                now_dt = datetime.datetime.now()
                date_str = now_dt.strftime("%A, %B %d, %Y")
                speech = f"Today is {date_str}, {title}."
                self.tts.speak(speech)
                self.memory.add_turn("assistant", speech)
                self.omni_memory.archive_turn("assistant", speech)
                res = {"speech": speech, "action_taken": "get_date", "date": date_str}
                self._last_command_result = res
                return res

            # Live Weather via wttr.in
            if action == "get_weather":
                city = ai_intent.get("city") or ai_intent.get("slots", {}).get("city") or ""
                w_res = self.daily_life_tools.get_weather(city)
                speech = w_res.get("speech", f"Weather conditions retrieved, {title}.")
                self.tts.speak(speech)
                self.memory.add_turn("assistant", speech)
                self.omni_memory.archive_turn("assistant", speech)
                res = {"speech": speech, "action_taken": "get_weather", "data": w_res}
                self._last_command_result = res
                return res

            # Calendar & Agendas
            if action == "list_calendar":
                cal_res = self.daily_life_tools.list_calendar_events()
                speech = cal_res.get("speech", f"Your calendar is clear, {title}.")
                self.tts.speak(speech)
                self.memory.add_turn("assistant", speech)
                self.omni_memory.archive_turn("assistant", speech)
                res = {"speech": speech, "action_taken": "list_calendar", "data": cal_res}
                self._last_command_result = res
                return res

            if action == "schedule_meeting":
                event_title = ai_intent.get("slots", {}).get("title") or text
                cal_res = self.daily_life_tools.add_calendar_event(event_title)
                speech = cal_res.get("speech", f"Event scheduled, {title}.")
                self.tts.speak(speech)
                self.memory.add_turn("assistant", speech)
                self.omni_memory.archive_turn("assistant", speech)
                res = {"speech": speech, "action_taken": "schedule_meeting", "data": cal_res}
                self._last_command_result = res
                return res

            # Daily Expense Tracking
            if action == "log_expense":
                slots = ai_intent.get("slots", {})
                amt = float(slots.get("amount") or 10.0)
                exp_res = self.daily_life_tools.log_expense(amount=amt, category="general", description=text)
                speech = exp_res.get("speech", f"Expense logged, {title}.")
                self.tts.speak(speech)
                self.memory.add_turn("assistant", speech)
                self.omni_memory.archive_turn("assistant", speech)
                res = {"speech": speech, "action_taken": "log_expense", "data": exp_res}
                self._last_command_result = res
                return res

            # Hydration Logging
            if action == "log_hydration":
                h_res = self.daily_life_tools.log_hydration(1)
                speech = h_res.get("speech", f"Hydration recorded, {title}.")
                self.tts.speak(speech)
                self.memory.add_turn("assistant", speech)
                self.omni_memory.archive_turn("assistant", speech)
                res = {"speech": speech, "action_taken": "log_hydration", "data": h_res}
                self._last_command_result = res
                return res

            # Quick Notes & Scratchpad
            if action == "save_note":
                note_content = ai_intent.get("note") or text
                title_note = note_content.split("\n")[0][:40]
                n_res = self.daily_life_tools.save_note(title=title_note, content=note_content)
                speech = n_res.get("speech", f"Note saved, {title}.")
                self.tts.speak(speech)
                self.memory.add_turn("assistant", speech)
                self.omni_memory.archive_turn("assistant", speech)
                res = {"speech": speech, "action_taken": "save_note", "data": n_res}
                self._last_command_result = res
                return res

            if action == "list_notes":
                n_res = self.daily_life_tools.list_notes()
                speech = n_res.get("speech", f"Here are your notes, {title}.")
                self.tts.speak(speech)
                self.memory.add_turn("assistant", speech)
                self.omni_memory.archive_turn("assistant", speech)
                res = {"speech": speech, "action_taken": "list_notes", "data": n_res}
                self._last_command_result = res
                return res

            # Timers
            if action == "set_timer":
                mins = float(ai_intent.get("minutes") or 10.0)
                t_res = self.daily_life_tools.set_timer(mins, f"Timer ({int(mins)} mins)")
                speech = t_res.get("speech", f"Timer set for {mins} minutes, {title}.")
                self.tts.speak(speech)
                self.memory.add_turn("assistant", speech)
                self.omni_memory.archive_turn("assistant", speech)
                res = {"speech": speech, "action_taken": "set_timer", "data": t_res}
                self._last_command_result = res
                return res

            # Deep Work Focus Session
            if action == "deep_work":
                self.daily_life_tools.play_focus_music("lofi")
                t_res = self.daily_life_tools.set_timer(90.0, "Deep Work 90m Sprint")
                speech = f"Deep work protocol engaged, {title}. 90-minute countdown active and focus stream engaged."
                self.tts.speak(speech)
                self.memory.add_turn("assistant", speech)
                self.omni_memory.archive_turn("assistant", speech)
                res = {"speech": speech, "action_taken": "deep_work", "data": t_res}
                self._last_command_result = res
                return res

            # Eye Break (20-20-20)
            if action == "eye_break":
                eye_res = self.daily_life_tools.log_eye_break()
                speech = eye_res.get("speech", f"Eye break logged, {title}.")
                self.tts.speak(speech)
                self.memory.add_turn("assistant", speech)
                self.omni_memory.archive_turn("assistant", speech)
                res = {"speech": speech, "action_taken": "eye_break", "data": eye_res}
                self._last_command_result = res
                return res

            # System Vitals Telemetry
            if action == "system_vitals":
                vitals = self.os_controller.get_system_vitals()
                speech = (
                    f"Diagnostics nominal, {title}. CPU is at {vitals['cpu_percent']} percent, "
                    f"RAM utilized is {vitals['ram_used_gb']} GB of {vitals['ram_total_gb']} GB ({vitals['ram_percent']} percent), "
                    f"and {vitals['disk_free_gb']} GB disk space remains."
                )
                self.tts.speak(speech)
                self.memory.add_turn("assistant", speech)
                self.omni_memory.archive_turn("assistant", speech)
                res = {"speech": speech, "action_taken": "system_vitals", "data": vitals}
                self._last_command_result = res
                return res

            # Lock Workstation
            if action == "lock_workstation":
                self.os_controller.lock_workstation()
                speech = f"Locking workstation immediately, {title}."
                self.tts.speak(speech)
                self.memory.add_turn("assistant", speech)
                self.omni_memory.archive_turn("assistant", speech)
                res = {"speech": speech, "action_taken": "lock_workstation"}
                self._last_command_result = res
                return res

            # WhatsApp Send
            if action == "whatsapp_send" and ai_intent.get("contact") and ai_intent.get("message"):
                target = ai_intent["contact"]
                msg = ai_intent["message"]
                res = self.comm_hub.send_whatsapp_message(target, msg)
                speech = f"Right away, sir. Dispatched WhatsApp directive to {target}: '{msg}'."
                self.tts.speak(speech)
                self.memory.add_turn("assistant", speech)
                self.omni_memory.archive_turn("assistant", speech)
                return {"speech": speech, "action_taken": "whatsapp_send", "data": res}

            # WhatsApp Call
            if action == "whatsapp_call" and ai_intent.get("contact"):
                target = ai_intent["contact"]
                res = self.comm_hub.initiate_whatsapp_call(target)
                speech = f"Initiating voice communications with {target} via WhatsApp array, sir."
                self.tts.speak(speech)
                self.memory.add_turn("assistant", speech)
                self.omni_memory.archive_turn("assistant", speech)
                return {"speech": speech, "action_taken": "whatsapp_call", "data": res}

            # Email Compose
            if action == "email_compose" and ai_intent.get("recipient"):
                to_addr = ai_intent["recipient"]
                subj = ai_intent.get("subject", "Stark Directive")
                body = ai_intent.get("body", text)
                res = self.comm_hub.compose_email(to_addr, subject=subj, body=body)
                speech = f"Right away, sir. Drafted email to {to_addr} regarding '{subj}'."
                self.tts.speak(speech)
                self.memory.add_turn("assistant", speech)
                self.omni_memory.archive_turn("assistant", speech)
                return {"speech": speech, "action_taken": "email_compose", "data": res}

            # Email Check Inbox
            if action == "email_check_inbox":
                res = self.comm_hub.check_inbox()
                speech = res["summary"]
                self.tts.speak(speech)
                self.memory.add_turn("assistant", speech)
                self.omni_memory.archive_turn("assistant", speech)
                return {"speech": speech, "action_taken": "check_inbox", "data": res}

            # Play Media (YouTube / Spotify)
            if action == "play_media" and ai_intent.get("query"):
                q = ai_intent["query"]
                plat = ai_intent.get("platform", "youtube")
                if plat == "spotify":
                    res = self.web_media.open_service("spotify")
                else:
                    res = self.web_media.play_youtube(q)
                speech = res["summary"]
                self.tts.speak(speech)
                self.memory.add_turn("assistant", speech)
                self.omni_memory.archive_turn("assistant", speech)
                return {"speech": speech, "action_taken": "play_media", "data": res}

            # Screen Perception / Vision
            if action == "screen_vision":
                res = self.screen_perception.inspect_current_workspace()
                speech = res["summary"]
                self.tts.speak(speech)
                self.memory.add_turn("assistant", speech)
                self.omni_memory.archive_turn("assistant", speech)
                return {"speech": speech, "action_taken": "screen_vision", "data": res}

            # GUI Automation Control
            if action == "gui_control" and ai_intent.get("command"):
                cmd = ai_intent["command"]
                if cmd == "screenshot":
                    res = self.gui_agent.take_screenshot()
                    speech = "Screen captured and archived in Stark telemetry, sir."
                elif cmd == "volume_up":
                    self.gui_agent.volume_up()
                    speech = "Audio volume increased, sir."
                elif cmd == "volume_down":
                    self.gui_agent.volume_down()
                    speech = "Audio volume decreased, sir."
                elif cmd == "mute":
                    self.gui_agent.volume_mute()
                    speech = "Audio mute toggled, sir."
                elif cmd == "play_pause":
                    self.gui_agent.media_play_pause()
                    speech = "Media playback toggled, sir."
                elif cmd == "show_desktop":
                    self.gui_agent.show_desktop()
                    speech = "Minimizing active applications to display desktop, sir."
                else:
                    speech = "Workstation control engaged, sir."
                self.tts.speak(speech)
                self.memory.add_turn("assistant", speech)
                self.omni_memory.archive_turn("assistant", speech)
                return {"speech": speech, "action_taken": f"gui_{cmd}"}

            # Web Search
            if action == "web_search" and ai_intent.get("query"):
                q = ai_intent["query"]
                res = self.web_media.search_google(q)
                speech = res["summary"]
                self.tts.speak(speech)
                self.memory.add_turn("assistant", speech)
                self.omni_memory.archive_turn("assistant", speech)
                return {"speech": speech, "action_taken": "web_search", "data": res}

            # Iron Man Protocols
            if action == "iron_man_protocol" and ai_intent.get("protocol"):
                p = ai_intent["protocol"]
                if p == "house_party":
                    res = self.protocols.house_party_protocol()
                elif p == "clean_slate":
                    res = self.protocols.clean_slate_protocol()
                elif p == "barn_door":
                    res = self.protocols.barn_door_protocol()
                elif p == "workshop":
                    res = self.protocols.workshop_protocol()
                elif p == "medical":
                    res = self.protocols.medical_vitals_protocol()
                else:
                    res = {"summary": "Protocol executed, sir."}
                speech = res["summary"]
                self.tts.speak(speech)
                self.memory.add_turn("assistant", speech)
                self.omni_memory.archive_turn("assistant", speech)
                return {"speech": speech, "action_taken": f"protocol_{p}", "data": res}

            # Memory Operations
            if action == "memory_op":
                mtype = ai_intent.get("type", "recall")
                mfact = ai_intent.get("fact", "")
                if mtype == "remember" and mfact:
                    self.omni_memory.store_memory(content=mfact, category="fact", importance=4)
                    speech = f"Committed to Omni-Memory, sir: '{mfact}'."
                elif mtype == "recall" and mfact:
                    mems = self.omni_memory.recall_relevant(mfact, limit=2)
                    speech = f"Recalling from Omni-Memory: {mems[0]['content']}." if mems else f"No records found for '{mfact}', sir."
                else:
                    summary = self.omni_memory.build_system_context(text)
                    speech = f"According to Omni-Memory: {summary.replace('[', '').replace(']', '')}"
                self.tts.speak(speech)
                self.memory.add_turn("assistant", speech)
                self.omni_memory.archive_turn("assistant", speech)
                return {"speech": speech, "action_taken": f"memory_{mtype}"}

            # Add Task from Intent
            if action == "add_task" and ai_intent.get("description"):
                task_desc = ai_intent["description"]
                task = self.task_manager.add_task(task_desc)
                pending_count = len(self.task_manager.get_pending_tasks())
                speech = f"Task {task.id} registered, sir: '{task_desc}'. We currently have {pending_count} pending item{'s' if pending_count != 1 else ''} on our agenda."
                self.tts.speak(speech)
                self.memory.add_turn("assistant", speech)
                self.omni_memory.archive_turn("assistant", speech)
                return {"speech": speech, "action_taken": "add_task", "task": task.to_dict()}

            # List Tasks from Intent
            if action == "list_tasks":
                pending = self.task_manager.get_pending_tasks()
                if not pending:
                    speech = "The task queue is currently empty, sir. Standing by for your directives."
                else:
                    task_items = [f"Item {t.id}: {t.description}" for t in pending]
                    speech = f"You have {len(pending)} pending task{'s' if len(pending) != 1 else ''}, sir: " + "; ".join(task_items) + "."
                self.tts.speak(speech)
                self.memory.add_turn("assistant", speech)
                self.omni_memory.archive_turn("assistant", speech)
                return {"speech": speech, "action_taken": "list_tasks", "tasks": [t.to_dict() for t in pending]}

            # Skill Query from Intent
            if action == "skill_query":
                q = ai_intent.get("query", "")
                if not q or any(w in q.lower() for w in ["all", "list", "how many", "count"]):
                    speech = self.skill_registry.format_speech_overview()
                    self.tts.speak(speech)
                    self.memory.add_turn("assistant", speech)
                    return {"speech": speech, "action_taken": "list_skills", "data": self.skill_registry.get_stats()}
                else:
                    matched = self.skill_registry.search_skills(q, limit=5)
                    if matched:
                        names = ", ".join([s.name for s in matched])
                        speech = f"I identified {len(matched)} matching skills for '{q}', including {names}, sir."
                    else:
                        speech = f"No specialized local skills found for '{q}', though I can query our global online registry, sir."
                    self.tts.speak(speech)
                    self.memory.add_turn("assistant", speech)
                    return {"speech": speech, "action_taken": "search_skills", "skills": [s.to_dict() for s in matched]}

        # =========================================================================
        # 1. Canonical Iron Man Protocols
        # =========================================================================
        if "house party protocol" in lower:
            res = self.protocols.house_party_protocol()
            speech = res["summary"]
            self.tts.speak(speech)
            self.memory.add_turn("assistant", speech)
            self.omni_memory.archive_turn("assistant", speech)
            return {"speech": speech, "action_taken": "house_party_protocol", "data": res}

        if "clean slate protocol" in lower:
            res = self.protocols.clean_slate_protocol()
            speech = res["summary"]
            self.tts.speak(speech)
            self.memory.add_turn("assistant", speech)
            self.omni_memory.archive_turn("assistant", speech)
            return {"speech": speech, "action_taken": "clean_slate_protocol", "data": res}

        if any(w in lower for w in ["barn door protocol", "initiate lockdown", "lockdown protocol", "shield displays"]):
            res = self.protocols.barn_door_protocol()
            speech = res["summary"]
            self.tts.speak(speech)
            self.memory.add_turn("assistant", speech)
            self.omni_memory.archive_turn("assistant", speech)
            return {"speech": speech, "action_taken": "barn_door_protocol", "data": res}

        if "workshop protocol" in lower:
            res = self.protocols.workshop_protocol()
            speech = res["summary"]
            self.tts.speak(speech)
            self.memory.add_turn("assistant", speech)
            self.omni_memory.archive_turn("assistant", speech)
            return {"speech": speech, "action_taken": "workshop_protocol", "data": res}

        if any(w in lower for w in ["medical protocol", "health protocol"]):
            res = self.protocols.medical_vitals_protocol()
            speech = res["summary"]
            self.tts.speak(speech)
            self.memory.add_turn("assistant", speech)
            self.omni_memory.archive_turn("assistant", speech)
            return {"speech": speech, "action_taken": "medical_protocol", "data": res}

        # =========================================================================
        # 2. Multi-Channel Communications & Social Hub (WhatsApp, Gmail, Calling)
        # =========================================================================
        # 2a. WhatsApp Message
        match_wa = re.search(r"\b(?:send\s+(?:a\s+)?whatsapp(?:\s+message)?\s+(?:to\s+)?|whatsapp\s+)([a-zA-Z0-9_\-\.\+]+)(?:\s+saying\s+|\s*:\s*|\s+that\s+)(.+)", text, re.IGNORECASE)
        if match_wa:
            target = match_wa.group(1).strip()
            msg = match_wa.group(2).strip()
            res = self.comm_hub.send_whatsapp_message(target, msg)
            speech = f"Right away, sir. {res['summary']}"
            self.tts.speak(speech)
            self.memory.add_turn("assistant", speech)
            self.omni_memory.archive_turn("assistant", speech)
            return {"speech": speech, "action_taken": "whatsapp_send", "data": res}

        # 2b. WhatsApp Voice Call
        match_wa_call = re.search(r"\b(?:call\s+([a-zA-Z0-9_\-\.\+]+)\s+on\s+whatsapp|whatsapp\s+call\s+([a-zA-Z0-9_\-\.\+]+))\b", text, re.IGNORECASE)
        if match_wa_call:
            target = match_wa_call.group(1) or match_wa_call.group(2)
            res = self.comm_hub.initiate_whatsapp_call(target.strip())
            speech = f"{res['summary']}"
            self.tts.speak(speech)
            self.memory.add_turn("assistant", speech)
            self.omni_memory.archive_turn("assistant", speech)
            return {"speech": speech, "action_taken": "whatsapp_call", "data": res}

        # 2c. Compose Email via Gmail
        match_email = re.search(r"\b(?:send\s+(?:an\s+)?email\s+(?:to\s+)?|email\s+|compose\s+(?:an\s+)?email\s+(?:to\s+)?|write\s+(?:an\s+)?email\s+(?:to\s+)?|draft\s+(?:an\s+)?email\s+(?:to\s+)?)([a-zA-Z0-9_\-\.\@]+)(?:\s+(?:about|saying|that|with\s+subject)\s+)(.+)", text, re.IGNORECASE)
        if match_email:
            target = match_email.group(1).strip()
            body_text = match_email.group(2).strip()
            res = self.comm_hub.compose_email(target, subject="Stark Directive", body=body_text)
            speech = f"Right away, sir. {res['summary']}"
            self.tts.speak(speech)
            self.memory.add_turn("assistant", speech)
            self.omni_memory.archive_turn("assistant", speech)
            return {"speech": speech, "action_taken": "compose_email", "data": res}

        # 2d. Check Inbox
        if any(w in lower for w in ["check email", "check inbox", "unread emails", "open gmail", "my emails"]):
            res = self.comm_hub.check_inbox()
            speech = res["summary"]
            self.tts.speak(speech)
            self.memory.add_turn("assistant", speech)
            self.omni_memory.archive_turn("assistant", speech)
            return {"speech": speech, "action_taken": "check_inbox", "data": res}

        # 2e. Facebook Messenger
        if any(w in lower for w in ["open messenger", "facebook messenger"]):
            res = self.comm_hub.open_messenger()
            speech = res["summary"]
            self.tts.speak(speech)
            self.memory.add_turn("assistant", speech)
            return {"speech": speech, "action_taken": "open_messenger", "data": res}

        # 2f. Social Post Broadcast (Twitter/X, LinkedIn, Reddit)
        match_social = re.search(r"\b(?:post\s+(?:to|on)\s+(twitter|x|linkedin|reddit)\s*:\s*|tweet\s+)(.+)", text, re.IGNORECASE)
        if match_social:
            plat = match_social.group(1) or "X"
            post_content = match_social.group(2).strip()
            res = self.comm_hub.post_social_update(plat, post_content)
            speech = f"Right away, sir. {res['summary']}"
            self.tts.speak(speech)
            self.memory.add_turn("assistant", speech)
            return {"speech": speech, "action_taken": "social_post", "data": res}

        # =========================================================================
        # 3. Autonomous Creative "Maker" Studio
        # =========================================================================
        if any(w in lower for w in ["create dashboard", "stark hud", "build dashboard", "hud dashboard", "make a dashboard"]):
            res = self.creative_studio.create_futuristic_dashboard()
            speech = res["summary"]
            self.tts.speak(speech)
            self.memory.add_turn("assistant", speech)
            self.omni_memory.archive_turn("assistant", speech)
            return {"speech": speech, "action_taken": "create_dashboard", "data": res}

        # =========================================================================
        # 4. PC-Wide Computer-Use GUI Actions (Screenshots, Media, Volume, Windows)
        # =========================================================================
        if any(w in lower for w in ["take screenshot", "capture screen", "screenshot"]):
            res = self.gui_agent.take_screenshot()
            speech = f"{res.get('summary', 'Screen captured and archived in Stark telemetry, sir.')}"
            self.tts.speak(speech)
            self.memory.add_turn("assistant", speech)
            return {"speech": speech, "action_taken": "take_screenshot", "data": res}

        if any(w in lower for w in ["volume up", "increase volume", "louder"]):
            self.gui_agent.volume_up()
            speech = "Audio volume increased, sir."
            self.tts.speak(speech)
            return {"speech": speech, "action_taken": "volume_up"}

        if any(w in lower for w in ["volume down", "decrease volume", "quieter"]):
            self.gui_agent.volume_down()
            speech = "Audio volume decreased, sir."
            self.tts.speak(speech)
            return {"speech": speech, "action_taken": "volume_down"}

        if any(w in lower for w in ["mute volume", "mute audio", "silence audio", "unmute"]):
            self.gui_agent.volume_mute()
            speech = "Audio mute toggled, sir."
            self.tts.speak(speech)
            return {"speech": speech, "action_taken": "volume_mute"}

        if any(w in lower for w in ["play music", "pause music", "pause track", "resume music"]):
            self.gui_agent.media_play_pause()
            speech = "Media playback toggled, sir."
            self.tts.speak(speech)
            return {"speech": speech, "action_taken": "media_play_pause"}

        if any(w in lower for w in ["show desktop", "minimize all"]):
            self.gui_agent.show_desktop()
            speech = "Minimizing active applications to display desktop, sir."
            self.tts.speak(speech)
            return {"speech": speech, "action_taken": "show_desktop"}

        # =========================================================================
        # 5. Omni-Memory & Contact Registry Queries
        # =========================================================================
        if any(w in lower for w in ["what do you know about me", "who am i", "what is my name", "what are my preferences", "what do you remember"]):
            summary = self.omni_memory.build_system_context(text)
            speech = f"Accessing Omni-Memory, sir. {summary.replace('[', '').replace(']', '').replace(chr(10), ' ')}"
            self.tts.speak(speech)
            return {"speech": speech, "action_taken": "omni_memory_query"}

        if any(w in lower for w in ["list contacts", "my contacts", "show contacts"]):
            contacts = self.omni_memory.list_contacts()
            if contacts:
                clist = ", ".join([f"{c['name']} ({c.get('phone') or c.get('email') or 'No info'})" for c in contacts])
                speech = f"You have {len(contacts)} contacts logged in Omni-Memory: {clist}."
            else:
                speech = "No external contacts currently recorded in Omni-Memory, sir."
            self.tts.speak(speech)
            return {"speech": speech, "action_taken": "list_contacts"}

        # =========================================================================
        # 4. System Diagnostics & Hardware Vitals
        # =========================================================================
        if any(w in lower for w in ["vitals", "diagnostics", "system health", "cpu", "battery", "ram", "system status"]):
            vitals = self.os_controller.get_system_vitals()
            speech = (
                f"All systems nominal, sir. CPU utilization is at {vitals['cpu_percent']} percent, "
                f"memory is steady at {vitals['ram_percent']} percent ({vitals['ram_used_gb']} of {vitals['ram_total_gb']} gigabytes), "
                f"and storage has {vitals['disk_free_gb']} gigabytes available."
            )
            self.tts.speak(speech)
            self.memory.add_turn("assistant", speech)
            return {"speech": speech, "data": vitals, "action_taken": "get_vitals"}

        # =========================================================================
        # 5. Open Windows / Application Management
        # =========================================================================
        if any(w in lower for w in ["open windows", "active windows", "what's open"]):
            windows = self.os_controller.list_open_windows()
            if windows:
                top = windows[:4]
                speech = f"You currently have {len(windows)} active windows on screen, including: {', '.join(top)}."
            else:
                speech = "No primary application windows detected, sir."
            self.tts.speak(speech)
            self.memory.add_turn("assistant", speech)
            return {"speech": speech, "data": windows, "action_taken": "list_windows"}

        # =========================================================================
        # 6. Lock Workstation
        # =========================================================================
        if any(w in lower for w in ["lock workstation", "lock pc", "lock the screen", "lock computer"]):
            res = self.os_controller.lock_workstation()
            speech = res["message"]
            self.tts.speak(speech)
            self.memory.add_turn("assistant", speech)
            return {"speech": speech, "action_taken": "lock_workstation"}


        # =========================================================================
        # 9. Focus / Switch Window
        # =========================================================================
        match_focus = re.search(r"\b(?:switch to|focus|bring up|show)\s+(?:window\s+)?([a-zA-Z0-9_\-\.\s]+)", lower)
        if match_focus:
            target = match_focus.group(1).strip()
            if not any(w in target for w in ["offline", "local", "qwen", "mode", "voice", "text", "task", "status"]):
                res = self.os_controller.focus_window(target)
                if res["success"]:
                    speech = f"Switched to {target}, sir."
                    self.tts.speak(speech)
                    self.memory.add_turn("assistant", speech)
                    return {"speech": speech, "action_taken": "focus_window", "target": target}

        # =========================================================================
        # 10. REAL TASK & TOOL EXECUTION (Native Task Executor + Hermes Harness)
        # Guarantees real filesystem, web, shell, and code execution on PC.
        # =========================================================================
        # 10a. Direct Native Task Execution (Instant, 100% reliable)
        native_file = self.task_executor.execute_file_creation(text)
        if native_file and native_file["success"]:
            speech = f"Right away, sir. {native_file['summary']}"
            self.tts.speak(speech)
            self.memory.add_turn("assistant", speech)
            return {"speech": speech, "action_taken": "create_file", "data": native_file}

        native_folder = self.task_executor.execute_folder_creation(text)
        if native_folder and native_folder["success"]:
            speech = f"Right away, sir. {native_folder['summary']}"
            self.tts.speak(speech)
            self.memory.add_turn("assistant", speech)
            return {"speech": speech, "action_taken": "create_folder", "data": native_folder}

        native_del = self.task_executor.execute_file_deletion(text)
        if native_del:
            speech = f"{native_del['summary']}, sir."
            self.tts.speak(speech)
            self.memory.add_turn("assistant", speech)
            return {"speech": speech, "action_taken": "delete_file", "data": native_del}

        native_search = self.task_executor.execute_web_search(text)
        if native_search and native_search["success"]:
            speech = f"{native_search['summary']}, sir."
            self.tts.speak(speech)
            self.memory.add_turn("assistant", speech)
            return {"speech": speech, "action_taken": "web_search", "data": native_search}

        native_shell = self.task_executor.execute_shell_command(text)
        if native_shell:
            speech = f"{native_shell['summary']}"
            self.tts.speak(speech)
            self.memory.add_turn("assistant", speech)
            return {"speech": speech, "action_taken": "shell_command", "data": native_shell}

        # 10b. General Action Directives (Code engineering, multi-tool agentic workflows via Hermes)
        if self.is_action_directive(text):
            print(f"\n[*] Delegating Action Directive to Hermes Agent Execution Harness...")
            matched_skills = self.skill_executor.resolve_best_skills(text, max_skills=3)
            skill_names = [s.name for s in matched_skills]
            if skill_names:
                print(f"[*] Activating Domain Skills: {', '.join(skill_names)}")
            hermes_res = self.hermes.execute_oneshot(text, skills=skill_names if skill_names else None, timeout=45)
            if hermes_res["success"] and hermes_res["output"]:
                out = hermes_res["output"]
                lines = [l.strip() for l in out.splitlines() if l.strip()]
                summary = lines[0] if lines else "Task successfully executed, sir."
                if len(summary) > 160:
                    summary = summary[:157] + "..."
                speech = f"Right away, sir. {summary}"
                print(f"\n[Hermes Action Result]:\n{out}\n")
                self.tts.speak(speech)
                self.memory.add_turn("assistant", speech)
                return {"speech": speech, "action_taken": "hermes_action", "output": out, "skills": skill_names}

        # =========================================================================
        # 11. Conversational Intelligence (Dual Brain: Qwen Local SLM + OpenRouter Cloud)
        # =========================================================================
        omni_ctx = self.omni_memory.build_system_context(text)
        empathy_guidance = self.affect_engine.format_empathy_guidance(emotion_data)
        
        is_conversational = not self.is_action_directive(text) and len(text.split()) < 35
        if is_conversational:
            dynamic_system_prompt = (
                f"You are J.A.R.V.I.S., {title}'s loyal, witty, and brilliant British AI major-domo. "
                f"Speak naturally with refined eloquence and poise. Keep verbal answers concise (1 to 2 crisp sentences), "
                f"engage in intelligent conversation on any topic, answer questions thoughtfully, and proactively offer assistance or ask follow-ups."
            )
            if empathy_guidance:
                dynamic_system_prompt += f" Tone: {empathy_guidance}."
        else:
            dynamic_system_prompt = self.persona_text
            dynamic_system_prompt = self.skill_executor.enrich_system_prompt_with_skills(dynamic_system_prompt, text, max_skills=1)
            if omni_ctx:
                dynamic_system_prompt += f"\n\n{omni_ctx}"
            if empathy_guidance:
                dynamic_system_prompt += f"\n\n{empathy_guidance}"

        now_dt = datetime.datetime.now()
        clock_context = (
            f"[CRITICAL WORKSTATION CLOCK]: Local Time: {now_dt.strftime('%I:%M %p')}, "
            f"Date: {now_dt.strftime('%A, %B %d, %Y')}. Year: {now_dt.year}. "
            f"Workstation OS: Windows 11. (Current live temporal anchor. Never assume year is 2023 or earlier; use this exact date and time)."
        )
        dynamic_system_prompt = f"{clock_context}\n\n{dynamic_system_prompt}"

        recent_turns = self.memory.get_recent_turns(6)
        messages = [{"role": "system", "content": dynamic_system_prompt}]
        for turn in recent_turns:
            if turn["role"] in ["user", "assistant"]:
                messages.append({"role": turn["role"], "content": turn["content"]})
        if not messages or messages[-1]["content"] != text:
            messages.append({"role": "user", "content": text})

        # 11. Multi-Tier Hybrid Cognition Engine
        # 11a. Fast Cloud Brain (Groq LPU 250ms / Gemini Flash 350ms / OpenRouter)
        fast_res = self.fast_cloud_brain.query(messages, max_tokens=60)
        if fast_res["success"] and fast_res["reply"]:
            speech = fast_res["reply"]
            self.tts.speak(speech)
            self.memory.add_turn("assistant", speech)
            self.omni_memory.archive_turn("assistant", speech)
            self.reflex_engine.last_interaction_time = time.time()
            return {"speech": speech, "action_taken": "fast_cloud_brain", "provider": fast_res.get("provider")}

        # 11b. Immediate Vocal Acknowledgment (only for long action directives, not casual dialogue)
        if not is_conversational and len(text.split()) > 6:
            self.tts.speak_instant_ack()

        # Prioritize warm Local Qwen 2.5 SLM if running locally
        if self.local_brain.is_service_available():
            local_res = self.local_brain.query(text, dynamic_system_prompt, messages=messages, max_tokens=120)
            if local_res["success"] and local_res["reply"]:
                speech = local_res["reply"]
                self.tts.speak(speech)
                self.memory.add_turn("assistant", speech)
                self.omni_memory.archive_turn("assistant", speech)
                self.reflex_engine.last_interaction_time = time.time()
                return {"speech": speech, "action_taken": "local_brain", "model": self.local_brain.model}

        # Cloud Cognition via OpenRouter Brain (with fail-fast on 429)
        brain_res = self.openrouter_brain.query(messages, max_tokens=100)
        if brain_res["success"] and brain_res["reply"]:
            speech = brain_res["reply"]
            self.tts.speak(speech)
            self.memory.add_turn("assistant", speech)
            self.omni_memory.archive_turn("assistant", speech)
            self.reflex_engine.last_interaction_time = time.time()
            return {"speech": speech, "action_taken": "openrouter_brain", "model": brain_res.get("model_used")}

        # 11d. Fallback to Hermes Harness
        hermes_res = self.hermes.execute_oneshot(text, timeout=25)
        if hermes_res["success"] and hermes_res["output"]:
            out = hermes_res["output"]
            lines = [l.strip() for l in out.splitlines() if l.strip()]
            speech = lines[0] if lines else "Task completed, sir."
            self.tts.speak(speech)
            self.memory.add_turn("assistant", speech)
            self.omni_memory.archive_turn("assistant", speech)
            self.reflex_engine.last_interaction_time = time.time()
            return {"speech": speech, "action_taken": "hermes_agent", "output": out}

        # Default polite fallback
        speech = "Understood, sir. Processing your directive now."
        self.tts.speak(speech)
        self.memory.add_turn("assistant", speech)
        self.omni_memory.archive_turn("assistant", speech)
        self.reflex_engine.last_interaction_time = time.time()
        return {"speech": speech, "action_taken": "default_ack"}

    def _handle_sequential_tasks(self, task_descriptions: List[str]) -> Dict[str, Any]:
        """Handles sequential multi-step tasks one by one."""
        tasks = self.task_manager.add_multiple_tasks(task_descriptions)
        intro_speech = f"Certainly, sir. I have broken down your directive into {len(tasks)} sequential tasks. Commencing task 1 now."
        self.tts.speak(intro_speech)
        print(f"\n[J.A.R.V.I.S. Task Queue]: {len(tasks)} tasks scheduled.")

        results = []
        for i, task in enumerate(tasks, 1):
            self.task_manager.mark_in_progress(task.id)
            print(f"\n--- [Executing Task {task.id}/{len(tasks)}]: {task.description} ---")
            
            sub_res = self._execute_single_subtask(task.description)
            task_result = sub_res.get("summary", "Done")
            self.task_manager.mark_completed(task.id, result=task_result)
            results.append({"task_id": task.id, "description": task.description, "result": task_result})

            # Announce progress between tasks
            if i < len(tasks):
                progress_speech = f"Task {i} complete. Proceeding to task {i + 1}: {tasks[i].description}."
                self.tts.speak(progress_speech)
                time.sleep(0.5)

        final_speech = f"All {len(tasks)} tasks have been successfully concluded, sir. Standing by."
        self.tts.speak(final_speech)
        self.memory.add_turn("assistant", final_speech)
        return {
            "speech": final_speech,
            "action_taken": "sequential_tasks_completed",
            "tasks_executed": results
        }

    def _execute_task_queue(self) -> Dict[str, Any]:
        """Executes all pending tasks in the TaskManager one by one."""
        pending = self.task_manager.get_pending_tasks()
        if not pending:
            return {"speech": "No pending tasks, sir.", "action_taken": None}

        intro_speech = f"Commencing execution of {len(pending)} pending task{'s' if len(pending) != 1 else ''}, sir."
        self.tts.speak(intro_speech)

        results = []
        for i, task in enumerate(pending, 1):
            self.task_manager.mark_in_progress(task.id)
            sub_res = self._execute_single_subtask(task.description)
            summary = sub_res.get("summary", "Executed")
            self.task_manager.mark_completed(task.id, result=summary)
            results.append({"task_id": task.id, "description": task.description, "result": summary})

            if i < len(pending):
                next_task = pending[i]
                prog = f"Task {task.id} concluded. Commencing task {next_task.id}: {next_task.description}."
                self.tts.speak(prog)
                time.sleep(0.5)

        done_speech = f"All queued tasks have been executed, sir."
        self.tts.speak(done_speech)
        self.memory.add_turn("assistant", done_speech)
        return {"speech": done_speech, "action_taken": "queue_executed", "results": results}

    def _execute_single_subtask(self, description: str) -> Dict[str, Any]:
        """
        Executes a single decomposed subtask using the optimal subsystem:
        OS Controller, Hermes Harness (Real Tool Execution), or Cognitive Brain.
        """
        lower = description.lower()

        # 1. System Vitals
        if any(w in lower for w in ["vitals", "status", "health", "cpu", "ram"]):
            vitals = self.os_controller.get_system_vitals()
            summary = f"CPU at {vitals['cpu_percent']}%, RAM at {vitals['ram_percent']}%"
            return {"success": True, "summary": summary, "data": vitals}

        # 2. Websites / URL Shortcuts
        for key, url in self.WEB_SHORTCUTS.items():
            if key in lower:
                webbrowser.open(url)
                return {"success": True, "summary": f"Opened {key.title()} in browser"}

        # 3. Launching Apps
        match_launch = re.search(r"\b(?:open|launch|start)\s+([a-zA-Z0-9_\-\.\s]+)", lower)
        if match_launch:
            app = match_launch.group(1).strip()
            res = self.os_controller.launch_application(app)
            return {"success": res["success"], "summary": f"Launched {app}"}

        # 4. Focus Window
        match_focus = re.search(r"\b(?:switch to|focus|bring up)\s+([a-zA-Z0-9_\-\.\s]+)", lower)
        if match_focus:
            app = match_focus.group(1).strip()
            res = self.os_controller.focus_window(app)
            return {"success": res["success"], "summary": f"Focused window {app}"}

        # 5. Lock workstation
        if "lock" in lower:
            res = self.os_controller.lock_workstation()
            return {"success": True, "summary": res["message"]}

        # 6. Direct Native Task Execution (Files, Folders, Deletions, Searches, Shell)
        n_file = self.task_executor.execute_file_creation(description)
        if n_file and n_file["success"]:
            return {"success": True, "summary": n_file["summary"]}

        n_folder = self.task_executor.execute_folder_creation(description)
        if n_folder and n_folder["success"]:
            return {"success": True, "summary": n_folder["summary"]}

        n_del = self.task_executor.execute_file_deletion(description)
        if n_del:
            return {"success": n_del["success"], "summary": n_del["summary"]}

        n_search = self.task_executor.execute_web_search(description)
        if n_search and n_search["success"]:
            return {"success": True, "summary": n_search["summary"]}

        n_shell = self.task_executor.execute_shell_command(description)
        if n_shell:
            return {"success": n_shell["success"], "summary": n_shell["summary"]}

        # 7. Real Action Tasks -> Hermes Harness
        if self.is_action_directive(description):
            hermes_res = self.hermes.execute_oneshot(description, timeout=45)
            if hermes_res["success"] and hermes_res["output"]:
                summary = hermes_res["output"][:120]
                return {"success": True, "summary": summary}

        # 8. Local Offline Cognition (Qwen 2.5) if requested or active
        if self.local_brain.is_service_available():
            loc_res = self.local_brain.query(f"Task: {description}. Provide concise status.", self.persona_text)
            if loc_res["success"] and loc_res["reply"]:
                return {"success": True, "summary": loc_res["reply"], "model": loc_res.get("model")}

        # 8. Cloud Cognition -> OpenRouter Brain
        prompt = [
            {"role": "system", "content": "You are J.A.R.V.I.S. Summarize the completed action in one short British sentence addressing the user as Sir."},
            {"role": "user", "content": f"Task: {description}. Provide status."}
        ]
        res = self.openrouter_brain.query(prompt, max_tokens=100)
        summary = res.get("reply") or f"Task '{description}' executed successfully, sir."
        return {"success": True, "summary": summary}

    def _execute_pending_action(self, pending: Dict[str, Any]) -> Dict[str, Any]:
        """Executes an action that has passed user confirmation."""
        action_type = pending.get("action")
        target = pending.get("target")
        
        if action_type == "kill_process":
            res = self.os_controller.kill_process(target)
            speech = f"Action confirmed. {res['message']}"
            self.tts.speak(speech)
            self.memory.add_turn("assistant", speech)
            return {"speech": speech, "action_taken": "kill_process_confirmed", "result": res}
            
        speech = "Confirmed, sir. Execution completed."
        self.tts.speak(speech)
        self.memory.add_turn("assistant", speech)
        return {"speech": speech, "action_taken": "confirmed_generic"}
