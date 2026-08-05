---
title: Target — flow
date: YYYY-MM-DD
target: Target name
platform: web
job: The job we are studying them for — one sentence, JTBD phrasing
coverage: 0/0 flows
status: open
ledger: docs/studies/<target>.study.json
manifest: .agents/workspace/study-manifest.json
---

# Study — {Target} · {flow}

**Platform**: {web | ios}   **Job**: {JTBD sentence}
**Adapter used**: {browser-use | chrome-devtools}   **Manifest**: {path}

## Scope & job
{flowsInScope for this record, and why — the bounded list, not "everything".}

## Mobbin priors + gaps
**Covered by Mobbin**: {n screens, pattern vocabulary found}
**Gap list (this capture's work order)**: {what Mobbin didn't cover for this target}

## Capture summary
{screens captured, per flow, with the naming-convention ids. Link to `captureDir`.}

## Nav graph + reachable-unvisited
{nodes = screens, edges = causing interaction. `reachable-unvisited` count and what they are.}

## IA + patterns
{landmark/heading outline per screen; primitives inventory with variants observed; Mobbin-taxonomy
pattern names where they apply.}

## Inferred system (tagged)
{color ramp / type scale / spacing rhythm / radii / elevation / motion — every line tagged
`inferred`. Never presented as the target's real tokens.}

## Verdict + coverage numbers
**{COMPLETE | PARTIAL | BLOCKED}**

- flows captured / flows in scope: {n}/{n}
- screens captured / Mobbin-covered screens: {n}/{n}
- reachable-unvisited: {n}
- assumed-tag ratio: {n}/{n}

{If PARTIAL or BLOCKED: name what's missing and why.}

## What to steal & what to avoid
**Steal**: {patterns worth reusing, with evidence link}
**Avoid**: {patterns not to copy, and why — keeps this a reference, not a clone}

<!-- status: open | done | blocked -->
<!-- superseded-by: {path to a newer study of this target, when re-studied} -->
<!-- spec: {cospecify record citing study:<id>}   handoffRef: {codraw design-manifest referenceLedger} -->
