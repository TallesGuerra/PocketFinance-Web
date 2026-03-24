'use client'

import { useState, useEffect, useCallback } from 'react'
import { getSupabase } from '@/lib/supabase'
import { Transaction } from '@/types'
import { useAuthContext } from '@/components/AuthProvider'
import { MOCK_TRANSACTIONS } from '@/lib/mockData'

export function useTransactions(month?: number, year?: number) {
  const { activeProfile } = useAuthContext()
  const isGuest = activeProfile === 'guest'
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTransactions = useCallback(async () => {
    if (isGuest) {
      const filtered = MOCK_TRANSACTIONS.filter(t => {
        if (!month || !year) return true
        const [y, m] = t.date.split('-').map(Number)
        return y === year && m === month
      })
      setTransactions(filtered.sort((a, b) => b.date.localeCompare(a.date)))
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const supabase = getSupabase()
      let query = supabase
        .from('transactions')
        .select('*, category:categories(*)')
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })

      if (month && year) {
        const start = `${year}-${String(month).padStart(2, '0')}-01`
        const end = new Date(year, month, 0).toISOString().split('T')[0]
        // Include normal transactions in this month OR installment transactions that span this month
        query = query.or(
          `and(date.gte.${start},date.lte.${end}),and(is_installment.eq.true,date.lte.${end},installment_end_date.gte.${start})`
        )
      }

      const { data, error } = await query
      if (error) throw error

      let result = (data as unknown as Transaction[]) || []

      // Project active recurring transactions into future months
      if (month && year) {
        const now = new Date()
        const currentMonth = now.getMonth() + 1
        const currentYear = now.getFullYear()
        const isFutureMonth = year > currentYear || (year === currentYear && month > currentMonth)

        if (isFutureMonth) {
          const monthStart = `${year}-${String(month).padStart(2, '0')}-01`
          const monthEnd = new Date(year, month, 0).toISOString().split('T')[0]

          const { data: activeRecurring } = await supabase
            .from('recurring_transactions')
            .select('*, category:categories(*)')
            .eq('active', true)
            .or(`start_date.is.null,start_date.lte.${monthEnd}`)
            .or(`end_date.is.null,end_date.gte.${monthStart}`)

          if (activeRecurring) {
            type RawR = {
              id: string; description: string; amount: number; type: string;
              category_id: string | null; category: Transaction['category'];
              day_of_month: number; notes: string | null; created_at: string;
            }
            const projected: Transaction[] = (activeRecurring as RawR[]).map(r => {
              const day = Math.min(r.day_of_month, new Date(year, month, 0).getDate())
              const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
              return {
                id: `virtual-${r.id}`,
                description: r.description,
                amount: r.amount,
                type: r.type as 'income' | 'expense',
                category_id: r.category_id ?? '',
                category: r.category,
                date,
                notes: r.notes ?? undefined,
                is_installment: false,
                paid: false,
                created_at: r.created_at,
                _virtual: true,
              }
            })
            result = [...result, ...projected]
          }
        }
      }

      setTransactions(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar transações')
    } finally {
      setLoading(false)
    }
  }, [month, year, isGuest])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  // Real-time subscription — refetch whenever transactions table changes
  useEffect(() => {
    if (isGuest) return
    const supabase = getSupabase()
    const channel = supabase
      .channel('transactions-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, () => {
        fetchTransactions()
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [fetchTransactions])

  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'created_at' | 'category' | '_virtual'>) => {
    if (isGuest) return null
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('transactions')
      .insert({
        description: transaction.description,
        amount: transaction.amount,
        type: transaction.type,
        category_id: transaction.category_id,
        date: transaction.date,
        notes: transaction.notes,
        is_installment: transaction.is_installment ?? false,
        installment_end_date: transaction.installment_end_date ?? null,
        installment_amount: transaction.installment_amount ?? null,
        paid: false,
        paid_date: null,
      })
      .select('*, category:categories(*)')
      .single()
    if (error) throw error
    await fetchTransactions()
    return data
  }

  const updateTransaction = async (id: string, transaction: Partial<Omit<Transaction, 'id' | 'created_at' | 'category' | '_virtual'>>) => {
    if (isGuest) return
    const supabase = getSupabase()
    const { error } = await supabase
      .from('transactions')
      .update({
        description: transaction.description,
        amount: transaction.amount,
        type: transaction.type,
        category_id: transaction.category_id,
        date: transaction.date,
        notes: transaction.notes ?? null,
        is_installment: transaction.is_installment ?? false,
        installment_end_date: transaction.installment_end_date ?? null,
        installment_amount: transaction.installment_amount ?? null,
      })
      .eq('id', id)
    if (error) throw error
    await fetchTransactions()
  }

  const deleteTransaction = async (id: string) => {
    if (isGuest) return
    const supabase = getSupabase()
    const { error } = await supabase.from('transactions').delete().eq('id', id)
    if (error) throw error
    setTransactions(prev => prev.filter(t => t.id !== id))
  }

  const updatePaidStatus = async (id: string, paid: boolean) => {
    if (isGuest) return
    const supabase = getSupabase()
    const paid_date = paid ? new Date().toISOString().split('T')[0] : null
    const { error } = await supabase
      .from('transactions')
      .update({ paid, paid_date })
      .eq('id', id)
    if (error) throw error
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, paid, paid_date } : t))
  }

  return { transactions, loading, error, addTransaction, updateTransaction, deleteTransaction, updatePaidStatus, refetch: fetchTransactions }
}
