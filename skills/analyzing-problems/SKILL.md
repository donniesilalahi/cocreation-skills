---
name: analyzing-problems
description: Systematically diagnose root causes for bugs, errors, and unexpected behavior. Use this skill when something is broken and you need structured analysis instead of guessing.
---

# Analyzing Problems

## Purpose

Apply a structured, repeatable process to identify the true root cause of issues rather than treating symptoms.

## When to Use

- A bug is reported or an error occurs
- Behavior differs from expectations
- A fix didn't work or the issue keeps recurring
- You need to explain why something broke

## How to Use

1. **Reproduce** the problem consistently
2. **Gather** relevant logs, stack traces, and context
3. **Isolate** the minimal conditions that trigger it
4. **Hypothesize** potential causes
5. **Test** each hypothesis systematically
6. **Verify** the root cause before proposing fixes

## Memory Bank

Save each analysis as its own file in the memory bank, named after the problem:
```
.agents/skills/analyzing-problems/memory-bank/login-timeout.md
```

Copy `_template.md` as a starting point and keep its frontmatter (`title`, `date`, `status`) filled in—those fields become the columns in the index. Do **not** write into `ANALYSIS.md`—that file is the auto-generated index.

After adding or updating a record, refresh the index:
```bash
node .agents/skills/analyzing-problems/index.js
```

This regenerates `ANALYSIS.md` with a link to every analysis in the folder.

## Analysis Template

```markdown
## Problem: [Short description]

- **Symptoms**: [What is happening?]
- **Expected**: [What should happen?]
- **Reproduction**: [Steps to trigger]
- **Hypotheses**:
  1. [First guess]
  2. [Second guess]
- **Tests**:
  1. [Test 1 → Result]
  2. [Test 2 → Result]
- **Root cause**: [Confirmed cause]
- **Fix**: [Solution or next step]
```

## Principles

- Never assume; verify with evidence
- Change one variable at a time
- Document dead ends—they save time later
