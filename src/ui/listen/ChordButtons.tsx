import '../shared/shared.css'
import './listen.css'
import { canGuess, inPlay } from '../../core/guess'
import { CHORD_QUALITIES } from '../../core/theory'
import { useSettings } from '../settings/SettingsContext'
import { useSession } from '../session/SessionContext'
import { useSessionActions } from '../session/useSessionActions'
import { focusInstrument } from '../shared/focus'
import { qualityLabel } from './chordLabels'
import { INTERVAL_KEYS } from './intervalKeys'

export function ChordButtons() {
  const { session } = useSession()
  const { settings } = useSettings()
  const { guessChord } = useSessionActions()
  const { chordQuestion, revealed, chordWrongMarks = [] } = session.practice
  const { chordPool } = settings
  const active = chordQuestion !== undefined && !revealed
  return (
    <div className="interval-row" role="group" aria-label="Guess the chord quality">
      {CHORD_QUALITIES.map((quality, index) => {
        const inPool = chordQuestion === undefined ? chordPool.includes(quality.name) : inPlay(quality.name, chordPool, chordQuestion.quality)
        const tried = chordWrongMarks.includes(quality.name)
        const disabled = !active || !canGuess(quality.name, chordPool, chordQuestion.quality, chordWrongMarks)
        const label = qualityLabel(quality.name)
        return (
          <button
            key={quality.name}
            type="button"
            className={tried ? 'interval-button wrong' : 'interval-button'}
            aria-disabled={disabled ? true : undefined}
            aria-label={tried ? `${label}, tried` : undefined}
            aria-keyshortcuts={INTERVAL_KEYS[index]}
            data-out-of-pool={inPool ? undefined : true}
            onClick={(event) => {
              focusInstrument(event)
              if (!disabled) guessChord(quality.name)
            }}
          >
            <span className="interval-label">{label}</span>
            <span className="key-hint" aria-hidden="true">
              {INTERVAL_KEYS[index]}
            </span>
          </button>
        )
      })}
    </div>
  )
}
