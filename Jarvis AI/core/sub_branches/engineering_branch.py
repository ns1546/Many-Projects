"""
J.A.R.V.I.S. Software Engineering & Autonomous DevOps Branch
Specialized sub-branch for autonomous code generation, syntax validation,
refactoring, terminal operations, agentic skill orchestration, and Hermes execution.
"""

import ast
import os
import re
import time
from typing import Dict, Any, List, Optional
from core.sub_branches.base_branch import BaseSubBranch, BranchResult


class EngineeringBranch(BaseSubBranch):
    """
    Sub-Branch 2: Software Engineering & Autonomous DevOps Division.
    Executes deep code synthesis, AST verification, command pipelines, and skill deployments.
    """

    def __init__(
        self,
        hermes: Any,
        task_executor: Any,
        skill_registry: Any,
        skill_hub: Optional[Any] = None
    ):
        super().__init__(
            branch_id="engineering",
            branch_name="Software Engineering & Autonomous DevOps Division",
            description="Autonomous software engineering, Hermes harness orchestration, code syntax auditing, and DevOps pipelines."
        )
        self.hermes = hermes
        self.task_executor = task_executor
        self.skill_registry = skill_registry
        self.skill_hub = skill_hub

    @property
    def capabilities(self) -> List[str]:
        return [
            "hermes_agent_coding_pipeline",
            "native_file_and_folder_synthesis",
            "python_ast_syntax_audit",
            "terminal_shell_execution",
            "agentic_skill_discovery_and_deploy",
            "codebase_diff_and_refactor"
        ]

    @property
    def specialist_roles(self) -> List[str]:
        return [
            "Lead System Architect",
            "Senior Implementation Engineer",
            "Hermes Agent Operator",
            "DevOps & QA Reliability Specialist"
        ]

    def can_handle(self, text: str, context: Optional[Dict[str, Any]] = None) -> bool:
        lower = text.lower()
        triggers = [
            "code", "build", "develop", "implement", "create file", "write script",
            "python", "html", "javascript", "css", "refactor", "debug",
            "syntax check", "audit code", "hermes", "terminal", "shell",
            "run command", "git", "npm", "pip", "pytest", "skill", "skills"
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
            # 1. Code Syntax & AST Audit
            if any(w in lower for w in ["syntax check", "audit code", "verify syntax", "check code"]):
                match_file = re.search(r"[\w\-\.\/\\\:]+\.py", text)
                target_file = match_file.group(0) if match_file else None
                audit_res = self._audit_python_syntax(target_file, text)
                speech = (
                    f"Syntax audit concluded, {title}. Status: {audit_res['status']}. "
                    f"{audit_res['message']}"
                )
                self.successful_executions += 1
                return BranchResult(
                    success=audit_res["valid"],
                    speech=speech,
                    action_taken="code_syntax_audit",
                    data=audit_res,
                    branch_id=self.branch_id,
                    branch_name=self.branch_name,
                    execution_time_ms=(time.time() - start_time) * 1000
                )

            # 2. Agentic Skills Catalog & Discovery Directives
            if any(w in lower for w in ["how many skills", "list skills", "skills catalog", "search skills", "find skill"]):
                if "search" in lower or "find" in lower:
                    q = re.sub(r".*?(?:search|find)\s+skills?\s+(?:for\s+)?", "", lower).strip()
                    matched = self.skill_registry.search_skills(q, limit=5)
                    names = ", ".join([s.name for s in matched]) if matched else "None"
                    speech = f"Identified {len(matched)} specialized engineering skills matching '{q}': {names}, {title}."
                    self.successful_executions += 1
                    return BranchResult(
                        success=True,
                        speech=speech,
                        action_taken="search_skills",
                        data={"query": q, "skills": [s.to_dict() for s in matched]},
                        branch_id=self.branch_id,
                        branch_name=self.branch_name,
                        execution_time_ms=(time.time() - start_time) * 1000
                    )
                else:
                    overview = self.skill_registry.format_speech_overview()
                    self.successful_executions += 1
                    return BranchResult(
                        success=True,
                        speech=overview,
                        action_taken="list_skills",
                        data=self.skill_registry.get_stats(),
                        branch_id=self.branch_id,
                        branch_name=self.branch_name,
                        execution_time_ms=(time.time() - start_time) * 1000
                    )

            # 3. Native File Creation Directive
            n_file = self.task_executor.execute_file_creation(text)
            if n_file and n_file.get("success"):
                speech = f"Synthesized file, {title}: {n_file.get('summary', 'File created')}."
                self.successful_executions += 1
                return BranchResult(
                    success=True,
                    speech=speech,
                    action_taken="create_file",
                    data=n_file,
                    branch_id=self.branch_id,
                    branch_name=self.branch_name,
                    execution_time_ms=(time.time() - start_time) * 1000
                )

            # 4. Native Folder Creation Directive
            n_folder = self.task_executor.execute_folder_creation(text)
            if n_folder and n_folder.get("success"):
                speech = f"Directory scaffolded, {title}: {n_folder.get('summary', 'Folder created')}."
                self.successful_executions += 1
                return BranchResult(
                    success=True,
                    speech=speech,
                    action_taken="create_folder",
                    data=n_folder,
                    branch_id=self.branch_id,
                    branch_name=self.branch_name,
                    execution_time_ms=(time.time() - start_time) * 1000
                )

            # 5. Shell Command Execution
            n_shell = self.task_executor.execute_shell_command(text)
            if n_shell and n_shell.get("success"):
                speech = f"Shell command executed, {title}: {n_shell.get('summary', 'Execution completed')}."
                self.successful_executions += 1
                return BranchResult(
                    success=True,
                    speech=speech,
                    action_taken="shell_execution",
                    data=n_shell,
                    branch_id=self.branch_id,
                    branch_name=self.branch_name,
                    execution_time_ms=(time.time() - start_time) * 1000
                )

            # 6. Hermes Autonomous Coding Pipeline (Deep Agentic Engineering)
            hermes_res = self.hermes.execute_oneshot(text, timeout=30)
            if hermes_res.get("success") and hermes_res.get("output"):
                clean_output = hermes_res["output"][:140].replace("\n", " ").strip()
                speech = f"Engineering task synthesized via Hermes Agent, {title}: {clean_output}."
                self.successful_executions += 1
                return BranchResult(
                    success=True,
                    speech=speech,
                    action_taken="hermes_coding",
                    data=hermes_res,
                    branch_id=self.branch_id,
                    branch_name=self.branch_name,
                    execution_time_ms=(time.time() - start_time) * 1000
                )

            # 7. Fallback Code Advice / Synthesis
            speech = f"Engineering directive received and indexed, {title}. Systems standing by for implementation."
            self.successful_executions += 1
            return BranchResult(
                success=True,
                speech=speech,
                action_taken="engineering_acknowledged",
                data={"directive": text},
                branch_id=self.branch_id,
                branch_name=self.branch_name,
                execution_time_ms=(time.time() - start_time) * 1000
            )

        except Exception as e:
            err_speech = f"Engineering Division encountered an execution fault: {str(e)}, {title}."
            return BranchResult(
                success=False,
                speech=err_speech,
                action_taken="engineering_error",
                data={"error": str(e)},
                branch_id=self.branch_id,
                branch_name=self.branch_name,
                execution_time_ms=(time.time() - start_time) * 1000
            )

    def _audit_python_syntax(self, file_path: Optional[str], raw_text: str) -> Dict[str, Any]:
        """Validates Python syntax via AST parser either from a target file or raw code."""
        if file_path and os.path.exists(file_path):
            try:
                with open(file_path, "r", encoding="utf-8") as f:
                    content = f.read()
                ast.parse(content)
                return {
                    "valid": True,
                    "status": "PASS",
                    "file": file_path,
                    "message": f"Source file '{os.path.basename(file_path)}' parses cleanly with zero AST syntax errors."
                }
            except SyntaxError as syn_err:
                return {
                    "valid": False,
                    "status": "FAIL",
                    "file": file_path,
                    "message": f"Syntax error at line {syn_err.lineno}: {syn_err.msg}"
                }
            except Exception as ex:
                return {"valid": False, "status": "ERROR", "message": str(ex)}

        # Try parsing code block embedded in raw_text
        code_match = re.search(r"```(?:python)?\s*(.+?)\s*```", raw_text, re.DOTALL)
        code_snippet = code_match.group(1) if code_match else raw_text
        try:
            ast.parse(code_snippet)
            return {
                "valid": True,
                "status": "PASS",
                "message": "Supplied code snippet AST verification passed with 100% syntactic conformity."
            }
        except SyntaxError as syn_err:
            return {
                "valid": False,
                "status": "FAIL",
                "message": f"AST SyntaxError on line {syn_err.lineno}: {syn_err.msg}"
            }
        except Exception as ex:
            return {"valid": False, "status": "ERROR", "message": str(ex)}
