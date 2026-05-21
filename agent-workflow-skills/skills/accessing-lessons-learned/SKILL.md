---
name: accessing-lessons-learned
description: Retrieve and apply previously documented lessons from a project's memory bank before starting new work. Use this skill to avoid repeating past mistakes, leverage proven solutions, and ground current decisions in historical context.
---

# Accessing Lessons Learned

## Purpose

Before starting a new task, bug fix, or feature, consult the project's accumulated knowledge to make better decisions faster.

## When to Use

- Starting work on a new feature or bug fix
- Choosing between multiple implementation approaches
- Encountering an error pattern you've seen before
- Onboarding to a project or returning after a break

## How to Use

1. Open the `documenting-lesson-learned` skill's memory bank
2. Search `LEARNING.md` and individual lesson files for keywords related to your current task
3. Apply relevant lessons to your current work
4. If no applicable lessons exist, proceed with your best judgment

## Memory Bank Location

Lessons are stored by the `documenting-lesson-learned` skill:

```
.agents/skills/documenting-lesson-learned/memory-bank/
├── LEARNING.md          (auto-generated index)
├── _template.md         (template for new lessons)
└── *.md                 (individual lesson records)
```

## Output Format

When referencing a lesson, cite:
- The lesson title
- The date it was learned
- The specific insight or constraint

## Example

```
Lesson: "Next.js API routes fail with large payloads on Vercel" (2024-03-15)
Insight: Keep API route responses under 4.5MB or use streaming.
Applying: Will implement chunked upload instead of single large response.
```
