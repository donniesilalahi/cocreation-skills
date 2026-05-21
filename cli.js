#!/usr/bin/env node
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import * as p from '@clack/prompts'
import pc from 'picocolors'
import { agents, detectInstalledAgents, getAgentDir } from './agents.js'

const packageRoot = path.dirname(fileURLToPath(import.meta.url))
const skillsSource = path.join(packageRoot, 'skills')
const scriptsSource = path.join(packageRoot, 'scripts')

/* ── Parse args ── */
const args = process.argv.slice(2)
const argSet = new Set(args)

const installGlobal = argSet.has('--global') || argSet.has('-g')
const installProject =
  argSet.has('--project') || argSet.has('-p') || !installGlobal
const force = argSet.has('--force') || argSet.has('-f')
const listOnly = argSet.has('--list')
const help = argSet.has('--help') || argSet.has('-h')
const yesMode = argSet.has('--yes') || argSet.has('-y')
const noHook = argSet.has('--no-hook')
const wantedSkills = args.filter((arg) => !arg.startsWith('-'))

const isTTY = process.stdout.isTTY
const isNonInteractive = yesMode || !isTTY

/* ── Detect if running inside an AI agent ── */
function detectAgentEnv() {
  if (process.env.CLAUDE_CODE) return 'claude'
  if (process.env.CURSOR_TRACE_ID) return 'cursor'
  if (process.env.VSCODE_PID || process.env.CODESPACES) return 'vscode'
  if (process.env.WINDSURF_API_KEY) return 'windsurf'
  if (process.env.AIDER_APP) return 'aider'
  return null
}

/* ── Help ── */
if (help) {
  console.log(`${pc.cyan('Usage:')}
  npx @donniesilalahi/cocreation-skills [skill-name...] [options]

${pc.cyan('Options:')}
  --project, -p   Install to ./.agents/skills in the current project. Default.
  --global, -g    Install to ~/.agents/skills (reference only).
  --force, -f     Overwrite existing installed skill directories.
  --yes, -y       Skip all prompts and use defaults.
  --no-hook       Skip setting up the git pre-commit hook.
  --list          List available skills without installing.
  --help, -h      Show this help.

${pc.cyan('Examples:')}
  npx @donniesilalahi/cocreation-skills --project
  npx @donniesilalahi/cocreation-skills planning-todos analyzing-problems --project
  npx @donniesilalahi/cocreation-skills --global --force`)
  process.exit(0)
}

/* ── ASCII Banner ── */
function printBanner() {
  console.log()
  console.log(pc.cyan('  ╔══════════════════════════════════════════════════════╗'))
  console.log(pc.cyan('  ║                                                      ║'))
  console.log(pc.cyan('  ║') + '      ' + pc.bold(pc.white('🛠️  COCREATION SKILLS INSTALLER')) + '              ' + pc.cyan('║'))
  console.log(pc.cyan('  ║                                                      ║'))
  console.log(pc.cyan('  ║') + '   Give your AI helper skills to plan, debug, and     ' + pc.cyan('║'))
  console.log(pc.cyan('  ║') + '   remember what you learn — all from your terminal.  ' + pc.cyan('║'))
  console.log(pc.cyan('  ║                                                      ║'))
  console.log(pc.cyan('  ╚══════════════════════════════════════════════════════╝'))
  console.log()
}

/* ── Skill discovery ── */
const availableSkills = fs
  .readdirSync(skillsSource, { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => {
    const dir = path.join(skillsSource, e.name)
    const skillFile = path.join(dir, 'SKILL.md')
    let description = ''
    if (fs.existsSync(skillFile)) {
      const content = fs.readFileSync(skillFile, 'utf8')
      const descMatch = content.match(/^description:\s*(.*)$/m)
      if (descMatch) description = descMatch[1].trim()
    }
    return { name: e.name, description, dir }
  })
  .sort((a, b) => a.name.localeCompare(b.name))

if (listOnly) {
  console.log(availableSkills.map((s) => s.name).join('\n'))
  process.exit(0)
}

/* ── Main flow ── */
async function main() {
  if (!isNonInteractive) printBanner()

  const detectedAgent = detectAgentEnv()

  /* 1. Select skills */
  let selectedSkillNames
  if (wantedSkills.length > 0) {
    selectedSkillNames = wantedSkills
    const unknown = selectedSkillNames.filter(
      (n) => !availableSkills.some((s) => s.name === n),
    )
    if (unknown.length > 0) {
      console.error(pc.red(`Unknown skill(s): ${unknown.join(', ')}`))
      console.error(`Available: ${availableSkills.map((s) => s.name).join(', ')}`)
      process.exit(1)
    }
  } else if (isNonInteractive) {
    selectedSkillNames = availableSkills.map((s) => s.name)
  } else {
    const choices = availableSkills.map((s) => ({
      value: s.name,
      label: pc.bold(s.name),
      hint: s.description.slice(0, 60) + (s.description.length > 60 ? '…' : ''),
    }))

    const result = await p.multiselect({
      message: 'Which skills do you want to install?',
      options: choices,
      initialValues: availableSkills.map((s) => s.name),
    })

    if (p.isCancel(result)) {
      p.cancel('Installation cancelled.')
      process.exit(0)
    }
    selectedSkillNames = result
  }

  const selectedSkills = availableSkills.filter((s) =>
    selectedSkillNames.includes(s.name),
  )

  /* 2. Detect agents */
  const detectedAgents = installProject
    ? detectInstalledAgents(process.cwd())
    : []

  let targetAgents
  if (isNonInteractive) {
    // Auto-select: universal + detected + agent from env
    const auto = new Set(['universal'])
    detectedAgents.forEach((a) => auto.add(a.id))
    if (detectedAgent) auto.add(detectedAgent)
    targetAgents = agents.filter((a) => auto.has(a.id))
  } else {
    const agentChoices = agents.map((a) => {
      const detected =
        installProject && detectedAgents.some((d) => d.id === a.id)
      const label = detected
        ? `${pc.bold(a.name)} ${pc.green('(detected)')}`
        : pc.bold(a.name)
      return {
        value: a.id,
        label,
        hint: a.universal ? 'Works with any agent' : `Installs to ${a.projectDir}`,
      }
    })

    const defaults = ['universal']
    detectedAgents.forEach((a) => defaults.push(a.id))
    if (detectedAgent && !defaults.includes(detectedAgent))
      defaults.push(detectedAgent)

    const result = await p.multiselect({
      message: 'Which AI helpers should get these skills?',
      options: agentChoices,
      initialValues: defaults,
    })

    if (p.isCancel(result)) {
      p.cancel('Installation cancelled.')
      process.exit(0)
    }
    targetAgents = agents.filter((a) => result.includes(a.id))
  }

  /* 3. Scope (project vs global) */
  let scope = installProject ? 'project' : 'global'
  if (!isNonInteractive && !installGlobal && !installProject) {
    const result = await p.select({
      message: 'Where should skills be installed?',
      options: [
        { value: 'project', label: 'Project only (.agents/skills in this folder)' },
        { value: 'global', label: 'Global (~/.agents/skills on this computer)' },
      ],
      initialValue: 'project',
    })
    if (p.isCancel(result)) {
      p.cancel('Installation cancelled.')
      process.exit(0)
    }
    scope = result
  }
  const isProject = scope === 'project'

  /* 4. Method (symlink vs copy) */
  let useSymlinks = true
  if (!isNonInteractive && isProject && targetAgents.some((a) => !a.universal)) {
    const result = await p.select({
      message: 'How should skills be linked to agent folders?',
      options: [
        { value: 'symlink', label: 'Symlink (recommended) — one source, multiple agents' },
        { value: 'copy', label: 'Copy — separate files for each agent' },
      ],
      initialValue: 'symlink',
    })
    if (p.isCancel(result)) {
      p.cancel('Installation cancelled.')
      process.exit(0)
    }
    useSymlinks = result === 'symlink'
  }

  /* 5. Summary */
  if (!isNonInteractive) {
    const lines = [
      pc.bold('Skills:') + ' ' + selectedSkills.map((s) => pc.cyan(s.name)).join(', '),
      pc.bold('Agents:') + ' ' + targetAgents.map((a) => a.name).join(', '),
      pc.bold('Scope:') + ' ' + (isProject ? 'Project' : 'Global'),
    ]
    if (isProject && targetAgents.some((a) => !a.universal)) {
      lines.push(pc.bold('Link:') + ' ' + (useSymlinks ? 'Symlink' : 'Copy'))
    }
    p.note(lines.join('\n'), 'Ready to install')

    const confirm = await p.confirm({
      message: 'Proceed with installation?',
      initialValue: true,
    })
    if (p.isCancel(confirm) || !confirm) {
      p.cancel('Installation cancelled.')
      process.exit(0)
    }
  }

  /* 6. Install */
  const s = p.spinner()
  if (!isNonInteractive) s.start('Installing skills…')

  const canonicalBase = isProject
    ? path.join(process.cwd(), '.agents', 'skills')
    : path.join(os.homedir(), '.agents', 'skills')

  fs.mkdirSync(canonicalBase, { recursive: true })

  const installed = []
  const skipped = []
  const symlinkFails = []

  for (const skill of selectedSkills) {
    const source = skill.dir
    const canonicalTarget = path.join(canonicalBase, skill.name)

    if (fs.existsSync(canonicalTarget)) {
      if (!force) {
        skipped.push(skill.name)
        continue
      }
      fs.rmSync(canonicalTarget, { recursive: true, force: true })
    }

    copyDirectory(source, canonicalTarget)

    // Copy per-skill indexer
    const skillIndexSrc = path.join(scriptsSource, 'skill-index.js')
    const skillIndexDst = path.join(canonicalTarget, 'index.js')
    if (fs.existsSync(skillIndexSrc)) {
      fs.copyFileSync(skillIndexSrc, skillIndexDst)
    }

    installed.push(skill.name)

    // Link/copy to agent-specific dirs
    for (const agent of targetAgents) {
      if (agent.universal) continue // universal agent uses canonical directly

      const agentDir = getAgentDir(agent, isProject)
      const agentSkillPath = path.join(agentDir, skill.name)

      // Skip if agent root doesn't exist in project
      if (isProject) {
        const agentRoot = path.join(process.cwd(), agent.rootHint)
        if (!fs.existsSync(agentRoot)) continue
      }

      fs.mkdirSync(agentDir, { recursive: true })

      try {
        fs.lstatSync(agentSkillPath)
        fs.rmSync(agentSkillPath, { recursive: true, force: true })
      } catch {
        // path does not exist, nothing to remove
      }

      if (useSymlinks) {
        try {
          fs.symlinkSync(canonicalTarget, agentSkillPath)
        } catch {
          // Fallback to copy if symlink fails
          copyDirectory(canonicalTarget, agentSkillPath)
          symlinkFails.push(`${agent.name}/${skill.name}`)
        }
      } else {
        copyDirectory(canonicalTarget, agentSkillPath)
      }
    }
  }

  // Copy master indexer
  const indexAllSrc = path.join(scriptsSource, 'index-all.js')
  const indexAllDst = path.join(canonicalBase, 'index-all.js')
  if (fs.existsSync(indexAllSrc)) {
    fs.copyFileSync(indexAllSrc, indexAllDst)
    fs.chmodSync(indexAllDst, 0o755)
  }

  if (!isNonInteractive) s.stop('Installation complete!')

  /* 7. Git hook */
  if (isProject && !noHook) {
    const gitDir = path.join(process.cwd(), '.git')
    const hooksDir = path.join(gitDir, 'hooks')
    const preCommitHook = path.join(hooksDir, 'pre-commit')

    if (fs.existsSync(gitDir) && !fs.existsSync(preCommitHook)) {
      fs.mkdirSync(hooksDir, { recursive: true })
      const hookContent = `#!/bin/sh
# Auto-update memory-bank indices before each commit
cd "$(git rev-parse --show-toplevel)" || exit 1
node .agents/skills/index-all.js
# Stage any updated index files
git diff --name-only | grep -E '^\\.agents/skills/[^/]+/memory-bank/(PLAN|ANALYSIS|LEARNING|IMPLEMENTATION)\\.md$' | while read -r file; do
  git add "$file"
done
git ls-files --others --exclude-standard | grep -E '^\\.agents/skills/[^/]+/memory-bank/(PLAN|ANALYSIS|LEARNING|IMPLEMENTATION)\\.md$' | while read -r file; do
  git add "$file"
done
`
      fs.writeFileSync(preCommitHook, hookContent)
      fs.chmodSync(preCommitHook, 0o755)
      if (!isNonInteractive) {
        console.log(pc.green('✔ Git hook installed → .git/hooks/pre-commit'))
      }
    }
  }

  /* 8. Results */
  if (isNonInteractive) {
    console.log(`Installed ${installed.length} skill(s) to ${canonicalBase}`)
    if (skipped.length) console.log(`Skipped (already exists): ${skipped.join(', ')}`)
  } else {
    const resultLines = []
    if (installed.length) {
      resultLines.push(pc.green('✔ Installed:') + ' ' + installed.join(', '))
    }
    if (skipped.length) {
      resultLines.push(pc.yellow('⊘ Skipped (exists):') + ' ' + skipped.join(', '))
    }
    if (symlinkFails.length) {
      resultLines.push(pc.yellow('⚠ Symlink failed, used copy instead:') + ' ' + symlinkFails.join(', '))
    }
    if (isProject && targetAgents.some((a) => !a.universal)) {
      resultLines.push('')
      resultLines.push(pc.dim('Skills live in .agents/skills/ and are linked to agent folders.'))
    }
    p.outro(resultLines.join('\n') || 'All done!')
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

main().catch((err) => {
  console.error(pc.red('Error:'), err.message)
  process.exit(1)
})
