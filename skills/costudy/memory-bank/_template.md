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

## Discovery
**Routes discovered**: {n routes, list or summarize}
**How**: {nav DOM links / sitemap.xml / client-side router manifest — which sources were checked}
**In scope vs out of scope**: {which discovered routes map to flowsInScope and get captured; which
are recorded reachable-unvisited because they're outside the job/scope}

## Capture summary
{screens captured, per flow, with the naming-convention ids. Link to `captureDir`.}

## Nav graph + reachable-unvisited
{nodes = screens, edges = causing interaction. `reachable-unvisited` count and what they are.}

## IA + patterns
{landmark/heading outline per screen; primitives inventory with variants observed; pattern names in
our own taxonomy, flagged provisional where new.}

## Inferred system (tagged)
{color ramp / type scale / spacing rhythm / radii / elevation / motion — every line tagged
`inferred`. Never presented as the target's real tokens.}

## Verdict + coverage numbers
**{COMPLETE | PARTIAL | BLOCKED}**

- flows captured / flows in scope: {n}/{n}
- screens captured / screens discovered: {n}/{n}
- reachable-unvisited: {n}
- assumed-tag ratio: {n}/{n}

{If PARTIAL or BLOCKED: name what's missing and why.}

## What to steal & what to avoid
**Steal**: {patterns worth reusing, with evidence link}
**Avoid**: {patterns not to copy, and why — keeps this a reference, not a clone}

<!-- status: open | done | blocked -->
<!-- superseded-by: {path to a newer study of this target, when re-studied} -->
<!-- spec: {cospecify record citing study:<id>}   handoffRef: {codraw design-manifest referenceLedger} -->
