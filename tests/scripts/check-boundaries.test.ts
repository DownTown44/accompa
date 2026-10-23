import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'

const script = join(process.cwd(), 'scripts', 'check-boundaries.mjs')
const roots: string[] = []

function check(files: Record<string, string>) {
  const root = mkdtempSync(join(tmpdir(), 'boundaries-'))
  roots.push(root)
  for (const [name, content] of Object.entries(files)) {
    const path = join(root, 'src', name)
    mkdirSync(dirname(path), { recursive: true })
    writeFileSync(path, content)
  }
  const result = spawnSync(process.execPath, [script, join(root, 'src')], { encoding: 'utf8' })
  return { code: result.status, stderr: result.stderr }
}

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true })
})

describe('check-boundaries', () => {
  it('passes the real project', () => {
    const result = spawnSync(process.execPath, [script], { encoding: 'utf8' })
    expect(result.status).toBe(0)
  })

  it('allows ui to import core and audio, and audio to import core', () => {
    const { code } = check({
      'core/a.ts': 'export const a = 1',
      'audio/b.ts': "import { a } from '../core/a'\nexport const b = a",
      'ui/c.ts': "import { a } from '../core/a'\nimport { b } from '../audio/b'\nexport const c = a + b",
    })
    expect(code).toBe(0)
  })

  it.each([
    ['core imports ui', 'core/a.ts', "import { x } from '../ui/x'", 'core/a.ts', '../ui/x'],
    ['core imports audio', 'core/a.ts', "import { x } from '../audio/x'", 'core/a.ts', '../audio/x'],
    ['audio imports ui', 'audio/a.ts', "import { x } from '../ui/x'", 'audio/a.ts', '../ui/x'],
  ])('fails when %s, naming the file and import', (_name, file, source, offender, spec) => {
    const { code, stderr } = check({ [file]: source })
    expect(code).toBe(1)
    expect(stderr).toContain(offender)
    expect(stderr).toContain(spec)
  })

  it.each([
    ['side-effect import', "import '../ui/x'"],
    ['re-export', "export { x } from '../ui/x'"],
    ['dynamic import', "const m = import('../ui/x')"],
    ['type import', "import type { X } from '../ui/x'"],
  ])('checks %s', (_name, source) => {
    expect(check({ 'core/a.ts': source }).code).toBe(1)
  })

  it('does not check files outside src', () => {
    const { code } = check({ 'core/a.ts': 'export const a = 1', '../tests/a.test.ts': "import { x } from '../src/ui/x'" })
    expect(code).toBe(0)
  })

  it('ignores bare package imports', () => {
    expect(check({ 'core/a.ts': "import { useState } from 'react'" }).code).toBe(0)
  })
})
