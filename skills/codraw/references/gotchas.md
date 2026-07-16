# codraw — render-verify guardrails & cross-project traps

The traps that recur when rendering a design system into artboards + canvases. The first three are
guardrails harvested from real failures (each cost a shipped bug); the rest map back to SKILL steps.

## 1. Render it and look — source review is blind to runtime bugs (§9)

A data-driven canvas or interactive artifact is **not verified by reading the source.** Two bugs once
shipped as "working" after a static-only pass, both caught only by an actual browser render:

- A legend built with `position: fixed` silently overlaid and covered the exact "start of journey"
  nodes it existed to help find — invisible in the CSS, obvious in a screenshot.
- A node's data field was set to a wrong-but-valid value, producing a **404 on a real HTTP request**
  when consumed — invisible in the JSX, obvious in the network log.

Both are "correct-looking source, wrong runtime behavior" — the class static review is structurally
unable to catch. **For any canvas/dashboard/interactive artifact, a real render + console check +
network check is a required step, not optional polish.** codraw does this smoke check; `coverify`
owns the full acceptance gate.

## 2. A new categorical value must be added to EVERY lookup that enumerates the set (§6)

The data-driven sitemap (and any data-driven canvas) enumerates a categorical token set — milestone,
status, state, role — in more than one place: the node data **and** the color/theme lookup map, the
legend, filter lists, switch statements. Adding the value to the node data alone is **not a silent
no-op — it's a crash waiting for that value to render.** A missing `M0` entry in a
`KF_MILESTONE_INFO` lookup produced a live `Cannot read properties of undefined (reading 'color')`
the instant an `M0` node rendered.

**Rule:** when you introduce a new categorical value into a data file, grep that file (and importers)
for every OTHER place the value-set is enumerated and update all of them. Treat "I added the value"
and "I added it everywhere the set is enumerated" as two separate, both-required steps — and (see
#1) render to confirm, because a static read of the node-data addition looks complete.

## 3. Flag ad-hoc primitive names — never freeze them as canonical (§8)

A canonical primitive taxonomy always lags real screen needs once build-out runs across parallel
milestones — expected, not a failure. One Kindlyform cycle accumulated ~15 new primitive-shaped names
(`MCPLaunchCard`, `AdaptiveFollowUpBadge`, `QuotaProgressBar`, …) beyond the original 17. The trap is
letting a name picked under build-pressure by one track, without cross-track visibility, silently
become canonical — that's how a design system grows near-duplicate primitives.

**Rule:** when a screen needs an element with no name in the taxonomy, name it **provisionally and say
so explicitly** in the ledger `notes` / the report. "I picked a reasonable name" ≠ "this name is
canonical." Flag the gap for a later DESIGN.md reconciliation pass (route it to `cospecify` /
`coconsolidate`); don't decide it mid-render.

## 4. Redrawing a primitive instead of reusing it (§2)

The SSOT primitives library is the reference. Redrawing a primitive "close enough" from scratch is
drift injected at the source — every artboard that composes it inherits the divergence. Reuse the
library primitive; if it genuinely can't express what the screen needs, that's a new-primitive flag
(#3), not a private redraw.

## 5. Silently resolving an open decision (§7)

Picking a side on an unresolved design decision mid-render is how the artboards diverge from what the
owner actually wants. **Draw the DEFAULT the spec names, flag it in `notes`, list it back.** A
decision needing engineering/legal input is logged `blocked` and left for that call — never
self-resolved to keep moving.

## 6. Letting the ledger drift from the code (§10)

A ledger whose `codeRef`/`route`/`codeStatus` were seeded once and never updated is a stale snapshot,
not the live design↔code map `coport`/`cobuild` rely on. Run the code-parity pass so `existing` /
`partial` / `new` reflect reality; a wrong `codeStatus` sends the porter to build what already exists
or trust what doesn't.

## 7. Writing the ledger into the OD workspace instead of the code repo (§5)

The ledger's value is that it's git-tracked in the **code** repo and outlives OD sessions. Put it in
the OD workspace and the durable seam is gone — later code chats have nothing to read. Keep it at the
manifest's `ledgerPath`, in the repo.
