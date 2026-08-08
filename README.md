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
| **coframe** | coframer | Frame the problem, set the appetite, write the pitch. |
| **coresearch** | coresearcher | Discovery and evidence; red-team the load-bearing assumptions. |
| **costudy** | costudier | Reverse-engineer another product's UI/UX — screens, flows, inferred design system — from your own live session. Builds its own pattern library; the live product is the only source. |
| **coplan** | coplanner | Break big tasks into small, tracked, verifiable steps. |
| **cospecify** | cospecifier | Author the buildable solution spec (screens, states, data, interfaces) and hand it to draw/build. |
| **cobuild** | cobuilder | Build it against the plan. (core loop — "make") |
| **coverify** | coverifier | Test and QA: behavior and visuals vs. the spec. (core loop — "check") |
| **codebug** | codebugger | Find the real root cause when something breaks. |
| **cochangelog** | cochangelogger | Record what shipped as a simple changelog list. |
| **colearn** | colearner | Capture and recall lessons; turn repeat mistakes into guardrails. (core loop — "learn") |
| **cocritique** | cocritic | Does the product actually do the user's job — and if not, what direction has to change? (the return edge) |
| **coconsolidate** | coconsolidator | Specialized loop: one master, many call sites — fold duplicated logic *and* drifted UI elements back into one. |
| **coharden** | cohardener | Specialized loop: harden the edge cases. |
| **codraw** | codrawer | Specialized loop: render a spec into faithful Open Design artboards + a git-tracked ledger (feeds cotranslate). |
| **cotranslate** | cotranslator | Specialized loop: port a design (artboard/spec) into native UI with zero drift. |

Every loop also runs **standalone** — `cochangelog` needs no prior plan. When two are paired, they
cross-reference each other (a plan and its changelog each link the other).

## The workflows

You don't have to pick loops by hand. `/cocreator` chooses a **workflow** — a named chain for a
recurring situation — and runs it:

| Workflow | When | Chain |
|---|---|---|
| **discover** | direction unclear, nothing to build yet | coframe → coresearch |
| **ship** | a small, well-understood change *(the default)* | cobuild ⇄ coverify → cochangelog |
| **feature** | a new capability, uncertain or high blast radius | the full chain, coframe → colearn |
| **design-first** | the UI itself is the deliverable | cospecify → codraw → cotranslate → coverify |
| **fix** | something is broken | codebug → cobuild → coverify → colearn |
| **evaluate** | "is this any good?" | coverify *(vs the spec)* · coconsolidate *(vs itself)* · cocritique *(vs the job)* |
| **release-prep** | about to face users | coharden → coverify → completion gate |
| **cleanup** | duplication/drift, behavior unchanged | coconsolidate → coverify |

Each has an **exit gate** — the condition that means the chain closed, not just that its last loop
ran. Enter one directly with `/cocreator fix "checkout 500s on retry"`.

**Built to keep going.** A workflow advances by itself on each PASS — naming it *was* the approval —
and stops on four things only: the exit gate is met, a human genuinely has to decide or do something,
retries run out, or the product direction itself is in question. It records where it is in
`.agents/workspace/STATE.md` (`Workflow:` + `Next:`), so a new session picks the chain back up
instead of asking you what happens next. Full catalog:
[`skills/cocreator/references/workflows.md`](skills/cocreator/references/workflows.md).

> **Renamed in 0.2.0.** The old skill names map to: `planning-todos → coplan`,
> `analyzing-problems → codebug`, `design-qa → coverify`, `consistency-audit → coaudit`
> (later merged into `coconsolidate`, see 0.11.0),
> `documenting-implementations → cochangelog`, and
> `documenting-lesson-learned` + `accessing-lessons-learned` → `colearn` (merged).
>
> **Renamed in 0.8.0.** For clearer, non-native-friendly names that map to the three distinct
> upstream objects — the *problem*, the *work*, the *solution*: `coshape → coframe` (frame the
> problem) and `codesign → cospecify` (write the buildable spec). Doers: `coshaper → coframer`,
> `codesigner → cospecifier`.
>
> **Renamed & merged in 0.11.0.** `coport → cotranslate` (`coporter → cotranslator`) — the skill
> already called itself "the design→implementation translation loop"; the name now says so, and
> `port-manifest.json` becomes `translate-manifest.json` (the old filename is still read).
> `coaudit` is **merged into `coconsolidate`** — they sat on the same axis (many implementations
> compared against each other) with the same fix (extract one master, migrate every call site) and
> differed only in lens, so `coconsolidate` now runs both a **logic lens** and a **visual lens**.
> Running the installer prints a migration hint if you still have the old directories; nothing is
> deleted for you.

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

## Updating an existing install

- **Plugin install** (Claude Code / Cursor / Codex): update the plugin/marketplace in your tool
  (e.g. Claude Code `/plugin` → update). The whole set re-syncs from the repo, so **renamed skills
  replace the old ones automatically** — nothing to clean up.
- **npx install** (skills copied into `.agents/skills/`): re-run
  `npx @donniesilalahi/cocreation-skills@latest --project --update` (refreshes `SKILL.md`, keeps your
  `memory-bank/` notes). The installer **adds** new skills but never deletes — `.agents/skills/` is
  shared with your other skills, so removal is always your call.

### Migrating renamed skills (npx installs only)

`0.8.0` renamed `coshape → coframe` and `codesign → cospecify`. On an npx install the old dirs stay
put (stale) and your notes live under the old name — the installer prints a reminder when it sees
them. To migrate each pair:

```bash
# example: coshape → coframe (repeat for codesign → cospecify)
mv .agents/skills/coshape/memory-bank/*.md .agents/skills/coframe/memory-bank/ 2>/dev/null
rm -rf .agents/skills/coshape
node .agents/skills/coframe/index.mjs   # rebuild the index so your records show up
```

Plugin installs don't need this — the rename is handled by the re-sync.

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

**OpenCode**: OpenCode does not read root `agents/` or the other plugin manifests. From this
checkout, the included `opencode.json` and `.opencode/agents/` make skills and doer agents available
directly. For consumer projects, install the skills plus OpenCode-native doer agents:

```bash
npx @donniesilalahi/cocreation-skills --project --opencode
```

For global agents, use `--global --opencode`. This writes agents to `.opencode/agents/` or
`~/.config/opencode/agents/`, respectively. Restart OpenCode after installation.

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
