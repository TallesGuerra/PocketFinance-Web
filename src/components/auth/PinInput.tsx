'use client'

import { useState, useEffect } from 'react'
import { Delete } from 'lucide-react'

interface PinInputProps {
  length?: number
  onComplete: (pin: string) => void
  error?: string
  loading?: boolean
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del']

export function PinInput({ length = 4, onComplete, error, loading }: PinInputProps) {
  const [pin, setPin] = useState('')

  useEffect(() => {
    if (pin.length === length) {
      onComplete(pin)
      // Clear pin after a short delay (for feedback)
      const t = setTimeout(() => setPin(''), 400)
      return () => clearTimeout(t)
    }
  }, [pin, length, onComplete])

  const press = (key: string) => {
    if (loading) return
    if (key === 'del') {
      setPin(p => p.slice(0, -1))
    } else if (key && pin.length < length) {
      setPin(p => p + key)
    }
  }

  return (
    <div className="flex flex-col items-center gap-8">
      {/* Dots */}
      <div className="flex gap-4">
        {Array.from({ length }).map((_, i) => (
          <div
            key={i}
            className={`w-4 h-4 rounded-full border-2 transition-all duration-150 ${
              i < pin.length
                ? 'bg-emerald-500 border-emerald-500 scale-110'
                : 'border-slate-300 dark:border-slate-600'
            }`}
          />
        ))}
      </div>

      {/* Error */}
      {error && (
        <p className="text-red-500 text-sm text-center -mt-4 animate-pulse">{error}</p>
      )}

      {/* Keypad */}
      <div className="grid grid-cols-3 gap-3 w-64">
        {KEYS.map((key, i) => {
          if (key === '') return <div key={i} />
          return (
            <button
              key={i}
              onClick={() => press(key)}
              disabled={loading}
              className={`h-16 rounded-2xl text-xl font-semibold flex items-center justify-center transition-all active:scale-95 disabled:opacity-50 ${
                key === 'del'
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm border border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              {key === 'del' ? <Delete size={20} /> : key}
            </button>
          )
        })}
      </div>
    </div>
  )
}
