---
name: new-skill
description: Scaffold a new Agent Skill in this repo from template/SKILL.md into skills/<name>/, enforcing the validate-skills.js rules so it passes validation on the first run. Use when adding a new skill to cocreation-skills.
disable-model-invocation: true
---

# New Skill

## Purpose

Create a new skill folder under `skills/` that passes `npm run validate` immediately and matches repo conventions.

## When to Use

When the user wants to add a new skill to this repo. Invoke with `/new-skill <name>` (kebab-case).

## How to Use

1. Read `$ARGUMENTS` for the skill name. Validate it: lowercase kebab-case (`^[a-z0-9]+(-[a-z0-9]+)*$`), ≤ 64 chars, not already present in `skills/`. If invalid or missing, ask for a valid name.
2. Read `template/SKILL.md` to get the current section layout. Do NOT hardcode it from memory.
3. Create `skills/<name>/SKILL.md` from the template. Set frontmatter:
   - `name:` must equal `<name>` exactly.
   - `description:` ≤ 1024 chars, stating both what the skill does and when to use it. Draft from the user's intent; confirm if unclear.
   - Use ONLY allowed fields: `name`, `description`, `license`, `compatibility`, `metadata`, `allowed-tools`. Drop the template's placeholder `metadata.internal` unless the skill is internal-only.
   - Keep the whole file ≤ 500 lines.
4. If the skill needs recall/tracking, scaffold `skills/<name>/memory-bank/` following an existing skill (e.g. `coplan`): an UPPERCASE index file with a `columns:` frontmatter spec, a `_template.md`, and an `index.js` copied/adapted to regenerate the table. Otherwise skip.
5. Run `npm run validate` and fix anything it flags.
6. Add the skill to `.claude-plugin/marketplace.json` if it should be discoverable as a plugin.
7. Remind the user to bump `package.json` version in the PR if they want to publish (see CLAUDE.md release flow).

## Principles

- Match existing skills' tone and structure — read one before writing.
- Move detail > 500 lines into a `references/` subdir; keep SKILL.md focused.
- Never invent frontmatter fields; the validator rejects unknown ones.
