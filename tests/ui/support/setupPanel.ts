import { afterEach, beforeEach, vi } from 'vitest'

export const chips = () => [...document.querySelectorAll<HTMLButtonElement>('.setup-chip')]
export const chip = (name: string) => chips().find((c) => c.textContent === name)!
export const answer = (name: string) =>
  [...document.querySelectorAll<HTMLElement>('.interval-button')].find((b) => b.querySelector('.interval-label')!.textContent === name)!

export function registerSetupHooks() {
  beforeEach(() => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5)
  })

  afterEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
    vi.restoreAllMocks()
  })
}
