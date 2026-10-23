import { useLayoutEffect, useEffect, useRef } from 'react'
import { INTERVALS } from '../../core/theory'
import { INTERVAL_KEYS } from '../listen/intervalKeys'
import { useSessionActions } from '../session/useSessionActions'

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
      const { play, revealOrNext, guess, toggleMode, toggleInstrument, shiftPiano } = latest.current
      const key = event.key.toLowerCase()
      const keyIndex = INTERVAL_KEYS.indexOf(event.key)
      if (keyIndex >= 0) {
        if (!isControl(event.target)) guess(INTERVALS[keyIndex].semitones)
      } else if (key === 'm') toggleMode()
      else if (key === 'i') toggleInstrument()
      else if (key === ']' || event.code === 'BracketRight') shiftPiano(1)
      else if (key === '[' || event.code === 'BracketLeft') shiftPiano(-1)
      else if (key === 'enter' && !isControl(event.target)) {
        event.preventDefault()
        revealOrNext()
      } else if (key === ' ' && !isControl(event.target)) {
        event.preventDefault()
        play()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])
}
