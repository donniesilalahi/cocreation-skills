---
name: cospecify
description: The "spec" loop. Author the buildable solution spec — screens, states, data shapes, interfaces, and the design-system decisions — and hand it to codraw (to render as artboards) and cobuild (to implement), so neither has to invent decisions mid-stream. The doer is cospecifier. Maps to the day-to-day PRD / functional spec / design doc; it decides the SOLUTION (distinct from coframe deciding the problem, and coplan deciding the work). It does NOT draw the pixels (that's codraw) or write the code (cobuild). Use at the design stage once the problem is framed and the plan is set, whenever the solution's shape needs pinning down before implementation. Optional loop; runs standalone or feeds codraw/cobuild. Best on Sonnet (structured design work).
---

# cospecify — write the buildable spec

The doer is **cospecifier**. This is the optional **spec** loop at the design stage — structured
work, best run on **Sonnet**. Decide the solution's shape so `codraw` renders against a spec and
`cobuild` builds against a spec, not a guess.

**What it owns vs. its neighbours:** cospecify decides the **solution** — the buildable spec
(a PRD / functional spec / design doc): screens, states, data shapes, interface contracts, and the
design-system decisions. It does **not** decide the *problem* (`coframe`), the *work* (`coplan`),
the *pixels* (`codraw` renders the spec into artboards), or the *code* (`cobuild`). Spec → draw →
build is the natural pairing (like a design doc → mockups → implementation).

## When to Use

- The problem is framed and planned, but the *solution's* shape isn't decided yet.
- You need screens/flows, an interface/contract, or a data shape pinned down before building.
- Ambiguity in the spec would force the builder to make product decisions mid-build.

## How to Use

1. **Recall first** — run `colearn` to pull design-system lessons and existing patterns/conventions.
2. **Specify the solution** — screens/flows, states and edge cases, interfaces and contracts, the
   data model. Decide the design-system primitives the solution composes from.
3. **Pull from design sources** — if a **Figma** or **Open Design** MCP is present, read existing
   components, tokens, and screens so the spec stays consistent with the system.
4. **Write a buildable spec** — explicit enough that `codraw`/`cobuild` needn't invent decisions:
   states, edge cases, acceptance criteria, the data/interface contract, the primitives used.
5. **Check against conventions** — flag drift from existing patterns for `coaudit`; flag any new
   primitive the taxonomy lacks for reconciliation (don't freeze an ad-hoc name silently).

## Native tooling

**Figma** / **Open Design** MCP tools (read components, tokens, screens — *if present*) ·
`EnterPlanMode` (rough the spec) · **Agent** (parallel design probes) · hand the spec to `codraw`
(render artboards) and `cobuild` (implement), drift to `coaudit`, and reusable patterns to `colearn`.

## Memory Bank

Save each spec as `YYYY-MM-DD-kebab-title.md`:
```
.agents/skills/cospecify/memory-bank/2026-06-26-settings-screen.md
```
Copy `_template.md`, keep its frontmatter (`title`, `date`, `status`) filled.
`SPEC.md` is the auto-generated index — never edit it by hand. After changes:
`node .agents/skills/cospecify/index.mjs`.

## Self-eval gate (close the loop)

- **Spec is clear and buildable** → PASS to `codraw` (render the artboards) and/or `cobuild` (build).
- **Spec drifts from existing conventions** → cross-loop to `coaudit`.
- **Spec is ambiguous or won't hold together** → re-loop: re-specify.
- **Needs a product/UX judgment call** → escalate to the human.

## Principles

- A spec `codraw`/`cobuild` can act on without asking questions is the deliverable — pin the edge cases.
- Reuse the design system; consistency beats novelty. Flag new primitives, don't silently coin them.
- Decide states and contracts up front; don't leave decisions for the render/build legs.
- Specifying is judgment work — spend attention here so the fast build lands right.
- Close the loop: feed reusable patterns to `colearn`.
