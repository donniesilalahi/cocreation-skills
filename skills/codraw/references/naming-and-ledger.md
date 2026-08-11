# Naming convention, state vocab, hand-off anatomy & ledger rules

Loaded on demand by `codraw`. The generic form of the four things that make an artboard set
self-describing and drift-proof. Project-specific values (segments, vocab, paths) come from the
`design-manifest.json`; the *rules* here are invariant.

## 1. Per-artboard hand-off anatomy (invariant #3)

Every artboard-state is one repeatable unit. A hand-off spec defines each with the same anatomy —
this is the build list codraw renders from, one artifact per row:

| Field | What it holds |
|---|---|
| **screen** | the screen/route this depicts (kebab-case) |
| **canvas** | surface + size (from the manifest's `canvasSizes`, e.g. desktop 1440×900 / mobile 390×844) |
| **purpose** | one line — what state of what flow this is |
| **regions** | the layout areas: persistent chrome (nav/header/command-bar) vs. main content |
| **primitives-used** | every primitive the artboard composes (must exist in the SSOT library — §2) |
| **copy** | the exact placeholder strings to render (never lorem; real representative copy) |
| **states-to-draw** | the state matrix for this screen (default · loading · empty · error · success …) — **draw the error state for any screen with a backend op; it's not optional** |
| **section-flow** | which artboards this transitions to, and the transition style (feeds ledger `flow`) |
| **new-primitives** | any element with no name in the taxonomy → provisional name, flagged (§8) |

A screen with N drawable states becomes **N artboard-states**, each its own artifact + ledger entry.
One hand-off screen ≠ one artboard when it bundles states.

## 2. Naming convention (invariant #4)

**Segmented, self-describing, STATE-last, closed-vocab.** The manifest gives the template and
segment values; the invariant is the shape:

```
{segment}__{segment}__…__{screen}__{state}
```

- **Every segment before `screen`** is a project axis (milestone, side, module, …) — declared in the
  manifest's `naming.segments`.
- **`screen`** is the kebab-case screen name.
- **`state`** is ALWAYS last and ALWAYS from the closed `stateVocab`. This is what makes
  "empty/loading/error/success" greppable and impossible to drift.

Examples (Kindlyform):

```
M1__researcher__researcher__analyze__populated
M1__researcher__researcher__analyze__loading
M1__candidate__interviewer__consent__error
M2__candidate__interviewer__adaptive-followup-arriving__processing
```

**Default state vocabulary** (ship this; override per project in the manifest):

```
default · empty · loading · processing · populated · filled · partial ·
success · error · disabled · focus · hover · active · expanded · collapsed · complete
```

Rules: the artifact name and its ledger `name` are identical. If a state you need isn't in the vocab,
**don't coin a name inline** — propose adding it to the manifest vocab (same reflex as new-primitive
reconciliation, §8). `scripts/ledger-check.mjs` fails any name whose state ∉ vocab or that doesn't
match the convention arity.

## 3. Ledger rules (invariant #5) — the durable design↔code seam

The ledger is **git-tracked in the code repo, not the OD workspace** — that is the whole point: it
survives OD sessions and is the map `cotranslate`/`cotest`/later code chats read.

- **One entry per artboard-STATE artifact.** Not per screen.
- **`name` MUST equal the naming convention**; **`state` MUST be in `stateVocab`**; **`id` = the
  hand-off spec id** (traceability back to the spec is never lost).
- **`flow`** carries the section-flow click-through order (from the hand-off), so the sitemap canvas
  can be generated from the ledger.
- **`codeRef` / `route` / `codeStatus`** start null/`new` and are filled by the **code-parity pass**
  (§10). `codeStatus` ∈ `existing | partial | new` tells `cotranslate`/`cobuild` how much is already built.
- **`notes`** carries decision flags (§7): `resolved: …` for a defaulted decision, `blocked: …` for
  one needing eng/legal. Both are drawn; the flag routes the follow-up.
- **Never delete an entry** — mark `status` (`todo | in_progress | done | needs-review`). Bump
  `updated` on every write. Keep it valid JSON at all times.

## 4. Seeding & maintaining

1. **Seed** the ledger from the hand-off specs before rendering (all entries `todo`), so the whole
   roadmap is visible up front.
2. **Render** each artboard-state; flip its `status` and set `odArtifact` as you go.
3. **Code-parity pass** fills `codeRef`/`route`/`codeStatus`.
4. The **sitemap canvas** is generated from the ledger `flow` edges + a data file — keep the two in
   sync (see `gotchas.md`: a categorical value added to node data must be added to every lookup map
   that enumerates the set, or the canvas crashes at render).
