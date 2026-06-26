---
title: Unit
date: YYYY-MM-DD
kind: D1
tier: C1
status: open
---

# DRY Consolidation — [Unit]

- **Signature**: `{grep/pattern}`
- **Clones found**: {N}   **Merged**: {M}   **Left alone**: {N-M}

## Variance Matrix
{paste the matrix; mark shared core vs varying axes}

## Decision
{Rule of Three + same-reason-to-change — why this is / isn't real duplication}

## Master
- Home: `{path}`
- Customization surface: {params/slots/variants}

## Adopt
- [ ] Master built at {path}
- [ ] Migrated {n} sites
- [ ] Dead copies deleted: {file:line …}
- [ ] Build green + tests pass
- [ ] Behavior unchanged per site (verified how)

## Notes
{clones left alone + why, scope handed to coplan, follow-ups}

<!-- kind: D1 copy-paste | D2 parallel reimpl | D3 forked-and-drifted · tier: C1 extract | C2 parameterize | C3 compose · status: open | building | done -->
