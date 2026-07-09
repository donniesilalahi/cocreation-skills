---
name: codesign
description: The "design" loop. Design the solution — UI/UX, interfaces, data shape — and hand a clear, buildable spec to cobuild so the build leg doesn't have to invent decisions mid-stream. The doer is codesigner. Use at the design stage once the problem is framed and the plan is set, whenever the solution's shape (screens, contracts, schemas) needs deciding before implementation. Optional loop; runs standalone or feeds cobuild. Best on Sonnet (structured design work).
---

# codesign — design the solution

The doer is **codesigner**. This is the optional **design** loop at the design stage — structured
work, best run on **Sonnet**. Decide the solution's shape so `cobuild` builds against a spec, not
a guess.

## When to Use

- The problem is framed and planned, but the *solution's* shape isn't decided yet.
- You need UI/UX, an interface/contract, or a data shape pinned down before building.
- Ambiguity in the design would force the builder to make product decisions mid-build.

## How to Use

1. **Recall first** — run `colearn` to pull design lessons and existing patterns/conventions.
2. **Design the shape** — screens/flows (UI/UX), interfaces and contracts, data model.
3. **Pull from design sources** — if a **Figma** or **Open Design** MCP is present, read existing
   components, tokens, and screens so the design stays consistent with the system.
4. **Write a buildable spec** — explicit enough that `cobuild` needn't invent decisions:
   states, edge cases, acceptance criteria, the data/interface contract.
5. **Check against conventions** — flag drift from existing patterns for `coaudit`.

## Native tooling

**Figma** / **Open Design** MCP tools (read components, tokens, screens — *if present*) ·
`EnterPlanMode` (rough the design) · **Agent** (parallel design probes) · hand the spec to
`cobuild`, drift to `coaudit`, and reusable patterns to `colearn`.

## Memory Bank

Save each design as `YYYY-MM-DD-kebab-title.md`:
```
.agents/skills/codesign/memory-bank/2026-06-26-settings-screen.md
```
Copy `_template.md`, keep its frontmatter (`title`, `date`, `status`) filled.
`DESIGN.md` is the auto-generated index — never edit it by hand. After changes:
`node .agents/skills/codesign/index.mjs`.

## Self-eval gate (close the loop)

- **Spec is clear and buildable** → PASS to `cobuild`.
- **Design drifts from existing conventions** → cross-loop to `coaudit`.
- **Spec is ambiguous or won't hold together** → re-loop: redesign.
- **Needs a product/UX judgment call** → escalate to the human.

## Principles

- A spec `cobuild` can build without asking questions is the deliverable — pin the edge cases.
- Reuse the design system; consistency beats novelty.
- Decide states and contracts up front; don't leave decisions for the build leg.
- Design is judgment work — spend attention here so the fast build lands right.
- Close the loop: feed reusable patterns to `colearn`.
