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
  --global, -g    Install to ~/.agents/skills (read-only reference).
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
      console.log(`Skipped existing skill: ${skill}. Use --force to overwrite.`)
      continue
    }
    fs.rmSync(target, { recursive: true, force: true })
  }

  copyDirectory(source, target)

  // Copy per-skill indexer into the installed skill folder
  const skillIndexSrc = path.join(scriptsSource, 'skill-index.js')
  const skillIndexDst = path.join(target, 'index.js')
  if (fs.existsSync(skillIndexSrc)) {
    fs.copyFileSync(skillIndexSrc, skillIndexDst)
  }

  console.log(`Installed ${skill} → ${target}`)
}

// Copy master indexer to .agents/skills/
const indexAllSrc = path.join(scriptsSource, 'index-all.js')
const indexAllDst = path.join(targetBase, 'index-all.js')
if (fs.existsSync(indexAllSrc)) {
  fs.copyFileSync(indexAllSrc, indexAllDst)
  fs.chmodSync(indexAllDst, 0o755)
}

console.log(`Done. Installed to ${targetBase}`)

if (installGlobal) {
  console.log(`\nNote: memory-bank records are project-local.`)
  console.log(`For active work, install with --project in each repository.`)
}

if (installProject && !noHook) {
  const gitDir = path.join(process.cwd(), '.git')
  const hooksDir = path.join(gitDir, 'hooks')
  const preCommitHook = path.join(hooksDir, 'pre-commit')

  if (fs.existsSync(gitDir)) {
    fs.mkdirSync(hooksDir, { recursive: true })

    const hookContent = `#!/bin/sh
# Auto-update memory-bank indices before each commit
cd "$(git rev-parse --show-toplevel)" || exit 1
node .agents/skills/index-all.js
# Stage any updated index files
git diff --name-only | grep -E '^\.agents/skills/[^/]+/memory-bank/(PLAN|ANALYSIS|LEARNING|IMPLEMENTATION)\.md$' | while read -r file; do
  git add "$file"
done
git ls-files --others --exclude-standard | grep -E '^\.agents/skills/[^/]+/memory-bank/(PLAN|ANALYSIS|LEARNING|IMPLEMENTATION)\.md$' | while read -r file; do
  git add "$file"
done
`

    if (fs.existsSync(preCommitHook)) {
      console.log(`\nSkipped: pre-commit hook already exists at ${preCommitHook}`)
      console.log(`Add the following manually if you want auto-indexing:`)
      console.log(hookContent)
    } else {
      fs.writeFileSync(preCommitHook, hookContent)
      fs.chmodSync(preCommitHook, 0o755)
      console.log(`\nGit pre-commit hook installed → ${preCommitHook}`)
      console.log(`Memory-bank indices will auto-update on every commit.`)
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
