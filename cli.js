#!/usr/bin/env node
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { initializeWorkspace } from './scripts/init-workspace.js'

const packageRoot = path.dirname(fileURLToPath(import.meta.url))
const skillsSource = path.join(packageRoot, 'skills')
const agentsSource = path.join(packageRoot, '.opencode', 'agents')
const args = process.argv.slice(2)

if (args[0] === 'init') {
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`Usage:
  npx @donniesilalahi/cocreation-skills init [options]

Options:
  --workspace-root <path>       Shared workspace root (default: .agents)
  --storage <mode>              local | linear-primary | mirror
  --product-type <type>         initiative | team
  --product-name <name>
  --product-id <id>
  --product-url <url>
  --linear-workspace-url <url>
  --project-name <name>
  --project-id <id>
  --project-url <url>
  --execution-team <id>         Repeat for multiple execution teams`)
    process.exit(0)
  }
  try {
    initializeWorkspace({ args: args.slice(1), packageRoot })
  } catch (error) {
    console.error(error instanceof Error ? error.message : error)
    process.exitCode = 1
  }
  process.exit()
}

const installGlobal = args.includes('--global') || args.includes('-g')
const installProject =
  args.includes('--project') || args.includes('-p') || !installGlobal
const force = args.includes('--force') || args.includes('-f')
const update = args.includes('--update') || args.includes('-u')
const listOnly = args.includes('--list')
const help = args.includes('--help') || args.includes('-h')
const noHook = args.includes('--no-hook')
const installOpenCode = args.includes('--opencode')
const wantedSkills = args.filter((arg) => !arg.startsWith('-'))

// Skills we've renamed. If a consumer still has the OLD dir installed, surface a
// migration hint — npm-copy installs are never auto-pruned, because
// .agents/skills/ is SHARED (it can hold the user's skills from other sources)
// and blanket deletion there is unsafe. We detect and instruct; we NEVER delete.
const RENAMES = {
  coshape: 'codirect',
  coframe: 'codirect',
  codesign: 'cospecify',
  coport: 'cotranslate',
  coaudit: 'coconsolidate',
  coverify: 'cotest',
}

if (help) {
  console.log(`Usage:
  npx @donniesilalahi/cocreation-skills [skill-name...] [options]

Options:
  --project, -p   Install to ./.agents/skills in the current project. Default.
  --global, -g    Install to ~/.agents/skills.
  --force, -f     Overwrite existing installed skill directories.
  --update, -u    Refresh SKILL.md only; preserve memory-bank/ (safe for updates).
  --no-hook       Skip setting up the git pre-commit hook (project only).
  --opencode      Install doer agents into OpenCode's native agent directory.
  --list          List available skills without installing.
  --help, -h      Show this help.

Examples:
  npx @donniesilalahi/cocreation-skills --project
  npx @donniesilalahi/cocreation-skills coplan codebug --project
  npx @donniesilalahi/cocreation-skills --global --force
  npx @donniesilalahi/cocreation-skills init --storage linear-primary`)
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

if (installOpenCode) {
  const openCodeAgentsTarget = installProject
    ? path.join(process.cwd(), '.opencode', 'agents')
    : path.join(os.homedir(), '.config', 'opencode', 'agents')
  copyDirectory(agentsSource, openCodeAgentsTarget)
  console.log(`Installed OpenCode agents to ${openCodeAgentsTarget}`)
}

warnRenamedSkills(targetBase, availableSkills)

// Auto-setup git hook for project installs
if (installProject && !noHook) {
  ensurePreCommitHook()
}

// Detect-and-instruct migration for renamed skills. Reads only; never deletes.
// A stale skill = an OLD name that is gone from this package but still sits in
// the consumer's install dir. We tell the user how to migrate; the removal is
// theirs to run (shared-dir safety).
function warnRenamedSkills(base, available) {
  const stale = Object.entries(RENAMES).filter(
    ([oldName]) =>
      !available.includes(oldName) && fs.existsSync(path.join(base, oldName)),
  )
  if (stale.length === 0) return
  console.log(
    '\n⚠  Renamed skills — your installed copies are now stale. Not auto-removed:',
  )
  console.log(
    '   .agents/skills/ is shared, so deleting there is your call. Renamed:',
  )
  for (const [oldName, newName] of stale) {
    console.log(`     ${oldName} → ${newName}`)
  }
  console.log(
    '   To migrate each: move <old>/memory-bank/*.md into <new>/memory-bank/,',
  )
  console.log(
    '   delete the <old> dir, then run <new>/index.mjs. See the README',
  )
  console.log('   "Updating an existing install" section.')
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
// up to date. If a hook already carries the marker but an older body, the
// marked block is replaced in place.
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
workspace_root=.agents
config=.agents/workspace/cocreation.yaml
if [ -f "$config" ]; then
  configured_root=$(sed -n 's/^workspaceRoot:[[:space:]]*//p' "$config" | head -n 1 | tr -d '"')
  [ -n "$configured_root" ] && workspace_root="$configured_root"
fi
case "$workspace_root" in
  /*) skills_root="$workspace_root/skills" ;;
  *) skills_root="$PWD/$workspace_root/skills" ;;
esac
for d in "$skills_root"/*/; do
  [ -f "$d/index.mjs" ] && node "$d/index.mjs"
done
if [ "$workspace_root" = ".agents" ]; then
  git diff --name-only | grep -E '^\\.agents/skills/[^/]+/memory-bank/' | while read -r f; do git add "$f"; done
  git ls-files --others --exclude-standard | grep -E '^\\.agents/skills/[^/]+/memory-bank/' | while read -r f; do git add "$f"; done
fi
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
  // older body.
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
