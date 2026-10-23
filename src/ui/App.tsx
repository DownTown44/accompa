import { ModeStrip } from './ModeStrip'
import { SessionProvider } from './SessionContext'
import { useShortcuts } from './useShortcuts'

function Shell() {
  useShortcuts()
  return (
    <div className="page">
      <ModeStrip />
      <main className="body" />
    </div>
  )
}

export function App() {
  return (
    <SessionProvider>
      <Shell />
    </SessionProvider>
  )
}
