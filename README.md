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

## How to install

### The easy way (recommended)

Run one command in your project folder. It installs the skills **and** sets up automatic indexing for your notes.

```bash
npx @donniesilalahi/cocreation-skills --project
```

That is it. The skills are now in `.agents/skills/` and every time you commit your code, your note indexes stay up to date automatically.

### Install only some skills

```bash
npx @donniesilalahi/cocreation-skills planning-todos analyzing-problems --project
```

### Update existing skills

```bash
npx @donniesilalahi/cocreation-skills --project --force
```

### Skip the git hook

If you do not want the automatic git hook, add `--no-hook`:

```bash
npx @donniesilalahi/cocreation-skills --project --no-hook
```

### Install from the skills marketplace

You can also install through the standard skills tool:

```bash
npx skills add donniesilalahi/cocreation-skills
```

Note: this method installs the skills but does **not** set up the git hook automatically. You will need to set that up separately (see below).

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
