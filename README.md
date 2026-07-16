# Co-creation Skills

An ecosystem of **loops** that help AI helpers (like Claude, Cursor, or Kimi) co-create products
with you — from strategy and research through plan, design, build, test, ship, and marketing.

Each skill is one closed loop: it does its step, checks its own work, then decides what happens
next (advance, repeat, ask you, or jump to a specialized loop). One master skill — **`/cocreator`**
— knows them all, recommends which to run, and delegates each to the right doer.

The thinking behind this lives in [`docs/cocreator/PLAYBOOK.md`](docs/cocreator/PLAYBOOK.md): AI
changes velocity, not principles — so human judgment concentrates at the two ends (shaping a thing
right, and checking it shipped right) while the slow manual middle collapses.

## The loops

| Skill (the action) | Doer agent | What it does |
|-------|-------|---------------------|
| **`/cocreator`** | — | Master loop. Recommends which loops to run and delegates each to its doer. |
| **coshape** | coshaper | Frame the problem, set the appetite, write the pitch. |
| **coresearch** | coresearcher | Discovery and evidence; red-team the load-bearing assumptions. |
| **coplan** | coplanner | Break big tasks into small, tracked, verifiable steps. |
| **codesign** | codesigner | Design the solution (UI/UX) and hand it to build. |
| **cobuild** | cobuilder | Build it against the plan. (core loop — "make") |
| **coverify** | coverifier | Test and QA: behavior and visuals vs. the spec. (core loop — "check") |
| **codebug** | codebugger | Find the real root cause when something breaks. |
| **cochangelog** | cochangelogger | Record what shipped as a simple changelog list. |
| **colearn** | colearner | Capture and recall lessons; turn repeat mistakes into guardrails. (core loop — "learn") |
| **coaudit** | coauditor | Specialized loop: find UI that drifted out of consistency and fix it. |
| **coconsolidate** | coconsolidator | Specialized loop: fold duplicated code/logic into one customizable master. |
| **coharden** | cohardener | Specialized loop: harden the edge cases. |
| **coport** | coporter | Specialized loop: port a design (artboard/spec) into native UI with zero drift. |

Every loop also runs **standalone** — `cochangelog` needs no prior plan. When two are paired, they
cross-reference each other (a plan and its changelog each link the other).

> **Renamed in 0.2.0.** The old skill names map to: `planning-todos → coplan`,
> `analyzing-problems → codebug`, `design-qa → coverify`, `consistency-audit → coaudit`,
> `documenting-implementations → cochangelog`, and
> `documenting-lesson-learned` + `accessing-lessons-learned` → `colearn` (merged).

## How to install

```bash
npx skills@latest add donniesilalahi/cocreation-skills
```

Interactive picker — choose which skills to install, which AI agents to target, project vs. global scope, and symlink vs. copy. Works with Claude Code, Cursor, Codex, Gemini CLI, and most others out of the box.

### Also want automatic note indexing on every commit?

The interactive picker installs skills but skips the git hook. To get the hook too, run the bundled installer after:

```bash
# Add the git hook to an already-installed project
npx @donniesilalahi/cocreation-skills --project --no-hook  # installs/updates skills
# or just set the hook up manually — see below
```

Or skip the picker entirely and use the bundled installer directly:

```bash
# All skills + git hook
npx @donniesilalahi/cocreation-skills --project

# Only specific skills
npx @donniesilalahi/cocreation-skills coplan codebug --project

# Update SKILL.md only — preserves memory-bank/ (your notes stay intact)
npx @donniesilalahi/cocreation-skills --project --update

# Overwrite everything including memory-bank/
npx @donniesilalahi/cocreation-skills --project --force
```

## Install as a plugin

All three tools read the same `skills/<name>/SKILL.md` files — the plugin manifests below are just
a thin, generated wrapper that makes the whole set installable as one unit. This is a parallel path
to the `npx` installer above, not a replacement.

**Claude Code** — two separate commands, run one at a time (don't paste both together):

Step 1 — add the marketplace. When the "Add Marketplace" prompt asks for a source, enter **only**
this (nothing else on the line):

```
/plugin marketplace add donniesilalahi/cocreation-skills
```

Step 2 — then, as a separate command, install the plugin:

```
/plugin install cocreation@cocreation-skills
```

Verify with `claude plugin details cocreation@cocreation-skills` — it should list all 14 skills.
Once installed, invoke skills namespaced: `/cocreation:coplan`, `/cocreation:cocreator`, etc.

> Working from a local clone instead? Point the marketplace at your checkout's **real absolute
> path** (not the literal example) — e.g. `/plugin marketplace add ~/Dev/Projects/cocreation-skills`.

**Codex**:

```
codex plugin marketplace add donniesilalahi/cocreation-skills
```

Then browse and install from `/plugins`. Codex also reads `.claude-plugin/marketplace.json`
directly, so either manifest works.

**Cursor**: add this repo as a plugin, or skip the manifest entirely — Cursor also scans
`.agents/skills/` (and `.cursor/skills/`) directly, so the skills load without any plugin install.

No manifest here is published to a public catalog — install is always from a local path or this
repo's own git URL.

## How to use the skills

Each skill has a **notes folder** (called `memory-bank/`). You and your AI helper write notes there as simple text files.

For example, with the `coplan` skill, you might create a file like this:

```
.agents/skills/coplan/memory-bank/
  └── 2026-06-26-fix-login-bug.md
```

Notes are named `YYYY-MM-DD-short-title.md` — the date and title tell you at a glance when it was
written and what it worked on.

Inside that file, you write your plan in plain English. The AI helper reads it and helps you stay on track.

### Update your note index by hand

If you ever want to update the index without committing, run:

```bash
# Update one skill
node .agents/skills/coplan/index.mjs

# Update all skills at once
for d in .agents/skills/*/; do
  [ -f "$d/index.mjs" ] && node "$d/index.mjs"
done
```

### Set up the git hook manually

If you installed via `npx skills add` or skipped the hook with `--no-hook`, you can set it up later with this one-liner:

```bash
mkdir -p .git/hooks && cat > .git/hooks/pre-commit << 'HOOK'
#!/bin/sh
cd "$(git rev-parse --show-toplevel)" || exit 1
for d in .agents/skills/*/; do
  [ -f "$d/index.mjs" ] && node "$d/index.mjs"
done
git diff --name-only | grep -E '^\.agents/skills/[^/]+/memory-bank/' | while read -r f; do git add "$f"; done
git ls-files --others --exclude-standard | grep -E '^\.agents/skills/[^/]+/memory-bank/' | while read -r f; do git add "$f"; done
HOOK
chmod +x .git/hooks/pre-commit
```

## Each project has its own notes

Your notes from Project A stay in Project A. Your notes from Project B stay in Project B. They never mix together.

## How can I help make this better?

Anyone can help. Here is how:

1. Click **Fork** on GitHub to make your own copy.
2. Make your changes.
3. Run `npm run validate` to make sure everything is okay.
4. Open a **Pull Request** so we can add your changes.

If you want to add a new skill, look at `template/SKILL.md` to see how skills are written. Then make a new folder in `skills/` and follow the same pattern.

Be kind. Be helpful. Everyone is welcome.

## License

You can use this for anything you want. You can change it. You can share it. You can even sell it. No restrictions. See [LICENSE.md](LICENSE.md) for the full text.
