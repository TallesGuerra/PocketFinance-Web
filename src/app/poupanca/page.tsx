'use client'

export const dynamic = 'force-dynamic'

import { useSavings } from '@/hooks/useSavings'
import { SavingsList } from '@/components/SavingsList'
import { Saving } from '@/types'

const CURRENCY_SYMBOLS: Record<string, string> = {
  EUR: '€',
  USD: '$',
  GBP: '£',
  CHF: 'Fr.',
  BRL: 'R$',
  JPY: '¥',
}

export default function PoupancaPage() {
  const { savings, loading, addSaving, updateSaving, deleteSaving, totalsByCurrency } = useSavings()

  const totalInEurEquivalent = Object.entries(totalsByCurrency)
  const hasMultipleCurrencies = totalInEurEquivalent.length > 1

  const handleAdd = async (data: Omit<Saving, 'id' | 'created_at'>) => {
    await addSaving(data)
  }

  return (
    <div>
      <div className="bg-gradient-to-br from-emerald-600 to-teal-500 px-4 pt-12 pb-6 text-white">
        <h1 className="text-xl font-bold mb-2">Poupança</h1>
        <p className="text-sm opacity-75 mb-4">O que tens guardado</p>

        {totalInEurEquivalent.length > 0 && (
          <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-4 space-y-2">
            {totalInEurEquivalent.map(([currency, total]) => (
              <div key={currency} className="flex justify-between items-center">
                <span className="text-sm opacity-80">{hasMultipleCurrencies ? currency : 'Total guardado'}</span>
                <span className="font-bold text-lg">
                  {CURRENCY_SYMBOLS[currency] ?? currency} {total.toLocaleString('pt-PT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="px-4 py-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <SavingsList
            savings={savings}
            totalsByCurrency={totalsByCurrency}
            onAdd={handleAdd}
            onUpdate={updateSaving}
            onDelete={deleteSaving}
          />
        )}
      </div>
    </div>
  )
}
