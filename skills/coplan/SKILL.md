---
name: coplan
description: The "plan" loop. Break a non-trivial task into clear, tracked, verifiable steps before building, and adapt the plan as work reveals new information. Use when starting any feature, refactor, or bug fix that isn't a one-liner. Mandatory leg of a full cycle; runs standalone too. Pairs with cochangelog (the plan and its changelog cross-reference each other).
---

# coplan — plan the work

The doer is **coplanner**. This is the mandatory **plan** loop that feeds the core
make → check → learn engine. Turn a vague goal into concrete, verifiable steps.

## When to Use

- Starting a feature, refactor, or bug fix that's more than a one-liner.
- The task feels too large or ambiguous, or spans multiple files/systems.
- You want a tracked list so nothing is forgotten.

## How to Use

1. **Recall first** — run `colearn` to pull any lessons relevant to this task.
2. **Understand** the goal and constraints. For high-blast-radius work, shape it with
   `EnterPlanMode` / `coshape` before decomposing.
3. **Decompose** into small, actionable items (each completable in ~2 hours).
4. **Track** with `TaskCreate` / `TaskUpdate` so progress is visible live.
5. **Prioritize** by dependency and impact; **execute** one item at a time.
6. **Update** the plan as you learn; **review** at completion.

## Native tooling

`EnterPlanMode` (shape the approach) · `TaskCreate` / `TaskUpdate` (track todos) · `/loop`
(self-paced passes on a long plan) · hand the built result to `coverify`, and a recurring lesson
to `colearn`.

## Memory Bank

Save each plan as `YYYY-MM-DD-kebab-title.md`:
```
.agents/skills/coplan/memory-bank/2026-06-26-fix-login-bug.md
```
Copy `_template.md`, keep its frontmatter (`title`, `date`, `status`, optional `changelog`) filled.
`PLAN.md` is the auto-generated index — never edit it by hand. After changes:
`node .agents/skills/coplan/index.js`.

## Pairing with a changelog (cross-reference)

When the planned work ships, `cochangelog` records it. Link the two both ways: the plan's
frontmatter gets `changelog: <changelog-record.md>`, the changelog's gets `plan: <this-record.md>`.
`/cocreator` wires this automatically when running coplan → core loop → cochangelog.

## Todo Format

```markdown
---
title: Task name
date: YYYY-MM-DD
status: todo
changelog:
---

# Plan: [Task Name]

- **Goal**: [What are we trying to achieve?]
- **Constraints**: [Time, tech, or business limits]
- **Todos**:
  - [ ] Step 1
  - [ ] Step 2
- **Completed**:
  - [x] Step 0
- **Blockers**: [Anything preventing progress]
- **Notes**: [Observations as work progresses]
```

## Self-eval gate (close the loop)

- **All todos done, output verified** → PASS to `cochangelog` (and link it).
- **New info breaks the plan** → re-loop: revise and keep going.
- **Blocked / needs a decision** → escalate to the human.
- **Scope ballooning** → cut scope to fit the appetite; don't grow the box (default: cancel,
  not extend).

## Principles

- Each todo completable in under 2 hours.
- Update the plan live — don't wait until the end.
- Mark blockers immediately.
- Close the loop: review what went well and what didn't, and feed lessons to `colearn`.
