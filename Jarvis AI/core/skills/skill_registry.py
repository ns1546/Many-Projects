"""
J.A.R.V.I.S. Universal Skill Registry & Knowledge Index
Indexes, categorizes, and provides sub-millisecond search across hundreds of
local agent skills, tools, workflows, and prompts.
"""

import os
import re
from typing import Dict, List, Optional, Any, Set
from dataclasses import dataclass, field

CATEGORY_KEYWORDS = {
    "Frontend & UI/UX Design": [
        "ui", "ux", "css", "html", "design", "tailwind", "react", "vue", "frontend",
        "gsap", "animation", "component", "styling", "taste", "banner", "brand",
        "minimalist", "brutalist", "visual", "mockup", "slides", "typography"
    ],
    "DevOps & Cloud Infrastructure": [
        "docker", "kubernetes", "k8s", "deploy", "deployment", "ci", "cd", "cloud",
        "aws", "gcp", "azure", "terraform", "canary", "nginx", "server", "linux",
        "container", "monitoring", "grafana", "pipeline", "sysadmin"
    ],
    "Engineering & Architecture": [
        "backend", "api", "fastapi", "django", "nestjs", "postgres", "mysql", "database",
        "prisma", "rest", "architecture", "refactor", "codebase", "pattern", "python",
        "node", "typescript", "golang", "rust", "c++", "dart", "flutter", "schema"
    ],
    "Testing, QA & Reliability": [
        "test", "testing", "regression", "qa", "debug", "debugging", "benchmark",
        "coverage", "e2e", "playwright", "mock", "lint", "verification", "audit",
        "silent-failure", "defect", "error"
    ],
    "Autonomous Agents & Loops": [
        "agent", "agentic", "orchestrat", "orch", "fleet", "hermes", "blueprint",
        "dev-team", "subagent", "autonomous", "loop", "eval", "kanban", "worktree"
    ],
    "AI, ML & Prompt Systems": [
        "llm", "gemini", "claude", "gpt", "prompt", "model", "fine-tuning", "rag",
        "embedding", "token", "multimodal", "live-api", "ai-first", "evaluator"
    ],
    "Biomedical & Life Sciences": [
        "alphafold", "protein", "genom", "variant", "dna", "rna", "chembl", "pdb",
        "pubmed", "uniprot", "clinvar", "ncbi", "sequence", "drug", "bio", "blast",
        "biomedical", "ontology", "openfda", "reactome"
    ],
    "Research & Productivity": [
        "arxiv", "literature", "search", "notion", "obsidian", "pdf", "docx", "xlsx",
        "email", "inbox", "meeting", "planning", "triage", "wiki", "summary", "citation"
    ],
    "System & Hardware Control": [
        "windows", "pc", "os", "desktop", "process", "volume", "vitals", "cpu", "ram",
        "screen", "vision", "screenshot", "gui", "cua", "powershell", "shell", "sentinel"
    ],
    "Human Assistant & Executive Lifestyle": [
        "assistant", "personal", "calendar", "schedule", "scheduling", "finance", "expense",
        "budget", "travel", "flight", "itinerary", "health", "wellness", "routine", "crm",
        "relationship", "briefing", "debrief", "focus", "pomodoro", "distraction",
        "decision", "meeting", "action", "emergency", "crisis", "lifestyle", "habit",
        "nutrition", "etiquette", "executive", "family", "recovery"
    ]
}

@dataclass
class Skill:
    name: str
    description: str
    category: str
    tags: List[str] = field(default_factory=list)
    path: str = ""
    markdown_path: str = ""
    summary: str = ""

    def to_dict(self) -> Dict[str, Any]:
        return {
            "name": self.name,
            "description": self.description,
            "category": self.category,
            "tags": self.tags,
            "path": self.path,
            "markdown_path": self.markdown_path,
            "summary": self.summary
        }

class SkillRegistry:
    DEFAULT_SKILL_ROOTS = [
        os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "skills")),
        os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".agents", "skills")),
        os.path.expanduser(r"~\AppData\Local\hermes\hermes-agent\skills"),
        os.path.expanduser(r"~\AppData\Local\hermes\hermes-agent\optional-skills"),
        os.path.expanduser(r"~\AppData\Local\hermes\hermes-agent\plugins"),
        os.path.expanduser(r"~\\.gemini\config\skills"),
        os.path.expanduser(r"~\\.gemini\config\plugins"),
    ]

    def __init__(self, root_skills_dir: Optional[str] = None, scan_all_roots: bool = True):
        if root_skills_dir:
            self.root_dir = os.path.abspath(root_skills_dir)
            self.root_dirs = [self.root_dir]
        else:
            self.root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "skills"))
            self.root_dirs = [self.root_dir]
            if scan_all_roots:
                for r in self.DEFAULT_SKILL_ROOTS:
                    if r not in self.root_dirs and os.path.exists(r):
                        self.root_dirs.append(r)
            
        self.skills: Dict[str, Skill] = {}
        self.categories: Dict[str, List[str]] = {}
        self._inverted_index: Dict[str, Set[str]] = {}
        self._slug_map: Dict[str, str] = {}
        self.load_all_skills()

    def _infer_category(self, name: str, description: str, tags: List[str]) -> str:
        combined = f"{name} {description} {' '.join(tags)}".lower()
        words = set(re.findall(r"[a-z0-9_\-]+", combined))
        
        best_cat = "General Engineering & Utilities"
        max_score = 0
        
        for cat, keywords in CATEGORY_KEYWORDS.items():
            score = 0
            for kw in keywords:
                if len(kw) <= 3:
                    if kw in words:
                        score += 2
                else:
                    if kw in combined:
                        score += 1
            if score > max_score:
                max_score = score
                best_cat = cat
                
        return best_cat

    def load_all_skills(self) -> int:
        """Discovers and parses every skill package across all configured directories recursively."""
        self.skills.clear()
        self.categories.clear()
        self._inverted_index.clear()
        self._slug_map.clear()
        
        discovered_paths: Set[str] = set()

        for base_dir in self.root_dirs:
            if not os.path.exists(base_dir):
                continue

            for dirpath, dirnames, filenames in os.walk(base_dir):
                skill_md = None
                for fn in filenames:
                    if fn.lower() == "skill.md":
                        skill_md = os.path.join(dirpath, fn)
                        break

                if not skill_md and dirpath != base_dir and not dirnames:
                    md_files = [f for f in filenames if f.lower().endswith(".md")]
                    if md_files:
                        skill_md = os.path.join(dirpath, md_files[0])

                if not skill_md:
                    continue

                norm_skill_path = os.path.normpath(skill_md).lower()
                if norm_skill_path in discovered_paths:
                    continue
                discovered_paths.add(norm_skill_path)

                entry_dir = dirpath
                name = os.path.basename(dirpath)
                description = ""
                tags: List[str] = []

                try:
                    with open(skill_md, "r", encoding="utf-8", errors="ignore") as f:
                        content = f.read()

                    # Parse frontmatter if present
                    if content.startswith("---"):
                        parts = content.split("---", 2)
                        if len(parts) >= 3:
                            frontmatter = parts[1]
                            for line in frontmatter.splitlines():
                                line_s = line.strip()
                                if line_s.startswith("name:"):
                                    name_val = line_s.split("name:", 1)[1].strip().strip('"\'')
                                    if name_val:
                                        name = name_val
                                elif line_s.startswith("description:"):
                                    desc_val = line_s.split("description:", 1)[1].strip().strip('"\'')
                                    if desc_val:
                                        description = desc_val
                                elif line_s.startswith("tags:") or line_s.startswith("keywords:"):
                                    tag_val = line_s.split(":", 1)[1].strip().strip("[]")
                                    tags.extend([t.strip().strip('"\'') for t in tag_val.split(",") if t.strip()])
                                    
                            body = parts[2].strip()
                        else:
                            body = content
                    else:
                        body = content

                    if not description:
                        lines = [l.strip() for l in body.splitlines() if l.strip()]
                        non_header_lines = [l for l in lines if not l.startswith("#")]
                        if non_header_lines:
                            description = non_header_lines[0]
                        else:
                            description = f"Specialized skill package for {name}."

                    category = self._infer_category(name, description, tags)
                    
                    clean_desc = re.sub(r"\[.*?\]\(.*?\)", "", description)
                    clean_desc = re.sub(r"[`#*]", "", clean_desc).strip()
                    summary = clean_desc[:160] + "..." if len(clean_desc) > 160 else clean_desc

                    skill = Skill(
                        name=name,
                        description=clean_desc,
                        category=category,
                        tags=tags,
                        path=entry_dir,
                        markdown_path=skill_md,
                        summary=summary
                    )
                    
                    self.skills[name] = skill
                    self._slug_map[name.lower()] = name
                    self._slug_map[os.path.basename(dirpath).lower()] = name
                    
                    if category not in self.categories:
                        self.categories[category] = []
                    if name not in self.categories[category]:
                        self.categories[category].append(name)
                    
                    tokens = re.findall(r"[a-z0-9_\-]+", f"{name} {clean_desc} {' '.join(tags)}".lower())
                    for tok in set(tokens):
                        if len(tok) >= 2:
                            if tok not in self._inverted_index:
                                self._inverted_index[tok] = set()
                            self._inverted_index[tok].add(name)

                except Exception:
                    continue

        return len(self.skills)

    def get_skill(self, name: str) -> Optional[Skill]:
        """Fetches a skill by exact or normalized name, slug, or title."""
        norm = name.strip().lower()
        if norm in self.skills:
            return self.skills[norm]
        if norm in self._slug_map:
            return self.skills.get(self._slug_map[norm])
            
        norm_space = norm.replace("-", " ")
        norm_hyphen = norm.replace(" ", "-")
        for s_name, s_obj in self.skills.items():
            s_lower = s_name.lower()
            if s_lower == norm or s_lower == norm_space or s_lower.replace("-", " ") == norm_space or s_lower.replace(" ", "-") == norm_hyphen:
                return s_obj
        return None

    def get_skill_instructions(self, name: str) -> Optional[str]:
        """Reads full markdown instructions for the given skill."""
        skill = self.get_skill(name)
        if not skill or not skill.markdown_path or not os.path.exists(skill.markdown_path):
            return None
        try:
            with open(skill.markdown_path, "r", encoding="utf-8", errors="ignore") as f:
                return f.read()
        except Exception:
            return None

    def search_skills(self, query: str, limit: int = 5) -> List[Skill]:
        """
        Fast token-overlap and fuzzy relevance search across all skills.
        Returns top matching skills sorted by relevance score.
        """
        q_tokens = re.findall(r"[a-z0-9_\-]+", query.lower())
        if not q_tokens:
            return list(self.skills.values())[:limit]

        scores: Dict[str, float] = {}

        for tok in q_tokens:
            # Direct token match in inverted index
            matched_names = self._inverted_index.get(tok, set())
            for name in matched_names:
                scores[name] = scores.get(name, 0.0) + 3.0
                
            # Bonus if token matches skill name directly
            for name in self.skills:
                if tok in name.lower():
                    scores[name] = scores.get(name, 0.0) + 5.0
                if name.lower() in query.lower():
                    scores[name] = scores.get(name, 0.0) + 10.0

        ranked = sorted(scores.items(), key=lambda x: x[1], reverse=True)
        results = []
        for name, _ in ranked[:limit]:
            if name in self.skills:
                results.append(self.skills[name])

        return results

    def get_categories(self) -> Dict[str, int]:
        """Returns categories mapped to total skill count."""
        return {cat: len(skills) for cat, skills in sorted(self.categories.items(), key=lambda x: len(x[1]), reverse=True)}

    def get_stats(self) -> Dict[str, Any]:
        """Returns comprehensive catalog diagnostics."""
        return {
            "total_skills": len(self.skills),
            "total_categories": len(self.categories),
            "root_directory": self.root_dir,
            "categories": self.get_categories(),
            "sample_skills": [s.name for s in list(self.skills.values())[:10]]
        }

    def create_or_synthesize_skill(
        self,
        name: str,
        description: str,
        category: Optional[str] = None,
        instructions: str = "",
        tags: Optional[List[str]] = None
    ) -> Skill:
        """
        Dynamically creates and registers a new procedural skill package on the fly,
        persisting it permanently to the project skills repository.
        """
        clean_name = re.sub(r"[^a-zA-Z0-9_\-]+", "-", name.strip().lower()).strip("-")
        target_dir = os.path.join(self.root_dir, clean_name)
        os.makedirs(target_dir, exist_ok=True)
        skill_md = os.path.join(target_dir, "SKILL.md")
        
        tags_list = tags or []
        cat = category or self._infer_category(clean_name, description, tags_list)
        
        content = (
            f"---\n"
            f"name: {clean_name}\n"
            f"description: \"{description}\"\n"
            f"tags: [{', '.join(tags_list)}]\n"
            f"---\n\n"
            f"# {name}\n\n"
            f"{description}\n\n"
            f"## Instructions\n"
            f"{instructions or 'Execute according to J.A.R.V.I.S. standard operational protocols.'}\n"
        )
        
        with open(skill_md, "w", encoding="utf-8") as f:
            f.write(content)
            
        skill = Skill(
            name=clean_name,
            description=description,
            category=cat,
            tags=tags_list,
            path=target_dir,
            markdown_path=skill_md,
            summary=description[:160]
        )
        self.skills[clean_name] = skill
        self._slug_map[clean_name] = clean_name
        if cat not in self.categories:
            self.categories[cat] = []
        if clean_name not in self.categories[cat]:
            self.categories[cat].append(clean_name)
            
        tokens = re.findall(r"[a-z0-9_\-]+", f"{clean_name} {description} {' '.join(tags_list)}".lower())
        for tok in set(tokens):
            if len(tok) >= 2:
                if tok not in self._inverted_index:
                    self._inverted_index[tok] = set()
                self._inverted_index[tok].add(clean_name)
                
        return skill

    def bridge_lifegraph(self, life_graph: Optional[Any] = None) -> int:
        """
        Connects the 5,900+ node Cognitive LifeGraph into the skill search space,
        making all daily routines, health protocols, financial sentinel actions,
        and automation tools discoverable and executable as skills.
        """
        if life_graph is None:
            try:
                from core.lifegraph.daily_life_nodes import build_daily_life_graph
                life_graph = build_daily_life_graph()
            except Exception:
                return 0
                
        bridged_count = 0
        for node_id, node in life_graph.nodes.items():
            s_name = f"lifegraph-{node.label.lower().replace(' ', '-')}"
            if s_name in self.skills:
                continue
            cat = node.category or "Daily Life & Executive Lifestyle"
            desc = node.description or f"Cognitive {node.node_type.value} capability for {node.label}."
            summary = desc[:160] + "..." if len(desc) > 160 else desc
            
            s = Skill(
                name=s_name,
                description=desc,
                category=cat,
                tags=node.keywords + [node.node_type.value.lower()],
                path="",
                markdown_path="",
                summary=summary
            )
            self.skills[s_name] = s
            self._slug_map[node.label.lower()] = s_name
            self._slug_map[node_id.lower()] = s_name
            
            if cat not in self.categories:
                self.categories[cat] = []
            self.categories[cat].append(s_name)
            
            tokens = re.findall(r"[a-z0-9_\-]+", f"{node.label} {desc} {' '.join(node.keywords)}".lower())
            for tok in set(tokens):
                if len(tok) >= 2:
                    if tok not in self._inverted_index:
                        self._inverted_index[tok] = set()
                    self._inverted_index[tok].add(s_name)
            bridged_count += 1
            
        return bridged_count

    def format_speech_overview(self) -> str:
        """Formats a natural, articulate verbal summary for J.A.R.V.I.S."""
        total = len(self.skills)
        cat_count = len(self.categories)
        top_cats = list(self.get_categories().keys())[:3]
        top_str = ", ".join(top_cats)
        return (
            f"I currently have {total} active skills indexed across {cat_count} operational domains, Sir, "
            f"including {top_str}, backed by over 5,900 cognitive action nodes and on-demand dynamic synthesis."
        )
