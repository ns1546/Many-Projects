"""
J.A.R.V.I.S. Omnipresent Communications & Customer Care Branch
Specialized sub-branch for 24/7 autonomous WhatsApp customer care, background daemon,
bilingual English/Bengali NLP, neural voice note dispatch, and call receptionist attendance.
"""

import time
import re
from typing import Dict, Any, List, Optional
from core.sub_branches.base_branch import BaseSubBranch, BranchResult


class CommunicationsBranch(BaseSubBranch):
    """
    Sub-Branch 4: Omnipresent Communications & Customer Care Division.
    Handles WhatsApp 24/7 background operations, call receptionist duties, bilingual care, and messaging.
    """

    def __init__(
        self,
        comm_hub: Any,
        customer_care: Optional[Any] = None
    ):
        super().__init__(
            branch_id="communications",
            branch_name="Omnipresent Communications & Customer Care Division",
            description="Autonomous 24/7 WhatsApp background daemon, bilingual English & Bengali NLP customer care, call reception, and voice note dispatch."
        )
        self.comm_hub = comm_hub
        self.customer_care = customer_care or getattr(comm_hub, "customer_care", None)

    @property
    def capabilities(self) -> List[str]:
        return [
            "whatsapp_background_daemon_24_7",
            "bilingual_bangla_english_customer_care",
            "autonomous_call_receptionist_service",
            "neural_voice_note_synthesis_and_dispatch",
            "continuous_reinforcement_knowledge_learning",
            "omnichannel_customer_care_dashboard"
        ]

    @property
    def specialist_roles(self) -> List[str]:
        return [
            "Customer Support Operations Lead",
            "WhatsApp 24/7 Background Daemon Operator",
            "Bilingual Bengali & English NLP Specialist",
            "Executive Call Receptionist"
        ]

    def can_handle(self, text: str, context: Optional[Dict[str, Any]] = None) -> bool:
        lower = text.lower()
        triggers = [
            "whatsapp", "customer care", "receptionist", "daemon",
            "attend call", "voice note", "incoming call", "customer ticket",
            "bangla", "bengali", "message from", "send message",
            "teach customer care", "customer care rule", "closing whatsapp"
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
            # 1. WhatsApp 24/7 Background Daemon Controls
            if any(w in lower for w in ["start whatsapp daemon", "keep whatsapp running in background", "run whatsapp in background", "start daemon"]):
                d_res = self.customer_care.start_background_daemon()
                speech = (
                    f"WhatsApp 24/7 background daemon is active on port {d_res.get('port', 5055)}, {title}. "
                    "Customer interactions will be serviced autonomously in English and Bengali even when WhatsApp is closed."
                )
                self.successful_executions += 1
                return BranchResult(
                    success=True,
                    speech=speech,
                    action_taken="start_whatsapp_daemon",
                    data=d_res,
                    branch_id=self.branch_id,
                    branch_name=self.branch_name,
                    execution_time_ms=(time.time() - start_time) * 1000
                )

            if any(w in lower for w in ["stop whatsapp daemon", "disable whatsapp background", "stop daemon"]):
                d_res = self.customer_care.stop_background_daemon()
                speech = f"WhatsApp 24/7 background daemon has been disengaged, {title}."
                self.successful_executions += 1
                return BranchResult(
                    success=True,
                    speech=speech,
                    action_taken="stop_whatsapp_daemon",
                    data=d_res,
                    branch_id=self.branch_id,
                    branch_name=self.branch_name,
                    execution_time_ms=(time.time() - start_time) * 1000
                )

            if any(w in lower for w in ["whatsapp daemon status", "whatsapp background status", "is whatsapp running in background"]):
                status = self.customer_care.get_daemon_status()
                state = "active and running 24/7" if status.get("is_running") else "offline"
                speech = f"WhatsApp background daemon is currently {state} on port {status.get('port', 5055)}, {title}."
                self.successful_executions += 1
                return BranchResult(
                    success=True,
                    speech=speech,
                    action_taken="whatsapp_daemon_status",
                    data=status,
                    branch_id=self.branch_id,
                    branch_name=self.branch_name,
                    execution_time_ms=(time.time() - start_time) * 1000
                )

            # 2. Receptionist Mode Activation / Deactivation
            if any(w in lower for w in ["attend call", "be my receptionist", "enable receptionist", "activate receptionist"]):
                self.customer_care.set_receptionist_mode(True)
                speech = f"Autonomous WhatsApp Call Receptionist is engaged, {title}. I shall attend incoming calls on your behalf."
                self.successful_executions += 1
                return BranchResult(
                    success=True,
                    speech=speech,
                    action_taken="enable_receptionist",
                    data={"receptionist_mode": True},
                    branch_id=self.branch_id,
                    branch_name=self.branch_name,
                    execution_time_ms=(time.time() - start_time) * 1000
                )

            if any(w in lower for w in ["disable receptionist", "stop attending calls", "don't attend calls"]):
                self.customer_care.set_receptionist_mode(False)
                speech = f"Call Receptionist mode disengaged, {title}. Incoming calls will route directly to you."
                self.successful_executions += 1
                return BranchResult(
                    success=True,
                    speech=speech,
                    action_taken="disable_receptionist",
                    data={"receptionist_mode": False},
                    branch_id=self.branch_id,
                    branch_name=self.branch_name,
                    execution_time_ms=(time.time() - start_time) * 1000
                )

            # 3. Customer Care Performance Dashboard
            if any(w in lower for w in ["customer care dashboard", "customer care status", "whatsapp status", "customer tickets"]):
                dash = self.customer_care.get_service_dashboard()
                rec_status = "active" if dash.get("receptionist_mode") else "standby"
                speech = (
                    f"Customer Care briefing, {title}: {dash.get('total_interactions', 0)} total interactions logged, "
                    f"{dash.get('resolved_tickets', 0)} resolved, {dash.get('escalated_tickets', 0)} escalated, "
                    f"and {dash.get('calls_attended', 0)} calls attended. Receptionist mode is {rec_status}."
                )
                self.successful_executions += 1
                return BranchResult(
                    success=True,
                    speech=speech,
                    action_taken="customer_care_dashboard",
                    data=dash,
                    branch_id=self.branch_id,
                    branch_name=self.branch_name,
                    execution_time_ms=(time.time() - start_time) * 1000
                )

            # 4. Teaching Customer Care Knowledge (Continuous Learning)
            teach_match = re.search(
                r"\b(?:learn\s+(?:this\s+)?(?:for\s+customer\s+care\s*)?[:\s]+|teach\s+customer\s+care[:\s]+|customer\s+care\s+rule[:\s]+)(.+)",
                text,
                re.IGNORECASE
            )
            if teach_match:
                rule_text = teach_match.group(1).strip()
                learn_res = self.customer_care.teach_rule(rule_text)
                self.successful_executions += 1
                return BranchResult(
                    success=True,
                    speech=learn_res.get("message", "Rule learned"),
                    action_taken="learn_customer_care_rule",
                    data=learn_res,
                    branch_id=self.branch_id,
                    branch_name=self.branch_name,
                    execution_time_ms=(time.time() - start_time) * 1000
                )

            # 5. Dispatch Neural Voice Note
            match_vn = re.search(
                r"\bsend\s+(?:a\s+)?(?:whatsapp\s+)?voice\s+note\s+to\s+([a-zA-Z0-9_\+\-\s]+?)[:\s]+(.+)",
                text,
                re.IGNORECASE
            )
            if match_vn:
                recip = match_vn.group(1).strip()
                vn_text = match_vn.group(2).strip()
                vn_res = self.comm_hub.send_whatsapp_voice_note(recip, vn_text)
                speech = f"Synthesized and dispatched WhatsApp voice note to {recip}, {title}."
                self.successful_executions += 1
                return BranchResult(
                    success=True,
                    speech=speech,
                    action_taken="send_voice_note",
                    data=vn_res,
                    branch_id=self.branch_id,
                    branch_name=self.branch_name,
                    execution_time_ms=(time.time() - start_time) * 1000
                )

            # 6. Incoming Text / Bengali or English Care Message Processing
            care_res = self.customer_care.process_incoming_text(
                customer_phone="+1-555-0199",
                customer_name="Valued Customer",
                message_text=text
            )
            speech = f"Inquiry processed with status '{care_res.get('status', 'resolved')}', {title}. Formulated response: '{care_res.get('reply_text', '')[:80]}...'"
            self.successful_executions += 1
            return BranchResult(
                success=True,
                speech=speech,
                action_taken="process_customer_inquiry",
                data=care_res,
                branch_id=self.branch_id,
                branch_name=self.branch_name,
                execution_time_ms=(time.time() - start_time) * 1000
            )

        except Exception as e:
            err_speech = f"Communications Division encountered an error: {str(e)}, {title}."
            return BranchResult(
                success=False,
                speech=err_speech,
                action_taken="communications_error",
                data={"error": str(e)},
                branch_id=self.branch_id,
                branch_name=self.branch_name,
                execution_time_ms=(time.time() - start_time) * 1000
            )
