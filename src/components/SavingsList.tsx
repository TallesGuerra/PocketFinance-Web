'use client'

import { useState } from 'react'
import { Plus, Trash2, PiggyBank, Pencil, ArrowDownLeft } from 'lucide-react'
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

const inputCls = 'w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-slate-400 dark:placeholder:text-slate-600'
const labelCls = 'block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1'

function formatAmount(amount: number, currency: string) {
  const symbol = CURRENCY_SYMBOLS[currency] ?? currency
  return `${symbol} ${amount.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

interface SavingsListProps {
  savings: Saving[]
  totalsByCurrency: Record<string, number>
  onAdd: (data: Omit<Saving, 'id' | 'created_at'>) => Promise<void>
  onUpdate: (id: string, data: Partial<Omit<Saving, 'id' | 'created_at'>>) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export function SavingsList({ savings, totalsByCurrency, onAdd, onUpdate, onDelete }: SavingsListProps) {
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editSaving, setEditSaving] = useState<Saving | null>(null)
  const [withdrawSaving, setWithdrawSaving] = useState<Saving | null>(null)
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [withdrawError, setWithdrawError] = useState('')
  const [withdrawLoading, setWithdrawLoading] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const handleAdd = async (data: Omit<Saving, 'id' | 'created_at'>) => {
    await onAdd(data)
    setIsAddOpen(false)
  }

  const handleEdit = async (data: Omit<Saving, 'id' | 'created_at'>) => {
    if (!editSaving) return
    await onUpdate(editSaving.id, data)
    setEditSaving(null)
  }

  const handleWithdraw = async () => {
    if (!withdrawSaving) return
    const value = Number(withdrawAmount)
    if (!withdrawAmount || isNaN(value) || value <= 0) {
      setWithdrawError('Valor inválido')
      return
    }
    if (value > withdrawSaving.amount) {
      setWithdrawError(`Saldo insuficiente (máx. ${formatAmount(withdrawSaving.amount, withdrawSaving.currency)})`)
      return
    }
    setWithdrawError('')
    setWithdrawLoading(true)
    try {
      const newAmount = withdrawSaving.amount - value
      if (newAmount === 0) {
        await onDelete(withdrawSaving.id)
      } else {
        await onUpdate(withdrawSaving.id, { amount: newAmount })
      }
      setWithdrawSaving(null)
      setWithdrawAmount('')
    } catch {
      setWithdrawError('Erro ao processar. Tenta novamente.')
    } finally {
      setWithdrawLoading(false)
    }
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
        <Button size="sm" onClick={() => setIsAddOpen(true)}>
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
              <div className="flex items-center gap-1 shrink-0">
                <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 mr-1">
                  {formatAmount(s.amount, s.currency)}
                </span>
                {/* Withdraw */}
                <button
                  onClick={() => { setWithdrawSaving(s); setWithdrawAmount(''); setWithdrawError('') }}
                  title="Retirar valor"
                  className="p-1.5 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg group"
                >
                  <ArrowDownLeft size={14} className="text-slate-300 dark:text-slate-700 group-hover:text-amber-500" />
                </button>
                {/* Edit */}
                <button
                  onClick={() => setEditSaving(s)}
                  title="Editar"
                  className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg group"
                >
                  <Pencil size={14} className="text-slate-300 dark:text-slate-700 group-hover:text-blue-400" />
                </button>
                {/* Delete */}
                <button
                  onClick={() => setDeleteId(s.id)}
                  title="Eliminar"
                  className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg group"
                >
                  <Trash2 size={14} className="text-slate-300 dark:text-slate-700 group-hover:text-red-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Nova Poupança">
        <SavingsForm onSubmit={handleAdd} onCancel={() => setIsAddOpen(false)} />
      </Modal>

      {/* Edit modal */}
      <Modal isOpen={!!editSaving} onClose={() => setEditSaving(null)} title="Editar Poupança">
        {editSaving && (
          <SavingsForm
            onSubmit={handleEdit}
            onCancel={() => setEditSaving(null)}
            initialValues={{
              description: editSaving.description,
              amount: editSaving.amount,
              currency: editSaving.currency,
              notes: editSaving.notes,
              date: editSaving.date,
            }}
          />
        )}
      </Modal>

      {/* Withdraw modal */}
      <Modal isOpen={!!withdrawSaving} onClose={() => setWithdrawSaving(null)} title="Retirar da Poupança">
        {withdrawSaving && (
          <div className="space-y-4">
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
              <p className="text-xs text-slate-500 dark:text-slate-400">{withdrawSaving.description}</p>
              <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                Disponível: {formatAmount(withdrawSaving.amount, withdrawSaving.currency)}
              </p>
            </div>
            <div>
              <label className={labelCls}>Valor a retirar</label>
              <input
                type="number"
                className={inputCls}
                placeholder="0,00"
                min="0.01"
                step="0.01"
                max={withdrawSaving.amount}
                value={withdrawAmount}
                onChange={e => { setWithdrawAmount(e.target.value); setWithdrawError('') }}
                autoFocus
              />
            </div>
            {withdrawError && <p className="text-sm text-red-500">{withdrawError}</p>}
            <div className="flex gap-3 pt-1">
              <Button type="button" variant="secondary" className="flex-1" onClick={() => setWithdrawSaving(null)}>
                Cancelar
              </Button>
              <Button variant="danger" className="flex-1" disabled={withdrawLoading} onClick={handleWithdraw}>
                Retirar
              </Button>
            </div>
          </div>
        )}
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
