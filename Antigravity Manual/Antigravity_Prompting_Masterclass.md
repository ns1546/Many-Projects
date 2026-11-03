# Antigravity Masterclass: Unlocking Full Enterprise Potential
*A comprehensive guide to commanding Antigravity as an autonomous engineering department.*

---

## 1. The Core Philosophy
Antigravity is not a standard "chatbot"—it is a multi-agent engineering platform. To get world-class results, you must change how you speak to it:
* **Stop Asking, Start Commanding:** Do not ask it to "try" or "maybe write a script." Issue direct, deterministic commands.
* **Never Accept Placeholders:** AI models naturally truncate code. You must explicitly forbid placeholders (e.g., `// rest of code`).
* **Deploy Teams, Not Individuals:** Instead of writing code directly, command Antigravity to act as an Architect to plan, a Developer to write, and a QA Engineer to test.

---

## 2. The Power of Slash Commands
Always begin complex tasks by forcing Antigravity into a specific execution state using slash commands:

* **`/plan`**: Use this when you are starting a massive feature. It forces the AI to stop, load architectural skills, and write a multi-phase markdown blueprint. You must approve the blueprint before it writes code.
* **`/goal`**: Use this when you want the AI to run autonomously in the background. It will execute code, read errors, fix them, and keep going until the objective is 100% complete.
* **`/learn`**: Use this to inject permanent global rules. (e.g., `/learn Always write unit tests for every new function`).

---

## 3. The Anatomy of a Perfect Enterprise Prompt
A world-class prompt for Antigravity contains four elements:
1. **The State:** A slash command (`/plan` or `/goal`).
2. **The Persona/Skill:** Explicitly invoking specific plugins or skills.
3. **The Anti-Slop Constraint:** Forbidding generic design or truncated code.
4. **The Review Gate:** Demanding a security or QA review before completion.

---

## 4. Copy-Paste Master Templates

### Template A: Building a Massive New Feature
*Use this when adding a completely new system to an existing codebase.*

> **`/plan`** Build the **[Name of Feature]** system. 
> 1. Act as the **`dev-team`** to architect the folder structure and data flow first. 
> 2. Use the **[Backend Skill, e.g., django-tdd]** skill to execute the logic.
> 3. You must write 100% production-ready code. Do NOT use any placeholders, stubs, or comments saying 'logic goes here'. Implement every file completely.
> 4. Once built, simulate the **`code-reviewer`** and **`security-reviewer`** personas to hunt for silent failures and edge cases before presenting the result.

### Template B: High-End UI/UX Design & Frontend
*Use this when you want an interface to look like a premium agency built it, not a generic AI template.*

> Redesign the **[Page Name]**. 
> 1. Use the **`ui-ux-pro-max`** and **`design-taste-frontend`** skills. 
> 2. I want a premium, high-end aesthetic. Use modern typography, calibrated spacing, and sophisticated micro-animations. 
> 3. Completely ban all generic AI UI slop (no standard blue buttons, no basic bootstrap-looking cards). 
> 4. Generate the exact CSS and HTML structure with full output enforcement.

### Template C: Complex Bug Hunting & Debugging
*Use this when your app is crashing or acting unexpectedly.*

> **`/goal`** Resolve the bug occurring in **[File or Feature]**.
> 1. Act as the **`performance-optimizer`** and **`silent-failure-hunter`**.
> 2. Trace the execution path to find where the data is corrupting or silently failing.
> 3. If you need to write console logs or run tests in the background to find it, do so autonomously. 
> 4. Fix the root cause, do not just patch the symptom.

### Template D: The Security & DevOps Audit
*Use this before launching a product to the internet.*

> Audit my current codebase for production readiness.
> 1. Run the **`production-audit`** and **`security-reviewer`** checks across the environment.
> 2. Check my database queries, local storage usage, and API keys for vulnerabilities.
> 3. Output a markdown checklist of what needs to be fixed before we go live.

---

## 5. Orchestration Pipelines (Advanced)
If you want Antigravity to literally manage itself, invoke the **Pipelines**. 

When you type: *"Trigger the `orch-add-feature` pipeline to build X"*, Antigravity will automatically:
1. Spin up a **Research Agent** to read your current files.
2. Spin up a **Planning Agent** to write a blueprint.
3. Wait for your approval.
4. Spin up a **TDD Developer Agent** to write tests, then write the code to pass them.
5. Spin up a **Code Review Agent** to audit the final code.

By utilizing these templates and commanding specific skills, you transition from "getting code snippets" to "managing a world-class software team."
