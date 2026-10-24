import { fireEvent, screen } from '@testing-library/react'

export const radio = (name: string) => screen.getByRole('radio', { name, hidden: true }) as HTMLInputElement
export const opener = () => screen.getByRole('button', { name: 'Setup' })
export const panel = () => document.getElementById('setup-panel') as HTMLElement
export const key = (n: number) => document.querySelector(`[data-pitch="${n}"]`)!
export const click = (el: Element) => {
  fireEvent.pointerDown(el)
  fireEvent.pointerUp(el)
}
export const lit = () => [...document.querySelectorAll('[data-lit]')].map((n) => n.getAttribute('data-lit')).sort()
export const rooted = () => [...document.querySelectorAll('[data-root]')].map((n) => n.getAttribute('data-lit'))
