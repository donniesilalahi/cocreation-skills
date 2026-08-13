---
name: coconsolidate
description: The "one master, many call sites" loop, in TWO lenses. LOGIC — kill code duplication (copy-pasted functions, parallel reimplementations, forked-and-drifted helpers, repeated config/validation blocks). VISUAL — kill UI drift (a back button at glyph 18 on one screen and 16 on another; pills, fields and icon buttons that should look identical but don't). Same machinery both ways: enumerate every site, build a variance matrix, find the canonical, decide whether it SHOULD be unified (Rule of Three + "same reason to change"), then build one customizable master and adopt it everywhere, passing legitimate variance through its customization surface instead of a copy. Use for "this is copy-pasted everywhere", "DRY this up", "why do we have three versions of this", "this looks bolder/bigger here than there", "make X consistent across the app", or a post-sweep pass to fold clones back before they drift further. Absorbs the former coaudit skill. The doer is coconsolidator.
---

# coconsolidate — one master, many call sites

The doer is **coconsolidator**. This is a specialized **horizontal** loop, callable from any stage:
it compares many implementations of one thing **against each other**. Not part of the core
make → check cycle — invoked when the same thing exists in many places and should collapse to one
customizable source of truth.

**Two lenses, one machinery.** The loop is identical either way; only the unit and the matrix
columns change.

| Lens | Unit | Matrix columns | Typical trigger |
|---|---|---|---|
| **Logic** | function, component, util, type, config block, query, validation rule, copy string | inputs, branches, error handling, defaults | *"this is copy-pasted everywhere"* |
| **Visual** | element-class — a set of UI elements meant to look and behave identically (back button, icon button, search field, status pill, primary button) | glyph size, weight, frame, fg/bg opacity, stroke, radius, spacing | *"this looks bolder here than there"* |

**The line vs siblings — all three compare different things:**

- `cotest` compares impl **vs the spec/artboard** (vertical conformance).
- `cotranslate` produces impl **from** a design source (vertical translation).
- **`coconsolidate` compares impl vs impl** (horizontal). It is the only one that asks
  "do these N things agree with each other?"

And `cocritique` asks whether the thing is worth having at all — consistency is not correctness.
A perfectly consistent element can be consistently wrong.

## What I Do

Take **one cluster** — a set of implementations that encode the *same intent* — and:

1. **Scope** the cluster: name the unit and a search signature for it.
2. **Enumerate** every site across the codebase.
3. **Build a variance matrix**: one row per site, columns = the axes on which sites differ. This
   separates what is *truly shared* from what *legitimately varies*.
4. **Find the canonical** — the majority/richest row, unless an authority says otherwise (§Canonical).
5. **Decide if it SHOULD be unified** — Rule of Three + "same reason to change". Coincidental
   similarity is left alone (see Guardrails).
6. **Diagnose the cause** (D1–D5) — it determines the fix tier.
7. **Design the master**: shared core + a customization surface (params / options / slots / variants
   / tokens) covering the legitimate variance from the matrix.
8. **Build** the master in the right shared home.
9. **Adopt + customize**: migrate each site, passing its variance as config; delete the dead copies.
10. **Verify**: build/tests green, behavior unchanged per site; for the visual lens, re-capture the
    affected screens and eyeball them side by side.

## When to Use

- **Logic:** *"this is copy-pasted everywhere"*, *"DRY this up"*, *"build a master X and use it
  everywhere"*, *"we have three versions of this — pick one"*, or a bug was just fixed in one copy
  and you suspect it lives in the others.
- **Visual:** *"this is bolder/bigger here than there"*, *"why isn't the back icon the same size as
  share/delete"*, *"these should look the same"*, *"make X consistent app-wide"*, *"create a master
  component for X"*.
- After a feature sweep, to fold copy-paste clones back into one source of truth before they spread.

## The five causes

Name the cause before fixing — it determines the fix tier. D1–D3 apply to both lenses; **D4 is
mostly a visual-lens cause** (a design spec that permits a range) and **D5 is the "we already built
the master and nobody used it" cause**, which happens in both.

| # | Cause | Signature | Fix tier |
|---|---|---|---|
| **D1** | **Copy-paste clone** | Identical / near-identical block pasted into N sites; no shared abstraction ever existed | **C1** extract as-is |
| **D2** | **Parallel reimplementation** | Same intent written independently N times, each subtly different — convergent evolution | **C2** reconcile + parameterize |
| **D3** | **Forked-and-drifted** | Was one shared thing, got copied then locally tweaked; now N variants each hand-"customized" | **C2/C3** master + customization surface |
| **D4** | **Loose spec** | The spec/token gives a **range or options** (`size: 15–16`, `frame: 32–36`), so every site legally picks a different point — the drift is *spec-compliant* | **C0** tighten the spec to ONE value, then C1–C4 to conform |
| **D5** | **Bypassed master** | An exact token/master already exists, but sites hardcode their own value around it (often: a master was built and never adopted) | **C4** surgical adopt at the deviant sites |

Causes combine. D4 + D2 is the classic visual pair: the spec allows a range *and* there is no shared
component, so every screen invents its own legal variant.

## Fix tiers

| Tier | When | Action |
|---|---|---|
| **C0 — Tighten the spec** | D4: the spec's range is the enabler | Collapse the range to ONE exact value in the design/spec source, record the decision, then conform code via C1–C4. **Fixing code first just re-creates the drift.** |
| **C1 — Extract as-is** | D1: sites are identical | Lift one copy into a shared module; no params needed |
| **C2 — Parameterize** | D2/D3: sites share a core but vary on known axes | Master takes params/options covering the matrix's varying columns |
| **C3 — Compose / layer** | Variance is structural, not just values | Master core + thin per-site adapters (slots, render props, wrappers) so sites customize composition, not copy |
| **C4 — Surgical adopt** | D5, or a handful of clear outliers against a settled canonical | Edit each deviant site to use the existing master/token. No API change. Crystal-clear ⇒ just do it. |

**Default posture on the visual lens:** C4 the obvious outliers now, so the improvement is
immediately visible, **and** propose the C2/C3 master extraction as the durable fix. Run the
extraction inline only with scope approval (it touches many files); otherwise hand the migration
plan to `coplan`.

## Workflow

### 1. Scope the cluster
From the user's complaint, name the unit and a grep/structural signature. **One cluster at a time.**
For the visual lens, the unit is an *element-class* and the signature is usually the icon/glyph name
or the shape helper (`chevron.left`, `clipShape(Circle())`, `StatusPill`).

### 2. Enumerate sites
```bash
grep -rln '<signature>' <src>/          # files
grep -rn  '<signature>' -A8 <src>/      # with the property block / body
```
For structural duplication, prefer a tool when present: `npx jscpd <src>` (clone detection) or
`ast-grep --pattern '<pattern>'`. Stay language-agnostic; grep is the floor.

> **LSP caveat.** `findReferences` / `workspaceSymbol` fail *silently* without an index — an empty
> result is indistinguishable from a missing index, and reads as "no master exists" right before you
> fork a duplicate. `grep` stays authoritative for existence. `documentSymbol` is always safe and is
> the fastest way to dump a master's full customization surface.

### 3. Build the variance matrix
One row per site. Columns are the axes that differ. **The matrix is the whole decision:** a column
identical everywhere → shared core; a column that varies → a parameter on the master (or evidence
the sites aren't really the same thing).

Logic lens:
```
unit: formatMoney  (signature: function formatMoney / toFixed(2))
file:line                         | rounding | currency | locale  | neg style | notes
----------------------------------|----------|----------|---------|-----------|------
billing/invoice.ts:42             | half-up  | USD hard | en-US   | parens    | ← richest
cart/summary.ts:88                | half-up  | prop     | en-US   | minus     |
admin/payout.ts:11                | trunc    | prop     | varies  | minus     | ← genuinely different
```

Visual lens:
```
element-class: dark back button  (signature: chevron.left)
file:line                         | glyph | weight   | frame | fg op | bg op | stroke
----------------------------------|-------|----------|-------|-------|-------|--------
Calendar/EventDetailView:566      | 18    | semibold | 36    | .75   | .08   | none    ← majority
Goals/GoalDetailView:256          | 16    | semibold | 36    | .75   | .08   | none    ← OUTLIER glyph
Goals/GoalDetailView:669          | 16    | semibold | 36    | .75   | .08   | none    ← OUTLIER glyph
```

### 4. Find the canonical
The **mode** (most common value per column) is the de-facto canonical — **unless an authority says
otherwise.** Authority order for the visual lens: **design source (artboard/spec) > the design
system's token > the code's majority**. If unsure what the canonical *should* be, read the design
source before declaring a value; don't let a popular mistake become the standard.

Count outliers vs total: few outliers → C4 surgical. Many → extraction + migration.

### 5. Decide: should this be unified?
Run the **Rule of Three** + **"same reason to change"** test (see Guardrails). If the sites only
*look* alike but change for different reasons → **STOP, leave them**, record the decision, done.
Premature merge is worse than duplication. A lone visual deviation may also be *intentional* (a
different context) — confirm before "fixing".

### 6. Diagnose the cause (D1–D5)
- Does the spec give a **range or options**? → **D4**. Fix the spec first (C0).
- Does an exact token/master exist that the site ignores? → **D5** (C4).
- No shared thing and copy-pasted? → **D1/D2/D3** (C1–C3).

### 7. Design the master
- **Shared core** = the columns identical across all rows.
- **Customization surface** = the columns that legitimately vary, exposed as params / options /
  slots / strategy callbacks / variants. The surface must let every existing site reproduce its
  *current* behavior — no site should silently change.
- **Missing knobs are the tell.** If a site needs a variant the master can't express, **extend the
  master's surface** — never fork a second view.
- Keep the surface minimal. If one rogue row needs a wildly different axis, it may not belong.
- **Adopt an existing orphan before inventing a new master.** A master built once and never adopted
  (D5) is common; adding a second one gives you two orphans.

### 8. Build the master
Put it in the right shared home (the existing util package / design-system module), not next to one
call site.

### 9. Adopt + customize
- Replace each site with a call to the master, passing that site's row from the matrix as config.
- **Delete** the now-dead local copies — a surviving copy re-seeds the drift you just paid to remove.
- Keep edits format-preserving (match the surrounding style per file).

### 10. Verify
- Build + run the test suite (compiles, green).
- Confirm each migrated site behaves identically to before (existing tests, or a quick
  characterization test if coverage is thin).
- **Visual lens:** re-run captures for the **affected screens only** — never the full suite (disk +
  time) — and eyeball the outlier against the canonical side by side.
- Diff-review the migration: every deleted copy accounted for, no behavior drift.

## Element registry (visual lens)

Keep the project's element-classes and their canonical specs in the **memory bank**, not in this
skill — they are project facts. A registry row looks like:

| Element-class | Signature (grep) | Canonical (source + value) | Drift seen | Master |
|---|---|---|---|---|
| Dark back button | `chevron.left` | DESIGN §7.2 — glyph 18 / semibold / frame 36 / fg .75 / bg .08 / no stroke | glyph 14–20, frame 32–36 | `WLBackButton` (to extract) |

Extend it as classes are consolidated; the registry is how the next sweep starts from knowledge
instead of grep.

## Memory-Bank

> **Storage:** Resolve `workspaceRoot` from `.agents/workspace/cocreation.yaml` (default `.agents`).
> In `local`, write the full record to `<workspaceRoot>/skills/<name>/memory-bank/` and refresh its
> index. In `linear-primary`, write the human-facing artifact through the active backend and keep
> provider metadata, links, and the local navigation/index cache; never write project records into
> the plugin cache.


**Directory**: `.agents/skills/coconsolidate/memory-bank/`
**File naming**: `YYYY-MM-DD-{unit-slug}.md` (date + the unit consolidated).
**Index**: `CONSOLIDATIONS.md` — auto-generated; never edit by hand. Copy `_template.md`, fill its
frontmatter (`title`, `date`, `lens`, `cause`, `tier`, `status`), then refresh:
`node .agents/skills/coconsolidate/index.mjs` (or `npm run update-indices`).

### Report Template

```markdown
---
title: {Unit or element-class}
date: YYYY-MM-DD
lens: logic
cause: D1
tier: C2
status: open
---

# Consolidation — {Unit}

**Lens**: logic | visual
**Signature**: `{grep/pattern}`
**Sites found**: {N}   **Merged/conformed**: {M}   **Left alone**: {N-M}
**Cause**: D1 / D2 / D3 / D4 / D5 (+combos)
**Fix tier**: C0 / C1 / C2 / C3 / C4

## Variance Matrix
{paste the matrix; mark the canonical row and every outlier cell}

## Canonical
{value + which authority settled it: design source / token / code majority}

## Decision
{Rule of Three + same-reason-to-change — why this is / isn't real duplication}

## Master
- Home: `{path}`
- Customization surface: {params/slots/variants/tokens}

## Adopt
- [ ] C0: spec collapsed to {exact values}
- [ ] Master built at {path}
- [ ] Migrated {n} sites
- [ ] Dead copies deleted: {file:line …}
- [ ] Build green + tests pass
- [ ] Behavior unchanged per site (verified how)
- [ ] Affected captures re-run + eyeballed (visual lens)

## Notes
{sites left alone + why, registry rows added, scope handed to coplan, follow-ups}
```

## Guardrails

- **Rule of Three.** Two clones is often fine; wait for the *third* before abstracting. Three real
  copies = a pattern worth a master.
- **"Same reason to change" is the test, not "looks similar."** DRY is a single source of truth for
  one piece of *knowledge*. If two blocks would change for *different* reasons (billing rounding vs
  analytics rounding that happen to match today), that is **coincidental duplication** — merging
  couples them and you'll fight the abstraction later. Leave them; record why.
- **Prefer the wrong duplication over the wrong abstraction.** A premature master with a
  `boolean`/`mode` flag tangle taxes every future change. If the surface sprouts flags that fork the
  body (`if (variant === 'admin')`), the cluster isn't one thing.
- **Don't mass-rewrite on a hunch.** Build the matrix first — the data tells you canonical vs
  outlier. A lone deviation might be intentional; confirm the context before "fixing" it.
- **Fix the spec before the code (D4).** Conforming code to a value the spec still permits a range
  around guarantees the drift returns.
- **Never leave a copy behind.** A surviving clone re-seeds the drift.
- **Preserve behavior, prove it.** The master must reproduce each site's current behavior. Land a
  characterization test before migrating if coverage is thin.
- **Targeted captures only** (visual lens) — one capture per affected screen, never the full suite.
- **Scope approval for wide migrations.** Touching many files = get sign-off or hand the plan to
  `coplan`; don't silently refactor dozens of call sites.

## Self-eval gate (close the loop)

- **Sites folded into one master (or conformed to the canonical), copies deleted, build/tests green,
  behavior unchanged, affected captures re-eyeballed** → PASS forward to `cotest` to confirm the
  affected surfaces still match their spec/artboards.
- **Matrix shows the sites aren't really the same thing (coincidental)** → record the decision, leave
  them, done — that *is* a pass.
- **Master would need flag-soup to fit every site, or the matrix stays inconclusive** → re-loop:
  re-cluster (maybe it's two masters), bounded retries, then **cancel and report the matrix** rather
  than forcing a bad abstraction or an endless re-fix.
- **No settled canonical exists** → escalate to the human; the design decision must precede the
  consolidation.
- **A wide migration exceeds approved scope** → escalate; hand the plan to `coplan`.
- **A site turns out to hide a genuine bug, not just drift** → cross-loop to `codebug` before
  consolidating.
- **Same duplication/drift pattern recurs across clusters** → write a lesson via `colearn` (it may
  graduate into a lint rule, a token, or a CI guardrail).

## Relationship to Other Skills

- **`cotest`** — vertical (screen vs artboard/spec). This loop is horizontal (sites vs each other).
  Run `cotest` to learn the *canonical* value; run this to *propagate* it.
- **`cotranslate`** — produces the port and **flags duplication for this loop**; it never runs the
  DRY pass itself.
- **`cocritique`** — asks whether the element should exist at all. Consistency ≠ correctness.
- **`cospecify` / `codraw`** — where a C0 spec tightening lands when no canonical exists yet.
- **`cobuild`** — builds the master once its shape is decided.
- **`coplan`** — receives the migration plan when full adoption is out of immediate scope.
- **`colearn`** — recurring duplication shapes graduate into guardrails (lint rules, tokens, codegen).
