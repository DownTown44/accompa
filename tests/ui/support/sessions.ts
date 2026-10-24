import { initialSession, type Session } from '../../../src/ui/session/session'

// The app opens in Explore; tests of the practice flow start from Listen.
export const listenSession: Session = { ...initialSession, mode: 'listen' }
