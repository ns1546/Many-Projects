"""
J.A.R.V.I.S. Sub-Branch Architecture: Base Contracts
Defines standard interfaces for specialized operational divisions and autonomous sub-agents.
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
import time
from typing import Dict, Any, List, Optional


@dataclass
class BranchResult:
    """Standardized response object produced by any J.A.R.V.I.S. Sub-Branch."""
    success: bool
    speech: str
    action_taken: str
    data: Dict[str, Any] = field(default_factory=dict)
    branch_id: str = "generic"
    branch_name: str = "Generic Division"
    execution_time_ms: float = 0.0

    def to_dict(self) -> Dict[str, Any]:
        return {
            "success": self.success,
            "speech": self.speech,
            "action_taken": self.action_taken,
            "branch_id": self.branch_id,
            "branch_name": self.branch_name,
            "execution_time_ms": round(self.execution_time_ms, 2),
            "data": self.data
        }


class BaseSubBranch(ABC):
    """
    Abstract base class for all operational divisions / sub-branches of J.A.R.V.I.S.
    Each branch operates with distinct specialists, domain knowledge, and execution tools.
    """

    def __init__(self, branch_id: str, branch_name: str, description: str):
        self.branch_id = branch_id
        self.branch_name = branch_name
        self.description = description
        self.total_executions = 0
        self.successful_executions = 0
        self.last_execution_time = 0.0

    @property
    @abstractmethod
    def capabilities(self) -> List[str]:
        """List of high-level capabilities supported by this branch."""
        pass

    @property
    @abstractmethod
    def specialist_roles(self) -> List[str]:
        """List of active development / operational specialist roles within this branch."""
        pass

    @abstractmethod
    def can_handle(self, text: str, context: Optional[Dict[str, Any]] = None) -> bool:
        """Determines if this branch possesses the domain competence to handle the directive."""
        pass

    @abstractmethod
    def execute(self, text: str, context: Optional[Dict[str, Any]] = None) -> BranchResult:
        """Executes the directive within this branch's operational domain."""
        pass

    def get_status(self) -> Dict[str, Any]:
        """Returns real-time health and operational metrics for this branch."""
        return {
            "branch_id": self.branch_id,
            "branch_name": self.branch_name,
            "description": self.description,
            "specialist_roles": self.specialist_roles,
            "capabilities": self.capabilities,
            "total_executions": self.total_executions,
            "successful_executions": self.successful_executions,
            "success_rate": round(self.successful_executions / max(1, self.total_executions) * 100, 1),
            "status": "nominal"
        }

    def list_capabilities(self) -> List[str]:
        """Returns capabilities formatted for inspection."""
        return self.capabilities
