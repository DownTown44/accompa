import { createContext, useContext, useEffect, useLayoutEffect, useReducer, type Dispatch, type ReactNode } from 'react'
import { initialSettings, type Settings } from '../../core/model'
import { settingsReducer, type SettingsAction } from './settings'
import { saveSetting } from './settingsStorage'

interface SettingsValue {
  settings: Settings
  dispatch: Dispatch<SettingsAction>
}

const SettingsContext = createContext<SettingsValue | null>(null)

export function SettingsProvider({ children, initial = initialSettings }: { children: ReactNode; initial?: Settings }) {
  const [settings, dispatch] = useReducer(settingsReducer, initial)

  // System leaves the attribute off so the OS scheme decides.
  useLayoutEffect(() => {
    const root = document.documentElement
    if (settings.theme === 'system') root.removeAttribute('data-theme')
    else root.setAttribute('data-theme', settings.theme)
  }, [settings.theme])

  useEffect(() => saveSetting('pool', settings.pool), [settings.pool])
  useEffect(() => saveSetting('sound', settings.sound), [settings.sound])
  useEffect(() => saveSetting('theme', settings.theme), [settings.theme])

  return <SettingsContext.Provider value={{ settings, dispatch }}>{children}</SettingsContext.Provider>
}

export function useSettings(): SettingsValue {
  const value = useContext(SettingsContext)
  if (!value) throw new Error('useSettings must be used inside SettingsProvider')
  return value
}
