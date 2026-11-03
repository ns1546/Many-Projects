"""
J.A.R.V.I.S. Autonomous Skill Routing & Execution Engine
Dynamically maps any complex user goal to the optimal combination of agent skills,
injecting specialized knowledge and invoking Hermes Agent or Local Brain with domain mastery.
"""

from typing import Dict, List, Any, Optional
from core.skills.skill_registry import SkillRegistry, Skill
from core.hermes_bridge import HermesBridge
from automation.task_executor import NativeTaskExecutor

class SkillExecutor:
    def __init__(self, registry: SkillRegistry, hermes: HermesBridge, task_executor: NativeTaskExecutor):
        self.registry = registry
        self.hermes = hermes
        self.task_executor = task_executor

    def resolve_best_skills(self, prompt: str, max_skills: int = 3, **kwargs) -> List[Skill]:
        """Identifies the top skill matches for a given natural language prompt."""
        limit = kwargs.get("limit", max_skills)
        return self.registry.search_skills(prompt, limit=limit)

    def execute_directive_with_skills(
        self,
        prompt: str,
        explicit_skills: Optional[List[str]] = None,
        timeout: int = 90
    ) -> Dict[str, Any]:
        """
        Executes a user directive using preloaded domain skills via Hermes Agent harness.
        """
        skill_names = []
        if explicit_skills:
            skill_names.extend(explicit_skills)
        else:
            matched = self.resolve_best_skills(prompt, max_skills=3)
            skill_names = [s.name for s in matched]

        # Execute Hermes with skill preload
        hermes_res = self.hermes.execute_oneshot(
            prompt=prompt,
            skills=skill_names if skill_names else None,
            timeout=timeout
        )

        return {
            "success": hermes_res.get("success", False),
            "output": hermes_res.get("output", ""),
            "error": hermes_res.get("error"),
            "skills_activated": skill_names
        }

    def enrich_system_prompt_with_skills(self, system_prompt: str, user_prompt: str, max_skills: int = 2) -> str:
        """
        Extracts key procedural instructions from matched skills and appends them
        to the cognitive LLM's system prompt.
        """
        matched = self.resolve_best_skills(user_prompt, limit=max_skills)
        if not matched:
            return system_prompt

        skill_context = "\n\n### ACTIVE J.A.R.V.I.S. DOMAIN SKILLS ENGAGED:"
        for s in matched:
            instructions = self.registry.get_skill_instructions(s.name)
            if instructions:
                # Extract first 60 lines of guidelines
                lines = instructions.splitlines()[:60]
                brief = "\n".join(lines)
                skill_context += f"\n\n#### Skill: {s.name} ({s.category})\n{brief}"

        return system_prompt + skill_context
