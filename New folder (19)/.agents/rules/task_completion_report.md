# Rule: Task Completion Reporting

## Description
The user has requested a persistent behavior: Every time a task is completed, you MUST provide a final report detailing all the agents, skills, plugins, and other tools that were utilized to solve the task.

## Instructions
- ALWAYS include a "Resource Usage Report" at the end of your final response when a task is fully resolved.
- List the specific subagents invoked (e.g., e2e-runner, code-reviewer).
- List the specific skills referenced or used (e.g., ui-styling, postgres-patterns, blueprint).
- List the specific plugins utilized.
- List the tools used (e.g., write_to_file, run_command).
- Do not skip this step under any circumstances.
