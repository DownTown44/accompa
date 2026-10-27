import '../shared/shared.css'
import './listen.css'
import { canGuess, inPlay } from '../../core/guess'
import { INTERVALS } from '../../core/theory'
import { useSettings } from '../settings/SettingsContext'
import { useSession } from '../session/SessionContext'
import { useSessionActions } from '../session/useSessionActions'
import { focusInstrument } from '../shared/focus'
import { INTERVAL_KEYS } from './intervalKeys'

export function IntervalButtons() {
  const { session } = useSession()
  const { settings } = useSettings()
  const { guess } = useSessionActions()
  if (session.mode !== 'listen') return null
  // Chord practice keeps the row's height, empty until the chord guess arrives.
  if (settings.practice === 'chords') {
    return (
      <div className="interval-row" aria-hidden="true">
        <span className="interval-button" style={{ visibility: 'hidden' }}>
          <span className="interval-label">&nbsp;</span>
          <span className="key-hint">&nbsp;</span>
        </span>
      </div>
    )
  }
  const { question, revealed, wrongMarks } = session.practice
  const { pool } = settings
  const active = question !== null && !revealed
  return (
    <div className="interval-row" role="group" aria-label="Guess the interval">
      {INTERVALS.map((definition, index) => {
        const inPool = question === null ? pool.includes(definition.semitones) : inPlay(definition.semitones, pool, question.interval)
        const tried = wrongMarks.includes(definition.semitones)
        const disabled = !active || !question || !canGuess(definition.semitones, pool, question.interval, wrongMarks)
        return (
          <button
            key={definition.semitones}
            type="button"
            className={tried ? 'interval-button wrong' : 'interval-button'}
            aria-disabled={disabled ? true : undefined}
            aria-label={tried ? `${definition.abbreviation}, tried` : undefined}
            aria-keyshortcuts={INTERVAL_KEYS[index]}
            data-out-of-pool={inPool ? undefined : true}
            onClick={(event) => {
              focusInstrument(event)
              if (!disabled) guess(definition.semitones)
            }}
          >
            <span className="interval-label">{definition.abbreviation}</span>
            <span className="key-hint" aria-hidden="true">
              {INTERVAL_KEYS[index]}
            </span>
          </button>
        )
      })}
    </div>
  )
}
