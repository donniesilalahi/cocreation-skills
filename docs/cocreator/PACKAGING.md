# PACKAGING — distributing the co-* skills as plugins

How this repo is packaged so its skills **load** and are **installable as a plugin** across
Claude Code, Codex, and Cursor — without publishing to any public catalog.

Read `CLAUDE.md` first (repo layout + SKILL.md rules). This doc is the design of record for the
plugin/manifest layer; `scripts/build-plugin-manifests.js` is its implementation.

## The one insight

Claude Code, Codex, Cursor, and OpenCode consume the **same open "Agent Skills" standard**
— a `skills/<name>/SKILL.md` with `name` + `description` frontmatter — and all four scan the
`.agents/skills/` path that this repo's installer (`cli.js`) already targets. So the skills
**already load** natively in every tool with zero per-tool rewrite.

OpenCode consumes the same skill files, but its agent loader is separate: it scans `.opencode/agents/`
or `~/.config/opencode/agents/`, not root `agents/`. The thin plugin/marketplace manifests make the
skill bundle installable for Claude Code, Codex, and Cursor; OpenCode agents use a generated native
copy. **One source of truth (`skills/*/SKILL.md`), generated tool-specific wrappers.**

## Scope decisions (locked)

- **Granularity:** ONE umbrella plugin bundling all 17 co-* skills + the `/cocreator` master.
  Not per-skill plugins. One install gets the whole loop ecosystem.
- **Namespace:** `cocreation` — skills invoke as `/cocreation:coplan`, `/cocreation:cocreator`, …
- **Maintenance:** a generator emits every manifest from `package.json` + a scan of `skills/`.
  No hand-authored manifests (they drifted once already: marketplace.json 0.2.0 vs package 0.3.0).
- **Publishing:** NONE. No submission to `claude-plugins-community`, `cursor.com/marketplace`, or
  any curated directory. Install is local-path or the author's own git repo only.

## Install UX (no publishing required)

Claude Code, from a local checkout:
```
/plugin marketplace add /Users/<you>/Dev/Projects/cocreation-skills
/plugin install cocreation@cocreation-skills
```
…or from the author's own GitHub repo (still not a public catalog — just a git URL):
```
/plugin marketplace add donniesilalahi/cocreation-skills
/plugin install cocreation@cocreation-skills
```
Verify: `claude plugin details cocreation@cocreation-skills` lists all 17 skills and 16 doer agents.

Codex desktop: install from the ChatGPT desktop app's Plugins tab when the plugin is available in
the active public, personal, or workspace source. This repository is currently distributed through
its Git marketplace, so Codex CLI's `/plugins` flow is the fallback for registering that source.
Start a new session before using the bundled skills. Project state is initialized separately with
`npx @donniesilalahi/cocreation-skills init`; see the README and
`skills/cocreator/references/artifact-backends.md`.

Cursor desktop: install from `/add-plugin` or the [Cursor Marketplace](https://cursor.com/marketplace).
The CLI is optional. For a repository not yet listed in Cursor's Marketplace, use the npx installer
to place skills under `.agents/skills/`; Cursor also scans that path directly.

OpenCode: run `npx @donniesilalahi/cocreation-skills --project --opencode` to install skills into
`.agents/skills/` and doer agents into `.opencode/agents/`. Use `--global --opencode` for global
agents. Restart OpenCode after installation.

### Project state is not plugin state

Install the plugin once at the tool/user level. Each consuming project then initializes its own
state boundary with:

```bash
npx @donniesilalahi/cocreation-skills init
```

The command creates `.agents/workspace/cocreation.yaml`, `STATE.md`, `inbox/`, `raw/`, project-owned
memory-bank scaffolds, and index scripts without overwriting existing records. `workspaceRoot` may
point at a shared directory so multiple repositories use one product history. See
`skills/cocreator/references/artifact-backends.md` for the resolved directory contract.

## Files this adds / changes

| File | Role |
|------|------|
| `.claude-plugin/plugin.json` | NEW. Umbrella plugin manifest (Claude). Components auto-discover from repo root. |
| `.claude-plugin/marketplace.json` | FIX. Version synced to `package.json`; plugin renamed `all-skills`→`cocreation`; `source:"./"`. |
| `.codex-plugin/…` | NEW (generated, unpublished). Codex parity manifest. Exact schema per official Codex spec. |
| `.cursor-plugin/…` | NEW (generated, unpublished). Cursor parity manifest. Exact schema per `github.com/cursor/plugins`. |
| `AGENTS.md` | NEW. Root cross-tool pointer (Linux-Foundation standard, read by all three) at the skill set. |
| `.opencode/agents/` | NEW. Generated OpenCode-native doer agents; omits Claude-only plugin variables and model aliases. |
| `scripts/build-plugin-manifests.js` | NEW. The generator. Single source → all manifests. Idempotent. |
| `package.json` | `build-manifests` script; `prepack` also runs it; manifests get version from here. |
| `README.md` | Install-as-plugin section for all three tools. |

## Generator contract (`scripts/build-plugin-manifests.js`)

- **Input:** `package.json` (name, version, description, author, license, homepage, repository) +
  a directory scan of `skills/*/SKILL.md` (reads each `name` + `description` from frontmatter).
- **Output:** writes the manifest files above plus `.opencode/agents/*.md`, deterministically. Re-running with no source change
  is a no-op (stable key order, trailing newline) — safe to wire into `prepack` and a pre-commit
  hook without spurious diffs.
- **Version:** every manifest's `version` is read from `package.json` — the single source. This is
  what fixes (and prevents) the drift.
- **Validation:** after writing, the generator (or `npm run validate`) confirms the Claude manifest
  passes and the skill list matches the `skills/` directory count.

## Claude manifest shapes (authoritative — Claude Code v2.1.203+)

`.claude-plugin/plugin.json`:
```json
{
  "name": "cocreation",
  "version": "<from package.json>",
  "description": "<from package.json>",
  "author": { "name": "Donnie Silalahi" },
  "homepage": "https://github.com/donniesilalahi/cocreation-skills",
  "license": "MIT"
}
```
Components live at the **plugin root** (repo root here), so `skills/` is auto-discovered — no
`skills:[]` array needed. Do NOT set `version` in both plugin.json and the marketplace entry
(plugin.json wins silently); the generator sets it only where appropriate.

`.claude-plugin/marketplace.json`:
```json
{
  "name": "cocreation-skills",
  "owner": { "name": "Donnie Silalahi", "email": "donniesilalahi@gmail.com" },
  "metadata": { "description": "…", "version": "<from package.json>" },
  "plugins": [
    { "name": "cocreation", "source": "./", "description": "…", "strict": false }
  ]
}
```
`source:"./"` = the repo is its own marketplace + plugin. `strict:false` lets the marketplace entry
be authoritative so a missing/duplicate field in plugin.json can't fail the load.

## Codex / Cursor manifest shapes

Exact dir names + field schemas are pinned from official sources (`developers.openai.com/codex/plugins`,
`github.com/cursor/plugins`) at build time — see the generator. Where an official source does not
confirm a field, the generator emits only confirmed fields and the parity manifest is best-effort
(these tools also load the skills directly via `.agents/skills/`, so the manifest is a convenience,
not a load requirement). Both reference the same `skills/` tree; no skill content is duplicated.

## Update semantics (the memory-bank ownership rule)

The load-bearing distinction: a skill's **body** is code; its **memory-bank records** are per-project
data. They have different owners and different update behavior. In `linear-primary`, the records'
human-facing content lives in Linear, while the project keeps the state head, provider metadata,
links, and a navigation/index cache.

| Thing | Owner | Where it lives | On update |
|-------|-------|----------------|-----------|
| Skill body (`SKILL.md`, `index.mjs`, scripts) | the plugin | plugin cache (`~/.claude/plugins/…`) | replaced wholesale — **never hand-edit in place** |
| memory-bank records (`YYYY-MM-DD-*.md`) | the consumer project | resolved `<workspaceRoot>/skills/<name>/memory-bank/`, git-committed when local | untouched — different location, survives |

**Why it matters:** the plugin cache is refetched/overwritten on `/plugin marketplace update`, so any
writable state *inside* it is lost. The self-learning loop must therefore write records to the
**project**, never the plugin — which is exactly what `coplan/SKILL.md`'s example path already does
(`.agents/skills/coplan/memory-bank/…`). The seed `_template.md` + empty index files (`PLAN.md`, …)
still ship with the plugin as scaffolding; real records accumulate in the project.

Update propagation is pull-based, per user, no push: a plugin user gets a change only when they run
`/plugin marketplace update cocreation-skills` (or on its version/SHA auto-check). With `version` set
in `plugin.json`, they get it when they refetch *and* the version changed — so the existing release
rule (bump `package.json`) drives it through the generator. `npx` users manually re-run
`npx … --update` (refreshes SKILL.md, preserves memory-bank).

## Non-goals

- No public catalog submission.
- No per-skill plugins.
- No forking of SKILL.md content per tool — one source, generated wrappers only.
- `cli.js init` scaffolds the project-owned state boundary; it never overwrites existing records.
