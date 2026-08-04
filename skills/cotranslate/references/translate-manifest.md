# `translate-manifest.json` — schema + worked example

The manifest carries every **project-specific fact** the `cotranslate` skill deliberately does not: token
sources, the masters registry, scaffolding to strip, inverted-param traps, capture and parity
commands. The skill is generic; the manifest is your project.

## Where it lives & who owns it

`.agents/workspace/translate-manifest.json`. If a human writes it, it is a `raw/` input (source of
truth). If `cotranslate` drafts it (SKILL §0), it is AI-owned **until the owner confirms** — never port
against an unconfirmed manifest.

## Schema

```jsonc
{
  "designSource": {
    "glob": "…/blocks/*.jsx",        // where the design boards/artboards live
    "kind": "open-design",           // open-design | figma | jsx | html | spec
    "copySource": "docs/WRITING.md", // strings SSOT; wins over the design on copy (SKILL §2)
    "scaffolding": ["CLWin", "DCArtboard", "OIShell"]  // component names to STRIP, not port
  },

  "targets": [
    { "platform": "swiftui", "sourceGlob": "apple/Sources/**", "confirmed": true },
    { "platform": "compose", "sourceGlob": "android/…",         "confirmed": false } // owner-gated
  ],

  "masters": {                       // symbol → file. The registry §5/§6 grep + documentSymbol.
    "PaintingFrameView": "apple/Sources/Components/PaintingFrameView.swift",
    "MuseumLabel":       "apple/Sources/Components/MuseumLabel.swift"
  },

  "invertedParams": [                // the §3 traps: same name, opposite range/sense
    { "name": "frost",
      "design":  { "range": "0..1",   "default": 1, "clearAt": 1 },
      "impl":    { "range": "0..0.5", "default": 0, "clearAt": 0 },
      "note": "translate by MEANING, never copy the number" }
  ],

  "lspProbe": {                      // §6: how to wire the index before trusting findReferences
    "setup": "brew install xcode-build-server && xcode-build-server config -scheme <S>",
    "knownUsedSymbol": "PaintingFrameView"  // findReferences must return non-empty to unlock refs
  },

  "capture": {                       // per-platform live-capture commands (integrated-exclusive)
    "swiftui-macos": "screencapture -o -x {out}",
    "swiftui-ios":   "xcrun simctl io booted screenshot {out}"
  },

  "parity": {                        // drives scripts/token-parity-check.py (SKILL §7)
    "source": { "path": "…/blocks/02-tokens-primitives.jsx", "format": "jsx-object",
                "blocks": ["zone", "onArt", "light", "dark"] },
    "target": { "path": "design-tokens/core-loop.tokens.json", "format": "json",
                "groups": { "zone": "zone", "onArt": "onArt",
                            "light": ["surface.light", "ink.light"],
                            "dark":  ["surface.dark",  "ink.dark"] } }
  }
}
```

## The `parity` block in detail

`token-parity-check.py` reads only this block. Both sides produce `{group: {name: color}}` and are
compared **by group name**.

- **`format: "jsx-object"`** — extracts named object literals from a JS/JSX file. `blocks` lists the
  object keys; each block's group name is the key itself.
- **`format: "json"`** — loads JSON; `groups` maps a group name to a dotted path, or a list of paths
  that get merged (e.g. `surface.light` + `ink.light` → group `light`).

Either format works on either side (a Figma variables JSON export can be the `source`; a JSX token
file can be the `target`). A key present on the impl side but not the design side is **INFO**, never
DRIFT — those often live in impl code (type scale, frame, radius, spacing), verified by reading.

**When a project's token shape fits neither format**, add a small per-project adapter that emits the
`{group: {name: color}}` shape and point `parity` at its output — owner-gated, same honesty as the
LSP gate. Do not stretch the two built-in formats past what they cleanly parse.

## Worked example (abridged, one group)

Design `02-tokens-primitives.jsx`:

```jsx
const FA = {
  zone: { deepFlow: '#3E7C6A', resting: '#B9A06B', fatigue: '#B4674E' },
  // …
}
```

Impl `core-loop.tokens.json`:

```json
{ "zone": { "deepFlow": "#3e7c6a", "resting": "#b9a06b", "fatigue": "#b46f4e" } }
```

Run:

```bash
python3 skills/cotranslate/scripts/token-parity-check.py --manifest .agents/workspace/translate-manifest.json
```

Output — casing is normalized, so `deepFlow`/`resting` PASS and only the real value diff surfaces:

```
  PASS: 2   DRIFT: 1   INFO: 0
  DRIFT (design SSOT vs impl — reconcile before translating):
    ✗ zone.fatigue        design=#b4674e      impl=#b46f4e
```

Exit 1 → reconcile before translating that color.
