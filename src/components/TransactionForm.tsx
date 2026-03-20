'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { useCategories } from '@/hooks/useCategories'
import { TransactionType } from '@/types'

interface TransactionFormProps {
  onSubmit: (data: {
    description: string
    amount: number
    type: TransactionType
    category_id: string
    date: string
    notes?: string
  }) => Promise<void>
  onCancel: () => void
}

export function TransactionForm({ onSubmit, onCancel }: TransactionFormProps) {
  const today = new Date().toISOString().split('T')[0]
  const [type, setType] = useState<TransactionType>('expense')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [date, setDate] = useState(today)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { categories } = useCategories(type)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim()) return setError('Descrição é obrigatória')
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return setError('Valor inválido')
    if (!categoryId) return setError('Selecciona uma categoria')

    setError('')
    setLoading(true)
    try {
      await onSubmit({
        description: description.trim(),
        amount: Number(amount),
        type,
        category_id: categoryId,
        date,
        notes: notes.trim() || undefined,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao guardar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Type toggle */}
      <div className="flex rounded-xl overflow-hidden border border-gray-200">
        <button
          type="button"
          onClick={() => { setType('expense'); setCategoryId('') }}
          className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
            type === 'expense' ? 'bg-red-500 text-white' : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          Despesa
        </button>
        <button
          type="button"
          onClick={() => { setType('income'); setCategoryId('') }}
          className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
            type === 'income' ? 'bg-emerald-500 text-white' : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          Receita
        </button>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
        <input
          type="text"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Ex: Almoço, Supermercado..."
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* Amount */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Valor (€)</label>
        <input
          type="number"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          placeholder="0.00"
          step="0.01"
          min="0.01"
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
        <select
          value={categoryId}
          onChange={e => setCategoryId(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
        >
          <option value="">Seleccionar categoria</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>
              {c.icon} {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notas (opcional)</label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Observações adicionais..."
          rows={2}
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
        />
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" className="flex-1" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" className="flex-1" disabled={loading}>
          {loading ? 'A guardar...' : 'Guardar'}
        </Button>
      </div>
    </form>
  )
}
