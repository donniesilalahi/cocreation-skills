# Co-creation Skills

This is a set of tools that help AI helpers (like Claude, ChatGPT, or Kimi) work better with you on software projects.

Think of each tool as a **skill** you give to your AI helper. Just like a person can learn skills, an AI helper can follow these skills to help you plan better, fix bugs faster, and remember what you learned.

## What skills are included?

| Skill | What it helps you do |
|-------|---------------------|
| **planning-todos** | Break big tasks into small steps and check them off as you go. |
| **analyzing-problems** | Find the real reason why something is broken, not just guess. |
| **documenting-implementations** | Write down what you built so you can remember it later. |
| **documenting-lesson-learned** | Save mistakes and good ideas so you do not forget them. |
| **accessing-lessons-learned** | Look up what you already learned before starting new work. |

## How do I use these skills?

### Step 1: Add the skills to your project

Run this command inside your project folder:

```bash
npx @donniesilalahi/cocreation-skills --project
```

This creates a folder called `.agents/skills/` in your project. Each skill gets its own folder inside.

### Step 2: Write notes while you work

Each skill has a **notes folder** (called `memory-bank/`). You write your notes there as simple text files.

For example, with the `planning-todos` skill, you might create a file like this:

```
.agents/skills/planning-todos/memory-bank/
  └── fix-login-bug.md
```

Inside that file, you write your plan in plain English.

### Step 3: The index updates by itself

When you save your work with `git commit`, a small helper script automatically updates the **index file** (like `PLAN.md`) so it lists all your notes. You do not have to do this by hand.

You can also run it yourself:

```bash
# Update just one skill
node .agents/skills/planning-todos/index.js

# Update all skills at once
node .agents/skills/index-all.js
```

### Pick only the skills you want

If you do not want all five skills, you can pick just the ones you need:

```bash
npx @donniesilalahi/cocreation-skills planning-todos analyzing-problems --project
```

### Update your skills

If the skills get better over time, you can update them:

```bash
npx @donniesilalahi/cocreation-skills --project --force
```

## What is a skill, really?

A skill is just a folder with two things inside:

1. **SKILL.md** — a short guide that tells the AI helper what this skill is for and how to use it.
2. **memory-bank/** — a folder where you and the AI helper write notes together.

That is it. No complicated setup. No special software. Just text files.

## Can I use these skills on every project?

Yes. But each project gets its **own** notes. Your notes from Project A stay in Project A. Your notes from Project B stay in Project B. They never mix together.

If you want, you can also install the skills on your whole computer (not just one project) so you can read them anywhere:

```bash
npx @donniesilalahi/cocreation-skills --global
```

But remember: your notes still live inside each project. The global install is just for reading the skill guides.

## How can I help make this better?

Anyone can help! Here is how:

1. Click **Fork** on GitHub to make your own copy.
2. Make your changes.
3. Run `npm run validate` to make sure everything is okay.
4. Open a **Pull Request** so we can add your changes.

If you want to add a new skill, look at `template/SKILL.md` to see how skills are written. Then make a new folder in `skills/` and follow the same pattern.

Be kind. Be helpful. Everyone is welcome.

## License

You can use this for anything you want. You can change it. You can share it. You can even sell it. No restrictions. See [LICENSE.md](LICENSE.md) for the full text.
