'use client'

import { useEffect } from 'react'
import { getSupabase } from '@/lib/supabase'
import { Transaction } from '@/types'

export function useReminders() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!('Notification' in window)) return

    const checkDueExpenses = async () => {
      const today = new Date().toISOString().split('T')[0]
      const supabase = getSupabase()

      const { data } = await supabase
        .from('transactions')
        .select('*, category:categories(*)')
        .eq('type', 'expense')
        .eq('paid', false)
        .lte('date', today)

      if (!data || data.length === 0) return

      const expenses = data as unknown as Transaction[]

      if (Notification.permission === 'granted') {
        expenses.forEach(t => {
          const isOverdue = t.date < today
          const body = isOverdue
            ? `Venceu em ${new Date(t.date + 'T00:00:00').toLocaleDateString('pt-PT')}`
            : 'Vence hoje'
          new Notification(`💳 ${t.description}`, {
            body: `${body} — ${Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(t.amount)}`,
            icon: '/icons/apple-touch-icon.png',
            tag: `expense-${t.id}`,
          })
        })
      } else if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            expenses.forEach(t => {
              const isOverdue = t.date < today
              const body = isOverdue
                ? `Venceu em ${new Date(t.date + 'T00:00:00').toLocaleDateString('pt-PT')}`
                : 'Vence hoje'
              new Notification(`💳 ${t.description}`, {
                body: `${body} — ${Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(t.amount)}`,
                icon: '/icons/apple-touch-icon.png',
                tag: `expense-${t.id}`,
              })
            })
          }
        })
      }
    }

    checkDueExpenses()
  }, [])
}
