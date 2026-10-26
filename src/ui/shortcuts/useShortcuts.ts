import { useLayoutEffect, useEffect, useRef } from 'react'
import { INTERVALS } from '../../core/theory'
import { INTERVAL_KEYS } from '../listen/intervalKeys'
import { useSession } from '../session/SessionContext'
import { useVoicingList } from '../session/useLitNotes'
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

// Left and Right step voicings from the instrument, the stepper's arrows, or no control at all.
function mayStep(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return true
  if (target.closest('.piano, .fretboard, .voicing-stepper') !== null) return true
  return !isControl(target)
}

export function useShortcuts() {
  const actions = useSessionActions()
  const { session } = useSession()
  const list = useVoicingList()
  const latest = useRef({ actions, list, steps: false })

  useLayoutEffect(() => {
    latest.current = { actions, list, steps: session.mode === 'explore' && session.instrument === 'guitar' && list.count >= 2 }
  })

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.repeat || hasModifier(event) || isTextField(event.target)) return
      const { actions, list, steps } = latest.current
      const { play, revealOrNext, guess, toggleMode, toggleInstrument, shiftPiano, toggleSetup, toggleHelp, dismiss, armRoot, stepVoicing } = actions
      const key = event.key.toLowerCase()
      const keyIndex = INTERVAL_KEYS.indexOf(event.key)
      if (keyIndex >= 0) {
        if (!isControl(event.target)) guess(INTERVALS[keyIndex].semitones)
      } else if (key === 'm') toggleMode()
      else if (key === 'p') toggleSetup()
      else if (key === 'r') {
        if (!isControl(event.target)) armRoot()
      } else if (key === 'arrowleft' || key === 'arrowright') {
        if (steps && mayStep(event.target)) {
          event.preventDefault()
          stepVoicing(key === 'arrowright' ? 1 : -1, list)
        }
      } else if (key === 'escape') dismiss()
      else if (event.key === '?') toggleHelp()
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
