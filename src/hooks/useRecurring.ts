'use client'

import { useState, useEffect, useCallback } from 'react'
import { getSupabase } from '@/lib/supabase'
import { Category, TransactionType } from '@/types'

export interface RecurringTransaction {
  id: string
  description: string
  amount: number
  type: TransactionType
  category_id: string
  category?: Category
  recurrence: 'monthly' | 'weekly' | 'yearly'
  day_of_month: number
  notes?: string | null
  active: boolean
  start_date?: string | null   // first month to generate (inclusive)
  end_date?: string | null     // last month to generate (inclusive)
  last_generated_month: number | null
  last_generated_year: number | null
  created_at: string
}

export function useRecurring() {
  const [recurring, setRecurring] = useState<RecurringTransaction[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    setLoading(true)
    const supabase = getSupabase()
    const { data } = await supabase
      .from('recurring_transactions')
      .select('*, category:categories(*)')
      .order('created_at', { ascending: false })
    setRecurring((data as unknown as RecurringTransaction[]) || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])

  // Real-time subscription — refetch whenever recurring_transactions table changes
  useEffect(() => {
    const supabase = getSupabase()
    const channel = supabase
      .channel('recurring-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'recurring_transactions' }, () => {
        fetch()
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [fetch])

  // Auto-generate transactions for current month on mount
  useEffect(() => {
    const autoGenerate = async () => {
      const now = new Date()
      const currentMonth = now.getMonth() + 1
      const currentYear = now.getFullYear()
      const monthStart = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`
      const monthEnd = new Date(currentYear, currentMonth, 0).toISOString().split('T')[0]
      const supabase = getSupabase()

      const { data: activeRecurring } = await supabase
        .from('recurring_transactions')
        .select('*')
        .eq('active', true)

      if (!activeRecurring) return

      type RawRecurring = {
        id: string; description: string; amount: number; type: string;
        category_id: string | null; day_of_month: number; notes: string | null;
        start_date: string | null; end_date: string | null;
        last_generated_month: number | null; last_generated_year: number | null;
      }

      for (const r of activeRecurring as RawRecurring[]) {
        // Skip if already generated for this month
        if (r.last_generated_month === currentMonth && r.last_generated_year === currentYear) continue

        // Respect start_date: skip if hasn't started yet
        if (r.start_date && r.start_date > monthEnd) continue

        // Respect end_date: skip if already ended
        if (r.end_date && r.end_date < monthStart) continue

        // Calculate the date for this month
        const day = Math.min(r.day_of_month, new Date(currentYear, currentMonth, 0).getDate())
        const date = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`

        // Insert the transaction
        await supabase.from('transactions').insert({
          description: r.description,
          amount: r.amount,
          type: r.type as 'income' | 'expense',
          category_id: r.category_id,
          date,
          notes: r.notes,
          is_installment: false,
          paid: false,
        })

        // Update last generated
        await supabase
          .from('recurring_transactions')
          .update({ last_generated_month: currentMonth, last_generated_year: currentYear })
          .eq('id', r.id)
      }
    }

    autoGenerate()
  }, [])

  const addRecurring = async (data: Omit<RecurringTransaction, 'id' | 'created_at' | 'category' | 'last_generated_month' | 'last_generated_year'>) => {
    const supabase = getSupabase()
    const { error } = await supabase.from('recurring_transactions').insert({
      description: data.description,
      amount: data.amount,
      type: data.type,
      category_id: data.category_id,
      recurrence: data.recurrence,
      day_of_month: data.day_of_month,
      notes: data.notes,
      active: true,
      start_date: data.start_date ?? null,
      end_date: data.end_date ?? null,
      last_generated_month: null,
      last_generated_year: null,
    })
    if (error) throw error
    await fetch()
  }

  const toggleActive = async (id: string, active: boolean) => {
    const supabase = getSupabase()
    await supabase.from('recurring_transactions').update({ active }).eq('id', id)
    setRecurring(prev => prev.map(r => r.id === id ? { ...r, active } : r))
  }

  const deleteRecurring = async (id: string) => {
    const supabase = getSupabase()
    await supabase.from('recurring_transactions').delete().eq('id', id)
    setRecurring(prev => prev.filter(r => r.id !== id))
  }

  const updateRecurring = async (id: string, data: Partial<Omit<RecurringTransaction, 'id' | 'created_at' | 'category' | 'last_generated_month' | 'last_generated_year'>>) => {
    const supabase = getSupabase()
    const { error } = await supabase.from('recurring_transactions').update({
      description: data.description,
      amount: data.amount,
      type: data.type,
      category_id: data.category_id,
      recurrence: data.recurrence,
      day_of_month: data.day_of_month,
      notes: data.notes ?? null,
      active: data.active,
      start_date: data.start_date ?? null,
      end_date: data.end_date ?? null,
    }).eq('id', id)
    if (error) throw error
    await fetch()
  }

  return { recurring, loading, addRecurring, updateRecurring, toggleActive, deleteRecurring, refetch: fetch }
}
