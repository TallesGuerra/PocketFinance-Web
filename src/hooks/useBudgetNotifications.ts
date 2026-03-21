'use client'

import { useEffect } from 'react'
import { getSupabase } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'

const NOTIFIED_KEY = 'pf_budget_notified'
const THRESHOLD_80 = 0.8
const THRESHOLD_100 = 1.0

async function requestPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false
  const result = await Notification.requestPermission()
  return result === 'granted'
}

function getNotifiedKey(categoryId: string, month: number, year: number, level: string) {
  return `${categoryId}-${month}-${year}-${level}`
}

export function useBudgetNotifications(month: number, year: number) {
  useEffect(() => {
    const check = async () => {
      if (typeof window === 'undefined') return
      const allowed = await requestPermission()
      if (!allowed) return

      const supabase = getSupabase()
      const now = new Date()
      const currentMonth = now.getMonth() + 1
      const currentYear = now.getFullYear()

      // Only check current month
      if (month !== currentMonth || year !== currentYear) return

      // Fetch budgets with spending
      type BudgetRow = { category_id: string; amount: number; category: { name?: string } | null }
      const { data: budgets } = await supabase
        .from('budgets')
        .select('*, category:categories(*)')
        .eq('month', month)
        .eq('year', year)

      if (!budgets?.length) return
      const typedBudgets = budgets as unknown as BudgetRow[]

      const start = `${year}-${String(month).padStart(2, '0')}-01`
      const end = new Date(year, month, 0).toISOString().split('T')[0]

      const { data: transactions } = await supabase
        .from('transactions')
        .select('category_id, amount')
        .eq('type', 'expense')
        .gte('date', start)
        .lte('date', end)

      if (!transactions) return

      // Calculate spending per category
      const spendingMap: Record<string, number> = {}
      transactions.forEach(t => {
        if (t.category_id) {
          spendingMap[t.category_id] = (spendingMap[t.category_id] ?? 0) + t.amount
        }
      })

      // Load already-notified set
      const notified: Set<string> = new Set(
        JSON.parse(localStorage.getItem(NOTIFIED_KEY) ?? '[]')
      )

      const newNotified = new Set(notified)
      const sw = await navigator.serviceWorker?.ready

      for (const budget of typedBudgets) {
        const spent = spendingMap[budget.category_id] ?? 0
        const ratio = spent / budget.amount
        const categoryName = budget.category?.name ?? 'Categoria'

        if (ratio >= THRESHOLD_100) {
          const key = getNotifiedKey(budget.category_id, month, year, '100')
          if (!notified.has(key)) {
            const title = `🚨 Orçamento ultrapassado — ${categoryName}`
            const body = `Gastaste ${formatCurrency(spent)} de ${formatCurrency(budget.amount)} (${Math.round(ratio * 100)}%)`
            if (sw) {
              sw.showNotification(title, { body, icon: '/pocketFinance_icon.svg', tag: key })
            } else {
              new Notification(title, { body, icon: '/pocketFinance_icon.svg', tag: key })
            }
            newNotified.add(key)
          }
        } else if (ratio >= THRESHOLD_80) {
          const key = getNotifiedKey(budget.category_id, month, year, '80')
          if (!notified.has(key)) {
            const title = `⚠️ Orçamento a 80% — ${categoryName}`
            const body = `Gastaste ${formatCurrency(spent)} de ${formatCurrency(budget.amount)}. Restam ${formatCurrency(budget.amount - spent)}.`
            if (sw) {
              sw.showNotification(title, { body, icon: '/pocketFinance_icon.svg', tag: key })
            } else {
              new Notification(title, { body, icon: '/pocketFinance_icon.svg', tag: key })
            }
            newNotified.add(key)
          }
        }
      }

      localStorage.setItem(NOTIFIED_KEY, JSON.stringify([...newNotified]))
    }

    check()
  }, [month, year])
}
