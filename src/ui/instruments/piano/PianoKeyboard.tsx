import { useRef, type PointerEvent } from 'react'
import { isBlackKey, windowPitches } from '../../../core/piano'
import { pitchClass, type Pitch } from '../../../core/pitch'
import type { Role } from '../../../core/explore'
import { octaveLabel } from '../../../core/spelling'
import { RoleMarker } from '../../shared/RoleMarker'

const WHITE_WIDTH = 57
const WHITE_HEIGHT = 300
const BLACK_WIDTH = 36
const BLACK_HEIGHT = 185
const TOP = 4

interface PianoKeyboardProps {
  start: number
  lit: readonly Pitch[]
  root?: Pitch
  // The role of each lit pitch, aligned with `lit`; the default is the root marker and a dot.
  roles?: readonly Role[]
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
export function PianoKeyboard({ start, lit, root, roles, onNotePress, onNoteRelease }: PianoKeyboardProps) {
  const held = useRef<Pitch | null>(null)
  const keys = layout(start)
  const roleOf = new Map<Pitch, Role>(lit.map((p, i) => [p, roles?.[i] ?? (p === root ? 'root' : 'none')]))
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
  const tint = (p: Pitch) => {
    const role = roles ? roleOf.get(p) : undefined
    return role === undefined || role === 'none' ? undefined : role
  }

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
        <rect key={k.pitch} className="key-white" data-pitch={k.pitch} data-tint={tint(k.pitch)} x={k.x} y={TOP} width={WHITE_WIDTH} height={WHITE_HEIGHT} {...handlers(k.pitch)} />
      ))}
      {black.map((k) => (
        <rect key={k.pitch} className="key-black" data-pitch={k.pitch} data-tint={tint(k.pitch)} x={k.x} y={TOP} width={BLACK_WIDTH} height={BLACK_HEIGHT} {...handlers(k.pitch)} />
      ))}
      {keys
        .filter((k) => roleOf.has(k.pitch))
        .map((k) => {
          const cx = k.x + (k.black ? BLACK_WIDTH : WHITE_WIDTH) / 2
          const cy = k.black ? 160 : 255
          const role = roleOf.get(k.pitch)!
          return (
            <g key={k.pitch} data-lit={k.pitch} data-role={role} data-root={role === 'root' ? '' : undefined}>
              <RoleMarker role={role} cx={cx} cy={cy} tone={k.black ? 'lit-dot-black' : undefined} plain={!roles} />
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
