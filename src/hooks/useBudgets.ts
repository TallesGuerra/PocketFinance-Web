'use client'

import { useState, useEffect, useCallback } from 'react'
import { getSupabase } from '@/lib/supabase'
import { Budget } from '@/types'
import { useAuthContext } from '@/components/AuthProvider'
import { getMockBudgets } from '@/lib/mockData'

export function useBudgets(month: number, year: number) {
  const { activeProfile } = useAuthContext()
  const isGuest = activeProfile === 'guest'
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)

  const fetchBudgets = useCallback(async () => {
    if (isGuest) {
      setBudgets(getMockBudgets(month, year))
      setLoading(false)
      return
    }
    const supabase = getSupabase()
    const { data } = await supabase
      .from('budgets')
      .select('*, category:categories(*)')
      .eq('month', month)
      .eq('year', year)
    setBudgets((data as unknown as Budget[]) || [])
    setLoading(false)
  }, [month, year, isGuest])

  useEffect(() => {
    fetchBudgets()
  }, [fetchBudgets])

  const upsertBudget = async (budget: Omit<Budget, 'id' | 'created_at' | 'category'>) => {
    if (isGuest) return null
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('budgets')
      .upsert(
        { category_id: budget.category_id, amount: budget.amount, month: budget.month, year: budget.year },
        { onConflict: 'category_id,month,year' }
      )
      .select('*, category:categories(*)')
      .single()
    if (error) throw error
    await fetchBudgets()
    return data
  }

  const deleteBudget = async (id: string) => {
    if (isGuest) return
    const supabase = getSupabase()
    const { error } = await supabase.from('budgets').delete().eq('id', id)
    if (error) throw error
    setBudgets(prev => prev.filter(b => b.id !== id))
  }

  return { budgets, loading, upsertBudget, deleteBudget, refetch: fetchBudgets }
}
