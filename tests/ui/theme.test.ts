import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const css = readFileSync(join(process.cwd(), 'src', 'ui', 'theme.css'), 'utf8')

const colors = [
  'bg', 'surface', 'ink', 'muted', 'keyline', 'accent', 'action', 'interval-tint', 'wrong',
  'role-root', 'role-third', 'role-fifth', 'role-seventh', 'key-black', 'key-edge', 'focus',
  'on-fill', 'chip',
]

function block(selectorStart: string): string {
  const start = css.indexOf(selectorStart)
  expect(start, `${selectorStart} block`).toBeGreaterThanOrEqual(0)
  let depth = 0
  for (let i = css.indexOf('{', start); i < css.length; i++) {
    if (css[i] === '{') depth++
    if (css[i] === '}' && --depth === 0) return css.slice(start, i)
  }
  throw new Error(`unclosed ${selectorStart}`)
}

const declared = (text: string) => new Set([...text.matchAll(/(--[\w-]+)\s*:/g)].map((m) => m[1]))

describe('theme tokens', () => {
  const root = block(':root {')
  const dark = block('@media (prefers-color-scheme: dark)')

  it.each(colors)('defines %s with a -dark twin', (name) => {
    const names = declared(root)
    expect(names).toContain(`--color-${name}`)
    expect(names).toContain(`--color-${name}-dark`)
  })

  it.each(colors)('swaps %s to its twin under a dark scheme', (name) => {
    expect(dark).toContain(`--color-${name}: var(--color-${name}-dark)`)
  })

  it('declares the typography ramp', () => {
    const names = declared(root)
    for (const type of ['wordmark', 'readout', 'readout-question', 'hint', 'legend', 'mode', 'segment', 'button', 'interval-label', 'note-label', 'key-hint', 'key-hint-small']) {
      expect(names).toContain(`--type-${type}-size`)
      expect(names).toContain(`--type-${type}-weight`)
    }
    expect(names).toContain('--font-serif')
    expect(names).toContain('--font-sans')
  })

  it('declares rounded and spacing tokens', () => {
    const names = declared(root)
    for (const name of ['key-black', 'key', 'interval', 'full']) expect(names).toContain(`--rounded-${name}`)
    for (const name of ['mode-gap', 'toggle-gap', 'toggle-padding', 'readout-gap', 'interval-gap', 'control-gap', 'control-top', 'strip-height', 'strip-padding-x', 'body-padding', 'mode-padding', 'segment-padding', 'button-padding', 'interval-padding', 'help-size', 'focus-ring-width', 'focus-ring-offset', 'key-edge-width']) {
      expect(names).toContain(`--spacing-${name}`)
    }
  })

  it('keeps key hints upright and everything else italic', () => {
    expect(css).toMatch(/body\s*{[^}]*font-style:\s*italic/)
    expect(css).toMatch(/\.key-hint\s*{[^}]*font-style:\s*normal/)
  })

  it('makes transitions instant under reduced motion', () => {
    expect(block('@media (prefers-reduced-motion: reduce)')).toMatch(/transition:\s*none/)
  })
})
