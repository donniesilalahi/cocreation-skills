---
name: planning-todos
description: Break down complex tasks into clear, actionable steps and track progress. Use this skill when starting any non-trivial task to maintain focus and ensure completeness.
---

# Planning Todos

## Purpose

Transform vague goals into a structured plan with concrete, verifiable steps. Track progress and adapt the plan as work reveals new information.

## When to Use

- Starting a new feature, refactor, or bug fix
- A task feels too large or ambiguous
- You need to coordinate work across multiple files or systems
- You want to ensure nothing is forgotten

## How to Use

1. **Understand** the goal and constraints
2. **Decompose** the work into small, actionable items
3. **Prioritize** by dependency and impact
4. **Execute** items one at a time
5. **Update** the plan as you learn more
6. **Review** at completion for lessons learned

## Memory Bank

Document plans in:
```
.agents/skills/planning-todos/memory-bank/PLAN.md
```

Use the `_template.md` for consistent formatting.

## Todo Format

```markdown
## Plan: [Task Name]

- **Goal**: [What are we trying to achieve?]
- **Constraints**: [Time, tech, or business limits]
- **Todos**:
  - [ ] Step 1
  - [ ] Step 2
  - [ ] Step 3
- **Completed**:
  - [x] Step 0
- **Blockers**: [Anything preventing progress]
- **Notes**: [Observations as work progresses]
```

## Principles

- Each todo should be completable in under 2 hours
- Update the plan live—don't wait until the end
- Mark blockers immediately so they can be addressed
- Close the loop: review what went well and what didn't
