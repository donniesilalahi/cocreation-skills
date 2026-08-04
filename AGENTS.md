# AGENTS.md

This repo ships **cocreation**, an ecosystem of `co-*` Agent Skills for human–AI product
co-creation.

## Skills

Skills live at `skills/<name>/SKILL.md` and load natively via the shared Agent Skills standard —
scanned from `.agents/skills/`, `.cursor/skills/`, and `.claude/skills/` (project or global). No
per-tool rewrite needed.

- **cocreator** — master loop; routes a request to the right co-* loop(s) and self-delegates.
- **coframe** — frame the problem, fix the appetite, write a tight pitch before building.
- **coresearch** — red-team the riskiest assumption a plan rests on before anyone builds on it.
- **coplan** — break non-trivial work into clear, tracked, verifiable steps.
- **cospecify** — author the buildable solution spec: screens, states, data shapes, interfaces.
- **cobuild** — implement the plan in small, reviewable increments.
- **coverify** — visual QA against design references; produces actionable fix lists.
- **codebug** — systematically diagnose root causes for bugs and unexpected behavior.
- **coharden** — close edge cases and failure modes after the happy path works.
- **cochangelog** — record what shipped as a simple, dated changelog.
- **colearn** — capture, recall, and graduate lessons into guardrails.
- **cocritique** — judge whether the product does the user's job optimally, and what direction change follows.
- **coconsolidate** — one master, many call sites: fold duplicated logic *and* drifted UI elements back into one.
- **codraw** — render a cospecify spec into faithful Open Design artboards + a git-tracked ledger.
- **cotranslate** — port a design source (artboard/mock/spec) into native UI with zero drift.

## Start here

Start with `/cocreator` (or `cocreation:cocreator` when installed as a plugin) — it's the master
loop and knows which skill(s) to run for a given request.

## More

- `docs/cocreator/PLAYBOOK.md` — principles; wins over any skill on conflict.
- `docs/cocreator/ROADMAP.md` — the loop architecture + skill↔agent roster + model tiers.
- `docs/cocreator/PACKAGING.md` — how this repo is packaged/installable as a plugin.
