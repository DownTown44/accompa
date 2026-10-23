interface Option<T extends string> {
  value: T
  label: string
}

interface SegmentedGroupProps<T extends string> {
  label: string
  name: string
  options: readonly Option<T>[]
  value: T
  onChange: (value: T) => void
  variant: 'mode' | 'segment'
}

export function SegmentedGroup<T extends string>({ label, name, options, value, onChange, variant }: SegmentedGroupProps<T>) {
  return (
    <div role="radiogroup" aria-label={label} className={`group group-${variant}`}>
      {options.map((option) => (
        <label key={option.value} className={`segment segment-${variant}`}>
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={option.value === value}
            onChange={() => onChange(option.value)}
          />
          <span>{option.label}</span>
        </label>
      ))}
    </div>
  )
}
