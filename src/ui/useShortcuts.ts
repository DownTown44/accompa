import { useEffect } from 'react'
import { useSession } from './SessionContext'

const textInputTypes = new Set(['text', 'search', 'email', 'url', 'tel', 'password', 'number'])

function isTextField(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  if (target.isContentEditable || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) return true
  return target instanceof HTMLInputElement && textInputTypes.has(target.type)
}

// AltGr is reported as Ctrl+Alt, and must not count as a modifier.
function hasModifier(event: KeyboardEvent): boolean {
  if (event.getModifierState('AltGraph')) return false
  return event.ctrlKey || event.altKey || event.metaKey
}

export function useShortcuts() {
  const { dispatch } = useSession()

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.repeat || hasModifier(event) || isTextField(event.target)) return
      const key = event.key.toLowerCase()
      if (key === 'm') dispatch({ type: 'toggleMode' })
      else if (key === 'i') dispatch({ type: 'toggleInstrument' })
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [dispatch])
}
