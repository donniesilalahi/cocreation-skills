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

## How to install

### The easy way (recommended)

Use the standard skills tool. It works with any AI helper.

```bash
npx skills add donniesilalahi/cocreation-skills
```

This will show you a nice menu where you can pick which skills to install and which AI helpers should use them.

### Install from npm

If you prefer npm, you can also install this package:

```bash
npm install @donniesilalahi/cocreation-skills
```

Then copy the skills from `node_modules/@donniesilalahi/cocreation-skills/skills/` into your project's `.agents/skills/` folder.

## How to use the skills

Each skill has a **notes folder** (called `memory-bank/`). You and your AI helper write notes there as simple text files.

For example, with the `planning-todos` skill, you might create a file like this:

```
.agents/skills/planning-todos/memory-bank/
  └── fix-login-bug.md
```

Inside that file, you write your plan in plain English. The AI helper reads it and helps you stay on track.

### Auto-update your note index

Each skill comes with its own `index.js`. When you add a new note file, run the indexer to regenerate the table of contents:

```bash
# Update one skill
node .agents/skills/planning-todos/index.js

# Update all skills at once
for d in .agents/skills/*/; do
  [ -f "$d/index.js" ] && node "$d/index.js"
done
```

To make this happen automatically every time you commit, run this one-liner from your project folder:

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

Or, if you installed via npm, you can run:

```bash
node node_modules/@donniesilalahi/cocreation-skills/scripts/setup-hook.js
```

Both do the same thing — create a `.git/hooks/pre-commit` hook that auto-indexes your memory-bank files before every commit. You can run it again safely — it will not create duplicates.

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
