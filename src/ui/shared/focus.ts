import type { MouseEvent } from 'react'

const FLAG = 'pointerFocus'

// Pointer focus on the instrument shows no ring; the next Tab brings the keyboard ring back, other keys are shortcuts.
if (typeof document !== 'undefined') {
  document.addEventListener('keydown', (event) => { if (event.key === 'Tab') delete document.documentElement.dataset[FLAG] }, true)
  document.addEventListener(
    'pointerdown',
    (event) => {
      if (event.target instanceof Element && event.target.closest('.piano, .fretboard')) document.documentElement.dataset[FLAG] = ''
    },
    true,
  )
}

// After a pointer click the active instrument takes focus, once the click's state change has rendered,
// so shortcuts keep working; keyboard activation keeps focus where it is.
export function focusInstrument(event: MouseEvent<HTMLElement>) {
  if (event.detail > 0) {
    document.documentElement.dataset[FLAG] = ''
    setTimeout(() => document.querySelector<HTMLElement>('.piano, .fretboard')?.focus(), 0)
  }
}
