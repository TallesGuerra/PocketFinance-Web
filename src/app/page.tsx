'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { Plus, Sun, Moon, PiggyBank } from 'lucide-react'
import { useTransactions } from '@/hooks/useTransactions'
import { usePreviousBalance } from '@/hooks/usePreviousBalance'
import { useSavings } from '@/hooks/useSavings'
import { useReminders } from '@/hooks/useReminders'
import { useTheme } from '@/components/ThemeProvider'
import { MonthPicker } from '@/components/MonthPicker'
import { SummaryCards } from '@/components/SummaryCards'
import { TransactionList } from '@/components/TransactionList'
import { TransactionForm } from '@/components/TransactionForm'
import { TransferToSavingsForm } from '@/components/TransferToSavingsForm'
import { ExpensesByCategory } from '@/components/ExpensesByCategory'
import { Modal } from '@/components/ui/Modal'

type View = 'history' | 'by-category'

export default function HomePage() {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isTransferOpen, setIsTransferOpen] = useState(false)
  const [view, setView] = useState<View>('history')

  const { transactions, loading, addTransaction, updateTransaction, deleteTransaction, updatePaidStatus } = useTransactions(month, year)
  const previousBalance = usePreviousBalance(month, year)
  const { addSaving } = useSavings()
  const { isDark, setTheme } = useTheme()
  useReminders()

  const handleAdd = async (data: Parameters<typeof addTransaction>[0]) => {
    await addTransaction(data)
    setIsModalOpen(false)
  }

  const handlePayVirtual = async (t: Parameters<typeof addTransaction>[0] & { id: string; _virtual?: boolean }) => {
    await addTransaction({
      description: t.description,
      amount: t.amount,
      type: t.type,
      category_id: t.category_id,
      date: t.date,
      notes: t.notes,
      paid: true,
    })
  }

  const handleTransfer = async (data: { description: string; amount: number; currency: string; categoryId: string; date: string; notes?: string }) => {
    await addTransaction({
      description: data.description,
      amount: data.amount,
      type: 'expense',
      category_id: data.categoryId,
      date: data.date,
      notes: data.notes,
      paid: true,
    })
    await addSaving({
      description: data.description,
      amount: data.amount,
      currency: data.currency,
      notes: data.notes,
      date: data.date,
    })
    setIsTransferOpen(false)
  }

  return (
    <div>
      {/* Mobile header (gradient) */}
      <div className="bg-gradient-to-br from-emerald-600 to-teal-500 px-4 pt-12 pb-6 text-white lg:rounded-none lg:pt-8">
        {/* Mobile title row */}
        <div className="flex items-center justify-between mb-4 lg:hidden">
          <h1 className="text-xl font-bold tracking-tight">💰 PocketFinance</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className="bg-white/20 backdrop-blur-sm p-2.5 rounded-xl hover:bg-white/30 transition-colors"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button
              onClick={() => setIsTransferOpen(true)}
              title="Transferir para Poupança"
              className="bg-white/20 backdrop-blur-sm p-2.5 rounded-xl hover:bg-white/30 transition-colors"
            >
              <PiggyBank size={18} />
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-white/20 backdrop-blur-sm p-2.5 rounded-xl hover:bg-white/30 transition-colors"
            >
              <Plus size={22} />
            </button>
          </div>
        </div>

        {/* Desktop title row */}
        <div className="hidden lg:flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold tracking-tight">Início</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsTransferOpen(true)}
              className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl hover:bg-white/30 transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <PiggyBank size={16} /> Para Poupança
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl hover:bg-white/30 transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <Plus size={18} /> Nova Transação
            </button>
          </div>
        </div>

        <MonthPicker month={month} year={year} onChange={(m, y) => { setMonth(m); setYear(y) }} />
        <div className="mt-4">
          <SummaryCards transactions={transactions} previousBalance={previousBalance} />
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4 space-y-3">
        {/* View toggle */}
        <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
          <button
            onClick={() => setView('history')}
            className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-all ${
              view === 'history'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            Histórico
          </button>
          <button
            onClick={() => setView('by-category')}
            className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-all ${
              view === 'by-category'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            Por categoria
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : view === 'history' ? (
          <TransactionList transactions={transactions} onDelete={deleteTransaction} onTogglePaid={updatePaidStatus} onUpdate={updateTransaction} onPayVirtual={handlePayVirtual} viewMonth={month} viewYear={year} />
        ) : (
          <ExpensesByCategory transactions={transactions} />
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nova Transação">
        <TransactionForm onSubmit={handleAdd} onCancel={() => setIsModalOpen(false)} />
      </Modal>

      <Modal isOpen={isTransferOpen} onClose={() => setIsTransferOpen(false)} title="Transferir para Poupança">
        <TransferToSavingsForm onSubmit={handleTransfer} onCancel={() => setIsTransferOpen(false)} />
      </Modal>
    </div>
  )
}
