import type { LegendEntry } from '../../core/explore'
import { RoleMarker } from './RoleMarker'

// The legend row under the readout: one shape and label per role in the lit chord.
export function RoleLegend({ legend }: { legend: readonly LegendEntry[] }) {
  return (
    <ul className="role-legend" aria-label="Note roles">
      {legend.map((entry) => (
        <li key={entry.role} data-role={entry.role}>
          <svg viewBox="-17 -17 34 34" aria-hidden="true">
            <RoleMarker role={entry.role} cx={0} cy={0} />
          </svg>
          <span>{entry.degree ? `${entry.label} ${entry.note} (${entry.degree})` : `${entry.label} ${entry.note}`}</span>
        </li>
      ))}
    </ul>
  )
}
