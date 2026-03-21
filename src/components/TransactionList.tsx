'use client'

import { useState } from 'react'
import { Trash2, Check } from 'lucide-react'
import { Transaction } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import { EmptyState } from '@/components/ui/EmptyState'

interface TransactionListProps {
  transactions: Transaction[]
  onDelete: (id: string) => Promise<void>
  onTogglePaid?: (id: string, paid: boolean) => Promise<void>
}

function getInstallmentLabel(t: Transaction): string | null {
  if (!t.is_installment || !t.installment_end_date) return null
  const start = new Date(t.date)
  const end = new Date(t.installment_end_date)
  const months =
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth()) +
    1
  if (t.installment_amount) {
    return `${months}x de ${formatCurrency(t.installment_amount)}`
  }
  return `${months} parcelas`
}

function getDueDateStatus(t: Transaction): 'overdue' | 'today' | 'upcoming' | null {
  if (t.type !== 'expense' || t.paid) return null
  const today = new Date().toISOString().split('T')[0]
  if (t.date < today) return 'overdue'
  if (t.date === today) return 'today'
  return 'upcoming'
}

export function TransactionList({ transactions, onDelete, onTogglePaid }: TransactionListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('Tens a certeza que queres apagar esta transação?')) return
    setDeletingId(id)
    try {
      await onDelete(id)
    } finally {
      setDeletingId(null)
    }
  }

  const handleTogglePaid = async (t: Transaction) => {
    if (!onTogglePaid) return
    setTogglingId(t.id)
    try {
      await onTogglePaid(t.id, !t.paid)
    } finally {
      setTogglingId(null)
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
            {items.map(t => {
              const dueDateStatus = getDueDateStatus(t)
              const installmentLabel = getInstallmentLabel(t)

              return (
                <div
                  key={t.id}
                  className={`bg-white rounded-2xl p-3 flex items-center gap-3 shadow-sm border transition-opacity ${
                    t.paid ? 'opacity-60 border-gray-50' : 'border-gray-50'
                  } ${dueDateStatus === 'overdue' ? 'border-l-4 border-l-red-400' : ''} ${
                    dueDateStatus === 'today' ? 'border-l-4 border-l-amber-400' : ''
                  }`}
                >
                  {/* Paid checkbox — expenses only */}
                  {t.type === 'expense' && onTogglePaid && (
                    <button
                      onClick={() => handleTogglePaid(t)}
                      disabled={togglingId === t.id}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                        t.paid
                          ? 'bg-emerald-500 border-emerald-500'
                          : 'border-gray-300 hover:border-emerald-400'
                      }`}
                    >
                      {t.paid && <Check size={12} className="text-white" strokeWidth={3} />}
                    </button>
                  )}

                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                    style={{ backgroundColor: `${t.category?.color}20` }}
                  >
                    {t.category?.icon ?? '📦'}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${t.paid ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                      {t.description}
                    </p>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <p className="text-xs text-gray-400">{t.category?.name ?? 'Sem categoria'}</p>
                      {installmentLabel && (
                        <span className="text-xs bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded-full">
                          {installmentLabel}
                        </span>
                      )}
                      {dueDateStatus === 'overdue' && (
                        <span className="text-xs bg-red-100 text-red-500 px-1.5 py-0.5 rounded-full">Vencida</span>
                      )}
                      {dueDateStatus === 'today' && (
                        <span className="text-xs bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-full">Vence hoje</span>
                      )}
                      {t.paid && t.paid_date && (
                        <span className="text-xs bg-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded-full">
                          Pago em {formatDate(t.paid_date)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className={`text-sm font-semibold ${t.type === 'income' ? 'text-emerald-600' : t.paid ? 'text-gray-400' : 'text-red-500'}`}>
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
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
