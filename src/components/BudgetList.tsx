'use client'

import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Budget, Category } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { EmptyState } from '@/components/ui/EmptyState'

interface BudgetWithSpent extends Budget {
  spent: number
}

interface BudgetListProps {
  budgets: BudgetWithSpent[]
  categories: Category[]
  month: number
  year: number
  onUpsert: (budget: { category_id: string; amount: number; month: number; year: number }) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export function BudgetList({ budgets, categories, month, year, onUpsert, onDelete }: BudgetListProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [categoryId, setCategoryId] = useState('')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!categoryId || !amount) return
    setLoading(true)
    try {
      await onUpsert({ category_id: categoryId, amount: Number(amount), month, year })
      setIsOpen(false)
      setCategoryId('')
      setAmount('')
    } finally {
      setLoading(false)
    }
  }

  const availableCategories = categories.filter(
    c => c.type !== 'income' && !budgets.find(b => b.category_id === c.id)
  )

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-gray-900">Orçamentos</h2>
        <Button size="sm" onClick={() => setIsOpen(true)}>
          <Plus size={16} /> Adicionar
        </Button>
      </div>

      {budgets.length === 0 ? (
        <EmptyState icon="🎯" title="Sem orçamentos" description="Define limites de gastos por categoria" />
      ) : (
        <div className="space-y-3">
          {budgets.map(b => {
            const percentage = Math.min((b.spent / b.amount) * 100, 100)
            const isOver = b.spent > b.amount
            return (
              <div key={b.id} className="bg-white rounded-2xl p-4 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{b.category?.icon}</span>
                    <span className="text-sm font-medium text-gray-900">{b.category?.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-semibold ${isOver ? 'text-red-500' : 'text-gray-700'}`}>
                      {formatCurrency(b.spent)} / {formatCurrency(b.amount)}
                    </span>
                    <button onClick={() => onDelete(b.id)} className="p-1 hover:bg-red-50 rounded-lg">
                      <Trash2 size={14} className="text-gray-300 hover:text-red-400" />
                    </button>
                  </div>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${isOver ? 'bg-red-500' : percentage > 80 ? 'bg-amber-400' : 'bg-emerald-500'}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {isOver ? `${formatCurrency(b.spent - b.amount)} acima do limite` : `${formatCurrency(b.amount - b.spent)} restantes`}
                </p>
              </div>
            )
          })}
        </div>
      )}

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Novo Orçamento">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
            <select
              value={categoryId}
              onChange={e => setCategoryId(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="">Seleccionar categoria</option>
              {availableCategories.map(c => (
                <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Limite mensal (€)</label>
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
          <div className="flex gap-3">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? 'A guardar...' : 'Guardar'}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
