---
name: documenting-implementations
description: Record what was built, why design decisions were made, and how the implementation works. Use this skill after completing a feature or refactor to preserve context for future maintenance.
---

# Documenting Implementations

## Purpose

Create a durable record of implementation details so future developers (including yourself) can understand, debug, and extend the work without re-reading all the code.

## When to Use

- After completing a feature or significant refactor
- When design decisions have non-obvious trade-offs
- Before handing off work to another developer
- When the implementation involves complex algorithms or integrations

## How to Use

1. Summarize what was built and its purpose
2. Document key design decisions and their rationale
3. List files, modules, or components changed
4. Note any deviations from standard patterns
5. Record known limitations or future improvements

## Memory Bank

Save each implementation as its own file in the memory bank, named after the feature:
```
.agents/skills/documenting-implementations/memory-bank/auth-refactor.md
```

Copy `_template.md` as a starting point and keep its frontmatter (`title`, `date`, `scope`) filled in—those fields become the columns in the index. Do **not** write into `IMPLEMENTATION.md`—that file is the auto-generated index.

After adding or updating a record, refresh the index:
```bash
node .agents/skills/documenting-implementations/index.js
```

This regenerates `IMPLEMENTATION.md` with a link to every implementation in the folder.

## Template

```markdown
## Implementation: [Feature/Refactor Name]

- **Date**: YYYY-MM-DD
- **Purpose**: [What problem does this solve?]
- **Scope**: [What was changed?]
- **Design decisions**:
  - [Decision 1]: [Rationale]
  - [Decision 2]: [Rationale]
- **Files changed**:
  - `path/to/file.ts`
  - `path/to/file.css`
- **Key patterns**:
  - [Pattern or technique used]
- **Limitations**:
  - [Known limitation 1]
- **Future work**:
  - [Potential improvement 1]
```

## Principles

- Write for someone reading this in 6 months
- Focus on "why," not just "what"
- Keep it concise but complete
