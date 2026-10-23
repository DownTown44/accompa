import { useRef, type PointerEvent } from 'react'
import { isBlackKey, windowPitches } from '../core/piano'
import { pitchClass, type Pitch } from '../core/pitch'
import { octaveLabel } from '../core/spelling'

const WHITE_WIDTH = 57
const WHITE_HEIGHT = 300
const BLACK_WIDTH = 36
const BLACK_HEIGHT = 185
const TOP = 4
const DOT_RADIUS = 9
const ROOT_RING_RADIUS = 16

interface PianoKeyboardProps {
  start: number
  lit: readonly Pitch[]
  root?: Pitch
  onNotePress?: (pitch: Pitch) => void
  onNoteRelease?: (pitch: Pitch) => void
}

interface KeyShape {
  pitch: Pitch
  black: boolean
  x: number
}

function layout(start: number): KeyShape[] {
  let whites = 0
  return windowPitches(start).map((p) => {
    if (isBlackKey(p)) return { pitch: p, black: true, x: 1 + WHITE_WIDTH * whites - BLACK_WIDTH / 2 }
    return { pitch: p, black: false, x: 1 + WHITE_WIDTH * whites++ }
  })
}

// Presentational: draws the window and reports presses; it owns no musical state or sound.
export function PianoKeyboard({ start, lit, root, onNotePress, onNoteRelease }: PianoKeyboardProps) {
  const held = useRef<Pitch | null>(null)
  const keys = layout(start)
  const litSet = new Set(lit)
  const width = 1 + WHITE_WIDTH * keys.filter((k) => !k.black).length + 1

  function press(event: PointerEvent, p: Pitch) {
    if (event.button !== 0) return
    event.currentTarget.setPointerCapture?.(event.pointerId)
    held.current = p
    onNotePress?.(p)
  }

  function release(p: Pitch) {
    if (held.current !== p) return
    held.current = null
    onNoteRelease?.(p)
  }

  const handlers = (p: Pitch) => ({
    onPointerDown: (event: PointerEvent) => press(event, p),
    onPointerUp: () => release(p),
    onPointerCancel: () => release(p),
  })

  const white = keys.filter((k) => !k.black)
  const black = keys.filter((k) => k.black)

  return (
    <svg
      className="piano"
      viewBox={`0 0 ${width} 330`}
      width={width}
      height={330}
      tabIndex={0}
      role="group"
      aria-label="Piano keyboard"
    >
      {white.map((k) => (
        <rect key={k.pitch} className="key-white" data-pitch={k.pitch} x={k.x} y={TOP} width={WHITE_WIDTH} height={WHITE_HEIGHT} {...handlers(k.pitch)} />
      ))}
      {black.map((k) => (
        <rect key={k.pitch} className="key-black" data-pitch={k.pitch} x={k.x} y={TOP} width={BLACK_WIDTH} height={BLACK_HEIGHT} {...handlers(k.pitch)} />
      ))}
      {keys
        .filter((k) => litSet.has(k.pitch))
        .map((k) => {
          const cx = k.x + (k.black ? BLACK_WIDTH : WHITE_WIDTH) / 2
          const cy = k.black ? 160 : 255
          return (
            <g key={k.pitch} data-lit={k.pitch} data-root={k.pitch === root ? '' : undefined}>
              {k.pitch === root && <circle className="root-ring" cx={cx} cy={cy} r={ROOT_RING_RADIUS} />}
              <circle className={k.black ? 'lit-dot lit-dot-black' : 'lit-dot'} cx={cx} cy={cy} r={DOT_RADIUS} />
            </g>
          )
        })}
      {white
        .filter((k) => pitchClass(k.pitch) === 0)
        .map((k) => (
          <text key={k.pitch} className="octave-label" x={k.x + WHITE_WIDTH / 2} y={324} textAnchor="middle">
            {octaveLabel(k.pitch)}
          </text>
        ))}
    </svg>
  )
}
