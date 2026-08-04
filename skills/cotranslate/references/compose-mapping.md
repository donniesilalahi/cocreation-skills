# CSS / JSX → Kotlin + Jetpack Compose mapping — STUB (owner-gated)

**Do not build against this without confirming the Android framework choice with the owner first.**
This is a provisional parallel to `swiftui-mapping.md` so the same design system can render on a
second native target. If the manifest's `targets` does not include a confirmed Compose target, this
file is reference-only.

The discipline is identical to SwiftUI (SKILL §1–§9): one master per primitive, verify token
semantics in both sources, port every element + state, span-scope. Only the mechanical mapping
changes.

| CSS / JSX | Compose (Modifier) — *provisional* |
|---|---|
| `HStack(spacing:)` | `Row(horizontalArrangement = Arrangement.spacedBy(G.dp))` |
| `VStack(spacing:)` | `Column(verticalArrangement = Arrangement.spacedBy(G.dp))` |
| `.padding(x)` | `Modifier.padding(x.dp)` |
| `borderRadius: R` | `Modifier.clip(RoundedCornerShape(R.dp))` |
| `boxShadow` | `Modifier.shadow(elevation = …dp)` (approx; two-layer needs custom draw) |
| `radial-gradient` | `Brush.radialGradient(...)` |
| `linear-gradient` | `Brush.linearGradient(...)` |
| `position:absolute` / overlay | `Box { … }` |
| `filter: saturate(s)` | `ColorFilter` via `ColorMatrix().apply { setToSaturation(s) }` |
| `filter: blur(Npx)` | `Modifier.blur(N.dp)` |
| brand tokens | a `Tokens` object generated from the **same** token source both renderers consume |
| brand type scale | a `Type` object binding the same font families |

## The one cross-renderer rule

If a param is **inverted** between the design source and one renderer (SKILL §3, the `frost`
archetype), keep **both native renderers on the same corrected sense** so they agree — translate by
meaning on each side, then make Compose match the corrected SwiftUI value, not the raw design value.

## Parity

Extend the manifest's `parity.target` (or add a second target entry) to point at the Compose token
binding once it exists; `token-parity-check.py` diffs it the same way. Each master (SKILL §5) gets
one Compose implementation, same as SwiftUI.
