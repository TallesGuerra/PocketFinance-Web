'use client'

import { useState } from 'react'
import { Trash2, Check, Pencil, RefreshCcw } from 'lucide-react'
import { Transaction } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import { EmptyState } from '@/components/ui/EmptyState'
import { Modal } from '@/components/ui/Modal'
import { TransactionForm } from '@/components/TransactionForm'

interface TransactionListProps {
  transactions: Transaction[]
  onDelete: (id: string) => Promise<void>
  onTogglePaid?: (id: string, paid: boolean) => Promise<void>
  onUpdate?: (id: string, data: Parameters<typeof TransactionForm>[0]['onSubmit'] extends (d: infer D) => unknown ? D : never) => Promise<void>
  onPayVirtual?: (t: Transaction) => Promise<void>
  viewMonth?: number
  viewYear?: number
}

// Returns the display date for an installment shown in a different month
function getViewDate(t: Transaction, viewMonth?: number, viewYear?: number): string {
  if (!t.is_installment || !viewMonth || !viewYear) return t.date
  const orig = new Date(t.date + 'T00:00:00')
  if (orig.getMonth() + 1 === viewMonth && orig.getFullYear() === viewYear) return t.date
  const day = orig.getDate()
  const daysInMonth = new Date(viewYear, viewMonth, 0).getDate()
  return `${viewYear}-${String(viewMonth).padStart(2, '0')}-${String(Math.min(day, daysInMonth)).padStart(2, '0')}`
}

// Returns installment label, showing current parcel number when viewed in another month
function getInstallmentLabel(t: Transaction, viewMonth?: number, viewYear?: number): string | null {
  if (!t.is_installment || !t.installment_end_date) return null
  const start = new Date(t.date + 'T00:00:00')
  const end = new Date(t.installment_end_date + 'T00:00:00')
  const total =
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth()) +
    1
  const amountStr = t.installment_amount ? ` · ${formatCurrency(t.installment_amount)}` : ''

  if (viewMonth && viewYear) {
    const current =
      (viewYear - start.getFullYear()) * 12 +
      (viewMonth - (start.getMonth() + 1)) +
      1
    return `Parcela ${current}/${total}${amountStr}`
  }
  return `${total}x${amountStr}`
}

function getDueDateStatus(t: Transaction, viewDate: string): 'overdue' | 'today' | null {
  if (t.type !== 'expense' || t.paid || t._virtual) return null
  const today = new Date().toISOString().split('T')[0]
  if (viewDate < today) return 'overdue'
  if (viewDate === today) return 'today'
  return null
}

export function TransactionList({ transactions, onDelete, onTogglePaid, onUpdate, onPayVirtual, viewMonth, viewYear }: TransactionListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [payingVirtualId, setPayingVirtualId] = useState<string | null>(null)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)

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

  const handleUpdate = async (data: Parameters<typeof TransactionForm>[0]['onSubmit'] extends (d: infer D) => unknown ? D : never) => {
    if (!editingTransaction || !onUpdate) return
    await onUpdate(editingTransaction.id, data)
    setEditingTransaction(null)
  }

  if (transactions.length === 0) {
    return <EmptyState icon="💸" title="Sem transações" description="Adiciona a tua primeira transação" />
  }

  // Group by display date (installments projected into current month)
  const grouped = transactions.reduce((acc, t) => {
    const key = getViewDate(t, viewMonth, viewYear)
    if (!acc[key]) acc[key] = []
    acc[key].push(t)
    return acc
  }, {} as Record<string, Transaction[]>)

  return (
    <>
      <div className="space-y-4">
        {Object.entries(grouped)
          .sort(([a], [b]) => b.localeCompare(a))
          .map(([date, items]) => (
            <div key={date}>
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-600 mb-2 uppercase tracking-wider">
                {formatDate(date)}
              </p>
              <div className="space-y-2">
                {items.map(t => {
                  const viewDate = getViewDate(t, viewMonth, viewYear)
                  const dueDateStatus = getDueDateStatus(t, viewDate)
                  const installmentLabel = getInstallmentLabel(t, viewMonth, viewYear)
                  const displayAmount = t.is_installment && t.installment_amount ? t.installment_amount : t.amount

                  return (
                    <div
                      key={t.id}
                      className={`bg-white dark:bg-slate-900 rounded-2xl p-3 flex items-center gap-2 border transition-opacity overflow-hidden ${
                        t.paid
                          ? 'opacity-60 border-slate-100 dark:border-slate-800'
                          : dueDateStatus === 'overdue'
                          ? 'border-l-4 border-l-red-400 border-slate-100 dark:border-slate-800'
                          : dueDateStatus === 'today'
                          ? 'border-l-4 border-l-amber-400 border-slate-100 dark:border-slate-800'
                          : 'border-slate-100 dark:border-slate-800'
                      }`}
                      style={{ boxShadow: 'var(--shadow)' }}
                    >
                      {/* Paid checkbox — real expenses only */}
                      {t.type === 'expense' && onTogglePaid && !t._virtual && (
                        <button
                          onClick={() => handleTogglePaid(t)}
                          disabled={togglingId === t.id}
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                            t.paid
                              ? 'bg-emerald-500 border-emerald-500'
                              : 'border-slate-300 dark:border-slate-600 hover:border-emerald-400'
                          }`}
                        >
                          {t.paid && <Check size={12} className="text-white" strokeWidth={3} />}
                        </button>
                      )}

                      {/* Virtual recurring — pay button for expenses, icon for income */}
                      {t._virtual && t.type === 'expense' && onPayVirtual && (
                        <button
                          onClick={async () => {
                            setPayingVirtualId(t.id)
                            try { await onPayVirtual(t) } finally { setPayingVirtualId(null) }
                          }}
                          disabled={payingVirtualId === t.id}
                          title="Marcar como pago"
                          className="w-6 h-6 rounded-full border-2 border-slate-300 dark:border-slate-600 flex items-center justify-center flex-shrink-0 hover:border-emerald-400 transition-colors disabled:opacity-50"
                        >
                          {payingVirtualId === t.id
                            ? <RefreshCcw size={10} className="text-slate-400 animate-spin" />
                            : <Check size={10} className="text-slate-300 dark:text-slate-600 group-hover:text-emerald-400" />
                          }
                        </button>
                      )}
                      {t._virtual && t.type === 'income' && (
                        <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                          <RefreshCcw size={14} className="text-slate-300 dark:text-slate-600" />
                        </div>
                      )}

                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                        style={{ backgroundColor: `${t.category?.color}20` }}
                      >
                        {t.category?.icon ?? '📦'}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${
                          t.paid
                            ? 'line-through text-slate-400 dark:text-slate-600'
                            : 'text-slate-900 dark:text-slate-100'
                        }`}>
                          {t.description}
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5">
                          {t.category?.name ?? 'Sem categoria'}
                          {t._virtual && ' · Recorrente'}
                          {installmentLabel && ` · ${installmentLabel}`}
                          {dueDateStatus === 'overdue' && ' · Vencida'}
                          {dueDateStatus === 'today' && ' · Vence hoje'}
                        </p>
                        {t.paid && t.paid_date && (
                          <p className="text-xs text-emerald-500 dark:text-emerald-400 truncate">
                            Pago em {formatDate(t.paid_date)}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-0.5 flex-shrink-0 ml-auto">
                        <p className={`text-sm font-semibold text-right min-w-0 ${
                          t.type === 'income'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : t.paid
                            ? 'text-slate-400 dark:text-slate-600'
                            : t._virtual
                            ? 'text-slate-400 dark:text-slate-500'
                            : 'text-red-500'
                        }`}>
                          {t.type === 'income' ? '+' : '-'}{formatCurrency(displayAmount)}
                        </p>

                        {/* Edit button — real transactions only */}
                        {!t._virtual && onUpdate && (
                          <button
                            onClick={() => setEditingTransaction(t)}
                            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Pencil size={14} className="text-slate-300 dark:text-slate-600 hover:text-slate-500 transition-colors" />
                          </button>
                        )}

                        {/* Delete button — real transactions only */}
                        {!t._virtual && (
                          <button
                            onClick={() => handleDelete(t.id)}
                            disabled={deletingId === t.id}
                            className="p-1.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                          >
                            <Trash2 size={16} className="text-slate-300 dark:text-slate-700 hover:text-red-400 transition-colors" />
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
      </div>

      {/* Edit modal */}
      {editingTransaction && (
        <Modal
          isOpen={true}
          onClose={() => setEditingTransaction(null)}
          title="Editar transação"
        >
          <TransactionForm
            initialData={editingTransaction}
            editMode
            onSubmit={handleUpdate}
            onCancel={() => setEditingTransaction(null)}
          />
        </Modal>
      )}
    </>
  )
}
