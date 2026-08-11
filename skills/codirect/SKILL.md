---
name: codirect
description: The "direct" loop — the Director of Product seat. Set the product direction and the design direction at direction level, fix the appetite (the time/effort box), and write a tight pitch an agent can't wander from — pulling risk forward by naming the load-bearing assumptions before any building starts. Product direction = problem framing, appetite, pitch (Shape Up "shaping"). Design direction = design principles, mood, references, brand positioning — the direction of the design, not its execution (tokens/screens/states stay in cospecify/codraw). The doer is codirector. Use upstream, at the strategy stage, for high-blast-radius or ambiguous work where getting the direction wrong is expensive. Maps to Double Diamond "Define" and Shape Up shaping. Optional loop; runs standalone or hands a directed pitch to cochallenge (stress-test), coresearch (evidence), or coplan (decompose). Best on Opus (judgment-heavy). Formerly named coframe.
---

# codirect — direct the product

The doer is **codirector**. This is the optional **direct** loop at the upstream strategy
stage — judgment-heavy, best run on **Opus**. Effort concentrates here: a tight direction and a
fixed appetite are worth more than a fast build downstream. It decides the **direction** (the
problem, and how big a box to spend on it) — distinct from `coplan` (which decides the *work*)
and `cospecify` (which decides the *solution*).

## Scope — direction level only

Two dimensions, one altitude:

- **Product direction** — the real need, who it's for, what's out of scope, the appetite, the
  pitch. Inherited unchanged from Shape Up "shaping".
- **Design direction** — design principles, mood, references, brand positioning. The *direction*
  of the design, never its execution: tokens, screens, states, and data shapes belong to
  `cospecify` / `codraw` / the design-manifest.

## When to Use

- Work is ambiguous, high-blast-radius, or "what should we even build?" is unsettled.
- You need a box around effort before an agent starts — fixed appetite, variable scope.
- The riskiest part is the direction, not the execution.
- The product needs a design direction named before specs and artboards exist.

## How to Use

1. **Recall first** — run `colearn` to pull lessons relevant to this problem space.
2. **Direct the product** — what's the real need, who's it for, what's explicitly out of scope.
3. **Set the appetite** — a fixed time/effort box (e.g. "small batch: 2 days"). Scope flexes
   to fit; the box does not grow.
4. **Name the design direction** (when the work has a visual surface) — principles, mood,
   references, brand position. One paragraph, not a token sheet.
5. **Write the pitch** — tight enough that an agent can't wander: problem, appetite, the shape of
   a solution, rabbit holes to avoid, no-gos. Use `EnterPlanMode` to draft it.
6. **Pull risk forward** — name the load-bearing assumptions and what would make each fail
   (a pre-mortem). Flag the cheapest to test for `coresearch`.

## Native tooling

`EnterPlanMode` (draft and pressure-test the pitch) · **Agent** (delegate exploratory probes) ·
hand the directed pitch to `cochallenge` (stress-test it), `coresearch` (test the risk), or
`coplan` (decompose), and any direction lesson to `colearn`.

## Memory Bank

Save each pitch as `YYYY-MM-DD-kebab-title.md`:
```
.agents/skills/codirect/memory-bank/2026-06-26-onboarding-revamp.md
```
Copy `_template.md`, keep its frontmatter (`title`, `date`, `appetite`, `status`) filled.
`DIRECTION.md` is the auto-generated index — never edit it by hand. After changes:
`node .agents/skills/codirect/index.mjs`.

## Self-eval gate (close the loop)

- **Pitch is tight, appetite set, risks named** → PASS to `cochallenge` (stress-test the
  direction) or `coresearch` (test the risk) or `coplan`.
- **Direction is fuzzy or pitch is wanderable** → re-loop: re-direct.
- **Needs a product/business decision** → escalate to the human.
- **Too big for the appetite** → cut scope to fit the box (fixed appetite); don't grow it.
- **`cochallenge` returns COLLAPSES or HOLED** → this loop re-runs with the hole list; the
  challenger never edits the pitch itself.

## Principles

- Fixed appetite, variable scope: cut to fit the box, default to cancel not extend.
- A pitch an agent can wander from isn't directed yet — name the rabbit holes and no-gos.
- The cheapest bug is the one you named before building — list load-bearing assumptions.
- Direction is judgment, not execution; spend human attention here.
- Direction level only: the moment you're writing tokens or screen states, you're in
  `cospecify`'s seat — stop and hand off.
- Close the loop: feed direction lessons back to `colearn`.
