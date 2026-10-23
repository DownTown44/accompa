import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join, relative, resolve, sep } from 'node:path'

// A layer may import only from the layers listed for it (AD-1).
const allowed = {
  core: [],
  audio: ['core'],
  ui: ['core', 'audio'],
}

const sourceFile = /\.(?:[cm]?[jt]s|[jt]sx)$/
const specifier = /(?:\bfrom\s*|\bimport\s*\(?\s*)(['"])([^'"]+)\1/g

function* walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) yield* walk(path)
    else if (sourceFile.test(entry.name)) yield path
  }
}

const layerOf = (srcDir, path) => relative(srcDir, path).split(sep)[0]

function findViolations(srcDir) {
  const violations = []
  for (const file of walk(srcDir)) {
    const from = layerOf(srcDir, file)
    if (!(from in allowed)) continue
    for (const [, , spec] of readFileSync(file, 'utf8').matchAll(specifier)) {
      if (!spec.startsWith('.')) continue
      const to = layerOf(srcDir, resolve(dirname(file), spec))
      if (to in allowed && to !== from && !allowed[from].includes(to)) {
        violations.push(`${relative(srcDir, file).split(sep).join('/')} imports ${spec}: ${from} must not import from ${to}`)
      }
    }
  }
  return violations
}

const violations = findViolations(resolve(process.argv[2] ?? 'src'))
for (const violation of violations) console.error(violation)
process.exit(violations.length > 0 ? 1 : 0)
