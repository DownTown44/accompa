import type { MouseEvent } from 'react'

// After a pointer click the active instrument takes focus, once the click's state change has rendered,
// so shortcuts keep working; keyboard activation keeps focus where it is.
export function focusInstrument(event: MouseEvent<HTMLElement>) {
  if (event.detail > 0) setTimeout(() => document.querySelector<HTMLElement>('.piano, .fretboard')?.focus(), 0)
}
