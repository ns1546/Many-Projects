"""
J.A.R.V.I.S. Multimodal Perception & Computer-Use Branch
Specialized sub-branch for desktop screen vision, active window tracking,
coordinate-driven GUI automation, screenshot archiving, and web media perception.
"""

import time
import re
from typing import Dict, Any, List, Optional
from core.sub_branches.base_branch import BaseSubBranch, BranchResult


class PerceptionBranch(BaseSubBranch):
    """
    Sub-Branch 6: Multimodal Perception & Computer-Use Division.
    Provides sensory awareness of the desktop, screen capture, GUI automation, and web navigation.
    """

    def __init__(
        self,
        screen_perception: Any,
        gui_agent: Any,
        web_media: Any,
        os_controller: Any
    ):
        super().__init__(
            branch_id="perception",
            branch_name="Multimodal Perception & Computer-Use Division",
            description="Sensory desktop screen perception, active window tracking, vision-guided GUI computer-use, and web media automation."
        )
        self.screen_perception = screen_perception
        self.gui_agent = gui_agent
        self.web_media = web_media
        self.os_controller = os_controller

    @property
    def capabilities(self) -> List[str]:
        return [
            "desktop_visual_feed_capture",
            "active_window_situational_awareness",
            "vision_guided_gui_computer_use",
            "web_media_browser_navigation",
            "screen_ocr_workspace_digest"
        ]

    @property
    def specialist_roles(self) -> List[str]:
        return [
            "Visual Display Observer",
            "Scene & OCR Inspector",
            "Computer-Use GUI Operator",
            "Web Media Scout"
        ]

    def can_handle(self, text: str, context: Optional[Dict[str, Any]] = None) -> bool:
        lower = text.lower()
        triggers = [
            "screenshot", "screen capture", "what is on my screen", "look at my screen",
            "what am i looking at", "active window", "switch window", "focus window",
            "click", "type", "gui", "webpage", "browse", "visual feed"
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
            # 1. Desktop Visual Feed Capture / Screenshot
            if any(w in lower for w in ["screenshot", "capture screen", "capture desktop", "take screenshot"]):
                cap = self.screen_perception.capture_active_screen()
                speech = f"{cap.get('summary', 'Screenshot captured')}, {title}."
                self.successful_executions += 1
                return BranchResult(
                    success=cap.get("success", True),
                    speech=speech,
                    action_taken="capture_screenshot",
                    data=cap,
                    branch_id=self.branch_id,
                    branch_name=self.branch_name,
                    execution_time_ms=(time.time() - start_time) * 1000
                )

            # 2. Situational Awareness & Active Screen Inspection
            if any(w in lower for w in ["what is on my screen", "look at my screen", "what am i looking at", "screen digest"]):
                cap = self.screen_perception.capture_active_screen()
                win_title = cap.get("active_window", "Desktop Workspace")
                speech = (
                    f"Visual perception online, {title}. Active foreground window is '{win_title}'. "
                    f"Desktop feed has been archived to telemetry."
                )
                self.successful_executions += 1
                return BranchResult(
                    success=True,
                    speech=speech,
                    action_taken="screen_situational_awareness",
                    data=cap,
                    branch_id=self.branch_id,
                    branch_name=self.branch_name,
                    execution_time_ms=(time.time() - start_time) * 1000
                )

            # 3. Focus Window Directive
            match_focus = re.search(r"\b(?:switch to|focus|bring up)\s+([a-zA-Z0-9_\-\.\s]+)", lower)
            if match_focus:
                app = match_focus.group(1).strip()
                res = self.os_controller.focus_window(app)
                speech = f"Window focus directed to {app}, {title}."
                self.successful_executions += 1
                return BranchResult(
                    success=res.get("success", True),
                    speech=speech,
                    action_taken="focus_window",
                    data=res,
                    branch_id=self.branch_id,
                    branch_name=self.branch_name,
                    execution_time_ms=(time.time() - start_time) * 1000
                )

            # 4. Fallback GUI / Perception Status
            res = self.gui_agent.get_screen_resolution()
            speech = f"Multimodal perception sensors active, {title}. Display resolution calibrated at {res[0]}x{res[1]} pixels."
            self.successful_executions += 1
            return BranchResult(
                success=True,
                speech=speech,
                action_taken="perception_standby",
                data={"resolution": res},
                branch_id=self.branch_id,
                branch_name=self.branch_name,
                execution_time_ms=(time.time() - start_time) * 1000
            )

        except Exception as e:
            err_speech = f"Perception Division encountered an error: {str(e)}, {title}."
            return BranchResult(
                success=False,
                speech=err_speech,
                action_taken="perception_error",
                data={"error": str(e)},
                branch_id=self.branch_id,
                branch_name=self.branch_name,
                execution_time_ms=(time.time() - start_time) * 1000
            )
