import { useLayoutEffect, useRef } from 'react'
import { useSession } from '../session/SessionContext'
import { showsStepper, useVoicingList } from '../session/useLitNotes'
import { useSessionActions } from '../session/useSessionActions'

type Arrow = 'previous' | 'next'

const focusFirstInstrument = () => document.querySelector<HTMLElement>('.piano, .fretboard')?.focus()

// One reserved row: `◀ Voicing 1 of N ▶` on the guitar with two or more voicings, `◀ Voicing edited ▶` while edited, empty otherwise.
export function VoicingStepper() {
  const { session } = useSession()
  const list = useVoicingList()
  const { stepVoicing } = useSessionActions()
  const previousRef = useRef<HTMLButtonElement>(null)
  const nextRef = useRef<HTMLButtonElement>(null)
  // Which arrow held focus when this render started; the DOM still shows the previous state here.
  const focused = useRef<Arrow | null>(null)
  const active = document.activeElement
  focused.current =
    previousRef.current && active === previousRef.current ? 'previous' : nextRef.current && active === nextRef.current ? 'next' : null

  const visible = session.mode === 'explore' && session.instrument === 'guitar' && showsStepper(list)
  // While edited both arrows are live when a generated voicing exists, else inert.
  const atStart = list.edited ? list.count === 0 : list.index <= 0
  const atEnd = list.edited ? list.count === 0 : list.index >= list.count - 1

  useLayoutEffect(() => {
    const was = focused.current
    focused.current = null
    if (was === null) return
    if (!visible) focusFirstInstrument()
    else if (was === 'previous' && atStart) nextRef.current?.focus()
    else if (was === 'next' && atEnd) previousRef.current?.focus()
  })

  return (
    <div className="voicing-row">
      {visible && (
        <div className="voicing-stepper" role="group" aria-label="Voicing">
          {atStart ? (
            <span className="voicing-end" aria-disabled="true">
              ·
            </span>
          ) : (
            <button ref={previousRef} type="button" className="voicing-arrow" aria-label="Previous voicing" onClick={() => stepVoicing(-1, list)}>
              <span aria-hidden="true">◀</span>
            </button>
          )}
          <span className="voicing-count">
            {list.edited ? 'Voicing edited' : `Voicing ${list.index + 1} of ${list.count}`}
          </span>
          {atEnd ? (
            <span className="voicing-end" aria-disabled="true">
              ·
            </span>
          ) : (
            <button ref={nextRef} type="button" className="voicing-arrow" aria-label="Next voicing" onClick={() => stepVoicing(1, list)}>
              <span aria-hidden="true">▶</span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}

