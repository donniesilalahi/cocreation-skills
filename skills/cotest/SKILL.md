---
name: cotest
description: The "test" loop — QA testing against the spec. Systematic QA of built output against Open Design artboards or design specs, and nothing beyond the spec: cross-checking is the whole scope (deeper adversarial evaluation is cochallenge; product-vs-job evaluation is cocritique). Compares marketing captures or live UI against reference designs, documents discrepancies, and produces actionable fix lists with pixel-perfect guidance. The doer is cotester. Use when validating screens after implementation or during design review. Runs on Haiku — checklist cross-checking is mechanical; the verification-trap guardrails still apply. Formerly named coverify.
---

# cotest — test against the spec

The doer is **cotester**. This is the **test** leg of the core make → test loop; it leans on
native `/verify`, `/code-review`, and `/simplify` and routes failures onward to the right loop.
Its scope is deliberately narrow: **cross-check the built output against the spec** — nothing
more. Whether the spec itself holds up is `cochallenge`'s question; whether the product does the
user's job is `cocritique`'s.

## What I Do

When asked to **QA a screen against design**, **validate pixel perfection**, or **compare marketing captures to artboards**, I run a **two-pass QA process**:

### Pass 1 — Development Check (Code vs. Checklist)
Read the source code for the screen and compare it against the QA checklist below. Look for mismatches in tokens, colors, spacing, component patterns, label strings, layout structure, and state handling *before* looking at screenshots.

### Pass 2 — Visual Check (Screen Captures vs. Checklist)
Inspect the marketing captures (or live UI) and compare them against the same checklist. Verify that what actually rendered matches the Open Design artboard pixel-for-pixel.

### Documentation
1. **Load the reference**: Read Open Design artboards (via MCP or ChromeDevTools preview) or local design files for the canonical layout, colors, typography, spacing, and component usage.
2. **Load the implementation**: Read the source code and inspect marketing captures for the built screen.
3. **Run both passes**: Code checklist first, visual checklist second.
4. **Document in memory-bank**: Write a dated test report with screenshots, discrepancies, severity, and fix instructions.
5. **Produce fix list**: Summarize findings as numbered, actionable items for the developer.

## When to Use

- After implementing a new screen and before shipping
- When marketing captures don't match Open Design artboards
- During design review to catch visual regressions
- When the user says: *"Does this match the design?"*, *"QA this screen"*, *"Compare to artboard"*

## QA Checklist (Systematic)

For every screen, verify:

### 1. Layout & Structure
- [ ] Overall frame size and safe areas match
- [ ] Header/nav bar placement and height
- [ ] Content area bounds and scroll behavior
- [ ] Sheet/modal presentation style (radius, shadow, overlap)

### 2. Typography
- [ ] Font family matches design spec
- [ ] Font size matches artboard
- [ ] Font weight matches (e.g., bold vs regular)
- [ ] Letter spacing / tracking matches
- [ ] Line height / line limit behavior
- [ ] Text color and opacity match

### 3. Colors & Surfaces
- [ ] Background colors match (hero, surface, card, subtle)
- [ ] Gradient angles and stops match
- [ ] Border colors and widths match
- [ ] Opacity values match design tokens

### 4. Icons & Imagery
- [ ] Icon names / assets match artboard
- [ ] Icon size and weight match
- [ ] Icon color/opacity match
- [ ] Photo placeholders / gradients match

### 5. Spacing & Alignment
- [ ] Padding values match design spec
- [ ] Gap between elements matches
- [ ] Inset alignment matches
- [ ] Divider placement and style

### 6. Components
- [ ] Pills: size, radius, border, active vs idle state
- [ ] Buttons: size, radius, background, stroke
- [ ] Cards: radius, shadow, dashed border style
- [ ] Input fields: label placement, placeholder style, editing state

### 7. Interactions & States
- [ ] Empty states handled
- [ ] Loading states handled
- [ ] Error states handled
- [ ] Editing mode vs view mode

### 8. Copy & Labels
- [ ] All text strings match artboard exactly
- [ ] Button labels match
- [ ] Placeholder text matches
- [ ] No hardcoded strings that should be parameterized

## Format & Location

> **Storage:** Resolve `workspaceRoot` from `.agents/workspace/cocreation.yaml` (default `.agents`).
> In `local`, write the full record to `<workspaceRoot>/skills/<name>/memory-bank/` and refresh its
> index. In `linear-primary`, write the human-facing artifact through the active backend and keep
> provider metadata, links, and the local navigation/index cache; never write project records into
> the plugin cache.


**Directory**: `.agents/skills/cotest/memory-bank/`  
**File naming**: `YYYY-MM-DD-HHmm_{screen-slug}_qa.md` (e.g., `2026-06-11-0900_home-screen_qa.md`)  
**Index**: `memory-bank/TEST.md` (auto-generated)

Copy `_template.md` for each report and keep its frontmatter (`title`, `date`, `artboard`, `status`) filled in—those fields become the columns in `TEST.md`. After writing or updating a report, refresh the index:

```bash
node .agents/skills/cotest/index.mjs
```

Do **not** write into `TEST.md` directly—it is regenerated from the reports.

## Test Report Template

```markdown
---
title: Screen name
date: YYYY-MM-DD
artboard: Artboard reference
status: needs-fix
---

# Test Report — {Screen Name}

## Summary

{N} discrepancies found, {M} critical.

## Discrepancies

### 1. {Title}
- **Severity**: critical / major / minor
- **Location**: {element}
- **Expected**: {design value}
- **Actual**: {code value}
- **Fix**: {actionable instruction}

## Verification

### Pass 1 — Development Check
- [ ] Code reviewed against QA checklist
- [ ] Token / color / spacing / typography issues documented
- [ ] Component usage matches artboard

### Pass 2 — Visual Check
- [ ] Marketing captures reviewed against QA checklist
- [ ] Discrepancies verified with ChromeDevTools MCP artboard inspection
- [ ] Pixel-perfect confirmed

### Final
- [ ] Fixes applied
- [ ] Marketing capture re-run
- [ ] Artboard comparison approved

## Notes

{Any follow-ups, blocked items, or design questions}
```

## Inspecting Artboards with ChromeDevTools MCP

Open Design artboards render in a browser preview. Use the **ChromeDevTools MCP** to inspect them:

1. Open the artboard preview URL from `mcp__open-design__get_project` or `mcp__open-design__get_run`.
2. Use `mcp__chrome-devtools__take_snapshot` to grab the accessibility/element tree.
3. Use `mcp__chrome-devtools__evaluate_script` to read computed CSS values:
   - `getComputedStyle(element).fontSize`
   - `getComputedStyle(element).color`
   - `getComputedStyle(element).paddingLeft`
   - `element.getBoundingClientRect()` for exact dimensions and positions
4. Use `mcp__chrome-devtools__take_screenshot` to capture the full artboard for side-by-side comparison.
5. When inspecting Open Design JSX source, search for the artboard component name to find exact token values and child component structures.

This lets you extract precise design values (e.g., exact padding, border radii, opacity hex codes) to compare against the code and screenshots.

## Workflow

1. **Load reference**
   - Read Open Design artboard JSX/source via MCP
   - Open preview in ChromeDevTools MCP and inspect exact styles
2. **Load implementation**
   - Read source code for the screen
   - Locate marketing capture PNGs for the screen
3. **Pass 1 — Development check**: Run the QA checklist against the code
4. **Pass 2 — Visual check**: Run the QA checklist against the screenshots
5. **Write report**: Persist to `memory-bank/`
6. **Summarize fixes**: Numbered, actionable list for the user
7. **Fix & re-verify**: Apply fixes, re-run capture, update report

## Native tooling

`/verify` (run the app and observe behavior vs spec) · `/code-review` (catch correctness bugs in the diff) · `/simplify` (flag cleanups). Use these alongside the visual passes above.

## Verification traps (always-on guardrails)

Graduated from real failures — a tester that ignores these passes broken work.

- **The false-PASS is invisible — hunt it deliberately.** Adversarial checks (refuters, code review)
  only scrutinize *claimed discrepancies*, so a tester's wrong **PASS** is never challenged and then
  becomes "evidence" in the record that the screen is fine. A verdict like *"4-stop gradient —
  passing"* once stood over a **flat** frame. For every PASS, re-derive the expected value from the
  spec and confirm the capture actually shows it — don't accept "looks right."
- **Distinctness proves difference, not correctness.** A hash/capture matrix showing every state is
  *distinct* only proves the states differ — a broken layout hashes distinct too. Pair every
  distinctness check with a **content assertion** (an expected token/element/string is present), or
  it passes garbage for being unique.
- **The capture/seed harness must RESET, not be idempotent.** Date-relative fixtures + a persistent
  store + an `if !alreadySeeded { seed() }` guard = after the seed date rolls (e.g. past midnight)
  seeding is silently skipped forever and you verify against stale/empty state. **Wipe and reseed on
  every launch**; never gate seeding behind an "already seeded" flag.

## Self-eval gate (close the loop)

- **All passes green, behavior + pixels match spec** → PASS forward: ship, or hand back to `cochangelog` to record what shipped.
- **Discrepancies found** → re-loop with the developer to apply fixes, re-capture, re-check (bounded retries; default: cancel/park the screen, not extend indefinitely).
- **Spec itself is ambiguous or the artboard is missing** → escalate to the human.
- **Defect is a logic bug** → cross-loop to `codebug`; **same element drifted across many screens** → cross-loop to `coconsolidate`; **robustness gap** → `coharden`.
- **Backprop:** every failure hands a lesson to `colearn` (what broke, the guardrail to prevent it). A bug-class that keeps recurring graduates into a guardrail. This is how the loop self-learns.

## Relationship to Other Skills

- **`cochallenge`**: evaluates the *decision artifacts* (direction/spec/plan) before build; cotest evaluates the *built output* against the spec after build.
- **`cocritique`**: evaluates the shipped product against the JOB; cotest never asks whether the spec was worth building.
- **`codebug`** / **`coconsolidate`** / **`coharden`**: where cotest routes failures (logic bug / cross-screen drift / robustness gap).
