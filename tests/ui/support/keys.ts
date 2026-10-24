import { act } from '@testing-library/react'

// happy-dom reports AltGraph whenever Alt is down, which browsers do not.
export function press(init: KeyboardEventInit | string, target: EventTarget = document.body, altGraph = false) {
  const options = typeof init === 'string' ? { key: init } : init
  const event = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...options })
  event.getModifierState = (name: string) => name === 'AltGraph' && altGraph
  act(() => {
    target.dispatchEvent(event)
  })
  return event
}
