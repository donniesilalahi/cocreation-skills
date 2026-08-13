#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const VALUE_FLAGS = new Set([
  '--workspace-root',
  '--storage',
  '--product-type',
  '--product-name',
  '--product-id',
  '--product-url',
  '--linear-workspace-url',
  '--project-name',
  '--project-id',
  '--project-url',
  '--execution-team',
])

const INIT_USAGE = `Usage:
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
  --execution-team <id>         Repeat for multiple execution teams`

/**
 * Scaffold the project-owned cocreation boundary without overwriting records.
 * The plugin owns instructions; this command owns only consumer-project state.
 */
export function initializeWorkspace({
  cwd = process.cwd(),
  args = [],
  packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'),
} = {}) {
  if (args.includes('--help') || args.includes('-h')) {
    console.log(INIT_USAGE)
    return
  }
  const options = parseOptions(args)
  const workspaceRoot = path.resolve(cwd, options.workspaceRoot)
  const workspaceDir = path.join(workspaceRoot, 'workspace')
  const skillsRoot = path.join(workspaceRoot, 'skills')
  const localConfigDir = path.join(cwd, '.agents', 'workspace')
  const configPath = path.join(localConfigDir, 'cocreation.yaml')

  fs.mkdirSync(workspaceDir, { recursive: true })
  fs.mkdirSync(path.join(workspaceDir, 'inbox'), { recursive: true })
  fs.mkdirSync(path.join(workspaceDir, 'raw'), { recursive: true })
  fs.mkdirSync(skillsRoot, { recursive: true })
  touch(path.join(workspaceDir, 'raw', '.gitkeep'))

  writeIfMissing(configPath, renderConfig(options))
  writeIfMissing(path.join(workspaceDir, 'STATE.md'), renderState())
  writeIfMissing(path.join(workspaceDir, 'inbox', 'INBOX.md'), renderInbox())

  const scaffolded = scaffoldSkillMemoryBanks(packageRoot, skillsRoot)

  console.log(`Initialized cocreation workspace at ${workspaceRoot}`)
  console.log(`Config: ${configPath}`)
  console.log(`Storage mode: ${options.storage}`)
  console.log(`Product scope: ${options.productType}`)
  console.log(`Scaffolded ${scaffolded} skill memory-bank directories`)
  if (options.storage !== 'local' && !options.productId) {
    console.log(
      'Next: fill product.id and product.url in .agents/workspace/cocreation.yaml before using Linear mode.',
    )
  }
}

function parseOptions(args) {
  const options = {
    workspaceRoot: '.agents',
    storage: 'local',
    productType: 'initiative',
    productName: '',
    productId: '',
    productUrl: '',
    linearWorkspaceUrl: '',
    projectName: '',
    projectId: '',
    projectUrl: '',
    executionTeams: [],
  }

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i]
    if (arg === '--force') {
      throw new Error(
        '--force is intentionally unsupported: initialization never overwrites project records; edit the config explicitly instead.',
      )
    }
    if (!VALUE_FLAGS.has(arg)) {
      throw new Error(`Unknown init option: ${arg}`)
    }
    const value = args[i + 1]
    if (!value || value.startsWith('--')) {
      throw new Error(`${arg} requires a value`)
    }
    i += 1

    switch (arg) {
      case '--workspace-root':
        options.workspaceRoot = value
        break
      case '--storage':
        options.storage = value
        break
      case '--product-type':
        options.productType = value
        break
      case '--product-name':
        options.productName = value
        break
      case '--product-id':
        options.productId = value
        break
      case '--product-url':
        options.productUrl = value
        break
      case '--linear-workspace-url':
        options.linearWorkspaceUrl = value
        break
      case '--project-name':
        options.projectName = value
        break
      case '--project-id':
        options.projectId = value
        break
      case '--project-url':
        options.projectUrl = value
        break
      case '--execution-team':
        options.executionTeams.push(value)
        break
      default:
        break
    }
  }

  if (!['local', 'linear-primary', 'mirror'].includes(options.storage)) {
    throw new Error('--storage must be local, linear-primary, or mirror')
  }
  if (!['initiative', 'team'].includes(options.productType)) {
    throw new Error('--product-type must be initiative or team')
  }

  return options
}

function renderConfig(options) {
  const indexMode =
    options.storage === 'linear-primary'
      ? 'linear-catalog'
      : options.storage === 'mirror'
        ? 'hybrid'
        : 'local'

  return `# Project-owned cocreation configuration.\n# Paths are resolved relative to the repository root unless absolute.\n\nversion: 1\nworkspaceRoot: ${yamlString(options.workspaceRoot)}\n\nstorage:\n  mode: ${options.storage}\n  localCache: true\n\nproduct:\n  type: ${options.productType}\n  name: ${yamlString(options.productName)}\n  id: ${yamlString(options.productId)}\n  url: ${yamlString(options.productUrl)}\n\nlinear:\n  workspaceUrl: ${yamlString(options.linearWorkspaceUrl)}\n  project:\n    name: ${yamlString(options.projectName)}\n    id: ${yamlString(options.projectId)}\n    url: ${yamlString(options.projectUrl)}\n  executionTeams: [${options.executionTeams.map(yamlString).join(', ')}]\n\nindex:\n  mode: ${indexMode}\n  catalogDocument: ""\n`
}

function renderState() {
  const today = new Date().toISOString().slice(0, 10)
  return `# Project state\n\n**Last updated:** ${today} · [State: fresh]\n\n## Head — active context\n\n- **Authoritative spec (SSOT):** not set — run codirect or cospecify when work begins\n- **Current focus:** none\n- **Workflow:** none — not started\n- **Next:** none — choose a workflow for the next request\n- **In-flight loop:** none\n- **Open decisions:** none\n- **Blockers:** none\n\n## Progress ledger — history (append-only; never rewrite a row)\n\n| Date | Workflow | Loop | Agent/model | Verdict | Record | Commit/artifact |\n|------|----------|------|-------------|---------|--------|-----------------|\n`
}

function renderInbox() {
  const today = new Date().toISOString().slice(0, 10)
  return `# Human inbox\n\n**Last updated:** ${today}\n\n## Blocking — on the critical path (resolve to unblock)\n\n| Item | Kind | Raised by | Due | Status |\n|------|------|-----------|-----|--------|\n| None | — | — | — | — |\n\n## Parked — non-blocking (work continues around these)\n\n| Item | Kind | Interim | Must reconcile? | Status |\n|------|------|---------|-----------------|--------|\n| None | — | — | — | — |\n\n## Resolved / done (kept for the trail; supersede, never delete)\n\n| Item | Kind | Answer / result | Decided by | Date |\n|------|------|-----------------|------------|------|\n| None | — | — | — | — |\n`
}

function scaffoldSkillMemoryBanks(packageRoot, skillsRoot) {
  const sourceRoot = path.join(packageRoot, 'skills')
  let count = 0

  for (const entry of fs.readdirSync(sourceRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    const sourceSkill = path.join(sourceRoot, entry.name)
    const sourceMemoryBank = path.join(sourceSkill, 'memory-bank')
    if (!fs.existsSync(sourceMemoryBank)) continue

    const targetSkill = path.join(skillsRoot, entry.name)
    const targetMemoryBank = path.join(targetSkill, 'memory-bank')
    fs.mkdirSync(targetMemoryBank, { recursive: true })
    copyIfMissing(path.join(sourceSkill, 'index.mjs'), path.join(targetSkill, 'index.mjs'))

    for (const file of fs.readdirSync(sourceMemoryBank)) {
      copyIfMissing(
        path.join(sourceMemoryBank, file),
        path.join(targetMemoryBank, file),
      )
    }
    execFileSync(process.execPath, [path.join(targetSkill, 'index.mjs')], {
      cwd: targetSkill,
      stdio: 'ignore',
    })
    count += 1
  }

  return count
}

function copyIfMissing(source, target) {
  if (!fs.existsSync(source) || fs.existsSync(target)) return
  fs.mkdirSync(path.dirname(target), { recursive: true })
  fs.copyFileSync(source, target)
}

function writeIfMissing(file, content) {
  if (fs.existsSync(file)) {
    console.log(`Preserved ${file}`)
    return
  }
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, content)
  console.log(`Created ${file}`)
}

function touch(file) {
  if (!fs.existsSync(file)) fs.writeFileSync(file, '')
}

function yamlString(value) {
  return JSON.stringify(value ?? '')
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    initializeWorkspace({ args: process.argv.slice(2) })
  } catch (error) {
    console.error(error instanceof Error ? error.message : error)
    process.exitCode = 1
  }
}
