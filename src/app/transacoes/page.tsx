'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { useTransactions } from '@/hooks/useTransactions'
import { TransactionList } from '@/components/TransactionList'
import { TransactionForm } from '@/components/TransactionForm'
import { Modal } from '@/components/ui/Modal'
import { MonthPicker } from '@/components/MonthPicker'

export default function TransacoesPage() {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all')

  const { transactions, loading, addTransaction, updateTransaction, deleteTransaction, updatePaidStatus } = useTransactions(month, year)

  const filtered = transactions.filter(t => {
    const matchesSearch = t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.category?.name.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'all' || t.type === filter
    return matchesSearch && matchesFilter
  })

  const handleAdd = async (data: Parameters<typeof addTransaction>[0]) => {
    await addTransaction(data)
    setIsModalOpen(false)
  }

  return (
    <div>
      <div className="bg-gradient-to-br from-emerald-600 to-teal-500 px-4 pt-12 pb-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold tracking-tight">Transações</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-white/20 backdrop-blur-sm p-2.5 rounded-xl hover:bg-white/30 transition-colors"
          >
            <Plus size={22} />
          </button>
        </div>
        <MonthPicker month={month} year={year} onChange={(m, y) => { setMonth(m); setYear(y) }} />
      </div>

      <div className="px-4 py-4 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Pesquisar transações..."
            className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Filter tabs */}
        <div className="flex rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
          {(['all', 'expense', 'income'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                filter === f
                  ? f === 'income' ? 'bg-emerald-500 text-white' : f === 'expense' ? 'bg-red-500 text-white' : 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {f === 'all' ? 'Todas' : f === 'income' ? 'Receitas' : 'Despesas'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <TransactionList transactions={filtered} onDelete={deleteTransaction} onTogglePaid={updatePaidStatus} onUpdate={updateTransaction} viewMonth={month} viewYear={year} />
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nova Transação">
        <TransactionForm onSubmit={handleAdd} onCancel={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  )
}
