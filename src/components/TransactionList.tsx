'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Transaction } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import { EmptyState } from '@/components/ui/EmptyState'

interface TransactionListProps {
  transactions: Transaction[]
  onDelete: (id: string) => Promise<void>
}

export function TransactionList({ transactions, onDelete }: TransactionListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('Tens a certeza que queres apagar esta transação?')) return
    setDeletingId(id)
    try {
      await onDelete(id)
    } finally {
      setDeletingId(null)
    }
  }

  if (transactions.length === 0) {
    return <EmptyState icon="💸" title="Sem transações" description="Adiciona a tua primeira transação" />
  }

  // Group by date
  const grouped = transactions.reduce((acc, t) => {
    const key = t.date
    if (!acc[key]) acc[key] = []
    acc[key].push(t)
    return acc
  }, {} as Record<string, Transaction[]>)

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([date, items]) => (
        <div key={date}>
          <p className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">{formatDate(date)}</p>
          <div className="space-y-2">
            {items.map(t => (
              <div key={t.id} className="bg-white rounded-2xl p-3 flex items-center gap-3 shadow-sm border border-gray-50">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                  style={{ backgroundColor: `${t.category?.color}20` }}
                >
                  {t.category?.icon ?? '📦'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{t.description}</p>
                  <p className="text-xs text-gray-400">{t.category?.name ?? 'Sem categoria'}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`text-sm font-semibold ${t.type === 'income' ? 'text-emerald-600' : 'text-red-500'}`}>
                    {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(t.id)}
                  disabled={deletingId === t.id}
                  className="p-2 rounded-xl hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  <Trash2 size={16} className="text-gray-300 hover:text-red-400 transition-colors" />
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
