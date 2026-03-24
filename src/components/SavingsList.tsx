'use client'

import { useState } from 'react'
import { Plus, Trash2, PiggyBank } from 'lucide-react'
import { Saving } from '@/types'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { EmptyState } from '@/components/ui/EmptyState'
import { SavingsForm } from '@/components/SavingsForm'

const CURRENCY_SYMBOLS: Record<string, string> = {
  EUR: '€',
  USD: '$',
  GBP: '£',
  CHF: 'Fr.',
  BRL: 'R$',
  JPY: '¥',
}

function formatAmount(amount: number, currency: string) {
  const symbol = CURRENCY_SYMBOLS[currency] ?? currency
  return `${symbol} ${amount.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

interface SavingsListProps {
  savings: Saving[]
  totalsByCurrency: Record<string, number>
  onAdd: (data: Omit<Saving, 'id' | 'created_at'>) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export function SavingsList({ savings, totalsByCurrency, onAdd, onDelete }: SavingsListProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const handleAdd = async (data: Omit<Saving, 'id' | 'created_at'>) => {
    await onAdd(data)
    setIsOpen(false)
  }

  const handleDelete = async (id: string) => {
    await onDelete(id)
    setDeleteId(null)
  }

  const currencies = Object.keys(totalsByCurrency)

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Poupança</h2>
        <Button size="sm" onClick={() => setIsOpen(true)}>
          <Plus size={16} /> Adicionar
        </Button>
      </div>

      {/* Totals by currency */}
      {currencies.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mb-5">
          {currencies.map(currency => (
            <div key={currency} className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/40 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <PiggyBank size={16} className="text-emerald-500" />
                <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">{currency}</span>
              </div>
              <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300">
                {formatAmount(totalsByCurrency[currency], currency)}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* List */}
      {savings.length === 0 ? (
        <EmptyState icon="🐷" title="Sem poupanças" description="Começa a registar o que tens guardado" />
      ) : (
        <div className="space-y-2">
          {savings.map(s => (
            <div key={s.id} className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{s.description}</p>
                {s.notes && (
                  <p className="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5">{s.notes}</p>
                )}
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                  {new Date(s.date + 'T00:00:00').toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' })}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                  {formatAmount(s.amount, s.currency)}
                </span>
                <button
                  onClick={() => setDeleteId(s.id)}
                  className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                >
                  <Trash2 size={14} className="text-slate-300 dark:text-slate-700 hover:text-red-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add modal */}
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Nova Poupança">
        <SavingsForm onSubmit={handleAdd} onCancel={() => setIsOpen(false)} />
      </Modal>

      {/* Delete confirmation modal */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Eliminar Poupança">
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
          Tens a certeza que queres eliminar este registo?
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={() => setDeleteId(null)}>
            Cancelar
          </Button>
          <Button variant="danger" className="flex-1" onClick={() => deleteId && handleDelete(deleteId)}>
            Eliminar
          </Button>
        </div>
      </Modal>
    </>
  )
}
