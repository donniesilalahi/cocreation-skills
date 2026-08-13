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
| **codirect** | codirector | Set the product + design direction, fix the appetite, write the pitch. |
| **coresearch** | coresearcher | Discovery and evidence; red-team the load-bearing assumptions. |
| **costudy** | costudier | Reverse-engineer another product's UI/UX — screens, flows, inferred design system — from your own live session. Builds its own pattern library; the live product is the only source. |
| **coplan** | coplanner | Break big tasks into small, tracked, verifiable steps. |
| **cospecify** | cospecifier | Author the buildable solution spec (screens, states, data, interfaces) and hand it to draw/build. |
| **cochallenge** | cochallenger | Devil's advocate: stress-test the direction/spec/plan *before* build — blindspots, first principles, problem-solution fit. |
| **cobuild** | cobuilder | Build it against the plan. (core loop — "make") |
| **cotest** | cotester | Test and QA: behavior and visuals vs. the spec — cross-check only. (core loop — "check") |
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
| **discover** | direction unclear, nothing to build yet | codirect → cochallenge → coresearch |
| **ship** | a small, well-understood change *(the default)* | cobuild ⇄ cotest → cochangelog |
| **feature** | a new capability, uncertain or high blast radius | the full chain, codirect → colearn |
| **design-first** | the UI itself is the deliverable | cospecify → cochallenge → codraw → cotranslate → cotest |
| **fix** | something is broken | codebug → cobuild → cotest → colearn |
| **evaluate** | "is this any good?" | cotest *(vs the spec)* · coconsolidate *(vs itself)* · cocritique *(vs the job)* · cochallenge *(vs the reasoning)* |
| **release-prep** | about to face users | coharden → cotest → completion gate |
| **cleanup** | duplication/drift, behavior unchanged | coconsolidate → cotest |

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
>
> **Renamed & added in 0.15.0.** `coframe → codirect` (`coframer → codirector`, index
> `FRAME.md → DIRECTION.md`) — the Director-of-Product seat: product *and* design direction.
> `coverify → cotest` (`coverifier → cotester`, index `QA.md → TEST.md`) — QA testing strictly
> against the spec. New **`cochallenge`** (`cochallenger`) — the devil's-advocate evaluator for
> decision artifacts pre-build, enforcing the generator/evaluator split.

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

Renames leave the old dirs in place on an npx install (stale) with your notes under the old name —
the installer prints a reminder when it sees them. Current mappings: `coshape → codirect`,
`coframe → codirect`, `codesign → cospecify`, `coport → cotranslate`, `coaudit → coconsolidate`,
`coverify → cotest`. To migrate each pair:

```bash
# example: coframe → codirect (repeat for the others)
mv .agents/skills/coframe/memory-bank/*.md .agents/skills/codirect/memory-bank/ 2>/dev/null
rm -rf .agents/skills/coframe
node .agents/skills/codirect/index.mjs   # rebuild the index so your records show up
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

Verify with `claude plugin details cocreation@cocreation-skills` — it should list all 17 skills and
16 doer agents. Plugin installation supplies shared capabilities; project state remains in the
consuming project.
Once installed, invoke skills namespaced: `/cocreation:coplan`, `/cocreation:cocreator`, etc.

> Working from a local clone instead? Point the marketplace at your checkout's **real absolute
> path** (not the literal example) — e.g. `/plugin marketplace add ~/Dev/Projects/cocreation-skills`.

**Codex** — install the plugin once for the Codex environment/user, then initialize state per
project. Codex separates shared plugin capabilities from project-owned state:

| Install once in Codex | Initialize in each project |
|---|---|
| Skills, doer agents, manifests, and plugin instructions | `.agents/workspace/cocreation.yaml` |
| The reusable `cocreation` plugin bundle | `STATE.md`, `inbox/`, `raw/`, and local indexes |
| No product-specific documentation | Optional shared `workspaceRoot` and Linear references |

### Install the plugin in the ChatGPT desktop app

If `cocreation` is available through your personal, workspace, or public plugin source:

1. Open the ChatGPT desktop app and open the **Plugins** tab.
2. Find `cocreation`, review its details, and install it.
3. Open Codex in the desktop app and start a new chat/session before invoking `/cocreator`.

This repository is distributed through its own Git marketplace rather than the public plugin
catalog. If it does not appear in the desktop app's available sources, use the Codex CLI setup
below once to add the repository marketplace, or have a workspace administrator publish it to a
source visible to the desktop app. Local/repository marketplace availability can vary by surface.

### Install the plugin in Codex CLI

1. Add this repository as a local/repository marketplace. From a shell, run:

   ```bash
   codex plugin marketplace add donniesilalahi/cocreation-skills
   ```

   If the marketplace is already configured, skip this step.

2. Start Codex and enter `/plugins`.
3. Find the `cocreation` plugin under the `cocreation-skills` marketplace, inspect its details,
   and install it. The plugin includes 17 skills and 16 doer agents.
4. Start a new Codex session before using `/cocreator` or another bundled skill. If the plugin is
   installed but a skill is missing, check `/plugins` first and confirm the plugin is enabled.

For a terminal-only install after the marketplace is configured, use:

```bash
codex plugin add cocreation@cocreation-skills
codex plugin list --marketplace cocreation-skills
```

To refresh a Git marketplace after this repository publishes an update:

```bash
codex plugin marketplace upgrade cocreation-skills
```

Then open `/plugins` again if you need to reinstall or enable the updated plugin, and start a new
session. Do not copy the plugin into every repository; the per-project `init` command below is the
project-state step.

The same plugin can be installed from the Codex desktop app's Plugins surface when it is available
there. The IDE extension does not support plugins; use Codex CLI or the ChatGPT desktop app instead.
Codex also reads `.claude-plugin/marketplace.json` directly, so either marketplace manifest works.

### Initialize each project

Installing the plugin does not create project documentation. From each repository, run:

```bash
npx @donniesilalahi/cocreation-skills init
```

For Linear-primary storage, make the choice explicit during initialization:

```bash
npx @donniesilalahi/cocreation-skills init \
  --storage linear-primary \
  --product-type initiative \
  --product-id <linear-initiative-id> \
  --product-url <linear-initiative-url> \
  --linear-workspace-url <linear-workspace-url>
```

The project configuration records the storage mode, whether the product maps to a Linear
`initiative` or `team`, the stable Linear IDs/URLs, and an optional shared workspace root. The
plugin cache is never the place for project-specific records. If Linear tools or authentication are
not available in the host, use `local` mode; the index-first workflow remains the same.

See the [official Codex plugin documentation](https://learn.chatgpt.com/docs/plugins) for the
current plugin browser behavior and session boundary.

**Cursor desktop app** — Cursor is app-first for interactive use:

1. Open the Cursor editor.
2. In the Agent composer, run `/add-plugin`, or open the [Cursor Marketplace](https://cursor.com/marketplace).
3. Find and install `cocreation` at the desired user, team, or workspace scope.

The Cursor CLI is optional for terminal and automation workflows. If this repository is not yet
listed in the Cursor Marketplace, install the skills directly into the project instead:

```bash
npx @donniesilalahi/cocreation-skills --project
```

Cursor also scans `.agents/skills/` (and `.cursor/skills/`) directly, so the app can use the skills
without a marketplace plugin install. In either case, initialize project state separately with
`npx @donniesilalahi/cocreation-skills init` (or ask the in-app agent to run it).

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

## Initialize a project workspace

Install the plugin or skills once at the tool/user level, then initialize state in each consuming
project:

```bash
npx @donniesilalahi/cocreation-skills init
```

This creates a project-owned `.agents/workspace/cocreation.yaml`, `STATE.md`, `inbox/`, `raw/`,
project memory-bank scaffolds, and local indexes without overwriting existing records. The default
mode is local. To use Linear as the human-facing store:

```bash
npx @donniesilalahi/cocreation-skills init \
  --storage linear-primary \
  --product-type initiative \
  --product-id <linear-initiative-id> \
  --product-url <linear-initiative-url> \
  --linear-workspace-url <linear-workspace-url>
```

The configuration records whether the project uses `local`, `linear-primary`, or `mirror` storage,
where its product lives in Linear (`initiative` or `team`), and which shared `workspaceRoot` owns
the state. A product spanning multiple repositories can point several repositories at the same
root:

```bash
npx @donniesilalahi/cocreation-skills init \
  --workspace-root ../product-cocreation \
  --storage linear-primary \
  --product-type initiative \
  --product-id <linear-initiative-id>
```

See [`skills/cocreator/references/artifact-backends.md`](skills/cocreator/references/artifact-backends.md)
and [`skills/cocreator/references/linear.md`](skills/cocreator/references/linear.md) for the
backend contract, index-first behavior, and artifact mapping.

## How to use the skills

Each skill has a **notes folder** (called `memory-bank/`). You and your AI helper write notes there as simple text files. In a configured shared workspace, resolve the path as `<workspaceRoot>/skills/<name>/memory-bank/`; the default `<workspaceRoot>` is `.agents`.

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
