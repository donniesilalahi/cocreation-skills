---
name: coconsolidate
description: The "DRY consolidation" loop. Find code/logic that is duplicated across the codebase (copy-pasted functions, parallel reimplementations of the same util, forked-and-drifted helpers, repeated config/validation/query/copy blocks), decide whether it SHOULD be unified (Rule of Three + "same reason to change"), then build one customizable master and adopt it at every call site — passing each site's legitimate variance through the master's customization surface instead of a copy. Use when the user says "this is copy-pasted everywhere", "DRY this up", "extract a shared X / build a master component and use it everywhere", "remove the duplication", "why do we have three versions of this", or after a feature sweep to fold clones back into one source of truth. For VISUAL UI-element drift (icon/button sizes, frames, weights differ across screens) use coaudit instead — this skill is its code/logic-level sibling.
---

# DRY Consolidation Skill

The doer is **coconsolidator**. This is a specialized **duplication** loop callable from any stage — not part of the core make → check cycle, but invoked when the same logic exists in many places and should collapse to one customizable source of truth.

## What I Do

Take **one duplication cluster** — a set of code units (functions, components, utils, types, config blocks, queries, validation rules, copy strings) that encode the *same intent* — and:

1. **Scope** the cluster: name the unit and a search signature for it.
2. **Enumerate** every clone across the codebase.
3. **Build a variance matrix**: one row per clone, columns = the axes on which clones differ (inputs, branches, error handling, copy, styling). This separates what is *truly shared* from what *legitimately varies*.
4. **Decide if it SHOULD be DRY'd** — Rule of Three + "same reason to change". Coincidental similarity is left alone (see Guardrails).
5. **Design the master**: shared core + a customization surface (params / options / slots / variants) that covers the legitimate variance from the matrix.
6. **Build** the master in the right shared home.
7. **Adopt + customize**: migrate each site to the master, passing its variance as config; delete the dead local copies.
8. **Verify**: tests/build green, behavior unchanged per site.

This is **not** coaudit. coaudit compares many implementations of one **visual** element to kill pixel-level drift (glyph 18 vs 16). This skill compares many implementations of one **code/logic** unit to kill duplication. Same machinery (enumerate → matrix → canonical → extract → migrate), different domain.

## When to Use

- User says: *"this is copy-pasted everywhere"*, *"DRY this up"*, *"build a master X and use it everywhere"*, *"we have three versions of this — pick one"*.
- After a feature sweep, to fold copy-paste clones back into one source of truth before they drift further.
- When a bug was just fixed in one copy and you suspect the same bug lives in the others.

## The Three Kinds of Duplication

Name the kind before fixing — it determines how aggressive the master's customization surface must be.

| # | Kind | Signature | Right master |
|---|------|-----------|--------------|
| **D1** | **Copy-paste clone** | Identical / near-identical block pasted into N files; no shared abstraction ever existed | Extract verbatim into one function/component (**C1**) |
| **D2** | **Parallel reimplementation** | Same intent written independently N times, each subtly different (different var names, edge handling) — convergent evolution | Reconcile into one correct master, parameterize the real differences (**C2**) |
| **D3** | **Forked-and-drifted** | Was one shared thing, got copied then locally tweaked; now N variants each "customized" by hand | Master + customization surface that re-expresses each fork's tweak as config (**C2/C3**) |

## Workflow

### 1. Scope the cluster
From the user's complaint, name the unit and a grep/structural signature. One cluster at a time.

### 2. Enumerate clones
```bash
grep -rln '<signature>' <src>/          # files
grep -rn  '<signature>' -A8 <src>/      # with body
```
For structural/AST duplication, prefer a tool when present: `npx jscpd <src>` (clone detection) or `ast-grep --pattern '<pattern>'`. Stay language-agnostic; grep is the floor.

### 3. Build the variance matrix
One row per clone. Columns are the axes that differ. The matrix is the whole decision: a column that's the same everywhere → shared core; a column that varies → a parameter/slot on the master (or evidence the clones aren't really the same thing).

```
unit: formatMoney  (signature: function formatMoney / toFixed(2))
file:line                         | rounding | currency | locale  | neg style | notes
----------------------------------|----------|----------|---------|-----------|------
billing/invoice.ts:42             | half-up  | USD hard | en-US   | parens    | ← richest
cart/summary.ts:88                | half-up  | prop     | en-US   | minus     |
admin/payout.ts:11                | trunc    | prop     | varies  | minus     | ← genuinely different rounding
```

### 4. Decide: should this be DRY'd?
Run the **Rule of Three** + **"same reason to change"** test (see Guardrails). If the clones only *look* alike but change for different reasons → **STOP, leave them**, record the decision, done. Premature merge is worse than duplication.

### 5. Design the master
- **Shared core** = the columns identical across all rows.
- **Customization surface** = the columns that legitimately vary, exposed as params / options object / slots / strategy callbacks / variants. The surface must let every existing site reproduce its *current* behavior — no site should silently change.
- Keep the surface minimal: if one rogue row needs a wildly different axis (admin/payout's `trunc`), consider it may not belong in the cluster.

### 6. Build the master (tiers)

| Tier | When | Action |
|------|------|--------|
| **C1 — Extract as-is** | D1: clones are identical | Lift one copy into a shared module; no params needed |
| **C2 — Parameterize** | D2/D3: clones share a core but vary on known axes | Master takes params/options covering the matrix's varying columns |
| **C3 — Compose / layer** | Variance is structural, not just values | Master core + thin per-site adapters/wrappers (slots, render props, hooks) so sites customize composition, not copy |

Put the master in the right shared home (existing util/package/design-system module), not next to one call site.

### 7. Adopt + customize
- Replace each clone with a call to the master, passing that site's row from the matrix as config.
- **Delete** the now-dead local copies — an un-deleted copy re-seeds drift.
- Preserve each site's prior behavior exactly; the customization surface is how the "different places customize it".

### 8. Verify
- Build + run the test suite (compiles, green).
- Confirm each migrated site behaves identically to before (existing tests, or a quick characterization test if none).
- Diff-review the migration: every deleted copy accounted for, no behavior drift.

## Memory-Bank

**Directory**: `.agents/skills/coconsolidate/memory-bank/`
**File naming**: `YYYY-MM-DD-{unit-slug}.md` (date + the unit consolidated).
**Index**: `CONSOLIDATIONS.md` — auto-generated; never edit by hand. Copy `_template.md`, fill its
frontmatter (`title`, `date`, `kind`, `tier`, `status`), then refresh:
`node .agents/skills/coconsolidate/index.js` (or `npm run update-indices`).

### Report Template

```markdown
---
title: {Unit}
date: YYYY-MM-DD
kind: D1
tier: C2
status: open
---

# DRY Consolidation — {Unit}

**Signature**: `{grep/pattern}`
**Clones found**: {N}   **Merged**: {M}   **Left alone**: {N-M}
**Kind**: D1 / D2 / D3
**Master tier**: C1 / C2 / C3

## Variance Matrix
{paste the matrix; mark shared core vs varying axes}

## Decision
{Rule of Three + same-reason-to-change — why this is/ isn't real duplication}

## Master
- Home: `{path}`
- Customization surface: {params/slots/variants}

## Adopt
- [ ] Master built at {path}
- [ ] Migrated {n} sites
- [ ] Dead copies deleted: {file:line …}
- [ ] Build green + tests pass
- [ ] Behavior unchanged per site (verified how)

## Notes
{clones left alone + why, scope handed to coplan, follow-ups}
```

## Guardrails

- **Rule of Three.** Two clones is often fine; wait for the *third* before abstracting. Three real copies = a pattern worth a master.
- **"Same reason to change" is the test, not "looks similar."** DRY is about a single source of truth for one piece of *knowledge*. If two blocks would change for *different* reasons (billing rounding vs analytics rounding that just happen to match today), they are **coincidental duplication** — merging couples them and you'll fight the abstraction later. Leave them; record why.
- **Prefer the wrong duplication over the wrong abstraction.** A premature master with a `boolean`/`mode` flag tangle is a tax on every future change. If the customization surface starts sprouting flags that fork the body (`if (variant === 'admin')`), that's a smell the cluster isn't one thing.
- **Never leave a copy behind.** A surviving clone re-seeds the drift you just paid to remove.
- **Preserve behavior, prove it.** The master must reproduce each site's current behavior. Land a characterization test before migrating if coverage is thin.
- **Scope approval for wide migrations.** Touching many files = get sign-off or hand the migration plan to coplan; don't silently refactor dozens of call sites.

## Self-eval gate (close the loop)

- **Clones folded into one master, every site migrated + copies deleted, build/tests green, behavior unchanged** → PASS forward to coverify to confirm the affected surfaces still work.
- **Matrix shows the clones aren't really the same thing (coincidental)** → record the decision, leave them, done — that *is* a pass.
- **Master would need flag-soup to fit every site** → re-loop: re-cluster (maybe it's two masters), bounded retries, then cancel and report the matrix rather than forcing a bad abstraction.
- **A wide migration exceeds approved scope** → escalate to the human; hand the plan to coplan.
- **A clone turns out to hide a bug the others don't** → cross-loop to codebug before consolidating.
- **Same duplication pattern recurs across clusters** → write a lesson via colearn (it may graduate into a lint rule / guardrail).

## Relationship to Other Skills

- **coaudit** — the visual sibling. coaudit kills pixel-level drift in UI elements (its R2/T3 already extract+migrate a visual master component); this skill kills code/logic duplication. If a duplication cluster is purely a SwiftUI element diverging by size/weight, route to coaudit.
- **cobuild** — builds the master component/module once its shape is decided.
- **coverify** — confirms migrated sites behave as before.
- **coplan** — receives the migration plan when full adoption is out of immediate scope.
- **colearn** — recurring duplication shapes graduate into guardrails (lint rules, codegen).
