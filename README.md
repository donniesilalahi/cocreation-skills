# Agent Workflow Skills

A collection of reusable Agent Skills for planning, root cause analysis, implementation records, and lessons learned. Install one, several, or all skills into any project.

## Available Skills

| Skill | Description |
|-------|-------------|
| `accessing-lessons-learned` | Retrieve and apply previously documented lessons from a project's memory bank before starting new work. |
| `analyzing-problems` | Systematically diagnose root causes for bugs, errors, and unexpected behavior. |
| `documenting-implementations` | Record what was built, why design decisions were made, and how the implementation works. |
| `documenting-lesson-learned` | Capture insights, mistakes, and proven solutions from completed work so they can be reused later. |
| `planning-todos` | Break down complex tasks into clear, actionable steps and track progress. |

## Quick Start

### Install all skills into your project

```bash
npx @donniesilalahi/cocreation-skills --project
```

This also sets up a git pre-commit hook that auto-updates memory-bank indices whenever you add new records.

### Install selected skills only

```bash
npx @donniesilalahi/cocreation-skills planning-todos documenting-implementations --project
```

### Install globally (reference only)

```bash
npx @donniesilalahi/cocreation-skills --global
```

Global install is for reading skill definitions. **Memory-bank records are always project-local** — use `--project` in each repository where you do active work.

### Update an existing installation

```bash
npx @donniesilalahi/cocreation-skills --project --force
```

### Skip git hook setup

```bash
npx @donniesilalahi/cocreation-skills --project --no-hook
```

## How It Works

### Memory-bank indexing

Each skill has a `memory-bank/` folder. When you add a new `.md` record file, the pre-commit hook auto-regenerates the index (e.g., `PLAN.md`, `ANALYSIS.md`) with a linked table of contents.

You can also trigger indexing manually:

```bash
# Index a single skill
node .agents/skills/planning-todos/index.js

# Index all installed skills
node .agents/skills/index-all.js
```

### Project-local memory

When you install with `--project`, everything lives in `./.agents/skills/`:
- `SKILL.md` — the skill definition
- `memory-bank/` — your project's records and templates
- `index.js` — the auto-indexer for this skill

Each project has its own isolated memory bank. Nothing leaks between repositories.

## Development

### Setup

```bash
git clone https://github.com/donniesilalahi/cocreation-skills.git
cd cocreation-skills
```

### Validate skills

```bash
npm run validate
```

### Update memory-bank indices

```bash
npm run update-indices
```

### Dry-run publish

```bash
npm pack --dry-run
```

### Publish

```bash
npm publish --access public
```

## Contributing

Contributions are welcome! This project is open to anyone who wants to improve agent workflows, add new skills, or fix bugs.

### How to contribute

1. **Fork** the repository
2. **Create a branch** for your change
3. **Make your changes** — follow the existing skill structure
4. **Run validation** — `npm run validate` must pass
5. **Open a pull request** with a clear description

### Skill standards

Every skill must:
- Live in its own directory under `skills/`
- Contain a `SKILL.md` with valid YAML frontmatter
- Have a `name` matching the directory name (kebab-case, 1–64 chars)
- Have a `description` (≤1024 chars)
- Keep `SKILL.md` under 500 lines

See `template/SKILL.md` for a starting point.

### Code of Conduct

Be respectful, constructive, and inclusive. All contributions are valued.

## License

[MIT](LICENSE.md)
