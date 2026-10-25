import { useEffect, useState } from 'react'
import '../shared/shared.css'
import './explore.css'
import { exploreReadout } from '../../core/explore'
import { useSession } from '../session/SessionContext'

const ANNOUNCE_DELAY_MS = 400

export const EXPLORE_PROMPT = 'Select notes to build a chord'

// The font steps down with the label length so the one-line readout never wraps.
const sizeFor = (label: string): 'large' | 'medium' | 'small' =>
  label.length <= 6 ? 'large' : label.length <= 10 ? 'medium' : 'small'

export function ExploreView() {
  const { session } = useSession()
  const readout = exploreReadout(session.workspace.pitches)
  const spoken = readout ? (readout.name ?? readout.label) : ''
  const [announced, setAnnounced] = useState('')
  useEffect(() => {
    const timer = setTimeout(() => setAnnounced(spoken), ANNOUNCE_DELAY_MS)
    return () => clearTimeout(timer)
  }, [spoken])
  if (session.mode !== 'explore') return null
  return (
    <section className="explore" aria-label="Explore">
      {readout ? (
        <p className="readout-interval" data-size={sizeFor(readout.label)}>
          <span aria-hidden="true">{readout.label}</span>
          <span className="visually-hidden">{readout.name ?? readout.label}</span>
        </p>
      ) : (
        <p className="explore-prompt">{EXPLORE_PROMPT}</p>
      )}
      <p className="visually-hidden" aria-live="polite" data-testid="explore-announce">
        {announced}
      </p>
    </section>
  )
}
