'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useTransactions } from '@/hooks/useTransactions'
import { useBudgets } from '@/hooks/useBudgets'
import { useCategories } from '@/hooks/useCategories'
import { BudgetList } from '@/components/BudgetList'
import { MonthPicker } from '@/components/MonthPicker'
import { Budget } from '@/types'

export default function OrcamentosPage() {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())

  const { transactions } = useTransactions(month, year)
  const { budgets, loading, upsertBudget, deleteBudget } = useBudgets(month, year)
  const { categories } = useCategories('expense')

  // Merge budgets with actual spending
  const budgetsWithSpent = budgets.map(b => {
    const spent = transactions
      .filter(t => t.type === 'expense' && t.category_id === b.category_id)
      .reduce((sum, t) => sum + t.amount, 0)
    return { ...b, spent }
  })

  const totalBudget = budgets.reduce((s, b) => s + b.amount, 0)
  const totalSpent = budgetsWithSpent.reduce((s, b) => s + b.spent, 0)

  const handleUpsert = async (data: Omit<Budget, 'id' | 'created_at' | 'category'>) => {
    await upsertBudget(data)
  }

  return (
    <div>
      <div className="bg-gradient-to-br from-emerald-600 to-teal-500 px-4 pt-12 pb-6 text-white">
        <h1 className="text-xl font-bold mb-4">Orçamentos</h1>
        <MonthPicker month={month} year={year} onChange={(m, y) => { setMonth(m); setYear(y) }} />

        {budgets.length > 0 && (
          <div className="mt-4 bg-white/15 backdrop-blur-sm rounded-2xl p-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="opacity-80">Total gasto</span>
              <span className="font-semibold">
                €{totalSpent.toFixed(2)} / €{totalBudget.toFixed(2)}
              </span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  totalSpent > totalBudget ? 'bg-red-300' : totalSpent / totalBudget > 0.8 ? 'bg-amber-300' : 'bg-white'
                }`}
                style={{ width: `${Math.min((totalSpent / totalBudget) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="px-4 py-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <BudgetList
            budgets={budgetsWithSpent}
            categories={categories}
            month={month}
            year={year}
            onUpsert={handleUpsert}
            onDelete={deleteBudget}
          />
        )}
      </div>
    </div>
  )
}
