"""
J.A.R.V.I.S. Sub-Branch Registry & Autonomous Dispatcher
Central coordinator managing all 6 operational divisions, routing directives,
aggregating telemetry, and reporting departmental fleet readiness.
"""

import time
import re
from typing import Dict, Any, List, Optional
from core.sub_branches.base_branch import BaseSubBranch, BranchResult


class SubBranchRegistry:
    """
    Master Registry of J.A.R.V.I.S. Sub-Branches.
    Routes incoming user commands to the optimal operational branch and monitors fleet telemetry.
    """

    def __init__(self):
        self._branches: Dict[str, BaseSubBranch] = {}
        # Priority order for autonomous intent matching
        self._dispatch_priority: List[str] = [
            "personal_ops",
            "communications",
            "engineering",
            "cyber_sentinel",
            "daily_life",
            "perception"
        ]

    def register_branch(self, branch: BaseSubBranch) -> None:
        """Registers an operational sub-branch."""
        self._branches[branch.branch_id] = branch
        if branch.branch_id not in self._dispatch_priority:
            self._dispatch_priority.append(branch.branch_id)

    def get_branch(self, branch_id: str) -> Optional[BaseSubBranch]:
        """Retrieves a sub-branch by its identifier."""
        return self._branches.get(branch_id)

    def list_branches(self) -> List[Dict[str, Any]]:
        """Returns metadata and metrics for all registered branches."""
        return [b.get_status() for b in self._branches.values()]

    def get_fleet_status(self) -> Dict[str, Any]:
        """Aggregates fleet-wide metrics across all operational divisions."""
        total_branches = len(self._branches)
        total_execs = sum(b.total_executions for b in self._branches.values())
        success_execs = sum(b.successful_executions for b in self._branches.values())
        all_capabilities = []
        all_specialists = []
        for b in self._branches.values():
            all_capabilities.extend(b.capabilities)
            all_specialists.extend(b.specialist_roles)

        return {
            "total_branches": total_branches,
            "total_capabilities": len(set(all_capabilities)),
            "total_specialist_roles": len(set(all_specialists)),
            "total_executions": total_execs,
            "successful_executions": success_execs,
            "fleet_success_rate": round(success_execs / max(1, total_execs) * 100, 1),
            "branches": [b.get_status() for b in self._branches.values()]
        }

    def format_speech_overview(self, title: str = "sir") -> str:
        """Returns a refined British verbal status briefing for J.A.R.V.I.S."""
        fleet = self.get_fleet_status()
        branch_names = [b.branch_name.split()[0] for b in self._branches.values()]
        return (
            f"All {fleet['total_branches']} operational sub-branches are online with full departmental autonomy, {title}: "
            f"{', '.join(branch_names)}. Deploying {fleet['total_capabilities']} verified capabilities "
            f"across {fleet['total_specialist_roles']} specialist roles."
        )

    def dispatch(self, text: str, context: Optional[Dict[str, Any]] = None) -> Optional[BranchResult]:
        """
        Dispatches a user directive to the appropriate branch.
        Supports explicit branch targeting (e.g., 'engineering branch: create server.py')
        as well as autonomous domain intent classification.
        """
        lower = text.lower().strip()
        context = context or {}

        # 1. Explicit Branch Targeting
        explicit_patterns = {
            "personal_ops": r"\b(?:personal\s+ops|chief\s+of\s+staff|executive\s+branch)\b[:\s]*(.*)",
            "engineering": r"\b(?:engineering\s+branch|devops\s+branch|engineering|devops)\b[:\s]+(.*)",
            "cyber_sentinel": r"\b(?:sentinel\s+branch|cyber\s+sentinel|security\s+branch)\b[:\s]*(.*)",
            "communications": r"\b(?:communications?\s+branch|customer\s+care\s+branch)\b[:\s]*(.*)",
            "daily_life": r"\b(?:daily\s+life\s+branch|wellness\s+branch|lifegraph\s+branch)\b[:\s]*(.*)",
            "perception": r"\b(?:perception\s+branch|vision\s+branch|gui\s+branch)\b[:\s]*(.*)"
        }

        for branch_id, pattern in explicit_patterns.items():
            match = re.search(pattern, lower)
            if match and branch_id in self._branches:
                target_directive = match.group(1).strip() if match.groups() and match.group(1) else text
                if not target_directive:
                    target_directive = text
                return self._branches[branch_id].execute(target_directive, context)

        # 2. Autonomous Intent Matching by Priority
        for branch_id in self._dispatch_priority:
            branch = self._branches.get(branch_id)
            if branch and branch.can_handle(text, context):
                return branch.execute(text, context)

        return None
