#!/usr/bin/env node
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import readline from 'node:readline'
import { fileURLToPath } from 'node:url'

const packageRoot = path.dirname(fileURLToPath(import.meta.url))
const skillsSource = path.join(packageRoot, 'skills')
const scriptsSource = path.join(packageRoot, 'scripts')
const args = process.argv.slice(2)

const installGlobal = args.includes('--global') || args.includes('-g')
const installProject =
  args.includes('--project') || args.includes('-p') || !installGlobal
const force = args.includes('--force') || args.includes('-f')
const update = args.includes('--update') || args.includes('-u')
const listOnly = args.includes('--list')
const help = args.includes('--help') || args.includes('-h')
const noHook = args.includes('--no-hook')
const migrate = args.includes('--migrate')
const assumeYes = args.includes('--yes') || args.includes('-y')
const wantedSkills = args.filter((arg) => !arg.startsWith('-'))

if (help) {
  console.log(`Usage:
  npx @donniesilalahi/cocreation-skills [skill-name...] [options]

Options:
  --project, -p   Install to ./.agents/skills in the current project. Default.
  --global, -g    Install to ~/.agents/skills.
  --force, -f     Overwrite existing installed skill directories.
  --update, -u    Refresh SKILL.md only; preserve memory-bank/ (safe for updates).
  --no-hook       Skip setting up the git pre-commit hook (project only).
  --migrate       Migrate an existing npx install to the plugin: strip skill
                   bodies under ./.agents/skills, keep memory-bank/ records,
                   and install the project-level indexer + hook. ONLY touches
                   cocreation's own skills — other skill packs sharing that
                   directory are left untouched. Prompts before deleting.
  --yes, -y       Skip the --migrate confirmation prompt (for automation).
  --list          List available skills without installing.
  --help, -h      Show this help.

Examples:
  npx @donniesilalahi/cocreation-skills --project
  npx @donniesilalahi/cocreation-skills coplan codebug --project
  npx @donniesilalahi/cocreation-skills --global --force
  npx @donniesilalahi/cocreation-skills --migrate`)
  process.exit(0)
}

if (migrate) {
  await runMigration()
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
    if (update) {
      // Refresh SKILL.md only; leave memory-bank/ intact
      updateSkillFiles(source, target)
      console.log(`Updated ${skill} (memory-bank preserved)`)
      continue
    }
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
  ensurePreCommitHook()
}

// Update non-memory-bank files only (safe for existing installs with audit history)
function updateSkillFiles(source, target) {
  fs.mkdirSync(target, { recursive: true })
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    if (entry.name === 'memory-bank') continue
    const sourcePath = path.join(source, entry.name)
    const targetPath = path.join(target, entry.name)
    if (entry.isDirectory()) {
      updateSkillFiles(sourcePath, targetPath)
    } else if (entry.isFile()) {
      fs.copyFileSync(sourcePath, targetPath)
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

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// Installs/refreshes the git pre-commit hook that keeps memory-bank indices
// up to date. Prefers the project-level indexer (.agents/skills/index.mjs)
// when present, falling back to each skill's own index.mjs otherwise. Used
// by both the normal install flow and --migrate. If a hook already carries
// the marker but an older body, the marked block is replaced in place.
function ensurePreCommitHook() {
  const gitDir = path.join(process.cwd(), '.git')
  const hooksDir = path.join(gitDir, 'hooks')
  const preCommitHook = path.join(hooksDir, 'pre-commit')

  if (!fs.existsSync(gitDir)) return

  fs.mkdirSync(hooksDir, { recursive: true })

  const hookMarker = '# === cocreation-skills auto-index ==='
  const hookEndMarker = '# === end cocreation-skills ==='
  const hookBlock = `${hookMarker}
cd "$(git rev-parse --show-toplevel)" || exit 1
if [ -f .agents/skills/index.mjs ]; then
  node .agents/skills/index.mjs
else
  for d in .agents/skills/*/; do
    [ -f "$d/index.mjs" ] && node "$d/index.mjs"
  done
fi
git diff --name-only | grep -E '^\\.agents/skills/[^/]+/memory-bank/' | while read -r f; do git add "$f"; done
git ls-files --others --exclude-standard | grep -E '^\\.agents/skills/[^/]+/memory-bank/' | while read -r f; do git add "$f"; done
${hookEndMarker}
`
  const hookBody = `#!/bin/sh\n${hookBlock}`

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
    return
  }

  // Marker already present: replace the marked block in case it carries an
  // older body (e.g. pre-migration, no project-indexer preference).
  const blockRegex = new RegExp(
    `${escapeRegExp(hookMarker)}[\\s\\S]*?${escapeRegExp(hookEndMarker)}\\n?`,
  )
  if (blockRegex.test(existing)) {
    const replaced = existing.replace(blockRegex, hookBlock)
    if (replaced !== existing) {
      fs.writeFileSync(preCommitHook, replaced)
      fs.chmodSync(preCommitHook, 0o755)
      console.log('Refreshed .git/hooks/pre-commit auto-index block')
      return
    }
  }
  console.log('Git hook already has auto-index')
}

// Ask a yes/no question on the terminal; resolves true only on y/yes.
function confirm(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    })
    rl.question(question, (answer) => {
      rl.close()
      resolve(/^y(es)?$/i.test(answer.trim()))
    })
  })
}

// --migrate: convert an existing npx install (cocreation skill bodies copied
// into .agents/skills/<name>/) to a plugin-friendly layout — memory-bank/
// records are preserved in place, the loose body is stripped so the plugin's
// namespaced skill doesn't double-load alongside the loose copy.
//
// CRITICAL: .agents/skills/ is a SHARED directory — other skill packs live
// there too. This only ever touches cocreation's OWN skills (the set shipped
// in this package's skills/ dir). Every other directory is left untouched.
async function runMigration() {
  const base = path.join(process.cwd(), '.agents', 'skills')

  if (!fs.existsSync(base)) {
    console.log('No .agents/skills to migrate.')
    return
  }

  // The authoritative set of cocreation skills = what this package ships.
  const ownSkills = fs
    .readdirSync(skillsSource, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)

  // Only those cocreation skills actually present in this project.
  const present = ownSkills.filter((name) => {
    const dir = path.join(base, name)
    return fs.existsSync(dir) && fs.statSync(dir).isDirectory()
  })

  if (present.length === 0) {
    console.log(
      'No cocreation skills found under .agents/skills — nothing to migrate. Other skills left untouched.',
    )
    return
  }

  const hasMemoryBank = (name) =>
    fs.existsSync(path.join(base, name, 'memory-bank'))
  const toMigrate = present.filter(hasMemoryBank)
  const toRemove = present.filter((name) => !hasMemoryBank(name))

  console.log(`Migrating ${present.length} cocreation skill(s) in ${base}:`)
  if (toMigrate.length)
    console.log(`  strip body, KEEP memory-bank: ${toMigrate.join(', ')}`)
  if (toRemove.length)
    console.log(`  remove (no memory-bank):      ${toRemove.join(', ')}`)
  console.log(
    '  Every other skill in this directory is left completely untouched.',
  )

  if (!assumeYes) {
    if (!process.stdin.isTTY) {
      console.log(
        'Non-interactive shell — re-run with --yes to proceed. Nothing changed.',
      )
      return
    }
    const ok = await confirm('Proceed? (y/N) ')
    if (!ok) {
      console.log('Aborted. Nothing changed.')
      return
    }
  }

  let migratedCount = 0
  let removedCount = 0

  for (const name of toMigrate) {
    const skillDir = path.join(base, name)
    for (const child of fs.readdirSync(skillDir, { withFileTypes: true })) {
      if (child.name === 'memory-bank') continue
      fs.rmSync(path.join(skillDir, child.name), {
        recursive: true,
        force: true,
      })
    }
    console.log(`migrated ${name} (memory-bank preserved)`)
    migratedCount++
  }
  for (const name of toRemove) {
    fs.rmSync(path.join(base, name), { recursive: true, force: true })
    console.log(`removed ${name} (no memory-bank)`)
    removedCount++
  }

  const indexerSource = path.join(scriptsSource, 'project-indexer.mjs')
  const indexerTarget = path.join(base, 'index.mjs')
  fs.copyFileSync(indexerSource, indexerTarget)
  console.log(`installed project indexer at ${indexerTarget}`)

  ensurePreCommitHook()

  console.log(
    `Done. ${migratedCount} skill(s) migrated (memory-bank preserved), ${removedCount} skill(s) removed. Other skills untouched.`,
  )
}
