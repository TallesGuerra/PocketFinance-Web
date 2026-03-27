'use client'

import { useState, useEffect, useCallback } from 'react'
import { getSupabase } from '@/lib/supabase'
import { useAuthContext } from '@/components/AuthProvider'
import { MOCK_TRANSACTIONS } from '@/lib/mockData'

export function usePreviousBalance(month: number, year: number) {
  const { activeProfile } = useAuthContext()
  const isGuest = activeProfile === 'guest'
  const [previousBalance, setPreviousBalance] = useState(0)

  // Use today as upper bound so transactions added today already reflect in future months
  const today = new Date().toISOString().split('T')[0]
  const firstDay = `${year}-${String(month).padStart(2, '0')}-01`

  const fetchBalance = useCallback(async () => {
    if (isGuest) {
      const balance = MOCK_TRANSACTIONS
        .filter(t => t.date < firstDay && !t.is_installment)
        .reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0)
      setPreviousBalance(balance)
      return
    }

    const supabase = getSupabase()
    const { data } = await supabase
      .from('transactions')
      .select('amount, type')
      .lt('date', firstDay)
      .lte('date', today)
      .eq('is_installment', false)

    if (!data) return
    const balance = (data as { amount: number; type: string }[])
      .reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0)
    setPreviousBalance(balance)
  }, [firstDay, today, isGuest])

  useEffect(() => {
    fetchBalance()
  }, [fetchBalance])

  // Real-time: refetch when any transaction changes
  useEffect(() => {
    if (isGuest) return
    const supabase = getSupabase()
    const channel = supabase
      .channel('prev-balance-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, fetchBalance)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [fetchBalance, isGuest])

  return previousBalance
}
