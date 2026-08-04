# CSS / JSX → SwiftUI mapping + pitfall checklist

Loaded on demand by `cotranslate`. Generic to any SwiftUI target — no project facts here. The design
source is usually inline-styled JSX/HTML (or a spec that reduces to CSS-like values); this is how
those values become SwiftUI.

## Layout & box model

| JSX / CSS | SwiftUI |
|---|---|
| `display:flex; flexDirection:row; gap:G` | `HStack(spacing: G)` |
| `display:flex; flexDirection:column; gap:G` | `VStack(spacing: G)` |
| `alignItems` / `justifyContent` | `HStack/VStack(alignment:)` + `Spacer()` / `.frame(maxWidth:.infinity, alignment:)` |
| `padding: T R B L` | `.padding(.init(top:…, leading:…, bottom:…, trailing:…))` |
| `borderRadius: R` | `.clipShape(RoundedRectangle(cornerRadius: R, style: .continuous))` |
| `border: 1px solid C` | `.overlay(RoundedRectangle(...).strokeBorder(C, lineWidth: 1))` — **only if the design actually has one.** Adding a hairline the source lacks is a common drift. |
| `boxShadow: 0 Y BLUR rgba(...)` | `.shadow(color:, radius: BLUR, x: 0, y: Y)`. Two-layer shadows (ring + blur) need two `.shadow` or a background+overlay — don't collapse to one. |
| `position:absolute` / stacked layers | `ZStack` / `.overlay(alignment:)` / `.background(alignment:)` |
| fixed `width:` on a device mock | do **NOT** pin `.frame(width:)` to mock dims (see pitfalls) |

## Color, gradient, effects, type

| JSX / CSS | SwiftUI |
|---|---|
| `opacity: o` | `.opacity(o)` |
| `filter: saturate(s)` | `.saturation(s)` |
| `filter: blur(Npx)` | `.blur(radius: N)` |
| `backdropFilter: blur(Npx)` | `.background(.ultraThinMaterial)` / a custom blurred background — no exact analog, **flag** |
| `radial-gradient(… at 50% 0%, A, transparent P%)` | `RadialGradient(colors:[A,.clear], center:, startRadius:, endRadius:)` |
| `linear-gradient(deg, …stops)` | `LinearGradient(stops:, startPoint:, endPoint:)` |
| `textTransform: uppercase` | `.textCase(.uppercase)` |
| `letterSpacing: 0.06em` | `.tracking(pt)` where `pt = em × fontSize` (SwiftUI has no `em`) |
| `mask-image` / `mask-composite` | layered `Image` + `.mask()` / `.blendMode`; elaborate masks may be an **owner-approved** simplification — flag, don't silently simplify |

## SwiftUI pitfall checklist — things the JSX can't warn you about

Every one of these is a real, generic SwiftUI trap where a faithful-looking translation still
renders wrong. Check each:

- **`Text(someInt)` applies locale grouping** → a year renders `"1,906"`. Use `Text(String(n))`.
- **Default macOS focus ring** on fields/buttons. Add `.focusEffectDisabled()` and
  `.buttonStyle(.plain)` where the design shows none.
- **`.borderedProminent` / default accent renders system blue** — violates a monochrome design.
  Hand-style the fill; no `.tint()` accent on chrome.
- **`@ViewBuilder` siblings stack as an implicit `ZStack`, not a `VStack`.** Wrap vertical stacks
  explicitly.
- **Fixed `.frame(width:)` pins device/mock dims.** Orientation and size come from the design board,
  not a leftover `.frame(minWidth:)` — inheriting a phone floor has shipped portrait screens that
  the board drew landscape.
- **Widget/extension targets must register bundled fonts.** `UIAppFonts` in the app Info.plist does
  NOT cover a widget target; without its own registration every custom font silently falls back to
  system.
- **System text styles silently substitute for the brand scale.** `.caption`/`.subheadline`/
  `.headline`/`.monospaced` are NOT your type tokens — using them (hero or secondary) is the single
  most common drift. Use the design's type scale everywhere text appears.
- **Missing bundled weights fall back to system.** If only Light/Regular/Medium ship, a `600/700`
  from the design falls back to system semibold/bold — verify the weight actually renders.
