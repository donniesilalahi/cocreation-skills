---
name: cochangelog
description: Record what shipped as a simple, dated changelog list — one line per change. Use after completing a feature, fix, or refactor to leave a durable trail. Runs standalone (no plan required) or paired with a coplan plan, in which case the two cross-reference each other. Keep it a list, not an essay.
---

# cochangelog — record what shipped

The doer is **cochangelogger**. This is the "record" step after the core loop ships something.
It is deliberately lightweight: a **changelog list**, not an implementation essay.

## Purpose

Leave a durable, scannable trail of what changed and why — enough that future-you (or a teammate)
can reconstruct the history without re-reading every diff. One line per change.

## When to Use

- After completing a feature, fix, or refactor.
- When you want a shippable CHANGELOG-style record of a chunk of work.
- Standalone is fine — a changelog needs no prior plan.

## How to Use

1. List each change as one line: `- <verb> <what> — <why, if not obvious>`.
2. Group under a dated heading (the record filename carries the date too).
3. Link the files/PRs only where it helps; don't restate the whole diff.
4. **If this work had a `coplan` plan, cross-reference it** (see below).
5. Refresh the index: `node .agents/skills/cochangelog/index.mjs`.

## Pairing with a plan (cross-reference)

A changelog runs standalone, but when it documents work that had a plan, the two link each other:

- In the changelog record frontmatter: `plan: 2026-06-26-fix-login.md`
- In the plan record frontmatter: `changelog: 2026-06-26-fix-login.md`

`/cocreator` wires these automatically when it runs `coplan` → core loop → `cochangelog` in
sequence. Done by hand, just fill both `plan:` and `changelog:` fields so the trail is two-way.

## Memory Bank

Records live in `skills/cochangelog/memory-bank/` (installed: `.agents/skills/cochangelog/memory-bank/`),
named `YYYY-MM-DD-kebab-title.md`. Copy `_template.md`; keep frontmatter filled. `IMPLEMENTATION.md`
is the auto-generated index — never edit it by hand.

## Template

```markdown
---
title: Short change-set name
date: YYYY-MM-DD
scope: feature | fix | refactor | chore
plan: <plan-record.md, if any — else blank>
---

# Changelog: [Short change-set name]

- Added [x] — [why]
- Fixed [y] — [root cause in one phrase]
- Changed [z] — [why]
- Removed [w] — [why]

_Files: `path/a.ts`, `path/b.css`. PR: #123._
```

## Self-eval gate (close the loop)

- **List written + indexed (and `plan:` linked if a plan exists)** → PASS.
- **Found you're explaining instead of listing** → trim back to one line per change.
- **A change hides a lesson** → hand it to `colearn` before closing.

## Principles

- A list, not an essay. Lead with the verb.
- "Why" only when it isn't obvious from the "what."
- One record per shippable chunk; keep it atomic and dated.
