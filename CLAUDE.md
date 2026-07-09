# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

An npm package (`@donniesilalahi/cocreation-skills`) that ships an **ecosystem of `co-*` Agent
Skills** for human–AI product co-creation — markdown guides that tell AI helpers how to shape,
research, plan, design, build, verify, debug, document, market, and learn. A master skill
`/cocreator` orchestrates the rest and delegates each loop to a doer sub-agent (via the Agent tool,
with model overrides). Plain Node.js (ES modules, `node:*` only), **zero dependencies**, Node >= 18.
Not a workspaces monorepo: each skill under `skills/<name>/` is fully self-contained.

**Design docs live in `docs/cocreator/`:** `PLAYBOOK.md` (principles — the foundation; it wins over
any skill on conflict), `ROADMAP.md` (the loop architecture + skill↔agent roster + model tiers),
`RESEARCH.md` (sources). Read `ROADMAP.md` before adding or renaming a loop.

## Commands

- `npm run validate` — `scripts/validate-skills.js`, enforces SKILL.md rules (below). Run after editing any SKILL.md.
- `npm run update-indices` — regenerates every skill's `memory-bank/` index table.
- `prepack` runs both automatically before publish.

## SKILL.md rules (enforced by validate-skills.js)

- Allowed frontmatter fields ONLY: `name`, `description`, `license`, `compatibility`, `metadata`, `allowed-tools`. Any other field fails validation.
- `name` must equal the directory name, be kebab-case (`^[a-z0-9]+(-[a-z0-9]+)*$`), ≤ 64 chars.
- `description` required, ≤ 1024 chars (cover both *what* it does and *when* to use it).
- `compatibility` ≤ 500 chars.
- Whole SKILL.md ≤ 500 lines — move longer detail into a `references/` subdir (see `comarket/references/`).

New skills: copy `template/SKILL.md` into `skills/<name>/`, follow the same section layout. Or use `/new-skill`.

## Memory bank pattern

Skills with recall/tracking have `skills/<name>/memory-bank/`: one UPPERCASE index file (e.g. `PLAN.md`) whose frontmatter has a `columns:` spec, individual record `.md` files, a `_template.md`, and an `index.mjs` that regenerates the table from the records (skips `_*` files). Run the skill's `index.mjs`, or `npm run update-indices` for all.

Record files are named `YYYY-MM-DD-kebab-title.md` (date + what it worked on), with frontmatter `title`, `date`, `status`, and optional cross-refs (`plan:`, `changelog:`) linking paired records. `colearn` lesson records also carry `tier: lesson|skill|subagent` + a hit-count for the graduation path (recurring lessons get promoted to skills, then sub-agents).

## Co-working workspace (human ↔ AI ownership)

One workspace at the consumer project's `.agents/workspace/`. Inside it, **`raw/` is human-owned** — the AI reads it as the source of truth and never writes there (briefs, references, source data). **Everything else is the AI's** — the rest of `workspace/` (AI working area / output) and every `skills/<name>/memory-bank/`. Loop records may point at a `raw/` input and the output they produced, keeping the co-working trail explicit. The AI creates `.agents/workspace/raw/` on first use; the installer ships only `skills/`, so there's nothing to scaffold in this source repo.

## Release flow

CI (`.github/workflows/publish.yml`) publishes to npm on every push to `main`, but only if `package.json` `version` is new. So: **bump the version in `package.json` as part of the PR** that ships a change. Don't push to main without a bump if you intend to release.

## Git workflow

Work on a feature branch and open a PR — don't commit directly to `main`. Commit messages use Conventional Commits (`feat:`, `fix:`, `docs:`, `ci:`, `refactor:`).

## Gotchas

- `.githooks/pre-commit` (dev hook) auto-runs `update-indices` and `git add`s changed `memory-bank/` index files. The installer `cli.js` sets up an equivalent hook in consumer projects.
- Installed skills live at `.agents/skills/` (project) or `~/.agents/skills/` (global) — NOT `skills/` (that's the source layout in this repo).
- Installer flags: `--update` refreshes SKILL.md but preserves `memory-bank/`; `--force` overwrites everything including notes.
- `.claude-plugin/marketplace.json` lists skills for plugin discovery — keep it in sync when adding/removing a skill.
