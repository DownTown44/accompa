import { ModeStrip } from './ModeStrip'
import { SessionProvider } from './SessionContext'

export function App() {
  return (
    <SessionProvider>
      <div className="page">
        <ModeStrip />
        <main className="body" />
      </div>
    </SessionProvider>
  )
}
