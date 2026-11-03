---
name: meeting-synthesis-action-delegation
description: "High-speed meeting transcription synthesis, decision logging, SMART action item extraction, owner assignment, and automated post-meeting follow-up dispatches."
category: "Human Assistant & Productivity"
tags: ["meetings", "transcription", "action-items", "minutes", "delegation", "follow-up", "accountability", "productivity"]
---

# Meeting Synthesis & Action Delegation Skill

This skill transforms raw meeting discussions, voice notes, or interview transcripts into crisp executive action summaries, ensuring zero dropped commitments or vague accountability.

## Extraction Directives

When processing meeting content or audio transcripts:
1. **Executive Abstract**: 2-3 sentences summarizing the strategic core of the conversation.
2. **Key Decisions Agreed**: Irrevocable conclusions reached during the call.
3. **SMART Action Matrix**:
   - **Specific**: Exact deliverable defined.
   - **Measurable**: Clear completion criterion.
   - **Assignable**: Named owner (individual or team).
   - **Realistic**: Feasible scope.
   - **Time-bound**: Explicit calendar deadline.

## Standard Synthesis Template

```markdown
### 📋 Executive Meeting Summary: [Title / Topic]
- **Date & Attendees**: [Date] | [Participant Names]
- **Primary Objective**: [Goal of Session]

#### 🎯 Key Strategic Decisions
1. [Decision 1]
2. [Decision 2]

#### ⚡ Action Item Accountability Table
| Task / Commitment | Owner | Deadline | Priority | Status |
| :--- | :--- | :---: | :---: | :---: |
| Draft API specification | Sarah | Oct 18 | High | Pending |
| Finalize cloud budget | David | Oct 20 | Medium | Pending |
| Conduct safety review | User | Oct 22 | Urgent | In-Progress |

#### ✉️ Draft Follow-Up Broadcast
"Team, thank you for today's productive discussion. Attached is our aligned action matrix. Please confirm ownership of your deliverables by EOD tomorrow. Best regards, [User]"
```
