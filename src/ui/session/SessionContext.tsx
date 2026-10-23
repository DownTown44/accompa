import { createContext, useContext, useReducer, type Dispatch, type ReactNode } from 'react'
import { initialSession, sessionReducer, type Session, type SessionAction } from './session'

interface SessionValue {
  session: Session
  dispatch: Dispatch<SessionAction>
}

const SessionContext = createContext<SessionValue | null>(null)

export function SessionProvider({ children, initial = initialSession }: { children: ReactNode; initial?: Session }) {
  const [session, dispatch] = useReducer(sessionReducer, initial)
  return <SessionContext.Provider value={{ session, dispatch }}>{children}</SessionContext.Provider>
}

export function useSession(): SessionValue {
  const value = useContext(SessionContext)
  if (!value) throw new Error('useSession must be used inside SessionProvider')
  return value
}
