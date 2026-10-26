import { useEffect, useRef, useState } from 'react'
import '../shared/shared.css'
import './explore.css'
import { exploreReading } from '../../core/explore'
import { RoleMarker } from '../shared/RoleMarker'
import { useSession } from '../session/SessionContext'
import { useVoicingList } from '../session/useLitNotes'
import { useSessionActions } from '../session/useSessionActions'
import { VoicingStepper } from './VoicingStepper'

const ANNOUNCE_DELAY_MS = 400

export const EXPLORE_PROMPT = 'Select notes to build a chord'

// The font steps down with the label length so the one-line readout never wraps.
const sizeFor = (label: string): 'large' | 'medium' | 'small' =>
  label.length <= 6 ? 'large' : label.length <= 10 ? 'medium' : 'small'

export function ExploreView() {
  const { session } = useSession()
  const { chooseReading } = useSessionActions()
  const { readout, legend, alternatives } = exploreReading(session.workspace.pitches, session.workspace.reading, session.workspace.root)
  const spoken = readout ? (readout.name ?? readout.label) : ''
  const [announced, setAnnounced] = useState('')
  useEffect(() => {
    const timer = setTimeout(() => setAnnounced(spoken), ANNOUNCE_DELAY_MS)
    return () => clearTimeout(timer)
  }, [spoken])
  const list = useVoicingList()
  const [stepped, setStepped] = useState('')
  const last = useRef(list)
  // A step moves along the same list; a new chord, a swap or an undo is not announced.
  useEffect(() => {
    const before = last.current
    last.current = list
    if (before.frets !== list.frets) setStepped('')
    if (before.frets !== list.frets || before.index === list.index || list.count < 2) return
    const timer = setTimeout(() => setStepped(`Voicing ${list.index + 1} of ${list.count}`), ANNOUNCE_DELAY_MS)
    return () => clearTimeout(timer)
  }, [list])
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
      <div className="reading-alternatives" role="group" aria-label="Other readings">
        {alternatives.map((option, i) => (
          <button key={i} type="button" className="reading-alt" onClick={() => chooseReading(option.choice)}>
            <span aria-hidden="true">{option.symbol}</span>
            <span className="visually-hidden">{option.spoken}</span>
          </button>
        ))}
      </div>
      <VoicingStepper />
      <ul className="role-legend" aria-label="Note roles">
        {legend.map((entry) => (
          <li key={entry.role} data-role={entry.role}>
            <svg viewBox="-17 -17 34 34" aria-hidden="true">
              <RoleMarker role={entry.role} cx={0} cy={0} />
            </svg>
            <span>{entry.degree ? `${entry.label} ${entry.note} (${entry.degree})` : `${entry.label} ${entry.note}`}</span>
          </li>
        ))}
      </ul>
      <p className="visually-hidden" aria-live="polite" data-testid="explore-announce">
        {announced}
      </p>
      <p className="visually-hidden" aria-live="polite" data-testid="voicing-announce">
        {stepped}
      </p>
    </section>
  )
}
