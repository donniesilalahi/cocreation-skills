---
name: coaudit
description: The "drift audit" loop. Find UI elements that should look/behave identically but have drifted (e.g. a back button rendered at size 18 on one screen and 16 on another), diagnose whether the cause is a loose design token, a missing master component (DRY violation), or an ignored token, then plan a fix and apply surgical edits to crystal-clear outliers. Use when the user reports "this looks bolder/bigger here than there", "why isn't X the same size as Y", inconsistent icons/buttons/pills across screens, or asks to make an element consistent app-wide.
---

# Consistency Audit Skill

The doer is **coauditor**. This is a specialized **drift** loop callable on consistency drift from any stage — not part of the core make → check → verify cycle, but invoked when an element-class diverges across screens.

## What I Do

Take **one element-class** — a set of UI elements meant to look and behave identically (back button, hero icon button, search field, status pill, primary button…) — and:

1. **Enumerate** every place it is implemented across `Sources/WiseLifeUI`.
2. **Extract** each site's visual properties into a comparison matrix (glyph size, weight, frame, fg/bg opacity, stroke, radius).
3. **Cluster** → find the canonical/majority spec and the outliers.
4. **Diagnose** the root cause: loose token, missing master component (DRY), or ignored token.
5. **Plan** the fix at the right tier, and **apply surgical edits** to outliers that are crystal-clear.
6. **Verify** (build + re-run the affected marketing captures).

This is **not** `coverify`. coverify compares **one screen vs one artboard** (vertical). This skill compares **many implementations of the same element vs each other** (horizontal) to kill drift.

## When to Use

- User says: *"this is bolder/bigger here than there"*, *"why isn't the back icon the same size as share/delete"*, *"these should look the same"*.
- After a feature sweep, to catch copy-paste drift before it spreads.
- When asked to *"make X consistent across the app"* or *"create a master component for X"*.

## The Three Root Causes

Every drift traces to one (or more) of these. Name it before fixing — the cause determines the fix tier.

| # | Root cause | Signature | Right fix |
|---|-----------|-----------|-----------|
| **R1** | **Loose token** | DESIGN.md gives a *range* or *options* (`size: 15–16`, `frame: 32–36`) so each screen legally picks a different point → drift is "spec-compliant" | Tighten DESIGN.md to ONE exact value, then migrate |
| **R2** | **Missing master component** (DRY) | No shared view; element is copy-pasted (e.g. a private `backButton` computed prop) into N files, each free to drift | Extract a component into `WiseLifeDesignSystem`, migrate call sites |
| **R3** | **Ignored token / component** | An exact token or component exists, but the call site hardcodes a different value | Surgical edit to use the token/component |

> **Real example (the user's report).** In `CalendarEventDetailView.swift` two near-identical dark circular icon-buttons live in the *same file* yet diverge:
> - `backButton`: glyph **18** / frame **36** / fg `.75` / **no stroke**
> - `heroIconCircle` (share, trash): glyph **15** / frame **32** / fg `.65` / stroke `.1`
>
> And across files `backButton` is glyph **18** in Calendar but **16** in `GoalDetailView.swift`. Cause = **R1 + R2**: DESIGN.md §7.1/§7.2 spec these with ranges (`15–16`, `18`, `32–36`), and there is no shared `WLHeroIconButton`/`WLBackButton`, so the private `backButton` prop is hand-copied into ~66 files and drifts.

## Workflow

### 1. Scope the element-class
From the user's complaint, name the class and its grep signature. If sweeping, pick from the **Element Registry** below.

### 2. Enumerate call sites
```bash
grep -rln '<signature>' Sources/WiseLifeUI/        # files
grep -rn '<signature>' -A6 Sources/WiseLifeUI/      # with property block
```

### 3. Build the property matrix
One row per call site. Columns are the visual properties that *should* be identical.

```
element-class: dark back button  (signature: chevron.left)
file:line                                  | glyph | weight    | frame | fg op | bg op | stroke
-------------------------------------------|-------|-----------|-------|-------|-------|-------
Calendar/CalendarEventDetailView:566       | 18    | semibold  | 36    | .75   | .08   | none   ← majority
Goals/GoalDetailView:256                   | 16    | semibold  | 36    | .75   | .08   | none   ← OUTLIER glyph
Goals/GoalDetailView:669                   | 16    | semibold  | 36    | .75   | .08   | none   ← OUTLIER glyph
...
```

### 4. Cluster → canonical vs outliers
- The **mode** (most common value per column) is the de-facto canonical — unless DESIGN.md or an artboard says otherwise (artboards win; see memory `artboards-are-source-of-truth`).
- Flag every cell that deviates. Count outliers vs total → tells you surgical (few) vs migration (many).

### 5. Diagnose (R1 / R2 / R3)
- Check DESIGN.md for this element. **Range or options?** → R1. **Exact value the code ignores?** → R3.
- Check `Sources/WiseLifeDesignSystem` for a component. **None and copy-pasted?** → R2.
- Usually R1+R2 together: loose spec *and* no component.

### 6. Choose fix tier

| Tier | When | Action |
|------|------|--------|
| **T1 — Surgical edit** | ≤ a handful of clear outliers against a settled canonical; no API change | Edit each outlier to the canonical value. Crystal-clear ⇒ just do it. |
| **T2 — Tighten token** | R1: DESIGN.md range is the enabler | Pick ONE exact value in DESIGN.md §7, note the decision, then T1/T3 to conform code |
| **T3 — Extract master component** | R2: element copy-pasted into many files | Add `WL<Name>` view to `WiseLifeDesignSystem`, encoding the §7 spec exactly. Migrate call sites to it. This makes future drift *impossible*. |

> **Default posture:** surgical-fix the obvious outliers now (T1) so the user sees immediate improvement, **and** propose the T3 component extraction as the durable fix. Do T3 inline only when the user approves scope (it touches many files); otherwise hand back a plan via `coplan`.

### 7. Apply
- **T1:** `Edit` each outlier. Keep edits format-preserving (match surrounding `.white.opacity` vs `Color.white.opacity` style per file).
- **T3:** new file `Sources/WiseLifeDesignSystem/Components/WL<Name>.swift`, then replace each private impl with the component. Delete the now-dead private helpers.

### 8. Verify
- `swift build` (compiles).
- Re-run marketing capture **only for affected screens** (see memory `coverify-targeted-captures`): `./scripts/capture-marketing.sh --screen <slug>`.
- Eyeball the re-captured PNGs side-by-side. Confirm the outlier now matches canonical.

## Element Registry

Known element-classes, their grep signatures, and the canonical spec to enforce. Extend this as new classes are audited.

| Element-class | Signature (grep) | Canonical (DESIGN.md) | Drift seen | Notes |
|---------------|------------------|-----------------------|-----------|-------|
| Dark back button | `chevron.left` | §7.2 — glyph 18 / semibold / frame 36 / fg .75 / bg .08 / no stroke | glyph **14–20**, frame **32–36**, bg **.06–.14**, stroke **none–.3** | ~66 files copy a private `backButton`. Prime T3 (`WLBackButton`). |
| Hero icon button (share/trash/ellipsis/add in dark hero) | `clipShape(Circle())` near `Image(systemName:`; helpers named `heroIconButton`/`heroIconCircle` | §7.1 — glyph 15 / semibold / frame 32 / fg .65 / bg .08 / stroke .1 | glyph **13–18**, weight **regular↔semibold**, frame **32–36**, bg **.06–.14**, fg **.65–1.0** | Reimplemented per-module in 8+ files, each with a *different* private `heroIconButton(_:)`. Prime T3 (`WLHeroIconButton`). |
| Search field / icon | `magnifyingglass` | §7.1 (15–16) but unstandardized for search | glyph **14–16**, weight **regular / medium / semibold**, sometimes 32×32 framed, sometimes inline | ~34 files. Decide: framed button vs inline field-icon are two sub-classes — split before fixing. |
| Status pill | `ArtboardProgressStatusPill`, `StatusPill` | §7.6 — semantic colors only | — | See memory `coverify-task-detail-primitives`. |
| Primary / capsule buttons | `WLColor.accentMauve` fills; `.clipShape(Capsule())` | §7.3 / §7.4 | — | |

### Existing primitives (important)

- **`WLIconButton` already exists** at `Sources/WiseLifeUI/Components/WLChrome.swift:297–318` (glyph 16 / semibold / frame 36) — **but has 0 call sites.** A master component was built and never adopted. For the hero-icon-button T3, *adopt/extend this* rather than inventing a new one (avoid a second orphan). Decide its home: it currently lives in `WiseLifeUI/Components`, not `WiseLifeDesignSystem` — consider promoting it.
- **No icon-size/weight tokens exist** in `Sources/WiseLifeDesignSystem/DesignTokens.swift` (only `WLSpacing`/`WLRadius`/`WLTypeRole`/color). The R1 fix for icons may mean *adding* `WLIconSize`/`WLIconWeight` tokens, not just tightening DESIGN.md prose.

**Note on DESIGN.md ranges:** §7.1/§7.2 use ranges (`15–16`, `32–36`). Ranges are the R1 enabler. First fix = collapse the range to one value (T2).

## Memory-Bank

**Directory**: `.agents/skills/coaudit/memory-bank/`
**File naming**: `YYYY-MM-DD-HHmm_{element-class-slug}_audit.md`
**Index**: `AUDIT.md` — auto-generated; never edit by hand. Copy `_template.md`, keep its
frontmatter (`title`, `date`, `cause`, `tier`, `status`) filled, then refresh:
`node .agents/skills/coaudit/index.js`.

### Report Template

```markdown
---
title: {Element-class}
date: YYYY-MM-DD
cause: R1
tier: T1
status: open
---

# Consistency Audit — {Element-class}

**Signature**: `{grep}`
**Sites found**: {N}   **Outliers**: {M}
**Root cause**: R1 / R2 / R3 (+combos)
**Fix tier**: T1 / T2 / T3

## Property Matrix
{paste the matrix; mark canonical + outliers}

## Diagnosis
{why it drifted — quote DESIGN.md range or note missing component}

## Fix
- [ ] T2: DESIGN.md §7.x collapsed to {exact values}
- [ ] T3: `WL{Name}` added to WiseLifeDesignSystem
- [ ] Migrated {n} call sites
- [ ] T1 surgical: {file:line → old → new}
- [ ] swift build green
- [ ] Affected captures re-run + eyeballed

## Notes
{deferred sites, scope handed to coplan, design questions}
```

## Guardrails

- **Artboards win** over DESIGN.md over code (memory `artboards-are-source-of-truth`). If unsure what the canonical *should* be, inspect the Open Design artboard before declaring a value.
- **Don't mass-rewrite on a hunch.** Build the matrix first; the data tells you canonical vs outlier. A lone deviation might be intentional (different context) — confirm context before "fixing".
- **Targeted captures only** — never re-run the full marketing suite (disk + time). One `--screen` per affected slug.
- **T3 touches many files** — get scope approval or hand a plan to `coplan`; don't silently refactor 66 files.

## Self-eval gate (close the loop)

- **Outliers conformed to canonical, build green, captures re-eyeballed** → PASS forward to `coverify` to confirm the screens still match their artboards.
- **Matrix is inconclusive or a fix didn't take** → re-loop: re-enumerate / re-cluster, bounded retries (default: cancel and report the matrix, not endlessly re-fix).
- **No settled canonical, or T3 extraction exceeds approved scope** → escalate to the human and hand the migration plan to `coplan`.
- **An outlier turns out to be a genuine bug, not just drift** → cross-loop to `codebug`.

## Relationship to Other Skills

- **`coverify`** — vertical (screen vs artboard). This skill is horizontal (element vs itself across screens). Run coverify to learn the *canonical* value; run this to *propagate* it.
- **`design-brainstorming`** — if no canonical exists, brainstorm decides it, then this skill enforces it.
- **`coplan`** — receives the T3 migration plan when full extraction is out of immediate scope.
