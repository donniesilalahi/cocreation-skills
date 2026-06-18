# Co-creation Skills

A set of skills that help AI helpers (like Claude, Cursor, or Kimi) work better with you on software projects.

Think of each skill as a guide you give to your AI helper. It tells the AI how to help you plan tasks, find bugs, write notes about what you built, and remember lessons so you do not repeat mistakes.

## What skills are included?

| Skill | What it helps you do |
|-------|---------------------|
| **planning-todos** | Break big tasks into small steps and check them off as you go. |
| **analyzing-problems** | Find the real reason why something is broken, not just guess. |
| **documenting-implementations** | Write down what you built so you can remember it later. |
| **documenting-lesson-learned** | Save mistakes and good ideas so you do not forget them. |
| **accessing-lessons-learned** | Look up what you already learned before starting new work. |
| **design-qa** | Compare live UI or screenshots against design artboards and produce a pixel-perfect fix list. |
| **marketing-capture** | Set up or run reproducible App Store screenshot capture for SwiftUI apps — iOS Simulator and macOS — with seed data, scope/appearance/locale filtering, timestamped output, and a always-current `latest/` folder. |
| **consistency-audit** | Find UI elements that should look identical but have drifted across screens, diagnose the root cause (loose token, missing component, ignored token), and apply surgical fixes. |

## How to install

### The easy way (recommended)

Use the standard `skills` tool. It gives you an interactive picker — choose which skills to install, which AI agents to set them up for, project vs. global scope, and symlink vs. copy.

```bash
npx skills@latest add donniesilalahi/cocreation-skills
```

The skills land in `.agents/skills/`. This is the same installer most public skill repos use, so it works with Claude Code, Cursor, Codex, Gemini CLI, and many others out of the box.

Note: this method installs the skills but does **not** set up the git hook for automatic note indexing. If you want that, either use the alternative installer below, or set the hook up manually (see [Set up the git hook manually](#set-up-the-git-hook-manually)).

### Alternative: install with the auto git-hook

If you want the skills **and** automatic note indexing on every commit, use the bundled installer instead:

```bash
# All skills
npx @donniesilalahi/cocreation-skills --project

# Only some skills
npx @donniesilalahi/cocreation-skills planning-todos analyzing-problems --project

# Update SKILL.md only, preserve memory-bank/ (audit history safe)
npx @donniesilalahi/cocreation-skills --project --update

# Overwrite everything including memory-bank/
npx @donniesilalahi/cocreation-skills --project --force

# Skip the git hook
npx @donniesilalahi/cocreation-skills --project --no-hook
```

This installs to `.agents/skills/` and sets up a git pre-commit hook so your note indexes stay up to date automatically.

## How to use the skills

Each skill has a **notes folder** (called `memory-bank/`). You and your AI helper write notes there as simple text files.

For example, with the `planning-todos` skill, you might create a file like this:

```
.agents/skills/planning-todos/memory-bank/
  └── fix-login-bug.md
```

Inside that file, you write your plan in plain English. The AI helper reads it and helps you stay on track.

### Update your note index by hand

If you ever want to update the index without committing, run:

```bash
# Update one skill
node .agents/skills/planning-todos/index.js

# Update all skills at once
for d in .agents/skills/*/; do
  [ -f "$d/index.js" ] && node "$d/index.js"
done
```

### Set up the git hook manually

If you installed via `npx skills add` or skipped the hook with `--no-hook`, you can set it up later with this one-liner:

```bash
mkdir -p .git/hooks && cat > .git/hooks/pre-commit << 'HOOK'
#!/bin/sh
cd "$(git rev-parse --show-toplevel)" || exit 1
for d in .agents/skills/*/; do
  [ -f "$d/index.js" ] && node "$d/index.js"
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
