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

## Install All Skills

```bash
npx @donniesilalahi/agent-workflow-skills --project
```

## Install Selected Skills

```bash
npx @donniesilalahi/agent-workflow-skills planning-todos documenting-implementations --project
```

## Install Globally

```bash
npx @donniesilalahi/agent-workflow-skills --global
```

## Update Existing Install

```bash
npx @donniesilalahi/agent-workflow-skills --project --force
```

## Validate Before Publishing

```bash
npm run validate
npm pack --dry-run
```

## Publish

```bash
npm publish --access public
```

## License

MIT
