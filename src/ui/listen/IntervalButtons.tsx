import './listen.css'
import { INTERVALS } from '../../core/theory'
import { useSession } from '../session/SessionContext'
import { useSessionActions } from '../session/useSessionActions'
import { releaseFocusAfterPointer } from './focus'
import { INTERVAL_KEYS } from './intervalKeys'

export function IntervalButtons() {
  const { session } = useSession()
  const { guess } = useSessionActions()
  if (session.mode !== 'listen') return null
  const { question, revealed, pool, wrongMarks } = session.practice
  const active = question !== null && !revealed
  return (
    <div className="interval-row" role="group" aria-label="Guess the interval">
      {INTERVALS.map((definition, index) => {
        const inPool = pool.includes(definition.semitones)
        const tried = wrongMarks.includes(definition.semitones)
        const disabled = !active || !inPool || tried
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
              releaseFocusAfterPointer(event)
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
