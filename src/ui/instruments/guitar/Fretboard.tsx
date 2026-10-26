import { useRef, type PointerEvent } from 'react'
import { GUITAR_FRETS, pitchAt, type FretPosition } from '../../../core/instruments'
import type { Pitch } from '../../../core/pitch'
import type { Role } from '../../../core/explore'
import { stringNames } from '../../../core/spelling'
import { RoleMarker } from '../../shared/RoleMarker'

const WIDTH = 1200
const HEIGHT = 372
const NUT_X = 150
const BOARD_RIGHT = 1170
const BOARD_TOP = 56
const BOARD_BOTTOM = 314
const STRING_GAP = 46
const LOW_STRING_Y = 300
const NUMBER_Y = 344
const NAME_X = 58
const OPEN_RING_RADIUS = 19
const OPEN_X = 108
const MUTED_HALF = 8
const THICKEST_STRING = 3.25
const THINNEST_STRING = 1.0

// Graded from the low string down to the high string.
const stringWidth = (string: number, count: number) =>
  THICKEST_STRING - ((THICKEST_STRING - THINNEST_STRING) * string) / Math.max(count - 1, 1)

export interface FretNote extends FretPosition {
  pitch: Pitch
}

interface FretboardProps {
  tuning: readonly Pitch[]
  frets?: number
  lit: readonly FretPosition[]
  root?: FretPosition
  // The role of each lit position, aligned with `lit`; the default is the root marker and a dot.
  roles?: readonly Role[]
  // Strings drawn as muted, with an `x` at the nut; the default is none.
  muted?: readonly number[]
  onNotePress?: (note: FretNote) => void
  onNoteRelease?: (note: FretNote) => void
}

// Presentational: draws the board and reports presses; it owns no musical state or sound.
export function Fretboard({ tuning, frets = GUITAR_FRETS, lit, root, roles, muted, onNotePress, onNoteRelease }: FretboardProps) {
  const held = useRef<string | null>(null)
  const fretWidth = (BOARD_RIGHT - NUT_X) / frets
  const wireX = (fret: number) => NUT_X + fret * fretWidth
  const stringY = (string: number) => LOW_STRING_Y - string * STRING_GAP
  const cellX = (fret: number) => (fret === 0 ? OPEN_X : (wireX(fret - 1) + wireX(fret)) / 2)
  const names = stringNames(tuning)
  const note = (string: number, fret: number): FretNote => ({ string, fret, pitch: pitchAt(tuning, string, fret) })
  const keyOf = (string: number, fret: number) => `${string}:${fret}`

  function press(event: PointerEvent, string: number, fret: number) {
    if (event.button !== 0) return
    event.currentTarget.setPointerCapture?.(event.pointerId)
    held.current = keyOf(string, fret)
    onNotePress?.(note(string, fret))
  }

  function release(string: number, fret: number) {
    if (held.current !== keyOf(string, fret)) return
    held.current = null
    onNoteRelease?.(note(string, fret))
  }

  const strings = tuning.map((_, string) => string)
  const wires = Array.from({ length: frets }, (_, i) => i + 1)
  const cells = Array.from({ length: frets + 1 }, (_, i) => i)
  const isRoot = (p: FretPosition) => root?.string === p.string && root.fret === p.fret
  const visible = lit
    .map((p, i) => ({ ...p, role: roles?.[i] ?? (isRoot(p) ? 'root' : 'none') }) as FretPosition & { role: Role })
    .filter((p) => p.string >= 0 && p.string < tuning.length && p.fret >= 0 && p.fret <= frets)

  return (
    <svg
      className="fretboard"
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      width={WIDTH}
      height={HEIGHT}
      tabIndex={0}
      role="group"
      aria-label="Guitar fretboard"
    >
      <rect className="fb-board" x={NUT_X} y={BOARD_TOP} width={BOARD_RIGHT - NUT_X} height={BOARD_BOTTOM - BOARD_TOP} />
      {wires.map((fret) => (
        <line key={fret} className="fb-fret" x1={wireX(fret)} y1={BOARD_TOP} x2={wireX(fret)} y2={BOARD_BOTTOM} />
      ))}
      <line className="fb-nut" x1={NUT_X} y1={BOARD_TOP} x2={NUT_X} y2={BOARD_BOTTOM} />
      {strings.map((string) => (
        <g key={string}>
          <line
            className="fb-string"
            x1={NUT_X}
            y1={stringY(string)}
            x2={BOARD_RIGHT}
            y2={stringY(string)}
            strokeWidth={stringWidth(string, strings.length)}
          />
          <text className="fb-name" data-string={string} x={NAME_X} y={stringY(string) + 7} textAnchor="middle">
            {names[string]}
          </text>
        </g>
      ))}
      {wires.map((fret) => (
        <text key={fret} className="fb-number" x={cellX(fret)} y={NUMBER_Y} textAnchor="middle">
          {fret}
        </text>
      ))}
      {strings.flatMap((string) =>
        cells.map((fret) => {
          const x = fret === 0 ? OPEN_X - 42 : wireX(fret - 1)
          const w = fret === 0 ? NUT_X - (OPEN_X - 42) : fretWidth
          return (
            <rect
              key={keyOf(string, fret)}
              className="fb-cell"
              data-string={string}
              data-fret={fret}
              x={x}
              y={stringY(string) - STRING_GAP / 2}
              width={w}
              height={STRING_GAP}
              onPointerDown={(event) => press(event, string, fret)}
              onPointerUp={() => release(string, fret)}
              onPointerCancel={() => release(string, fret)}
            />
          )
        }),
      )}
      {visible.map(({ string, fret, role }) => (
        <g key={keyOf(string, fret)} data-lit={keyOf(string, fret)} data-role={role} data-root={role === 'root' ? '' : undefined} className="fb-lit">
          {fret === 0 && <circle className="fb-open-ring" cx={OPEN_X} cy={stringY(string)} r={OPEN_RING_RADIUS} />}
          <RoleMarker role={role} cx={cellX(fret)} cy={stringY(string)} plain={!roles} />
        </g>
      ))}
      {muted?.map((string) => (
        <path
          key={`x${string}`}
          className="fb-muted"
          data-muted={string}
          d={`M${OPEN_X - MUTED_HALF} ${stringY(string) - MUTED_HALF} l${2 * MUTED_HALF} ${2 * MUTED_HALF} m0 ${-2 * MUTED_HALF} l${-2 * MUTED_HALF} ${2 * MUTED_HALF}`}
        />
      ))}
    </svg>
  )
}
