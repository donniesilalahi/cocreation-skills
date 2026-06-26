---
name: coshape
description: The "shape" loop. Frame the problem, set a fixed appetite (the time/effort box), and write a tight pitch an agent can't wander from — pulling risk forward by naming the load-bearing assumptions before any building starts. The doer is coshaper. Use upstream, at the strategy/shaping stage, for high-blast-radius or ambiguous work where getting the framing wrong is expensive. Optional loop; runs standalone or hands a shaped pitch to coresearch or coplan. Best on Opus (judgment-heavy).
---

# coshape — shape the work

The doer is **coshaper**. This is the optional **shape** loop at the upstream strategy
stage — judgment-heavy, best run on **Opus**. Effort concentrates here: a tight frame and a
fixed appetite are worth more than a fast build downstream.

## When to Use

- Work is ambiguous, high-blast-radius, or "what should we even build?" is unsettled.
- You need a box around effort before an agent starts — fixed appetite, variable scope.
- The riskiest part is the framing, not the execution.

## How to Use

1. **Recall first** — run `colearn` to pull lessons relevant to this problem space.
2. **Frame the problem** — what's the real need, who's it for, what's explicitly out of scope.
3. **Set the appetite** — a fixed time/effort box (e.g. "small batch: 2 days"). Scope flexes
   to fit; the box does not grow.
4. **Write the pitch** — tight enough that an agent can't wander: problem, appetite, the shape of
   a solution, rabbit holes to avoid, no-gos. Use `EnterPlanMode` to draft it.
5. **Pull risk forward** — name the load-bearing assumptions and what would make each fail
   (a pre-mortem). Flag the cheapest to test for `coresearch`.

## Native tooling

`EnterPlanMode` (draft and pressure-test the pitch) · **Agent** (delegate exploratory probes) ·
hand the shaped pitch to `coresearch` (test the risk) or `coplan` (decompose), and any framing
lesson to `colearn`.

## Memory Bank

Save each pitch as `YYYY-MM-DD-kebab-title.md`:
```
.agents/skills/coshape/memory-bank/2026-06-26-onboarding-revamp.md
```
Copy `_template.md`, keep its frontmatter (`title`, `date`, `appetite`, `status`) filled.
`SHAPE.md` is the auto-generated index — never edit it by hand. After changes:
`node .agents/skills/coshape/index.js`.

## Self-eval gate (close the loop)

- **Pitch is tight, appetite set, risks named** → PASS to `coresearch` (test the risk) or `coplan`.
- **Frame is fuzzy or pitch is wanderable** → re-loop: reshape.
- **Needs a product/business decision** → escalate to the human.
- **Too big for the appetite** → cut scope to fit the box (fixed appetite); don't grow it.

## Principles

- Fixed appetite, variable scope: cut to fit the box, default to cancel not extend.
- A pitch an agent can wander from isn't shaped yet — name the rabbit holes and no-gos.
- The cheapest bug is the one you named before building — list load-bearing assumptions.
- Shape is judgment, not execution; spend human attention here.
- Close the loop: feed framing lessons back to `colearn`.
