'use client'

import { useState, useEffect } from 'react'
import { getSupabase } from '@/lib/supabase'
import { useAuthContext } from '@/components/AuthProvider'
import { MOCK_TRANSACTIONS } from '@/lib/mockData'

export function usePreviousBalance(month: number, year: number) {
  const { activeProfile } = useAuthContext()
  const isGuest = activeProfile === 'guest'
  const [previousBalance, setPreviousBalance] = useState(0)

  useEffect(() => {
    const firstDay = `${year}-${String(month).padStart(2, '0')}-01`

    if (isGuest) {
      const balance = MOCK_TRANSACTIONS
        .filter(t => t.date < firstDay && !t.is_installment)
        .reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0)
      setPreviousBalance(balance)
      return
    }

    const supabase = getSupabase()
    supabase
      .from('transactions')
      .select('amount, type')
      .lt('date', firstDay)
      .eq('is_installment', false)
      .then(({ data }) => {
        if (!data) return
        const balance = (data as { amount: number; type: string }[])
          .reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0)
        setPreviousBalance(balance)
      })
  }, [month, year, isGuest])

  return previousBalance
}
