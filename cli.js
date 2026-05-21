#!/usr/bin/env node
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const packageRoot = path.dirname(fileURLToPath(import.meta.url))
const skillsSource = path.join(packageRoot, 'skills')
const scriptsSource = path.join(packageRoot, 'scripts')
const args = process.argv.slice(2)

const installGlobal = args.includes('--global') || args.includes('-g')
const installProject =
  args.includes('--project') || args.includes('-p') || !installGlobal
const force = args.includes('--force') || args.includes('-f')
const listOnly = args.includes('--list')
const help = args.includes('--help') || args.includes('-h')
const noHook = args.includes('--no-hook')
const wantedSkills = args.filter((arg) => !arg.startsWith('-'))

if (help) {
  console.log(`Usage:
  npx @donniesilalahi/cocreation-skills [skill-name...] [options]

Options:
  --project, -p   Install to ./.agents/skills in the current project. Default.
  --global, -g    Install to ~/.agents/skills.
  --force, -f     Overwrite existing installed skill directories.
  --no-hook       Skip setting up the git pre-commit hook (project only).
  --list          List available skills without installing.
  --help, -h      Show this help.

Examples:
  npx @donniesilalahi/cocreation-skills --project
  npx @donniesilalahi/cocreation-skills planning-todos analyzing-problems --project
  npx @donniesilalahi/cocreation-skills --global --force`)
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
      console.log(`Skipped existing skill: ${skill}`)
      continue
    }
    fs.rmSync(target, { recursive: true, force: true })
  }

  copyDirectory(source, target)
  console.log(`Installed ${skill}`)
}

console.log(`Done. Skills installed to ${targetBase}`)

// Auto-setup git hook for project installs
if (installProject && !noHook) {
  const gitDir = path.join(process.cwd(), '.git')
  const hooksDir = path.join(gitDir, 'hooks')
  const preCommitHook = path.join(hooksDir, 'pre-commit')

  if (fs.existsSync(gitDir)) {
    fs.mkdirSync(hooksDir, { recursive: true })

    const hookMarker = '# === cocreation-skills auto-index ==='
    const hookBody = `#!/bin/sh
${hookMarker}
cd "$(git rev-parse --show-toplevel)" || exit 1
for d in .agents/skills/*/; do
  [ -f "$d/index.js" ] && node "$d/index.js"
done
git diff --name-only | grep -E '^\\.agents/skills/[^/]+/memory-bank/' | while read -r f; do git add "$f"; done
git ls-files --others --exclude-standard | grep -E '^\\.agents/skills/[^/]+/memory-bank/' | while read -r f; do git add "$f"; done
# === end cocreation-skills ===
`

    let existing = ''
    if (fs.existsSync(preCommitHook)) {
      existing = fs.readFileSync(preCommitHook, 'utf8')
    }

    if (!existing.includes(hookMarker)) {
      let newContent
      if (existing.trim()) {
        newContent = existing.trimEnd() + '\n\n' + hookBody
        console.log('Updated .git/hooks/pre-commit with auto-index')
      } else {
        newContent = hookBody
        console.log('Created .git/hooks/pre-commit with auto-index')
      }
      fs.writeFileSync(preCommitHook, newContent)
      fs.chmodSync(preCommitHook, 0o755)
    } else {
      console.log('Git hook already has auto-index')
    }
  }
}

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
