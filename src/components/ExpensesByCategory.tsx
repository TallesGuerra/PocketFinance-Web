'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { Transaction, Category } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'

interface Group {
  category: Category
  total: number
  transactions: Transaction[]
}

const FALLBACK_CATEGORY: Category = {
  id: 'sem-categoria',
  name: 'Sem categoria',
  icon: '📦',
  color: '#6B7280',
  type: 'expense',
  created_at: '',
}

export function ExpensesByCategory({ transactions }: { transactions: Transaction[] }) {
  const [openId, setOpenId] = useState<string | null>(null)

  const expenses = transactions.filter(t => t.type === 'expense')
  const totalExpenses = expenses.reduce((s, t) => s + t.amount, 0)

  // Group by category
  const groupMap = new Map<string, Group>()
  for (const t of expenses) {
    const id = t.category_id || 'sem-categoria'
    const cat = t.category ?? FALLBACK_CATEGORY
    if (!groupMap.has(id)) {
      groupMap.set(id, { category: cat, total: 0, transactions: [] })
    }
    const g = groupMap.get(id)!
    g.total += t.amount
    g.transactions.push(t)
  }

  const groups = [...groupMap.values()].sort((a, b) => b.total - a.total)

  if (groups.length === 0) {
    return (
      <p className="text-center text-slate-400 py-10 text-sm">Sem despesas este mês.</p>
    )
  }

  return (
    <div className="space-y-2">
      {groups.map(group => {
        const pct = totalExpenses > 0 ? (group.total / totalExpenses) * 100 : 0
        const isOpen = openId === group.category.id

        return (
          <div
            key={group.category.id}
            className="rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800"
          >
            {/* Category row */}
            <button
              onClick={() => setOpenId(isOpen ? null : group.category.id)}
              className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left"
            >
              <span className="text-2xl leading-none">{group.category.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                    {group.category.name}
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {formatCurrency(group.total)}
                    </span>
                    {isOpen
                      ? <ChevronDown size={15} className="text-slate-400" />
                      : <ChevronRight size={15} className="text-slate-400" />
                    }
                  </div>
                </div>
                {/* Progress bar */}
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: group.category.color }}
                    />
                  </div>
                  <span className="text-xs text-slate-400 w-8 text-right shrink-0">
                    {pct.toFixed(0)}%
                  </span>
                </div>
              </div>
            </button>

            {/* Transactions list (expanded) */}
            {isOpen && (
              <div className="border-t border-slate-100 dark:border-slate-800">
                {[...group.transactions]
                  .sort((a, b) => b.date.localeCompare(a.date))
                  .map((t, idx, arr) => (
                    <div
                      key={t.id}
                      className={`flex items-start justify-between px-4 py-3 gap-3 ${
                        idx < arr.length - 1 ? 'border-b border-slate-100 dark:border-slate-800' : ''
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-slate-800 dark:text-slate-200 truncate">
                          {t.description}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">{formatDate(t.date)}</p>
                        {t.notes && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 italic truncate">
                            {t.notes}
                          </p>
                        )}
                      </div>
                      <span className="text-sm font-semibold text-red-500 shrink-0 mt-0.5">
                        {formatCurrency(t.amount)}
                      </span>
                    </div>
                  ))}

                {/* Group subtotal */}
                <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60">
                  <span className="text-xs text-slate-400">
                    {group.transactions.length}{' '}
                    {group.transactions.length === 1 ? 'despesa' : 'despesas'}
                  </span>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    {formatCurrency(group.total)}
                  </span>
                </div>
              </div>
            )}
          </div>
        )
      })}

      {/* Grand total */}
      <div className="flex items-center justify-between px-4 py-3 bg-red-50 dark:bg-red-950/30 rounded-2xl border border-red-100 dark:border-red-900/30 mt-1">
        <span className="text-sm font-medium text-red-700 dark:text-red-400">Total despesas</span>
        <span className="text-base font-bold text-red-600 dark:text-red-400">
          {formatCurrency(totalExpenses)}
        </span>
      </div>
    </div>
  )
}
