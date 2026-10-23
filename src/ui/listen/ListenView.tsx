import './listen.css'
import { INTERVALS } from '../../core/theory'
import { useSession } from '../session/SessionContext'

export function ListenView() {
  const { session } = useSession()
  if (session.mode !== 'listen') return null
  const { question, revealed } = session.practice
  const definition = revealed && question ? INTERVALS.find((i) => i.semitones === question.interval) : undefined
  const { feedback } = session
  const feedbackLabel = feedback ? INTERVALS.find((i) => i.semitones === feedback.interval)?.abbreviation : undefined
  let hint = ''
  if (feedback && feedbackLabel) {
    hint = feedback.kind === 'right' ? `${feedbackLabel}. Next interval is playing.` : `${feedbackLabel} is not it — try another.`
  }
  return (
    <section className="listen" aria-label="Listen">
      <p className="readout-question">{definition ? definition.abbreviation : 'Which interval?'}</p>
      <p className="guess-hint" aria-live="polite">
        {hint}
      </p>
      <p className="visually-hidden" aria-live="polite">
        {definition?.name}
      </p>
    </section>
  )
}
