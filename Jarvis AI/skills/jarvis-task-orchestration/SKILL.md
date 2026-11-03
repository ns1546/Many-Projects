---
name: jarvis-task-orchestration
description: "Sequential task decomposition, queue execution, and status reporting for J.A.R.V.I.S. and Hermes Agent."
---

# J.A.R.V.I.S. Task Orchestration Skill

This skill enables Hermes Agent to interface directly with J.A.R.V.I.S.'s sequential execution engine, decomposing multi-step goals into verifiable checkpoints.

## Capabilities & Commands

### 1. Register a Task in J.A.R.V.I.S. Queue
```powershell
python -c "from core.task_manager import TaskManager; tm = TaskManager(); print(tm.add_task('Inspect git repository').to_dict())"
```

### 2. Multi-Step Decomposition
When given a complex assignment, break it down using the 15-minute unit rule:
1. Identify immediate preconditions and required tools.
2. Formulate 2 to 4 discrete subtasks.
3. Execute each subtask independently, verifying state after each step.
4. Synthesize final briefing for neural voice synthesis.

### 3. Voice Briefing Formatting
All verbal conclusions must adhere to the Paul Bettany persona:
- Concise (1 to 2 sentences spoken).
- Professional, confident, and polite.
- Address the user as "Sir".
