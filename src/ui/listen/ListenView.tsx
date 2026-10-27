import '../shared/shared.css'
import './listen.css'
import { INTERVALS } from '../../core/theory'
import { qualityLabel } from './chordLabels'
import { useSession } from '../session/SessionContext'
import { useSettings } from '../settings/SettingsContext'

export function ListenView() {
  const { session } = useSession()
  const { settings } = useSettings()
  if (session.mode !== 'listen') return null
  if (settings.practice === 'chords') {
    const { feedback } = session
    const hint =
      feedback?.kind === 'chordWrong'
        ? `${qualityLabel(feedback.quality)} is not it — try another.`
        : feedback?.kind === 'chordRight'
          ? `${qualityLabel(feedback.quality)}. Next chord is playing.`
          : ''
    return (
      <section className="listen" aria-label="Listen">
        <p className="readout-question">Which chord?</p>
        <p className="guess-hint" aria-live="polite">
          {hint}
        </p>
        <p className="visually-hidden" aria-live="polite"></p>
      </section>
    )
  }
  const { question, revealed } = session.practice
  const definition = revealed && question ? INTERVALS.find((i) => i.semitones === question.interval) : undefined
  const { feedback } = session
  const feedbackLabel = feedback?.kind === 'wrong' ? INTERVALS.find((i) => i.semitones === feedback.interval)?.abbreviation : undefined
  const hint = feedback && feedbackLabel ? `${feedbackLabel} is not it — try another.` : ''
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
