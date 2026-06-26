---
name: colearn
description: The "learn" step of the core loop. Capture lessons from completed or failed work, recall relevant lessons before new work, and graduate recurring lessons into guardrails. Use after fixing a bug, finishing a feature, or discovering a better pattern (capture); before starting a task, choosing an approach, or onboarding (recall); and whenever the same lesson keeps firing (graduate). Self-learning, self-updating guardrails — not a write-only log.
---

# colearn — capture, recall, graduate

The doer is **colearner**. This is the "learn" leg of the core make → check → learn loop. It runs
in three modes; pick by what you're doing.

## Purpose

Turn experience into guardrails that make the same mistake harder next time. Lessons are
**self-updating** (corrected when superseded, not just appended) and **self-promoting** (recurring
lessons graduate from advisory note → applied skill → enforcing sub-agent).

## When to Use

- **Capture** — after fixing a non-obvious bug, finishing a feature, or finding a better pattern.
  The core loop calls this automatically when `coverify` or `codebug` finds a failure (the backprop
  reflex): every failure writes a lesson.
- **Recall** — before starting a feature/bug fix, when choosing between approaches, when you hit a
  familiar error, or when onboarding / returning to a project.
- **Graduate** — when the same lesson or bug-class keeps firing (hit-count climbs).

## How to Use

### Recall (do this first, before new work)
1. Skim `memory-bank/LEARNING.md` (the index) for titles/tags related to the task.
2. Open the matching records; apply their Prevention/Solution to the current work.
3. Cite what you applied: title, date, and the specific insight. If nothing matches, proceed on
   best judgment.

### Capture (after work, or on a verify/debug failure)
1. Name the insight in one searchable line.
2. Save a record (template below) as `YYYY-MM-DD-kebab-title.md`.
3. If a record for this lesson already exists, **update it** and bump `hits` — don't duplicate.
4. Refresh the index: `node .agents/skills/colearn/index.js`.

### Graduate (lesson → skill → sub-agent)
Promotion is triggered by **recurrence**, tracked in each record's `hits` field:
- **`tier: lesson`** (default) — one record. Advisory; recalled before related work.
- **`tier: skill`** — when `hits` keeps climbing, fold the lesson into a checklist inside the
  relevant `co-*` skill (or a small new skill) so it's applied by default, not by luck.
- **`tier: subagent`** — when the guardrail needs autonomous enforcement on every run (e.g. an
  always-on reviewer), add it to `/cocreator`'s roster as a dispatched doer.
Record the promotion by updating `tier` in the record and noting where it graduated to.

## Memory Bank

Records live in `skills/colearn/memory-bank/` (installed: `.agents/skills/colearn/memory-bank/`).
Copy `_template.md`, keep its frontmatter filled. `LEARNING.md` is the auto-generated index — never
edit it by hand.

## Template

```markdown
---
title: Short, searchable title
date: YYYY-MM-DD
tags: tag-one, tag-two
tier: lesson
hits: 1
---

# Lesson: [Short, searchable title]

- **Context**: [What were you working on?]
- **Problem**: [What went wrong?]
- **Root cause**: [Why did it happen?]
- **Solution**: [What fixed it or what pattern works?]
- **Prevention**: [How to avoid this next time — this is the guardrail.]
- **Graduated to**: [skill/sub-agent name, once promoted — else leave blank]
```

## Self-eval gate (close the loop)

End every run by routing:
- **Captured + indexed** → PASS, return to the loop you came from.
- **Found a matching lesson on recall** → apply it, cite it, then continue.
- **`hits` crossed your promotion bar** → graduate the lesson, note where, then PASS.

## Principles

- One insight per record; keep it atomic and searchable.
- Update, don't pile up — a superseded lesson is corrected in place.
- The Prevention line is the actual guardrail; make it concrete and actionable.
- Graduation is data-driven (recurrence), not opinion.
- Include versions/environment details when relevant.
