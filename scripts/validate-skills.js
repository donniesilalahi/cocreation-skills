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
