import { INTERVALS } from '../core/theory'
import { useSession } from './SessionContext'

export function ListenView() {
  const { session } = useSession()
  if (session.mode !== 'listen') return null
  const { question, revealed } = session.practice
  const definition = revealed && question ? INTERVALS.find((i) => i.semitones === question.interval) : undefined
  return (
    <section className="listen" aria-label="Listen">
      <p className="readout-question">{definition ? definition.abbreviation : 'Which interval?'}</p>
      <p className="visually-hidden" aria-live="polite">
        {definition?.name}
      </p>
    </section>
  )
}
