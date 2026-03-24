'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { useCategories } from '@/hooks/useCategories'
import { Transaction, TransactionType } from '@/types'

const inputCls = 'w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-slate-400 dark:placeholder:text-slate-600'
const labelCls = 'block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1'

interface TransactionFormData {
  description: string
  amount: number
  type: TransactionType
  category_id: string
  date: string
  notes?: string
  is_installment?: boolean
  installment_end_date?: string | null
  installment_amount?: number | null
}

interface TransactionFormProps {
  onSubmit: (data: TransactionFormData) => Promise<void>
  onCancel: () => void
  initialData?: Partial<Transaction>
  editMode?: boolean
}

export function TransactionForm({ onSubmit, onCancel, initialData, editMode = false }: TransactionFormProps) {
  const today = new Date().toISOString().split('T')[0]
  const [type, setType] = useState<TransactionType>(initialData?.type ?? 'expense')
  const [description, setDescription] = useState(initialData?.description ?? '')
  const [amount, setAmount] = useState(
    initialData?.is_installment && initialData?.installment_amount
      ? String(initialData.installment_amount)
      : initialData?.amount ? String(initialData.amount) : ''
  )
  const [categoryId, setCategoryId] = useState(initialData?.category_id ?? '')
  const [date, setDate] = useState(initialData?.date ?? today)
  const [notes, setNotes] = useState(initialData?.notes ?? '')
  const [isInstallment, setIsInstallment] = useState(initialData?.is_installment ?? false)
  const [installmentEndDate, setInstallmentEndDate] = useState(initialData?.installment_end_date ?? '')
  const [installmentAmount, setInstallmentAmount] = useState(
    initialData?.installment_amount ? String(initialData.installment_amount) : ''
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { categories } = useCategories(type)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim()) return setError('Descrição é obrigatória')
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return setError('Valor inválido')
    if (!categoryId) return setError('Selecciona uma categoria')
    if (isInstallment && !installmentEndDate) return setError('Define a data de fim do parcelamento')
    if (isInstallment && installmentEndDate <= date) return setError('Fim do parcelamento deve ser após a data de vencimento')

    setError('')
    setLoading(true)
    try {
      const totalAmount = isInstallment && type === 'expense' && installmentAmount
        ? Number(installmentAmount) // store per-parcel amount as main amount when editing installments
        : Number(amount)

      await onSubmit({
        description: description.trim(),
        amount: editMode && isInstallment && installmentAmount ? Number(amount) : Number(amount),
        type,
        category_id: categoryId,
        date,
        notes: notes.trim() || undefined,
        is_installment: type === 'expense' ? isInstallment : false,
        installment_end_date: (type === 'expense' && isInstallment) ? (installmentEndDate || null) : null,
        installment_amount: (type === 'expense' && isInstallment && installmentAmount)
          ? Number(installmentAmount)
          : null,
      })
      void totalAmount // suppress unused warning
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao guardar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Type toggle — disabled in edit mode */}
      <div className="flex rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
        <button
          type="button"
          disabled={editMode}
          onClick={() => { setType('expense'); setCategoryId(''); setIsInstallment(false) }}
          className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
            type === 'expense'
              ? 'bg-red-500 text-white'
              : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
          } ${editMode ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
          Despesa
        </button>
        <button
          type="button"
          disabled={editMode}
          onClick={() => { setType('income'); setCategoryId(''); setIsInstallment(false) }}
          className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
            type === 'income'
              ? 'bg-emerald-500 text-white'
              : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
          } ${editMode ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
          Receita
        </button>
      </div>

      {/* Description */}
      <div>
        <label className={labelCls}>Descrição</label>
        <input
          type="text"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Ex: Almoço, Supermercado..."
          className={inputCls}
        />
      </div>

      {/* Amount */}
      <div>
        <label className={labelCls}>{isInstallment ? 'Valor total (€)' : 'Valor (€)'}</label>
        <input
          type="number"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          placeholder="0.00"
          step="0.01"
          min="0.01"
          className={inputCls}
        />
      </div>

      {/* Category */}
      <div>
        <label className={labelCls}>Categoria</label>
        <select
          value={categoryId}
          onChange={e => setCategoryId(e.target.value)}
          className={inputCls}
        >
          <option value="">Seleccionar categoria</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
          ))}
        </select>
      </div>

      {/* Due date */}
      <div>
        <label className={labelCls}>{type === 'expense' ? 'Data de Vencimento' : 'Data'}</label>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className={inputCls}
        />
      </div>

      {/* Installment toggle — expenses only */}
      {type === 'expense' && (
        <div
          className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer"
          onClick={() => setIsInstallment(v => !v)}
        >
          <div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Compra parcelada</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">Definir parcelas e data de término</p>
          </div>
          <div className={`w-11 h-6 rounded-full relative transition-colors ${isInstallment ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'}`}>
            <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${isInstallment ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </div>
        </div>
      )}

      {/* Installment fields */}
      {type === 'expense' && isInstallment && (
        <div className="space-y-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800">
          <div>
            <label className={labelCls}>Fim do parcelamento</label>
            <input
              type="date"
              value={installmentEndDate ?? ''}
              onChange={e => setInstallmentEndDate(e.target.value)}
              min={date}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Valor por parcela (€)</label>
            <input
              type="number"
              value={installmentAmount}
              onChange={e => setInstallmentAmount(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0.01"
              className={inputCls}
            />
          </div>
        </div>
      )}

      {/* Notes */}
      <div>
        <label className={labelCls}>Notas (opcional)</label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Observações adicionais..."
          rows={2}
          className={`${inputCls} resize-none`}
        />
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="secondary" className="flex-1" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" className="flex-1" disabled={loading}>
          {loading ? 'A guardar...' : editMode ? 'Atualizar' : 'Guardar'}
        </Button>
      </div>
    </form>
  )
}
