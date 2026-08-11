# `design-manifest.json` — schema + worked example

The manifest carries every **project-specific fact** `codraw` deliberately keeps out of `SKILL.md`:
design-system SSOT paths, the screen inventory, the naming convention + state vocab, canvas sizes,
the OD project id, and the ledger path. The skill is the generic method; the manifest is your
project. Mirror of cotranslate's `translate-manifest.md`.

## Where it lives & who owns it

`.agents/workspace/design-manifest.json`. Human-written → it's a `raw/` input (source of truth).
codraw-drafted (SKILL §0) → AI-owned **until the owner confirms**. Never render against an
unconfirmed manifest.

## Schema

```jsonc
{
  "project": "kindlyform-design",

  "designSystem": {                    // invariant #1 — the SSOT. codraw renders from it, never invents.
    "tokens": "design-system/tokens.css",
    "primitivesDoc": "DESIGN.md",      // canonical token/material/motion + base-primitive taxonomy
    "primitivesLibrary": "design-system/"  // invariant #2 — static HTML/CSS reference; reuse, don't redraw
  },

  "screenInventory": {                 // invariant #3 — the build list (hand-off specs)
    "handoffGlob": "memory-bank/design/2026-06-28_claude-design-handoff-*.md",
    "idField": "AR-NN"                 // the spec id kept in every ledger entry for traceability
  },

  "naming": {                          // invariant #4 — segmented, self-describing, STATE-last
    "convention": "{M}__{side}__{module}__{screen}__{state}",
    "segments": {                      // the project-specific segments (before the trailing state)
      "M": ["M0","M1","M2","M3","M4","M5","M6"],
      "side": ["researcher","candidate","shared"],
      "module": ["designer","recruiter","interviewer","researcher","foundation"]
    },
    "stateVocab": [                    // CLOSED set. state is always last. ship this default; override per project.
      "default","empty","loading","processing","populated","filled","partial",
      "success","error","disabled","focus","hover","active","expanded","collapsed","complete"
    ]
  },

  "canvases": {                        // invariant #6 — produce unless opted out
    "gallery":    true,                // all artboards
    "primitives": true,                // the component library
    "sitemap":    { "produce": true, "dataFile": "blocks/20-sitemap-data.jsx" }  // data-driven flow
  },

  "canvasSizes": {                     // per-surface artboard dimensions
    "desktop": "1440x900",
    "mobile":  "390x844"
  },

  "od": {                              // Open Design target (invariant #5 seam). Absent MCP → HTML fallback.
    "projectId": "kindlyform-design-88f0",
    "projectName": "kindlyform-design",
    "artboardPath": "artboards/{M}/{name}.html"   // also the on-disk fallback path
  },

  "ledgerPath": "memory-bank/design/design-ledger.json", // git-tracked in the CODE repo, not OD

  "referenceLedger": "docs/studies/acme.study.json"  // OPTIONAL. Path to a costudy study ledger —
                                                      // lets codraw resolve reference artboards (a
                                                      // competitor's captured screens/patterns)
                                                      // directly, without re-deriving anything.
                                                      // Read-only; codraw never writes to it.
}
```

## `referenceLedger` (optional) — reference evidence from `costudy`

When `costudy` has reverse-engineered a comparable shipped product into its own git-tracked ledger
(`docs/studies/<target>.study.json` by convention — see its `SKILL.md`), point `referenceLedger` at
that path. codraw then resolves `study:<id>` citations from a `cospecify` spec directly against it —
pattern name, primitives observed, inferred tokens, evidence tag (`observed | inferred | assumed`) —
instead of re-deriving comparative evidence itself. Absent this field, codraw renders from the
design-system SSOT alone, same as before; nothing about the core method changes. codraw only reads
this ledger — it never writes to it, and a `costudy` entry's `assumed`-tagged findings (most often
the "inferred design system" pass) must never be presented as this project's own tokens.

## The ledger (invariant #5) — lift verbatim, parameterized by the manifest

The ledger schema is proven; ship it as the default. It is git-tracked in the **code** repo so later
code chats, `cotranslate`, and `cotest` read the artboard→code map from it.

```jsonc
{
  "version": 1,
  "project": "kindlyform-design",
  "updated": "<ISO date>",                         // bump on every write
  "convention": "{M}__{side}__{module}__{screen}__{state}",
  "stateVocab": ["default","empty","loading","…","complete"],
  "designSystem": { "tokens": "design-system/tokens.css", "primitivesDoc": "DESIGN.md" },
  "odProject": { "id": "kindlyform-design-88f0", "name": "kindlyform-design" },
  "artboards": [
    {
      "id": "AR-01",                               // the hand-off spec id — never lose it
      "milestone": "M1", "side": "researcher", "module": "researcher",
      "screen": "analyze", "state": "populated",
      "name": "M1__researcher__researcher__analyze__populated",   // MUST equal the convention
      "handoffRef": "memory-bank/design/…-M1.md#AR-01",
      "odArtifact": "artboards/M1/M1__researcher__researcher__analyze__populated.html",
      "primitives": ["GlassCard","MetricTile","StatusPill","StageNav","FloatingCommandBar"],
      "status": "done",                            // todo | in_progress | done | needs-review
      "flow": ["AR-02"],                           // artboards this transitions to (from section flows)
      "codeRef": "app/routes/studies.$studyId.tsx",// filled by the code-parity pass (§10); null until then
      "route": "/studies/$studyId (activeStage='analyze')",
      "codeStatus": "partial",                     // existing | partial | new
      "notes": "resolved: command-bar-position = bottom-center (decision #1); …"
    }
  ]
}
```

**Rules** (full set in `naming-and-ledger.md`): one entry per artboard-STATE; `name` MUST equal the
convention; `state` MUST be in `stateVocab`; keep `id` = the hand-off id; never delete an entry (mark
`status`); keep it valid JSON at all times. `scripts/ledger-check.mjs` enforces name/state/convention
mechanically.

## Worked example — a decision defaulted vs blocked (invariant #7)

From the proven ledger — the two shapes the `notes` field must distinguish:

- **Defaulted** (drawn, flagged, listed back): `"notes": "resolved: command-bar-position =
  bottom-center (decision #1)"` — codraw drew the spec's default and recorded which decision it
  resolves, for the owner to confirm.
- **Blocked** (needs eng/legal, NOT self-resolved): `"notes": "blocked: mcp-auth-trust — needs
  engineering input (trust model + key rotation policy) before resolution; see decision-log #9. Do
  not silently resolve."`

Both states are drawn faithfully; the difference is the `notes` flag and whether it goes on the
owner's decision list or the blocked list.
