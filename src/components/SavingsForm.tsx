'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { DateInput } from '@/components/ui/DateInput'

const inputCls = 'w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-slate-400 dark:placeholder:text-slate-600'
const labelCls = 'block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1'

const CURRENCIES = [
  { code: 'EUR', label: '€ Euro' },
  { code: 'USD', label: '$ Dólar' },
  { code: 'GBP', label: '£ Libra' },
  { code: 'CHF', label: 'Fr. Franco Suíço' },
  { code: 'BRL', label: 'R$ Real' },
  { code: 'JPY', label: '¥ Iene' },
]

interface SavingsFormProps {
  onSubmit: (data: { description: string; amount: number; currency: string; notes?: string; date: string }) => Promise<void>
  onCancel: () => void
  initialValues?: { description: string; amount: number; currency: string; notes?: string; date: string }
}

export function SavingsForm({ onSubmit, onCancel, initialValues }: SavingsFormProps) {
  const today = new Date().toISOString().split('T')[0]
  const [description, setDescription] = useState(initialValues?.description ?? '')
  const [amount, setAmount] = useState(initialValues?.amount ? String(initialValues.amount) : '')
  const [currency, setCurrency] = useState(initialValues?.currency ?? 'EUR')
  const [notes, setNotes] = useState(initialValues?.notes ?? '')
  const [date, setDate] = useState(initialValues?.date ?? today)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim()) return setError('Descrição é obrigatória')
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return setError('Valor inválido')

    setError('')
    setLoading(true)
    try {
      await onSubmit({
        description: description.trim(),
        amount: Number(amount),
        currency,
        notes: notes.trim() || undefined,
        date,
      })
    } catch {
      setError('Erro ao guardar. Tenta novamente.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Description */}
      <div>
        <label className={labelCls}>Descrição</label>
        <input
          type="text"
          className={inputCls}
          placeholder="Ex: Fundo de emergência, viagem..."
          value={description}
          onChange={e => setDescription(e.target.value)}
          autoFocus
        />
      </div>

      {/* Amount + Currency */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Valor</label>
          <input
            type="number"
            className={inputCls}
            placeholder="0,00"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={e => setAmount(e.target.value)}
          />
        </div>
        <div>
          <label className={labelCls}>Moeda</label>
          <select
            className={inputCls}
            value={currency}
            onChange={e => setCurrency(e.target.value)}
          >
            {CURRENCIES.map(c => (
              <option key={c.code} value={c.code}>{c.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Date */}
      <div>
        <label className={labelCls}>Data</label>
        <DateInput value={date} onChange={setDate} className={inputCls} />
      </div>

      {/* Notes (optional) */}
      <div>
        <label className={labelCls}>Notas <span className="text-slate-400 font-normal">(opcional)</span></label>
        <textarea
          className={inputCls}
          rows={2}
          placeholder="Descrição adicional..."
          value={notes}
          onChange={e => setNotes(e.target.value)}
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-3 pt-1">
        <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
          Cancelar
        </Button>
        <Button type="submit" disabled={loading} className="flex-1">
          Guardar
        </Button>
      </div>
    </form>
  )
}
