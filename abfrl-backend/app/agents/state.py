"""
Agent state management.
"""

from typing import Any, Dict


class AgentState:
    """
    State container for agents.
    """

    def __init__(self) -> None:
        self.data: Dict[str, Any] = {}

    def update(self, key: str, value: Any) -> None:
        """
        Update state data.
        """
        self.data[key] = value

    def get(self, key: str) -> Any:
        """
        Get state data.
        """
        return self.data.get(key)