import { focusInstrument } from '../shared/focus'

interface Option<T extends string> {
  value: T
  label: string
}

interface SegmentedGroupProps<T extends string> {
  label: string
  labelledBy?: string
  name: string
  options: readonly Option<T>[]
  value: T
  onChange: (value: T) => void
  variant: 'mode' | 'segment' | 'setup'
  disabled?: boolean
}

export function SegmentedGroup<T extends string>({ label, labelledBy, name, options, value, onChange, variant, disabled }: SegmentedGroupProps<T>) {
  return (
    <div role="radiogroup" aria-label={labelledBy ? undefined : label} aria-labelledby={labelledBy} className={`group group-${variant}`}>
      {options.map((option) => (
        <label key={option.value} className={`segment segment-${variant}`}>
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={option.value === value}
            disabled={disabled}
            onChange={() => onChange(option.value)}
            onClick={variant === 'setup' ? undefined : focusInstrument}
          />
          <span>{option.label}</span>
        </label>
      ))}
    </div>
  )
}
