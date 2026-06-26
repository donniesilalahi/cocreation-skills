# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

An npm package (`@donniesilalahi/cocreation-skills`) that ships reusable **Agent Skills** — markdown guides that tell AI helpers how to plan, debug, document, and recall work. Plain Node.js (ES modules, `node:*` only), **zero dependencies**, Node >= 18. Not a workspaces monorepo: each skill under `skills/<name>/` is fully self-contained.

## Commands

- `npm run validate` — `scripts/validate-skills.js`, enforces SKILL.md rules (below). Run after editing any SKILL.md.
- `npm run update-indices` — regenerates every skill's `memory-bank/` index table.
- `prepack` runs both automatically before publish.

## SKILL.md rules (enforced by validate-skills.js)

- Allowed frontmatter fields ONLY: `name`, `description`, `license`, `compatibility`, `metadata`, `allowed-tools`. Any other field fails validation.
- `name` must equal the directory name, be kebab-case (`^[a-z0-9]+(-[a-z0-9]+)*$`), ≤ 64 chars.
- `description` required, ≤ 1024 chars (cover both *what* it does and *when* to use it).
- `compatibility` ≤ 500 chars.
- Whole SKILL.md ≤ 500 lines — move longer detail into a `references/` subdir (see `marketing-capture/references/`).

New skills: copy `template/SKILL.md` into `skills/<name>/`, follow the same section layout. Or use `/new-skill`.

## Memory bank pattern

Skills with recall/tracking have `skills/<name>/memory-bank/`: one UPPERCASE index file (e.g. `PLAN.md`) whose frontmatter has a `columns:` spec, individual record `.md` files, a `_template.md`, and an `index.js` that regenerates the table from the records (skips `_*` files). Run the skill's `index.js`, or `npm run update-indices` for all.

## Release flow

CI (`.github/workflows/publish.yml`) publishes to npm on every push to `main`, but only if `package.json` `version` is new. So: **bump the version in `package.json` as part of the PR** that ships a change. Don't push to main without a bump if you intend to release.

## Git workflow

Work on a feature branch and open a PR — don't commit directly to `main`. Commit messages use Conventional Commits (`feat:`, `fix:`, `docs:`, `ci:`, `refactor:`).

## Gotchas

- `.githooks/pre-commit` (dev hook) auto-runs `update-indices` and `git add`s changed `memory-bank/` index files. The installer `cli.js` sets up an equivalent hook in consumer projects.
- Installed skills live at `.agents/skills/` (project) or `~/.agents/skills/` (global) — NOT `skills/` (that's the source layout in this repo).
- Installer flags: `--update` refreshes SKILL.md but preserves `memory-bank/`; `--force` overwrites everything including notes.
- `.claude-plugin/marketplace.json` lists skills for plugin discovery — keep it in sync when adding/removing a skill.
