import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

export const agents = [
  {
    id: 'universal',
    name: 'Universal / Any Agent',
    projectDir: '.agents/skills',
    globalDir: path.join(os.homedir(), '.agents/skills'),
    rootHint: '.agents',
    universal: true,
  },
  {
    id: 'claude',
    name: 'Claude Code',
    projectDir: '.claude/skills',
    globalDir: path.join(os.homedir(), '.claude/skills'),
    rootHint: '.claude',
    universal: false,
  },
  {
    id: 'cursor',
    name: 'Cursor',
    projectDir: '.cursor/skills',
    globalDir: path.join(os.homedir(), '.cursor/skills'),
    rootHint: '.cursor',
    universal: false,
  },
  {
    id: 'vscode',
    name: 'VS Code / GitHub Copilot',
    projectDir: '.vscode/skills',
    globalDir: path.join(os.homedir(), '.vscode/skills'),
    rootHint: '.vscode',
    universal: false,
  },
  {
    id: 'windsurf',
    name: 'Windsurf',
    projectDir: '.windsurf/skills',
    globalDir: path.join(os.homedir(), '.windsurf/skills'),
    rootHint: '.windsurf',
    universal: false,
  },
  {
    id: 'cline',
    name: 'Cline',
    projectDir: '.cline/skills',
    globalDir: path.join(os.homedir(), '.cline/skills'),
    rootHint: '.cline',
    universal: false,
  },
  {
    id: 'aider',
    name: 'Aider',
    projectDir: '.aider/skills',
    globalDir: path.join(os.homedir(), '.aider/skills'),
    rootHint: '.aider',
    universal: false,
  },
]

export function detectInstalledAgents(cwd = process.cwd()) {
  return agents.filter((agent) => {
    const rootPath = path.join(cwd, agent.rootHint)
    return fs.existsSync(rootPath)
  })
}

export function getAgentDir(agent, isProject) {
  return isProject
    ? path.join(process.cwd(), agent.projectDir)
    : agent.globalDir
}
