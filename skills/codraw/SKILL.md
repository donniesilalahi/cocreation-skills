---
name: codraw
description: The design→artboard render loop (the "draw" step). Takes a cospecify spec + a design-system SSOT and renders a faithful, state-by-state Open Design (OD) artboard set — plus a git-tracked JSON ledger cross-referencing every artboard to code, and three canvases (gallery, primitives library, data-driven sitemap). Encodes the invariant method: design-system SSOT first, reuse primitives (never redraw), a strict segmented naming convention with a controlled STATE vocabulary, draw-the-DEFAULT-never-silently-pick on open decisions, new-primitive reconciliation, and a browser-render verify. Use when a buildable spec exists and you need the OD artboards + ledger that cotranslate ports from and cotest QAs against. Project facts (SSOT paths, state vocab, canvas sizes, OD project id, ledger path) live in a design-manifest.json, not this skill. Graceful-degrades to HTML/CSS artboards on disk when the OD MCP is absent. codraw renders — it does not invent the design system or build/QA it. The doer is codrawer.
---

# codraw — render a spec into faithful OD artboards (the draw step)

The doer is **codrawer** (Sonnet). This is the **render/draw** step of the co-creation pipeline:

```
cospecify(spec) → codraw(OD artboards + ledger + canvases) → { cotranslate, cobuild } → cotest / coconsolidate
```

`cospecify` writes the buildable *spec*; `codraw` renders it into a high-fidelity, state-by-state
**OD artboard set + ledger + canvases**. Its output is the input `cotranslate` ports from and `cotest`
QAs against. **codraw renders — it never invents the design system (that's `cospecify`) nor builds/QAs
it (`cobuild`/`cotest`).**

This skill ships only the **invariant method**. Every project-specific fact — the design-system SSOT
path, primitives doc, screen-inventory / hand-off source, state vocab, canvas sizes, OD project id,
ledger path — lives in a **`design-manifest.json`** the consumer keeps in `.agents/workspace/` (see
`references/design-manifest.md`). Load it first.

## 0. Bootstrap — the design-manifest (before anything)

If `.agents/workspace/design-manifest.json` does not exist, **do not improvise project facts.** Draft
it, then get owner confirmation (cotranslate's Step-0 pattern):

1. Locate the design-system SSOT (tokens/materials/motion + the primitives doc) and the screen
   inventory / hand-off specs.
2. Fill the manifest schema (`references/design-manifest.md`) — including the naming-convention
   template + state vocab — and hand it to the owner to confirm.

**Require the SSOT before proceeding.** codraw renders an existing design system; if none exists,
that is `cospecify`'s job, not codraw's (invariant #1). A confirmed/human-authored manifest is a
`raw/` input; an AI-drafted one is AI-owned until confirmed.

## The invariant method (10 steps)

**1. Design-system SSOT first.** Tokens + materials + motion + the base primitives live in one
source of truth (the manifest's `designSystem`). **Never invent styling — pull from here.** Fidelity
to those tokens/materials is non-negotiable.

**2. Reuse the primitives library.** The static component library (HTML/CSS, or the primitives doc)
is the visual reference for how each primitive looks. **Reuse it; never redraw a primitive from
scratch** — a redrawn primitive is drift at the source.

**3. Per-artboard hand-off anatomy.** Each artboard-state is one repeatable unit: **screen · regions
· primitives-used · copy · states-to-draw · section-flow · new-primitives.** This is the build list;
render one artifact per artboard-state. (Anatomy detail: `references/naming-and-ledger.md`.)

**4. Strict naming convention + controlled STATE vocab.** Every artifact + ledger entry follows a
**segmented, self-describing** name ending in a **state** drawn from a fixed vocabulary — so every
artboard is greppable and "empty/loading/error/success" never drift. The segment schema and the
vocab live in the manifest; **state-last + closed-vocab is the invariant.** If a hand-off bundles
several states, split into one artifact per state. (Rules: `references/naming-and-ledger.md`.)

**5. Git-tracked JSON ledger in the CODE repo.** Maintain the ledger (the manifest's `ledgerPath`)
**in the code repo, not the OD workspace.** It cross-references artboard ↔ code —
`id`/`handoffRef`/`odArtifact`/`primitives`/`status`/`flow`/`codeRef`/`route`/`codeStatus`. **This is
the durable seam** later code chats, `cotranslate`, and `cotest` read from. Keep it valid JSON; never
delete entries (mark `status`); update `updated` on every write.

**6. Three canvases.** Produce (unless the manifest opts one out): **gallery** (all artboards),
**primitives** (the component library), **sitemap** (the user-flow diagram, **data-driven** from a
blocks/data file). The data-driven sitemap is where the render-verify guardrails below bite hardest.

**7. Decision-review — draw the DEFAULT, never silently pick.** For each open design decision, **draw
the DEFAULT the spec specifies**, flag it in the ledger `notes`, and **list them back to the owner
for a call.** Never silently resolve. A decision that needs engineering/legal input is logged as
**blocked** in `notes` explicitly — do not resolve it yourself.

**8. New-primitive reconciliation.** When a screen needs an element with no name in the canonical
taxonomy, name it **provisionally and say so** (ledger `notes` / the report) — never freeze an ad-hoc
name as canonical mid-build. A canonical primitive list always lags real screen needs across
parallel milestones; flag the gap for a later reconciliation pass, don't decide it silently.

**9. Browser-render verify.** A data-driven canvas or interactive artifact is **not verified by
source review.** Actually render it and check **console + network** — source review is structurally
blind to `position:fixed` overlays that cover content, categorical-token lookup maps that crash at
render, and data values that 404 only when consumed. **Hand visual/interaction acceptance to
`cotest`** (doer `cotester`) — codraw does the render-and-look smoke check, cotest owns the
gate. Don't re-implement cotest here.

**10. Code-parity pass.** Keep `route`/`codeRef`/`codeStatus` current so the ledger stays the **live
design↔code map**, not a stale snapshot — `existing` / `partial` / `new` per artboard. This is what
makes the ledger useful to `cotranslate`/`cobuild` months later.

## Graceful degrade — no OD MCP

If the Open Design MCP is present, drive it (`list_projects` → reuse/`create_project` → `create_artifact`
/`write_file` per artboard-state). **If it is absent, write HTML/CSS artboards to disk** under the
manifest's artboard path instead — same naming, same ledger, same canvases. The method is
tool-agnostic; only the render target changes (house style, matching appstore-prep's screenshot loop).

## Role & scope

- codraw reports **`drawn` or `blocked`.** It renders + ledgers + smoke-checks; it does not invent
  the design system, port to code, or own the QA gate.
- **Cross-loop, don't restate:** translation to native code → `cotranslate`; visual/interaction acceptance
  → `cotest`; element drift across screens → `coconsolidate`. Keep only codraw's own acceptance criteria.
- Do **not** edit the design-system SSOT / primitives library (read-only references) or app code.

## Memory bank

**Directory:** `.agents/skills/codraw/memory-bank/` · **Records:** `YYYY-MM-DD-{screen-set-slug}.md`
(copy `_template.md`; frontmatter `title`/`date`/`states`/`status`). **Index:** `DRAW.md` —
auto-generated; never hand-edit. After a record: `node .agents/skills/codraw/index.mjs` (or
`npm run update-indices`). A record may link its `raw/` spec input and the ledger it produced.

## Self-eval gate (close the loop)

- **Every artboard-state rendered from the SSOT primitives, named to convention, ledgered, canvases
  render clean (console + network checked), decisions defaulted + flagged, status `drawn`** → PASS
  forward to `cotranslate`/`cobuild` (they consume the ledger) and `cotest` (acceptance).
- **A screen can't be rendered faithfully from the SSOT, or a needed primitive doesn't exist** →
  re-loop (bounded); flag the new primitive (step 8), don't invent styling.
- **An open decision needs an owner/eng/legal call** → draw the default, log it blocked, escalate.
- **Render surfaced a real defect** → `codebug`. **Duplication across canvases** → `coconsolidate`.
- **Backprop:** every render-verify catch hands a lesson to `colearn`.

## References

- `references/design-manifest.md` — manifest schema + a worked example (lifts the proven ledger).
- `references/naming-and-ledger.md` — the naming convention, state vocab, hand-off anatomy, and
  ledger rules, generalized.
- `references/gotchas.md` — the render-verify guardrails + cross-project traps.
