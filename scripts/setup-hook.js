#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const cwd = process.cwd()
const gitDir = path.join(cwd, '.git')
const hooksDir = path.join(gitDir, 'hooks')
const preCommitHook = path.join(hooksDir, 'pre-commit')

if (!fs.existsSync(gitDir)) {
  console.error('No .git directory found. Run this from inside a git repository.')
  process.exit(1)
}

fs.mkdirSync(hooksDir, { recursive: true })

const hookMarker = '# === cocreation-skills auto-index ==='
const hookBody = `#!/bin/sh
${hookMarker}
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
# === end cocreation-skills ===
`

let existing = ''
if (fs.existsSync(preCommitHook)) {
  existing = fs.readFileSync(preCommitHook, 'utf8')
}

if (existing.includes(hookMarker)) {
  console.log('✔ Git hook already set up. Nothing to do.')
  process.exit(0)
}

let newContent
if (existing.trim()) {
  // Append to existing hook
  newContent = existing.trimEnd() + '\n\n' + hookBody
  console.log('✔ Appended auto-index to existing .git/hooks/pre-commit')
} else {
  newContent = hookBody
  console.log('✔ Created .git/hooks/pre-commit with auto-index')
}

fs.writeFileSync(preCommitHook, newContent)
fs.chmodSync(preCommitHook, 0o755)
