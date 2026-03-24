'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { Plus, Trash2, Pause, Play, CreditCard } from 'lucide-react'
import { useRecurring } from '@/hooks/useRecurring'
import { useInstallments } from '@/hooks/useInstallments'
import { useCategories } from '@/hooks/useCategories'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatCurrency } from '@/lib/utils'
import { TransactionType } from '@/types'

const inputCls = 'w-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-slate-400'
const labelCls = 'block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1'

const recurrenceLabels: Record<string, string> = {
  monthly: 'Mensal',
  weekly: 'Semanal',
  yearly: 'Anual',
}

export default function RecorrentesPage() {
  const { recurring, loading, addRecurring, toggleActive, deleteRecurring } = useRecurring()
  const { installments } = useInstallments()
  const [isOpen, setIsOpen] = useState(false)
  const [type, setType] = useState<TransactionType>('expense')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [recurrence, setRecurrence] = useState<'monthly' | 'weekly' | 'yearly'>('monthly')
  const [dayOfMonth, setDayOfMonth] = useState('1')
  const [notes, setNotes] = useState('')
  const [startMonth, setStartMonth] = useState('')   // YYYY-MM, optional
  const [endMonth, setEndMonth] = useState('')       // YYYY-MM, optional
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const { categories } = useCategories(type)

  const resetForm = () => {
    setDescription(''); setAmount(''); setCategoryId('');
    setRecurrence('monthly'); setDayOfMonth('1'); setNotes('');
    setStartMonth(''); setEndMonth(''); setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim()) return setError('Descrição é obrigatória')
    if (!amount || Number(amount) <= 0) return setError('Valor inválido')
    if (!categoryId) return setError('Selecciona uma categoria')
    if (startMonth && endMonth && endMonth < startMonth) return setError('Mês de fim deve ser após o mês de início')
    setSaving(true)
    try {
      await addRecurring({
        description: description.trim(),
        amount: Number(amount),
        type,
        category_id: categoryId,
        recurrence,
        day_of_month: Number(dayOfMonth),
        notes: notes.trim() || null,
        active: true,
        start_date: startMonth ? `${startMonth}-01` : null,
        end_date: endMonth ? `${endMonth}-01` : null,
      })
      setIsOpen(false)
      resetForm()
    } catch {
      setError('Erro ao guardar')
    } finally {
      setSaving(false)
    }
  }

  const income = recurring.filter(r => r.type === 'income' && r.active)
  const expenses = recurring.filter(r => r.type === 'expense' && r.active)
  const inactive = recurring.filter(r => !r.active)

  return (
    <div>
      <div className="bg-gradient-to-br from-emerald-600 to-teal-500 px-4 pt-12 pb-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Recorrentes</h1>
            <p className="text-sm opacity-75 mt-0.5">Geradas automaticamente todo mês</p>
          </div>
          <button
            onClick={() => setIsOpen(true)}
            className="bg-white/20 backdrop-blur-sm p-2.5 rounded-xl hover:bg-white/30 transition-colors"
          >
            <Plus size={22} />
          </button>
        </div>
      </div>

      <div className="px-4 py-4 space-y-6">
        {/* Active installments */}
        {installments.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-600 uppercase tracking-wider mb-2">
              Parcelamentos Ativos
            </p>
            <div className="space-y-2">
              {installments.map(t => {
                const start = new Date(t.date + 'T00:00:00')
                const end = new Date(t.installment_end_date! + 'T00:00:00')
                const total = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1
                const now = new Date()
                const current = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth()) + 1
                const remaining = total - current
                const endFormatted = end.toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' })

                return (
                  <div
                    key={t.id}
                    className="bg-white dark:bg-slate-900 rounded-2xl p-3 flex items-center gap-3 border border-slate-100 dark:border-slate-800"
                    style={{ boxShadow: 'var(--shadow)' }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                      style={{ backgroundColor: `${t.category?.color}20` }}
                    >
                      {t.category?.icon ?? <CreditCard size={18} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{t.description}</p>
                      <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                        <span className="text-xs text-slate-400 dark:text-slate-500">{t.category?.name}</span>
                        <span className="text-xs bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 px-1.5 py-0.5 rounded-full">
                          Parcela {current}/{total}
                        </span>
                        {remaining > 0 && (
                          <span className="text-xs text-slate-400 dark:text-slate-500">
                            {remaining} restante{remaining !== 1 ? 's' : ''} · até {endFormatted}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold text-red-500">
                        -{formatCurrency(t.installment_amount ?? t.amount)}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">/mês</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Recurring transactions */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : recurring.length === 0 && installments.length === 0 ? (
          <EmptyState
            icon="🔄"
            title="Sem transações recorrentes"
            description="Adiciona receitas ou despesas que se repetem automaticamente"
          />
        ) : recurring.length > 0 ? (
          <>
            {income.length > 0 && (
              <RecurringGroup title="Receitas" items={income} onToggle={toggleActive} onDelete={deleteRecurring} />
            )}
            {expenses.length > 0 && (
              <RecurringGroup title="Despesas" items={expenses} onToggle={toggleActive} onDelete={deleteRecurring} />
            )}
            {inactive.length > 0 && (
              <RecurringGroup title="Pausadas" items={inactive} onToggle={toggleActive} onDelete={deleteRecurring} dimmed />
            )}
          </>
        ) : null}
      </div>

      <Modal isOpen={isOpen} onClose={() => { setIsOpen(false); resetForm() }} title="Nova Recorrente">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type toggle */}
          <div className="flex rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => { setType('expense'); setCategoryId('') }}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${type === 'expense' ? 'bg-red-500 text-white' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
            >
              Despesa
            </button>
            <button
              type="button"
              onClick={() => { setType('income'); setCategoryId('') }}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors ${type === 'income' ? 'bg-emerald-500 text-white' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
            >
              Receita
            </button>
          </div>

          <div>
            <label className={labelCls}>Descrição</label>
            <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Ex: Salário, Netflix..." className={inputCls} />
          </div>

          <div>
            <label className={labelCls}>Valor (€)</label>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" step="0.01" min="0.01" className={inputCls} />
          </div>

          <div>
            <label className={labelCls}>Categoria</label>
            <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className={inputCls}>
              <option value="">Seleccionar categoria</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Frequência</label>
              <select value={recurrence} onChange={e => setRecurrence(e.target.value as 'monthly' | 'weekly' | 'yearly')} className={inputCls}>
                <option value="monthly">Mensal</option>
                <option value="weekly">Semanal</option>
                <option value="yearly">Anual</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Dia do mês</label>
              <input type="number" value={dayOfMonth} onChange={e => setDayOfMonth(e.target.value)} min="1" max="31" className={inputCls} />
            </div>
          </div>

          {/* Optional start / end months */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Início (opcional)</label>
              <input
                type="month"
                value={startMonth}
                onChange={e => setStartMonth(e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Fim (opcional)</label>
              <input
                type="month"
                value={endMonth}
                onChange={e => setEndMonth(e.target.value)}
                min={startMonth || undefined}
                className={inputCls}
              />
            </div>
          </div>

          <div>
            <label className={labelCls}>Notas (opcional)</label>
            <input type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Observações..." className={inputCls} />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => { setIsOpen(false); resetForm() }}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={saving}>
              {saving ? 'A guardar...' : 'Guardar'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

function RecurringGroup({
  title,
  items,
  onToggle,
  onDelete,
  dimmed,
}: {
  title: string
  items: ReturnType<typeof useRecurring>['recurring']
  onToggle: (id: string, active: boolean) => Promise<void>
  onDelete: (id: string) => Promise<void>
  dimmed?: boolean
}) {
  return (
    <div>
      <p className="text-xs font-semibold text-slate-400 dark:text-slate-600 uppercase tracking-wider mb-2">{title}</p>
      <div className="space-y-2">
        {items.map(r => (
          <div
            key={r.id}
            className={`bg-white dark:bg-slate-900 rounded-2xl p-3 flex items-center gap-3 border border-slate-100 dark:border-slate-800 ${dimmed ? 'opacity-50' : ''}`}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
              style={{ backgroundColor: `${r.category?.color}20` }}
            >
              {r.category?.icon ?? '🔄'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{r.description}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                {recurrenceLabels[r.recurrence]} · dia {r.day_of_month}
                {r.end_date && ` · até ${new Date(r.end_date + 'T00:00:00').toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' })}`}
              </p>
            </div>
            <p className={`text-sm font-semibold flex-shrink-0 ${r.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
              {r.type === 'income' ? '+' : '-'}{formatCurrency(r.amount)}
            </p>
            <button
              onClick={() => onToggle(r.id, !r.active)}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {r.active
                ? <Pause size={14} className="text-slate-400" />
                : <Play size={14} className="text-emerald-500" />
              }
            </button>
            <button
              onClick={() => onDelete(r.id)}
              className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <Trash2 size={14} className="text-slate-300 dark:text-slate-700 hover:text-red-400" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
