'use client'

import { useState, useEffect, useCallback } from 'react'
import { getSupabase } from '@/lib/supabase'
import { Saving } from '@/types'
import { useAuthContext } from '@/components/AuthProvider'
import { MOCK_SAVINGS } from '@/lib/mockData'

export function useSavings() {
  const { activeProfile } = useAuthContext()
  const isGuest = activeProfile === 'guest'
  const [savings, setSavings] = useState<Saving[]>([])
  const [loading, setLoading] = useState(true)

  const fetchSavings = useCallback(async () => {
    if (isGuest) {
      setSavings(MOCK_SAVINGS)
      setLoading(false)
      return
    }
    const supabase = getSupabase()
    const { data } = await supabase
      .from('savings')
      .select('*')
      .order('date', { ascending: false })
    setSavings((data as Saving[]) ?? [])
    setLoading(false)
  }, [isGuest])

  useEffect(() => {
    fetchSavings()
    if (isGuest) return

    const supabase = getSupabase()
    const channel = supabase
      .channel('savings_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'savings' }, fetchSavings)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [fetchSavings, isGuest])

  const addSaving = async (data: Omit<Saving, 'id' | 'created_at'>) => {
    if (isGuest) return
    const supabase = getSupabase()
    const { error } = await supabase.from('savings').insert([data])
    if (error) throw error
    await fetchSavings()
  }

  const deleteSaving = async (id: string) => {
    if (isGuest) return
    const supabase = getSupabase()
    const { error } = await supabase.from('savings').delete().eq('id', id)
    if (error) throw error
    await fetchSavings()
  }

  const updateSaving = async (id: string, data: Partial<Omit<Saving, 'id' | 'created_at'>>) => {
    if (isGuest) return
    const supabase = getSupabase()
    const { error } = await supabase.from('savings').update(data).eq('id', id)
    if (error) throw error
    await fetchSavings()
  }

  // Totals grouped by currency
  const totalsByCurrency = savings.reduce<Record<string, number>>((acc, s) => {
    acc[s.currency] = (acc[s.currency] ?? 0) + s.amount
    return acc
  }, {})

  return { savings, loading, addSaving, updateSaving, deleteSaving, totalsByCurrency }
}
