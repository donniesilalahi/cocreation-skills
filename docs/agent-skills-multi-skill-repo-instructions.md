# Agent Skills Multi-Skill Repository Instructions

Use this instruction as a copy-paste prompt for another AI coding agent when creating the standalone open-source skills repository.

## 1. Objective

Create one npm-installable repository that contains multiple Agent Skills. Users should be able to install all skills, or selected skills, into any project with `npx`.

The repository must follow the `agentskills/agentskills` standard:

- Every skill is a directory with a required `SKILL.md` file.
- `SKILL.md` frontmatter may only contain: `name`, `description`, `license`, `compatibility`, `metadata`, `allowed-tools`.
- `name` must be lowercase kebab-case, 1-64 characters, and exactly match the parent directory name.
- `description` must be non-empty, <=1024 characters, and describe both what the skill does and when to use it.
- Keep each `SKILL.md` under 500 lines; move implementation detail into `references/`, `scripts/`, or other on-demand resources.

## 2. Repository Layout

Create this structure:

```text
agent-workflow-skills/
├── README.md
├── LICENSE
├── package.json
├── install.js
├── .gitignore
├── .claude-plugin/
│   └── marketplace.json
├── scripts/
│   └── validate-skills.js
├── skills/
│   ├── accessing-lessons-learned/
│   │   └── SKILL.md
│   ├── analyzing-problems/
│   │   ├── SKILL.md
│   │   └── memory-bank/
│   │       ├── _template.md
│   │       └── ANALYSIS.md
│   ├── documenting-implementations/
│   │   ├── SKILL.md
│   │   └── memory-bank/
│   │       ├── _template.md
│   │       └── IMPLEMENTATION.md
│   ├── document-lesson-learned/
│   │   ├── SKILL.md
│   │   └── memory-bank/
│   │       ├── _template.md
│   │       └── LEARNING.md
│   └── planning-todos/
│       ├── SKILL.md
│       └── memory-bank/
│           ├── _template.md
│           └── PLAN.md
└── template/
    └── SKILL.md
```

Do not create one repository per skill. This is one package containing many skill directories under `skills/`.

## 3. Source Skill Content

Copy the canonical skill folders from this project:

```text
.agents/skills/accessing-lessons-learned/
.agents/skills/analyzing-problems/
.agents/skills/documenting-implementations/
.agents/skills/document-lesson-learned/
.agents/skills/planning-todos/
```

Copy them into the new repository as:

```text
skills/accessing-lessons-learned/
skills/analyzing-problems/
skills/documenting-implementations/
skills/document-lesson-learned/
skills/planning-todos/
```

For open source distribution, include templates and empty generated index files, but do not include project-specific historical memory-bank records from this personal-site repository.

## 4. `package.json`

Create `package.json` like this, replacing package metadata as needed:

```json
{
  "name": "@donniesilalahi/agent-workflow-skills",
  "version": "0.1.0",
  "description": "Reusable Agent Skills for planning, root cause analysis, implementation records, and lessons learned.",
  "type": "module",
  "bin": {
    "agent-workflow-skills": "./install.js"
  },
  "files": ["install.js", "skills/", "template/", "README.md", "LICENSE"],
  "scripts": {
    "validate": "node scripts/validate-skills.js",
    "prepack": "npm run validate"
  },
  "keywords": ["agent-skills", "ai-agents", "skills", "workflow", "planning"],
  "license": "MIT",
  "engines": {
    "node": ">=18"
  }
}
```

Users will install with:

```bash
npx @donniesilalahi/agent-workflow-skills --project
```

## 5. `install.js`

Create an executable `install.js` that supports project-scoped, global, selective, and force installs.

```javascript
#!/usr/bin/env node
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const packageRoot = path.dirname(fileURLToPath(import.meta.url))
const skillsSource = path.join(packageRoot, 'skills')
const args = process.argv.slice(2)

const installGlobal = args.includes('--global') || args.includes('-g')
const installProject =
  args.includes('--project') || args.includes('-p') || !installGlobal
const force = args.includes('--force') || args.includes('-f')
const listOnly = args.includes('--list')
const help = args.includes('--help') || args.includes('-h')
const wantedSkills = args.filter((arg) => !arg.startsWith('-'))

if (help) {
  console.log(`Usage:
  npx @donniesilalahi/agent-workflow-skills [skill-name...] [options]

Options:
  --project, -p   Install to ./.agents/skills in the current project. Default.
  --global, -g    Install to ~/.agents/skills.
  --force, -f     Overwrite existing installed skill directories.
  --list          List available skills without installing.
  --help, -h      Show this help.

Examples:
  npx @donniesilalahi/agent-workflow-skills --project
  npx @donniesilalahi/agent-workflow-skills planning-todos analyzing-problems --project
  npx @donniesilalahi/agent-workflow-skills --global --force`)
  process.exit(0)
}

const targetBase = installProject
  ? path.join(process.cwd(), '.agents', 'skills')
  : path.join(os.homedir(), '.agents', 'skills')

const availableSkills = fs
  .readdirSync(skillsSource, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort()

if (listOnly) {
  console.log(availableSkills.join('\n'))
  process.exit(0)
}

const selectedSkills = wantedSkills.length > 0 ? wantedSkills : availableSkills
const unknownSkills = selectedSkills.filter(
  (skill) => !availableSkills.includes(skill),
)

if (unknownSkills.length > 0) {
  console.error(`Unknown skill(s): ${unknownSkills.join(', ')}`)
  console.error(`Available skills: ${availableSkills.join(', ')}`)
  process.exit(1)
}

fs.mkdirSync(targetBase, { recursive: true })

for (const skill of selectedSkills) {
  const source = path.join(skillsSource, skill)
  const target = path.join(targetBase, skill)

  if (fs.existsSync(target)) {
    if (!force) {
      console.log(`Skipped existing skill: ${skill}. Use --force to overwrite.`)
      continue
    }
    fs.rmSync(target, { recursive: true, force: true })
  }

  copyDirectory(source, target)
  console.log(`Installed ${skill} → ${target}`)
}

console.log(`Done. Installed to ${targetBase}`)

function copyDirectory(source, target) {
  fs.mkdirSync(target, { recursive: true })
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    const sourcePath = path.join(source, entry.name)
    const targetPath = path.join(target, entry.name)
    if (entry.isDirectory()) {
      copyDirectory(sourcePath, targetPath)
    } else if (entry.isFile()) {
      fs.copyFileSync(sourcePath, targetPath)
    }
  }
}
```

Make it executable:

```bash
chmod +x install.js
```

## 6. Validation Script

Create `scripts/validate-skills.js` to enforce the `agentskills/agentskills` SKILL.md standard before publishing.

```javascript
import fs from 'node:fs'
import path from 'node:path'

const allowedFrontmatter = new Set([
  'name',
  'description',
  'license',
  'compatibility',
  'metadata',
  'allowed-tools',
])

const skillsRoot = path.join(process.cwd(), 'skills')
let failed = false

for (const entry of fs.readdirSync(skillsRoot, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue

  const skillName = entry.name
  const skillPath = path.join(skillsRoot, skillName)
  const skillFile = path.join(skillPath, 'SKILL.md')

  if (!fs.existsSync(skillFile)) {
    fail(`${skillPath}: missing SKILL.md`)
    continue
  }

  const content = fs.readFileSync(skillFile, 'utf8')
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n/)

  if (!frontmatterMatch) {
    fail(`${skillFile}: missing YAML frontmatter`)
    continue
  }

  const fields = parseFlatFrontmatter(frontmatterMatch[1])
  const fieldNames = Object.keys(fields)
  const unknownFields = fieldNames.filter(
    (field) => !allowedFrontmatter.has(field),
  )

  if (unknownFields.length > 0) {
    fail(
      `${skillFile}: unknown frontmatter field(s): ${unknownFields.join(', ')}`,
    )
  }

  if (fields.name !== skillName) {
    fail(`${skillFile}: name must match directory name '${skillName}'`)
  }

  if (!fields.name || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(fields.name)) {
    fail(`${skillFile}: invalid name '${fields.name}'`)
  }

  if (fields.name && fields.name.length > 64) {
    fail(`${skillFile}: name exceeds 64 characters`)
  }

  if (!fields.description || fields.description.length > 1024) {
    fail(`${skillFile}: description is missing or exceeds 1024 characters`)
  }

  if (fields.compatibility && fields.compatibility.length > 500) {
    fail(`${skillFile}: compatibility exceeds 500 characters`)
  }

  const lineCount = content.split('\n').length
  if (lineCount > 500) {
    fail(`${skillFile}: SKILL.md exceeds 500 lines; move detail to references/`)
  }

  console.log(`ok ${skillFile}`)
}

if (failed) process.exit(1)

function parseFlatFrontmatter(frontmatter) {
  const result = {}
  for (const line of frontmatter.split('\n')) {
    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/)
    if (!match) continue
    result[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, '')
  }
  return result
}

function fail(message) {
  failed = true
  console.error(message)
}
```

## 7. README Requirements

Write `README.md` with these sections:

1. What this skill collection is.
2. Available skills table.
3. Install all skills:

   ```bash
   npx @donniesilalahi/agent-workflow-skills --project
   ```

4. Install selected skills:

   ```bash
   npx @donniesilalahi/agent-workflow-skills planning-todos documenting-implementations --project
   ```

5. Install globally:

   ```bash
   npx @donniesilalahi/agent-workflow-skills --global
   ```

6. Update existing install:

   ```bash
   npx @donniesilalahi/agent-workflow-skills --project --force
   ```

7. Validate before publishing:

   ```bash
   npm run validate
   npm pack --dry-run
   ```

8. Publish:

   ```bash
   npm publish --access public
   ```

## 8. Claude Plugin Manifest

Create `.claude-plugin/marketplace.json` for Claude Code plugin installation support:

```json
{
  "name": "agent-workflow-skills",
  "owner": {
    "name": "Donnie Silalahi",
    "email": "donniesilalahi@gmail.com"
  },
  "metadata": {
    "description": "Reusable Agent Skills for planning, root cause analysis, implementation records, and lessons learned.",
    "version": "0.1.0"
  },
  "plugins": [
    {
      "name": "all-skills",
      "description": "Install all Agent Workflow Skills.",
      "source": "./",
      "strict": false,
      "skills": [
        "./skills/accessing-lessons-learned",
        "./skills/analyzing-problems",
        "./skills/documenting-implementations",
        "./skills/document-lesson-learned",
        "./skills/planning-todos"
      ]
    }
  ]
}
```

## 9. Final Acceptance Criteria

The new repository is complete when:

- `npm run validate` passes.
- `npm pack --dry-run` includes `install.js`, `skills/`, `template/`, `README.md`, and `LICENSE`.
- `npx . --project` installs skills into a test repo's `.agents/skills/` directory.
- `npx . planning-todos --project` installs only `planning-todos`.
- `npx . --project --force` overwrites an existing installation.
- Every installed skill has a valid `SKILL.md` and parent directory name matching `name`.
- No project-specific memory-bank history is included in the published package.
