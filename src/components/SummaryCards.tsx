import { TrendingUp, TrendingDown, Wallet, History } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import { Transaction } from '@/types'

interface SummaryCardsProps {
  transactions: Transaction[]
  previousBalance?: number
}

export function SummaryCards({ transactions, previousBalance = 0 }: SummaryCardsProps) {
  const income = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const expenses = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const monthBalance = income - expenses
  const totalBalance = previousBalance + monthBalance

  return (
    <div className="space-y-2.5">
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
            <span className="text-xs opacity-80">Saldo mês</span>
          </div>
          <p className={`font-bold text-sm ${monthBalance < 0 ? 'text-red-200' : ''}`}>
            {formatCurrency(monthBalance)}
          </p>
        </div>
      </div>

      {previousBalance !== 0 && (
        <div className="bg-white/10 backdrop-blur-sm rounded-xl px-3 py-2 flex items-center justify-between text-white">
          <div className="flex items-center gap-1.5">
            <History size={13} className="opacity-70" />
            <span className="text-xs opacity-70">Anterior</span>
            <span className={`text-xs font-medium ${previousBalance < 0 ? 'text-red-200' : 'text-emerald-200'}`}>
              {previousBalance > 0 ? '+' : ''}{formatCurrency(previousBalance)}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs opacity-70">Acumulado</span>
            <span className={`text-xs font-bold ${totalBalance < 0 ? 'text-red-200' : 'text-white'}`}>
              {formatCurrency(totalBalance)}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
