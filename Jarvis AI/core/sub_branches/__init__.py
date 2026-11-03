"""
J.A.R.V.I.S. Operational Sub-Branches Package
Provides specialized departmental autonomy across the entire assistant ecosystem:
1. PersonalOpsBranch (Chief of Staff & Personal Operations)
2. EngineeringBranch (Software Engineering & Autonomous DevOps)
3. CyberSentinelBranch (Workstation Cyber Sentinel & Security)
4. CommunicationsBranch (Omnipresent Communications & 24/7 Customer Care)
5. DailyLifeBranch (Daily Life Logistics & Bio-Wellness)
6. PerceptionBranch (Multimodal Perception & Computer-Use)
"""

from core.sub_branches.base_branch import BaseSubBranch, BranchResult
from core.sub_branches.branch_registry import SubBranchRegistry
from core.sub_branches.personal_ops_branch import PersonalOpsBranch
from core.sub_branches.engineering_branch import EngineeringBranch
from core.sub_branches.cyber_sentinel_branch import CyberSentinelBranch
from core.sub_branches.communications_branch import CommunicationsBranch
from core.sub_branches.daily_life_branch import DailyLifeBranch
from core.sub_branches.perception_branch import PerceptionBranch

__all__ = [
    "BaseSubBranch",
    "BranchResult",
    "SubBranchRegistry",
    "PersonalOpsBranch",
    "EngineeringBranch",
    "CyberSentinelBranch",
    "CommunicationsBranch",
    "DailyLifeBranch",
    "PerceptionBranch"
]
