'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { formatMonth } from '@/lib/utils'

interface MonthPickerProps {
  month: number
  year: number
  onChange: (month: number, year: number) => void
}

export function MonthPicker({ month, year, onChange }: MonthPickerProps) {
  const prev = () => {
    if (month === 1) onChange(12, year - 1)
    else onChange(month - 1, year)
  }
  const next = () => {
    if (month === 12) onChange(1, year + 1)
    else onChange(month + 1, year)
  }

  return (
    <div className="flex items-center gap-3">
      <button onClick={prev} className="p-2 rounded-xl hover:bg-white/20 transition-colors">
        <ChevronLeft size={20} />
      </button>
      <span className="font-semibold text-base capitalize min-w-[140px] text-center">
        {formatMonth(month, year)}
      </span>
      <button onClick={next} className="p-2 rounded-xl hover:bg-white/20 transition-colors">
        <ChevronRight size={20} />
      </button>
    </div>
  )
}
