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

### Install selected skills only

```bash
npx @donniesilalahi/cocreation-skills planning-todos documenting-implementations --project
```

### Install globally

```bash
npx @donniesilalahi/cocreation-skills --global
```

### Update an existing installation

```bash
npx @donniesilalahi/cocreation-skills --project --force
```

## Development

### Setup

```bash
git clone https://github.com/donniesilalahi/cocreation-skills.git
cd cocreation-skills
npm run setup-hooks
```

### Validate skills

```bash
npm run validate
```

### Update memory-bank indices

```bash
npm run update-indices
```

Indices are auto-updated via a pre-commit hook when you add new memory-bank records.

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
