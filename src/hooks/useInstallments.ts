'use client'

import { useState, useEffect } from 'react'
import { getSupabase } from '@/lib/supabase'
import { Transaction } from '@/types'

export function useInstallments() {
  const [installments, setInstallments] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      const today = new Date().toISOString().split('T')[0]
      const supabase = getSupabase()
      const { data } = await supabase
        .from('transactions')
        .select('*, category:categories(*)')
        .eq('is_installment', true)
        .gte('installment_end_date', today)
        .order('installment_end_date', { ascending: true })
      setInstallments((data as unknown as Transaction[]) || [])
      setLoading(false)
    }
    fetch()
  }, [])

  return { installments, loading }
}
