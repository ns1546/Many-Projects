# The Complete Antigravity Capabilities Manual
*An exhaustive, all-time reference guide to every single Agent, Skill, Plugin, and Slash Command available in your environment across all domains (Web, Mobile, AI, Science, and Orchestration).*

---

## 1. Slash Commands & Core System
*Built-in commands to trigger specific execution modes and customize Antigravity.*

- **/plan**: Forces the agent to write a comprehensive, multi-phase markdown blueprint before writing any code.
- **/goal**: Unleashes autonomous loop capabilities. The agent will run background tasks and keep running indefinitely until the goal is 100% achieved.
- **/schedule**: Runs an instruction on a recurring schedule (cron) or sets a one-time background timer.
- **/learn**: Persists a custom behavior or rule for all future tasks.
- **/grill-me**: Initiates an interactive interview to resolve ambiguous design decisions.
- **`agy-customizations`**: Comprehensive guide for creating your own skills, rules, hooks, and MCP servers.
- **`antigravity-guide`**: Comprehensive guide for AGY, the CLI, and IDE keybindings.
- **`skill-creator`**: Skill for creating, modifying, and evaluating custom skills.
- **`workflow-skill-creator`**: Distills a completed user workflow into a reusable, permanent skill.

---

## 2. Orchestration & Engineering (Antigravity PowerPack)
*Enterprise-grade orchestration for complex, multi-agent engineering projects.*

### Orchestration Skills:
- **`dev-team`**: Simulates a collaborative session with a PM, Architect, Developer, and QA.
- **`team-builder`**: Interactive picker to dispatch up to 5 specialist agents in parallel on one task.
- **`team-agent-orchestration`**: Coordinates multiple agents in parallel across branches or worktrees (Kanban style).
- **`claude-devfleet`**: Orchestrate multi-agent coding tasks, dispatch parallel agents in isolated worktrees.
- **`blueprint`**: Turns a one-line objective into a step-by-step construction plan.
- **`parallel-execution-optimizer`**: Speeds up tasks by splitting them into a dependency graph of parallel agent lanes.
- **`orch-add-feature` / `orch-fix-defect` / `orch-refine-code` / `orch-pipeline`**: End-to-end pipelines that automatically handle Research -> Plan -> TDD -> Review -> Commit.
- **`agent-self-evaluation`**: Self-rates output on 5 axes (accuracy, completeness, clarity, actionability, conciseness).
- **`agentic-engineering`**: Operate as an agentic engineer using eval-first execution and cost-aware routing.
- **`ai-first-engineering`**: Process and review gates for codebases largely written by AI agents.
- **`ai-regression-testing`**: Regression testing strategies specifically for AI-assisted development.
- **`benchmark-optimization-loop`**: Bounded optimization loop for latency/throughput benchmarking.
- **`autonomous-loops`**: Architectures for autonomous DAG systems.
- **`codebase-onboarding`**: Generates architecture maps and onboarding guides for unfamiliar codebases.
- **`architecture-decision-records`**: Captures architectural decisions as numbered ADR markdown files.
- **`api-design`**: REST API design patterns (status codes, pagination, versioning).

### Specialist Subagents:
- **`architect`**: Software architecture specialist for system design.
- **`code-architect`**: Designs feature architectures based on existing codebase patterns.
- **`code-explorer`**: Deeply analyzes codebase features by tracing execution paths.
- **`code-reviewer`**: Expert code review specialist for quality and security.
- **`security-reviewer`**: Vulnerability detection specialist (OWASP, SSRF, injection).
- **`silent-failure-hunter`**: Reviews code for swallowed errors and bad fallbacks.
- **`performance-optimizer`**: Identifies bottlenecks, memory leaks, and render issues.
- **`e2e-runner`**: End-to-end testing specialist managing test journeys.
- **`refactor-cleaner`**: Dead code cleanup and consolidation specialist.
- **`spec-miner`**: Extracts behavioral specs from existing codebases for OpenSpec.
- **`marketing-agent`**: Copywriter for campaign planning, audience research, and content calendars.
- **`chief-of-staff`**: Personal communication chief of staff for triaging emails/Slack.
- **`agent-evaluator`**: Evaluates agent output against a 5-axis quality rubric.
- **`planner`**: Expert planning specialist for complex features.

---

## 3. UI/UX, Design, & "Taste" 
*Elite visual intelligence skills for high-end frontend designs and branding.*

### Taste Skills (Anti-Slop Design):
- **`design-taste-frontend` (v1 & v2)**: Anti-slop frontend skill for shipping interfaces that do not look templated.
- **`high-end-visual-design`**: Teaches the AI to design like a premium agency (blocks generic defaults).
- **`cinematic-frontend-designer`**: Builds professional, 3D cinematic websites using GSAP.
- **`stitch-design-taste`**: Semantic Design System Skill for Google Stitch.
- **`gpt-taste`**: Elite UX/UI & GSAP Motion Engineer for massive section spacing and strict grids.
- **`industrial-brutalist-ui`**: Raw mechanical interfaces (Swiss print with military terminal aesthetics).
- **`minimalist-ui`**: Clean editorial-style interfaces (monochrome palettes, flat grids).
- **`imagegen-frontend-web` / `imagegen-frontend-mobile`**: Generates premium, conversion-aware website/app design concepts as image references.
- **`image-to-code`**: Elite image-to-code skill that deeply analyzes designs before implementation.
- **`redesign-existing-projects`**: Audits existing designs and upgrades to premium quality without breaking functionality.
- **`full-output-enforcement`**: Enforces complete code generation and bans placeholder patterns.
- **`brandkit`**: Premium brand-kit image generation for logo systems and identity decks.

### UI/UX Pro Max Skills:
- **`ui-ux-pro-max`**: Comprehensive UI/UX intelligence (192 product palettes, 119 UX guidelines).
- **`ui-styling`**: Accessible interfaces using shadcn/ui and Tailwind CSS.
- **`design-system`**: Token architecture (primitive -> semantic -> component) and component specs.
- **`design`**: Comprehensive identity design (logo generation, HTML presentations, icons).
- **`brand`**: Brand voice, visual identity, and messaging frameworks.
- **`banner-design`**: Designs banners for social media, ads, and web heroes in 22 styles.
- **`slides`**: Creates strategic HTML presentations with Chart.js.

---

## 4. Flutter, Dart, & Mobile Development
*Framework-specific tooling and automation for Mobile App Engineering.*

### Dart Skills:
- **`dart-add-unit-test`**: Write and organize unit tests.
- **`dart-build-cli-app`**: Entrypoint structure and cross-platform scripts.
- **`dart-collect-coverage`**: Collect coverage and create LCOV reports.
- **`dart-fix-runtime-errors`**: Locates failing lines via stack trace and applies fixes.
- **`dart-generate-test-mocks`**: Generate mock objects for external dependencies.
- **`dart-migrate-to-checks-package`**: Migrate from `matcher` to `checks` package.
- **`dart-resolve-package-conflicts`**: Workflow for fixing `pub get` version conflicts.
- **`dart-run-static-analysis`**: Identify warnings and resolve mechanical lint issues.
- **`dart-setup-ffi-assets`**: Compile and package C/C++ source into Native Assets.
- **`dart-use-ffigen`**: Automatically generate FFI bindings.
- **`dart-use-pattern-matching`**: Implement switch expressions and pattern matching.
- **`dart-use-primary-constructors`**: Migrate to new constructor syntax.
- **`dart-write-documentation`**: Enforce Effective Dart documentation guidelines.

### Flutter Skills:
- **`flutter-add-integration-test`**: Configure Flutter Driver for E2E testing.
- **`flutter-add-widget-preview`**: Add interactive widget previews.
- **`flutter-add-widget-test`**: Implement component-level tests.
- **`flutter-apply-architecture-best-practices`**: Architect layered approaches (UI, Logic, Data).
- **`flutter-build-responsive-layout`**: Create adaptable layouts (MediaQuery, LayoutBuilder).
- **`flutter-fix-layout-issues`**: Fix RenderFlex overflows and unbounded constraints.
- **`flutter-implement-json-serialization`**: Map JSON to models.
- **`flutter-setup-declarative-routing`**: Configure `go_router` for advanced navigation.
- **`flutter-setup-localization`**: Initialize global localization support.
- **`flutter-use-http-package`**: REST API integrations.
- **`android-cli`**: Manage Android SDKs and virtual devices.

### Subagents:
- **`flutter_a11y_agent`**: Subagent dedicated entirely to reviewing Flutter code for accessibility.

---

## 5. AI, API, & SEO Integrations
*Skills for modern Web platforms and Large Language Models.*

- **`gemini-api-dev`**: Best practices for integrating the Gemini API (multimodal, function calling).
- **`gemini-live-api-dev`**: Blueprints for building real-time WebSocket streaming apps (Voice Activity Detection).
- **`gemini-omni-flash-api`**: Generative video editing and text-to-video processing.
- **`claude-opus-4-5-migration`**: Safely migrates prompts and code to Opus 4.5.
- **`ns-technical-seo`**: Automatically audits and implements Technical SEO best practices.

---

## 6. Science, Biology, & Bioinformatics (Science Plugin)
*Specialized research tools for genomics, chemistry, and literature.*

- **AlphaGenome Suite**: `alphagenome-atlas-website-links`, `alphagenome-single-variant-analysis`, `alphagenome-variant-impact-score`
- **Protein & Structures**: `alphafold-database-fetch-and-analyze`, `foldseek-structural-search`, `pdb-database`, `pymol`, `human-protein-atlas-database`, `interpro-database`, `uniprot-database`
- **Genetics & Sequence**: `ensembl-database`, `dbsnp-database`, `clinvar-database`, `gnomad-database`, `ncbi-sequence-fetch`, `protein-sequence-msa`, `protein-sequence-similarity-search`
- **Chemistry & Drugs**: `chembl-database`, `pubchem-database`, `openfda-database`, `clinical-trials-database`, `opentargets-database`
- **Pathways & Ontologies**: `reactome-database`, `quickgo-database`, `embl-ebi-ols`
- **Regulatory Genomics**: `encode-ccres-database`, `jaspar-database`, `unibind-database`, `ucsc-conservation-and-tfbs`, `gtex-database`, `string-database`
- **Academic Literature**: `pubmed-database`, `literature-search-arxiv`, `literature-search-biorxiv`, `literature-search-europepmc`, `literature-search-openalex`
- **History**: `predictingthepast` (Ancient text restoration via Aeneas/Ithaca)
- **Utilities**: `credentials`, `science-skills-common`, `uv`
