# Naming convention, evidence tags & study ledger rules

Loaded on demand by `costudy`. Generic rules; project-specific values (target name, flows,
`ledgerPath`) come from `study-manifest.json` (`references/study-manifest.md`). **The shape here
mirrors codraw's ledger** (`skills/codraw/references/naming-and-ledger.md`) deliberately — same
per-entry discipline, same status-in-a-field rule — so codraw can read a study ledger without a
translation step.

## 1. Naming convention — STATE last, closed vocab

```
<target>__<flow>__<screen>__<STATE>
```

- **`target`** — the manifest's `target.name`, kebab-safe.
- **`flow`** — one of `flowsInScope`.
- **`screen`** — kebab-case screen name, matching what codraw would call it if this became a build
  reference.
- **`STATE`** — ALWAYS last, ALWAYS from the manifest's closed `stateVocab`.

```
acme__checkout__payment__error
acme__checkout__payment__success
acme__onboarding__welcome__default
acme__invoice-status__list__empty
```

**Default state vocabulary** (ship this; override per study in the manifest):

```
default · empty · loading · error · success · filled · disabled
```

### Why the capture name must equal the ledger `id` must equal the canvas node name

This is the same discipline as codraw's naming invariant, for the same reason: **a capture becomes a
canvas node with no renaming step.** The screenshot file, the ledger entry's `id`, and the gallery/flow-map
node all share one string. Rename any one of the three and the other two silently point at nothing —
there's no reconciliation pass that catches a mismatch except a canvas failing to render. (The one
sanctioned exception is iOS ingestion, `capture-protocol.md` §7, where a human-supplied screenshot set
needs one naming pass on the way in.)

## 2. Ledger — full schema

Git-tracked at the manifest's `ledgerPath`, **in the code repo, not the OD workspace** — same rule as
codraw, same reason: it must outlive the AI workspace and be readable by `cospecify`/`codraw`/
`cocritique` in later sessions.

### Top-level document

```jsonc
{
  "version":  1,
  "target":   "Acme",
  "platform": "web",                                // web | ios
  "updated":  "<ISO date>",                          // bump on every write
  "convention": "<target>__<flow>__<screen>__<STATE>",
  "stateVocab": ["default", "empty", "loading", "error", "success", "filled", "disabled"],
  "captures": [ /* one object per screen-state, schema below */ ]
}
```

### Per-entry schema

| Field | Type | Required | Allowed values / shape | Notes |
|---|---|---|---|---|
| `id` | string | yes | matches `convention` exactly | e.g. `acme__checkout__payment__error`. Same string as the capture filename and the canvas node — never diverges. |
| `target` | string | yes | manifest `target.name` | redundant with `id`'s first segment, kept for flat queries |
| `platform` | string | yes | `"web"` \| `"ios"` | |
| `flow` | string | yes | must be in `flowsInScope` | |
| `screen` | string | yes | kebab-case | |
| `state` | string | yes | must be in `stateVocab` | last segment of `id`; `scripts`-level validation should check this matches |
| `pattern` | string \| null | optional | Mobbin taxonomy name | null if no Mobbin match; filled from step 1 (Prime) or step 4.2 (pattern pass) |
| `primitives` | string[] | optional | free-form inventory | component vocabulary observed on this screen (`field`, `button`, `radio-card`, `inline-alert`, …) |
| `ia` | string[] | yes | landmark/heading outline entries | e.g. `["header/nav","main/h1 Checkout","main/h2 Payment method"]` — the raw material for the IA sitemap canvas |
| `tokens` | object \| null | optional | computed-style sample, keyed by node class (`text`/`surface`/`control`/`elevated`) | **always `tag: inferred`** at the entry level when this is populated — see §3 |
| `network` | string[] | optional | `"METHOD /path"` strings | requests observed firing on entry to this screen; `[]` if the adapter couldn't observe them (note the gap, don't omit the field) |
| `evidence` | object | yes | `{ screenshot, a11y, dom, mobbinUrl }` — each a path or URL or `null` | the four capture artifacts + optional Mobbin source; at least one non-null required |
| `tag` | string | yes | `"observed"` \| `"inferred"` \| `"assumed"` | see §3 — the entry's overall evidence strength |
| `odArtifact` | string \| null | optional | canvas/artboard path | filled once rendered (SKILL step 6); null until then |
| `status` | string | yes | `"captured"` \| `"synthesized"` \| `"rendered"` \| `"superseded"` | see §4 — status is a field, never a rename |

```jsonc
{
  "id": "acme__checkout__payment__error",
  "target": "Acme", "platform": "web",
  "flow": "checkout", "screen": "payment", "state": "error",
  "pattern": "payment-method-selection",
  "primitives": ["field", "button", "radio-card", "inline-alert"],
  "ia": ["header/nav", "main/h1 Payment", "main/h2 Card details"],
  "tokens": {
    "control": { "backgroundColor": "rgb(220,38,38)", "borderRadius": "8px", "fontSize": "14px" }
  },
  "network": ["POST /api/pay"],
  "evidence": {
    "screenshot": ".agents/workspace/studies/acme-2026-08-05/acme__checkout__payment__error.png",
    "a11y":       ".agents/workspace/studies/acme-2026-08-05/acme__checkout__payment__error.a11y.json",
    "dom":        ".agents/workspace/studies/acme-2026-08-05/acme__checkout__payment__error.dom.html",
    "mobbinUrl":  null
  },
  "tag": "observed",
  "odArtifact": null,
  "status": "captured"
}
```

## 3. Evidence tag — `observed | inferred | assumed`

Borrowed from `cocritique`. Applies at the entry level (`tag`) and can be applied more granularly
inside a synthesized artifact (e.g. one field of a pattern card).

| Tag | Qualifies when | Example |
|---|---|---|
| `observed` | Directly captured — a screenshot, DOM snapshot, or network log exists and was read, not summarized from memory | "The payment screen shows an inline red alert with text 'Card declined'" — read straight off the DOM/screenshot |
| `inferred` | Derived by computation or generalization from `observed` evidence, not itself directly captured | The token sweep's computed-style sample; a design-system ramp generalized across several `observed` screens; a pattern name assigned by matching Mobbin taxonomy to an observed layout |
| `assumed` | No direct evidence — filled from priors, category baseline, or an untested guess | "Probably uses the same error-toast pattern on mobile" with no mobile capture; a Mobbin category prior applied to a screen never actually reached |

**Rule: a conclusion is no stronger than its weakest input.** A pattern card that cites three
`observed` screens and one `assumed` gap can't be tagged `observed` overall — it inherits `assumed`.
This is the same discipline `cocritique` applies to a direction verdict; it exists so a downstream
reader (`cospecify` citing `study:<id>`) can trust the tag without re-deriving it.

**Inferred design tokens are ALWAYS `inferred` — never `observed`.** The computed-style sample
(`capture-protocol.md` §2) reads one node instance's rendered CSS; it is not the target's actual
design-token source. Presenting it as "Acme's real tokens" is the single most damaging drift this
ledger schema exists to prevent — it must read as a sample, every time it's consumed.

## 4. Status is a field, entries are never deleted

Per the repo's status-in-a-field rule (`docs/cocreator/SSOT.md`): a capture's lifecycle lives in
`status`, never in a filename or a folder move.

- `captured` — the five artifacts exist, redacted, on disk.
- `synthesized` — folded into IA/pattern/system-tokens passes (SKILL step 4).
- `rendered` — has an `odArtifact` (canvas exists).
- `superseded` — a later capture replaced this one for the same `id`; **do not delete** — add
  `supersedes`/`superseded-by` if you need the cross-reference, same as any other repo record.

Bump `updated` on every write to the ledger document. Keep it valid JSON at all times.

## 5. Handoff contract

- **`cospecify` cites a pattern as `study:<id>`** in its spec — e.g. `study:acme__checkout__payment__error`
  as the evidence line for a design decision. The spec is still the SSOT; the citation is provenance,
  not authority (competitors are not the bar — PLAYBOOK).
- **`codraw`'s `design-manifest.json` gains an optional `referenceLedger` pointer**:
  ```jsonc
  { "referenceLedger": "docs/studies/acme.study.json" }
  ```
  lets codraw resolve a reference artboard against the study ledger directly, without re-deriving
  anything already captured.
- **`cocritique` may read the ledger as comparative evidence** — always tagged as *competitor*
  evidence in its findings, **never** as the bar a critique verdict is measured against.
