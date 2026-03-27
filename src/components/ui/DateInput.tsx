'use client'

interface DateInputProps {
  value: string          // YYYY-MM-DD
  onChange: (value: string) => void
  min?: string           // YYYY-MM-DD
  className?: string
}

function toDisplay(iso: string): string {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

function toISO(display: string): string {
  const [d, m, y] = display.split('/')
  if (!d || !m || !y || y.length < 4) return ''
  return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
}

export function DateInput({ value, onChange, min, className }: DateInputProps) {
  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove all non-digits
    const digits = e.target.value.replace(/\D/g, '').slice(0, 8)
    // Auto-insert slashes: DD/MM/YYYY
    let formatted = digits
    if (digits.length > 2) formatted = digits.slice(0, 2) + '/' + digits.slice(2)
    if (digits.length > 4) formatted = formatted.slice(0, 5) + '/' + digits.slice(4)
    e.target.value = formatted

    if (digits.length === 8) {
      const iso = toISO(formatted)
      if (iso && (!min || iso >= min)) onChange(iso)
    } else if (digits.length === 0) {
      onChange('')
    }
  }

  return (
    <input
      type="text"
      defaultValue={toDisplay(value)}
      key={value}
      onInput={handleInput}
      placeholder="dd/mm/aaaa"
      inputMode="numeric"
      className={className}
    />
  )
}
