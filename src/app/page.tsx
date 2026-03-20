'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useTransactions } from '@/hooks/useTransactions'
import { MonthPicker } from '@/components/MonthPicker'
import { SummaryCards } from '@/components/SummaryCards'
import { TransactionList } from '@/components/TransactionList'
import { TransactionForm } from '@/components/TransactionForm'
import { Modal } from '@/components/ui/Modal'

export default function HomePage() {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [isModalOpen, setIsModalOpen] = useState(false)

  const { transactions, loading, addTransaction, deleteTransaction } = useTransactions(month, year)

  const handleAdd = async (data: Parameters<typeof addTransaction>[0]) => {
    await addTransaction(data)
    setIsModalOpen(false)
  }

  return (
    <div>
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 px-4 pt-12 pb-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">💰 Finanças na Mão</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-white/20 backdrop-blur-sm p-2.5 rounded-xl hover:bg-white/30 transition-colors"
          >
            <Plus size={22} />
          </button>
        </div>
        <MonthPicker month={month} year={year} onChange={(m, y) => { setMonth(m); setYear(y) }} />
        <div className="mt-4">
          <SummaryCards transactions={transactions} />
        </div>
      </div>

      {/* Transaction list */}
      <div className="px-4 py-4">
        <h2 className="text-base font-semibold text-gray-900 mb-3">Histórico</h2>
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <TransactionList transactions={transactions} onDelete={deleteTransaction} />
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nova Transação">
        <TransactionForm onSubmit={handleAdd} onCancel={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  )
}
