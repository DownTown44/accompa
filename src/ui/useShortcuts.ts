import { useLayoutEffect, useEffect, useRef } from 'react'
import { useSessionActions } from './useSessionActions'

const textInputTypes = new Set(['text', 'search', 'email', 'url', 'tel', 'password', 'number'])

function isTextField(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  if (target.isContentEditable || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) return true
  return target instanceof HTMLInputElement && textInputTypes.has(target.type)
}

// Space and Enter belong to a focused control, which activates itself natively.
function isControl(target: EventTarget | null): boolean {
  return target instanceof Element && target.closest('button, input, select, textarea, a[href], [role="radio"], [role="tab"], [contenteditable]') !== null
}

// AltGr is reported as Ctrl+Alt, and must not count as a modifier.
function hasModifier(event: KeyboardEvent): boolean {
  if (event.getModifierState('AltGraph')) return false
  return event.ctrlKey || event.altKey || event.metaKey
}

export function useShortcuts() {
  const actions = useSessionActions()
  const latest = useRef(actions)

  useLayoutEffect(() => {
    latest.current = actions
  })

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.repeat || hasModifier(event) || isTextField(event.target)) return
      const { play, toggleMode, toggleInstrument } = latest.current
      const key = event.key.toLowerCase()
      if (key === 'm') toggleMode()
      else if (key === 'i') toggleInstrument()
      else if (key === ' ' && !isControl(event.target)) {
        event.preventDefault()
        play()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])
}
