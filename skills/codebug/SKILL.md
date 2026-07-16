---
name: codebug
description: The "diagnose" loop. Systematically diagnose root causes for bugs, errors, and unexpected behavior. Use this skill when something is broken and you need structured analysis instead of guessing — the core engine jumps here when coverify finds a failure.
---

# Analyzing Problems

The doer is **codebugger**. This is the **diagnose** loop the core engine jumps to when `coverify` finds a failure; it feeds confirmed fixes back to `cobuild` and recurring lessons to `colearn`.

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
.agents/skills/codebug/memory-bank/2026-06-26-login-timeout.md
```

Copy `_template.md` as a starting point and keep its frontmatter (`title`, `date`, `status`) filled in—those fields become the columns in the index. Do **not** write into `ANALYSIS.md`—that file is the auto-generated index.

After adding or updating a record, refresh the index:
```bash
node .agents/skills/codebug/index.mjs
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

## Guardrail — re-verify against the full spec, not the last fix

**Fixing the named symptom manufactures the next false pass.** When you diagnose round *N* by its
reported symptom and fix exactly that, round *N+1* silently adopts that symptom as the whole pass
bar — so the next defect, which the same spec would have caught, sails through because you only
checked "is the last thing fixed?" Always re-verify a fix against the **full original spec**, never
against the single symptom you just closed. A green on "the reported bug is gone" is not a green on
"the behavior is correct."

## Self-eval gate (close the loop)

- **Root cause confirmed + fix verified** → PASS forward to `cobuild` to apply it, then `coverify` to re-check; log the lesson to `colearn`.
- **Hypotheses exhausted, still not reproduced** → re-loop with fresh evidence, bounded retries (default: cancel after ~3 passes, not extend the hunt).
- **Needs a product/design decision or access you don't have** → escalate to the human.
- **Diagnosis reveals systemic drift across screens** → cross-loop to `coaudit`; if it's a hardening/robustness gap, hand to `coharden`.

## Principles

- Never assume; verify with evidence
- Change one variable at a time
- Document dead ends—they save time later
