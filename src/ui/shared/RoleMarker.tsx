import type { Role } from '../../core/explore'

// Half-sizes in SVG units; every shape is at least 18 across except the small no-role dot.
const CIRCLE_RADIUS = 9
const RING_RADIUS = 16
const DIAMOND = 11
const SQUARE = 9
const DOT_RADIUS = 5

interface RoleMarkerProps {
  role: Role
  cx: number
  cy: number
  // Extra class on the shape, for a marker on a dark key.
  tone?: string
  // The default look without roles: the no-role dot keeps its earlier, larger size.
  plain?: boolean
}

// The one marker for a note's role on the piano, the guitar and the legend: the shape carries the role and the fill repeats it.
export function RoleMarker({ role, cx, cy, tone, plain }: RoleMarkerProps) {
  const cls = (name: string) => (tone ? `${name} ${tone}` : name)
  switch (role) {
    case 'root':
      return (
        <>
          <circle className={cls('root-ring')} cx={cx} cy={cy} r={RING_RADIUS} />
          <circle className={cls('lit-dot marker-shape marker-root')} cx={cx} cy={cy} r={CIRCLE_RADIUS} />
        </>
      )
    case 'third':
      return (
        <polygon
          className={cls('lit-dot marker-shape marker-third')}
          points={`${cx},${cy - DIAMOND} ${cx + DIAMOND},${cy} ${cx},${cy + DIAMOND} ${cx - DIAMOND},${cy}`}
        />
      )
    case 'fifth':
      return <rect className={cls('lit-dot marker-shape marker-fifth')} x={cx - SQUARE} y={cy - SQUARE} width={SQUARE * 2} height={SQUARE * 2} />
    case 'seventh':
      return (
        <polygon
          className={cls('lit-dot marker-shape marker-seventh')}
          points={`${cx},${cy - 11} ${cx + 11},${cy + 9} ${cx - 11},${cy + 9}`}
        />
      )
    default:
      return <circle className={cls('lit-dot marker-none')} cx={cx} cy={cy} r={plain ? CIRCLE_RADIUS : DOT_RADIUS} />
  }
}
