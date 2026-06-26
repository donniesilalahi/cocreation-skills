---
name: cobuild
description: The "make" leg of the core loop. Implement against the coplan plan in small, reviewable increments, handing each increment to coverify before moving on — because build is where work COLLAPSES fast, so small increments keep it reviewable and recoverable. The doer is cobuilder. Use whenever there's a plan or spec to turn into working code/output. Mandatory leg of a full cycle; runs standalone too. Pairs with coverify (check) and jumps to codebug on failure. Best on Sonnet (structured build).
---

# cobuild — build the work

The doer is **cobuilder**. This is the mandatory **make** leg of the core
make → check → learn engine — structured build, best run on **Sonnet**. Build is where the work
**collapses** (fast), so the discipline is small increments, each handed straight to `coverify`.

## When to Use

- There's a `coplan` plan or `codesign` spec to turn into working code/output.
- You're implementing a feature, refactor, or fix — the actual making.
- Any time you'd otherwise "just build it": do it in reviewable increments.

## How to Use

1. **Recall first** — run `colearn` to pull lessons/guardrails relevant to this build.
2. **Pull the plan** — work against the `coplan` record (and `codesign` spec, if any).
3. **Build one small increment** — the smallest reviewable slice that does something verifiable.
4. **Hand it to `coverify`** — don't stack the next increment on an unverified one.
5. **On verify failure, jump to `codebug`** — diagnose root cause, then resume. Mark the plan.

## Native tooling

`TaskUpdate` (tick off plan items as they land) · `/loop` (self-paced passes over a long build) ·
**Agent** (parallelize independent increments) · hand each increment to `coverify`, failures to
`codebug`, and recurring lessons to `colearn`.

## Memory Bank

Save each build as `YYYY-MM-DD-kebab-title.md`:
```
.agents/skills/cobuild/memory-bank/2026-06-26-add-oauth-login.md
```
Copy `_template.md`, keep its frontmatter (`title`, `date`, `status`, optional `plan`) filled —
`plan:` cross-references the `coplan` record it builds against.
`BUILD.md` is the auto-generated index — never edit it by hand. After changes:
`node .agents/skills/cobuild/index.js`.

## Self-eval gate (close the loop)

- **Increment built and self-checks pass** → PASS to `coverify`.
- **It doesn't work / verify fails** → jump to `codebug`, then re-loop.
- **Blocked on a decision or missing input** → escalate to the human.
- **Scope creeping past the appetite** → cut to the appetite; don't grow the box.

## Principles

- Small, reviewable increments — review capacity is the constraint, not build capacity.
- Never stack on an unverified increment; check before continuing.
- Build collapses fast — that's why the increments must stay small enough to recover from.
- Build is execution, not judgment; route judgment calls to the human.
- Close the loop: feed recurring bug-classes to `colearn` so they graduate into guardrails.
