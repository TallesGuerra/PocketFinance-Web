'use client'

import { useState, useEffect, useCallback } from 'react'
import { getSupabase } from '@/lib/supabase'
import { Transaction } from '@/types'

export function useTransactions(month?: number, year?: number) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTransactions = useCallback(async () => {
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
        query = query.gte('date', start).lte('date', end)
      }

      const { data, error } = await query
      if (error) throw error
      setTransactions((data as unknown as Transaction[]) || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar transações')
    } finally {
      setLoading(false)
    }
  }, [month, year])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'created_at' | 'category'>) => {
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
      })
      .select('*, category:categories(*)')
      .single()
    if (error) throw error
    await fetchTransactions()
    return data
  }

  const deleteTransaction = async (id: string) => {
    const supabase = getSupabase()
    const { error } = await supabase.from('transactions').delete().eq('id', id)
    if (error) throw error
    setTransactions(prev => prev.filter(t => t.id !== id))
  }

  return { transactions, loading, error, addTransaction, deleteTransaction, refetch: fetchTransactions }
}
