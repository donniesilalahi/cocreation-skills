# Canvases — gallery, flow map, IA sitemap, design-system sheet, pattern cards

Five canvases, all generated from the study ledger (`references/ledger-and-naming.md`), rendered as
Open Design (OD) artifacts when the OD MCP is available, degrading to static HTML/CSS on disk
otherwise (§ fallback below) — **same naming, same ledger, same canvas set either way**, matching
codraw's fallback contract.

## 1. Gallery

**Shows:** every captured screen, grouped by flow, state-labelled.

**Generated from:** `captures[]`, grouped by `flow`, sorted by `screen` then `state` order matching
`stateVocab`.

**Layout:**
- One section per flow (`flowsInScope` order), section header = flow name.
- Within a section, one row per screen; one thumbnail per state, labelled with the state name.
- Thumbnail = `evidence.screenshot`. Missing screenshot (e.g. iOS-ingested entry with a placeholder)
  renders a labelled empty slot, not a silently skipped cell.
- Caption under each thumbnail: `id`, `tag`, and `pattern` if set.

## 2. Flow map

**Shows:** the nav graph — nodes + causing-interaction edges + `reachable-unvisited` stubs.

**Generated from:** `captures[]` as nodes (`id` → node label) plus the recorded `{element, action}`
edges from traversal (`capture-protocol.md` §3) plus every `reachable-unvisited` route discovered in
§4 of the same file.

**Layout:**
- Nodes grouped/clustered by `flow`, same left-to-right or top-to-bottom order as the traversal.
- Edge label = the causing interaction, short form (e.g. `click "Continue"`), not the resulting URL.
- `reachable-unvisited` nodes render as a visually distinct stub (dashed border, no thumbnail) —
  present in the map, clearly unwalked, never absent.
- This canvas is the one artifact costudy uniquely produces — no screenshot gallery structurally
  can — the edges are the payload, keep them legible over cramming in every node's thumbnail.

## 3. IA sitemap

**Shows:** data-driven hierarchy outline per screen — landmarks + heading structure.

**Generated from:** each entry's `ia[]` array, rendered as a nested outline per screen, grouped by
flow (same grouping as the gallery, so the two canvases can be read side by side).

**Layout:**
- One collapsible/scrollable block per screen: landmark → heading levels as nested list items,
  straight from `ia[]`'s recorded strings (`"header/nav"`, `"main/h1 Checkout"`, …).
- No paraphrasing — this canvas is a direct read of captured structure, not a summary. If the
  underlying `ia[]` is thin (e.g. an iOS-ingested entry with a visually-inferred outline only), the
  block says so rather than padding it.

## 4. Inferred design-system sheet

**Shows:** the inferred color ramp, type scale, spacing rhythm, radii, shadow/elevation, motion
durations & easing — **all `inferred`-tagged**, never presented as the target's real design tokens.

**Generated from:** aggregating every entry's `tokens` object (§`capture-protocol.md` §2's four node
classes: text, surface, control, elevated) across all captures, deduplicating near-identical values
into a ramp/scale rather than listing every raw sample.

**Layout:**
- Section per token category (color, type, spacing, radii, elevation, motion).
- Each value swatch/row carries its sample count (how many captures it was observed in) and an
  `inferred` badge, rendered visibly on every value — this is the one canvas where the tag has to be
  impossible to miss, since it's the highest-value and least-certain output of the whole study.
- Do not smooth outliers into a "clean" system silently — a genuinely inconsistent sample (three
  different button radii across screens) is itself a finding; show the spread, don't average it away.

## 5. Pattern cards

**Shows:** one card per named pattern — what it does, what to steal, what to avoid, evidence link.

**Generated from:** entries sharing a `pattern` value, rolled into one card; `primitives[]` across
those entries becomes the card's component inventory.

**Card fields:**

| Field | Content |
|---|---|
| Pattern name | Our own taxonomy name (kebab-case, functional, reused across studies), flagged `provisional` on first use — same reflex as codraw's new-primitive flag |
| What it does | One or two lines, functional description |
| What to steal | The specific, transferable idea — interaction model, information architecture choice, a genuinely good default |
| What to avoid | The specific reason NOT to copy this wholesale — a constraint that doesn't apply to us, a known usability cost, a legal/brand reason it's target-specific |
| Evidence link | `study:<id>` reference(s) into the ledger — the entries this card is built from |

**Why "what to avoid" is mandatory, not optional:** a pattern card with only "what to steal" is a copy
instruction. The "what to avoid" field is what keeps costudy's output a **design input for informed
decisions**, not a clone-and-ship asset (SKILL guardrail #7) — every card must name the specific
reason this pattern, as observed, isn't simply portable.

## Fallback — no OD MCP

If the Open Design MCP is present, drive it the same way codraw does: list/reuse or create an OD
project, write each canvas as an OD artifact. **If it is absent, write HTML/CSS canvases to disk**
under the study's `captureDir` (e.g. `captureDir/canvases/gallery.html`,
`captureDir/canvases/flow-map.html`, …) instead — same naming, same ledger, same five-canvas set. The
method is tool-agnostic; only the render target changes.

Canvases live under the gitignored `captureDir` **by design** (guardrail #5 — they embed
screenshots). The ledger is the committed, regenerable source; a canvas is a render of it. Never
commit canvases to work around a missing OD project.

As with codraw's data-driven sitemap: **a data-driven canvas is not verified by reading the source.**
Render the flow map and design-system sheet and actually look — a categorical value (a new `pattern`
name, a new `flow`) added to `captures[]` but missing from a canvas's lookup/legend is a silent crash
or a silently-missing node, not a silent no-op. Check console + network on any HTML/CSS canvas before
calling the render step done.
