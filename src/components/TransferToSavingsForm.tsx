'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { DateInput } from '@/components/ui/DateInput'
import { useCategories } from '@/hooks/useCategories'

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

interface TransferData {
  description: string
  amount: number
  currency: string
  categoryId: string
  date: string
  notes?: string
}

interface TransferToSavingsFormProps {
  onSubmit: (data: TransferData) => Promise<void>
  onCancel: () => void
}

export function TransferToSavingsForm({ onSubmit, onCancel }: TransferToSavingsFormProps) {
  const today = new Date().toISOString().split('T')[0]
  const { categories } = useCategories('expense')

  const [description, setDescription] = useState('Transferência para Poupança')
  const [amount, setAmount] = useState('')
  const [currency, setCurrency] = useState('EUR')
  const [categoryId, setCategoryId] = useState('')
  const [date, setDate] = useState(today)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim()) return setError('Descrição é obrigatória')
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return setError('Valor inválido')
    if (!categoryId) return setError('Seleciona uma categoria de despesa')

    setError('')
    setLoading(true)
    try {
      await onSubmit({
        description: description.trim(),
        amount: Number(amount),
        currency,
        categoryId,
        date,
        notes: notes.trim() || undefined,
      })
    } catch {
      setError('Erro ao processar. Tenta novamente.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/40 rounded-xl p-3 text-xs text-emerald-700 dark:text-emerald-400">
        💡 Regista uma saída do saldo do mês e adiciona automaticamente à tua poupança.
      </div>

      <div>
        <label className={labelCls}>Descrição</label>
        <input
          type="text"
          className={inputCls}
          value={description}
          onChange={e => setDescription(e.target.value)}
          autoFocus
        />
      </div>

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
          <label className={labelCls}>Moeda poupança</label>
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

      <div>
        <label className={labelCls}>Categoria da despesa</label>
        <select
          className={inputCls}
          value={categoryId}
          onChange={e => setCategoryId(e.target.value)}
        >
          <option value="">Selecionar categoria</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
          ))}
        </select>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
          Dica: cria uma categoria &quot;Poupança&quot; em Categorias para organizar melhor.
        </p>
      </div>

      <div>
        <label className={labelCls}>Data</label>
        <DateInput value={date} onChange={setDate} className={inputCls} />
      </div>

      <div>
        <label className={labelCls}>Notas <span className="text-slate-400 font-normal">(opcional)</span></label>
        <textarea
          className={inputCls}
          rows={2}
          placeholder="Ex: Fundo de emergência, viagem..."
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
          {loading ? 'A transferir...' : 'Transferir'}
        </Button>
      </div>
    </form>
  )
}
