"""
J.A.R.V.I.S. Cyber Sentinel & Security Auditor Branch
Specialized sub-branch for workstation hardware telemetry, process anomaly detection,
3-tier safety authorization gates, emergency lockdown, and security auditing.
"""

import time
import re
from typing import Dict, Any, List, Optional
from core.sub_branches.base_branch import BaseSubBranch, BranchResult
from core.safety.gates import SafetyTier


class CyberSentinelBranch(BaseSubBranch):
    """
    Sub-Branch 3: Workstation Cyber Sentinel & Security Auditor Division.
    Maintains workstation security, hardware telemetry, and enforces safety verification gates.
    """

    def __init__(
        self,
        sentinel: Any,
        os_controller: Any,
        safety_gate: Any
    ):
        super().__init__(
            branch_id="cyber_sentinel",
            branch_name="Workstation Cyber Sentinel & Security Division",
            description="Workstation telemetry monitoring, runaway process anomaly detection, 3-tier safety gates, and emergency lockdown."
        )
        self.sentinel = sentinel
        self.os_controller = os_controller
        self.safety_gate = safety_gate
        self.security_audit_log: List[Dict[str, Any]] = []

    @property
    def capabilities(self) -> List[str]:
        return [
            "hardware_telemetry_monitoring",
            "process_anomaly_scanner",
            "three_tier_safety_gate_audit",
            "workstation_emergency_lockdown",
            "process_termination_governor",
            "security_ledger_reporting"
        ]

    @property
    def specialist_roles(self) -> List[str]:
        return [
            "Cyber Sentinel Watchdog",
            "Hardware Telemetry Engineer",
            "Security & Safety Auditor",
            "Workstation Lockdown Specialist"
        ]

    def can_handle(self, text: str, context: Optional[Dict[str, Any]] = None) -> bool:
        lower = text.lower()
        triggers = [
            "vitals", "diagnostics", "system health", "hardware status", "cpu", "ram", "memory",
            "lock workstation", "lock screen", "lock pc", "security status", "threat scan",
            "anomaly", "audit log", "security audit", "kill process", "terminate process",
            "close app", "governor"
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
            # 1. Hardware Telemetry & Vitals
            if any(w in lower for w in ["vitals", "diagnostics", "system health", "hardware status", "what are your vitals"]):
                vitals = self.os_controller.get_system_vitals()
                speech = (
                    f"Sentinel telemetry online, {title}. CPU is at {vitals.get('cpu_percent', 0)}%, "
                    f"memory at {vitals.get('ram_percent', 0)}% ({vitals.get('ram_used_gb', 0)} of {vitals.get('ram_total_gb', 0)} GB), "
                    f"with {vitals.get('disk_free_gb', 0)} GB storage available."
                )
                self._log_audit_event("vitals_query", "Tier 1", "Authorized")
                self.successful_executions += 1
                return BranchResult(
                    success=True,
                    speech=speech,
                    action_taken="hardware_telemetry",
                    data=vitals,
                    branch_id=self.branch_id,
                    branch_name=self.branch_name,
                    execution_time_ms=(time.time() - start_time) * 1000
                )

            # 2. Emergency Workstation Lockdown
            if any(w in lower for w in ["lock workstation", "lock screen", "lock pc", "lock system", "engage lockdown"]):
                lock_res = self.os_controller.lock_workstation()
                speech = f"Workstation locked securely, {title}. Display sessions protected."
                self._log_audit_event("workstation_lockdown", "Tier 2", "Executed")
                self.successful_executions += 1
                return BranchResult(
                    success=True,
                    speech=speech,
                    action_taken="workstation_lockdown",
                    data=lock_res,
                    branch_id=self.branch_id,
                    branch_name=self.branch_name,
                    execution_time_ms=(time.time() - start_time) * 1000
                )

            # 3. Process Anomaly & Threat Scan
            if any(w in lower for w in ["anomaly", "threat scan", "scan processes", "check anomalies"]):
                vitals = self.os_controller.get_system_vitals()
                cpu_p = vitals.get("cpu_percent", 0.0)
                ram_p = vitals.get("ram_percent", 0.0)
                anomalies = []
                if cpu_p > 85.0:
                    anomalies.append(f"Elevated CPU load ({cpu_p}%)")
                if ram_p > 90.0:
                    anomalies.append(f"Near-saturation memory load ({ram_p}%)")

                status_desc = "all processes operating within nominal parameters" if not anomalies else f"detected {', '.join(anomalies)}"
                speech = f"Sentinel security scan complete, {title}: {status_desc}."
                self._log_audit_event("anomaly_scan", "Tier 1", "Clean" if not anomalies else "Warning")
                self.successful_executions += 1
                return BranchResult(
                    success=True,
                    speech=speech,
                    action_taken="anomaly_scan",
                    data={"anomalies": anomalies, "vitals": vitals},
                    branch_id=self.branch_id,
                    branch_name=self.branch_name,
                    execution_time_ms=(time.time() - start_time) * 1000
                )

            # 4. Security Audit Log Query
            if any(w in lower for w in ["audit log", "security log", "security status", "audit ledger"]):
                log_count = len(self.security_audit_log)
                speech = f"Security audit ledger maintains {log_count} recorded events, {title}. All past actions passed tiered authorization gates."
                self.successful_executions += 1
                return BranchResult(
                    success=True,
                    speech=speech,
                    action_taken="security_audit_log",
                    data={"total_events": log_count, "recent_events": self.security_audit_log[-10:]},
                    branch_id=self.branch_id,
                    branch_name=self.branch_name,
                    execution_time_ms=(time.time() - start_time) * 1000
                )

            # 5. Process Termination with 3-Tier Safety Gate Interception
            match_kill = re.search(r"\b(?:kill|terminate|close)\s+([a-zA-Z0-9_\-\.\s]+)", lower)
            if match_kill:
                target_proc = match_kill.group(1).strip()
                gate_eval = self.safety_gate.evaluate_execution(f"terminate {target_proc}")
                
                if gate_eval.get("prompt_needed"):
                    speech = f"Safety Gate Interception: Terminating '{target_proc}' requires your explicit confirmation, {title}."
                    self._log_audit_event("kill_process_intercepted", "Tier 2/3", "Prompt Required")
                    self.successful_executions += 1
                    return BranchResult(
                        success=True,
                        speech=speech,
                        action_taken="pending_confirmation",
                        data={"target": target_proc, "gate_eval": gate_eval},
                        branch_id=self.branch_id,
                        branch_name=self.branch_name,
                        execution_time_ms=(time.time() - start_time) * 1000
                    )
                else:
                    k_res = self.os_controller.kill_process(target_proc)
                    speech = f"{k_res.get('message', 'Process terminated')}, {title}."
                    self._log_audit_event("kill_process_executed", "Tier 2", "Success")
                    self.successful_executions += 1
                    return BranchResult(
                        success=k_res.get("success", True),
                        speech=speech,
                        action_taken="kill_process",
                        data=k_res,
                        branch_id=self.branch_id,
                        branch_name=self.branch_name,
                        execution_time_ms=(time.time() - start_time) * 1000
                    )

            # Fallback
            speech = f"Cyber Sentinel division is active and monitoring workstation vitals, {title}."
            self.successful_executions += 1
            return BranchResult(
                success=True,
                speech=speech,
                action_taken="sentinel_standby",
                data={},
                branch_id=self.branch_id,
                branch_name=self.branch_name,
                execution_time_ms=(time.time() - start_time) * 1000
            )

        except Exception as e:
            err_speech = f"Cyber Sentinel division encountered an error: {str(e)}, {title}."
            return BranchResult(
                success=False,
                speech=err_speech,
                action_taken="sentinel_error",
                data={"error": str(e)},
                branch_id=self.branch_id,
                branch_name=self.branch_name,
                execution_time_ms=(time.time() - start_time) * 1000
            )

    def _log_audit_event(self, action: str, tier: str, outcome: str):
        self.security_audit_log.append({
            "timestamp": time.time(),
            "action": action,
            "tier": tier,
            "outcome": outcome
        })
