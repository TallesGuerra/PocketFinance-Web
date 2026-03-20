import { TrendingUp, TrendingDown, Wallet } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { Transaction } from '@/types'

interface SummaryCardsProps {
  transactions: Transaction[]
}

export function SummaryCards({ transactions }: SummaryCardsProps) {
  const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const expenses = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const balance = income - expenses

  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-3 text-white">
        <div className="flex items-center gap-1.5 mb-1">
          <TrendingUp size={14} />
          <span className="text-xs opacity-80">Receitas</span>
        </div>
        <p className="font-bold text-sm">{formatCurrency(income)}</p>
      </div>
      <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-3 text-white">
        <div className="flex items-center gap-1.5 mb-1">
          <TrendingDown size={14} />
          <span className="text-xs opacity-80">Despesas</span>
        </div>
        <p className="font-bold text-sm">{formatCurrency(expenses)}</p>
      </div>
      <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-3 text-white">
        <div className="flex items-center gap-1.5 mb-1">
          <Wallet size={14} />
          <span className="text-xs opacity-80">Saldo</span>
        </div>
        <p className={`font-bold text-sm ${balance < 0 ? 'text-red-200' : ''}`}>{formatCurrency(balance)}</p>
      </div>
    </div>
  )
}
