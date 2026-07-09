# AGENTS.md

This repo ships **cocreation**, an ecosystem of `co-*` Agent Skills for human–AI product
co-creation.

## Skills

Skills live at `skills/<name>/SKILL.md` and load natively via the shared Agent Skills standard —
scanned from `.agents/skills/`, `.cursor/skills/`, and `.claude/skills/` (project or global). No
per-tool rewrite needed.

- **cocreator** — master loop; routes a request to the right co-* loop(s) and self-delegates.
- **coshape** — frame the problem, fix the appetite, write a tight pitch before building.
- **coresearch** — red-team the riskiest assumption a plan rests on before anyone builds on it.
- **coplan** — break non-trivial work into clear, tracked, verifiable steps.
- **codesign** — design UI/UX, interfaces, and data shape into a buildable spec.
- **cobuild** — implement the plan in small, reviewable increments.
- **coverify** — visual QA against design references; produces actionable fix lists.
- **codebug** — systematically diagnose root causes for bugs and unexpected behavior.
- **coharden** — close edge cases and failure modes after the happy path works.
- **cochangelog** — record what shipped as a simple, dated changelog.
- **comarket** — reproducible App Store / marketing screenshot capture for SwiftUI apps.
- **colearn** — capture, recall, and graduate lessons into guardrails.
- **coaudit** — find and fix UI elements that should match but have visually drifted.
- **coconsolidate** — find duplicated code/logic and unify it into one customizable master.

## Start here

Start with `/cocreator` (or `cocreation:cocreator` when installed as a plugin) — it's the master
loop and knows which skill(s) to run for a given request.

## More

- `docs/cocreator/PLAYBOOK.md` — principles; wins over any skill on conflict.
- `docs/cocreator/ROADMAP.md` — the loop architecture + skill↔agent roster + model tiers.
- `docs/cocreator/PACKAGING.md` — how this repo is packaged/installable as a plugin.
