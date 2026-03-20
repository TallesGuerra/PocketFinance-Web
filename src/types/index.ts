export type TransactionType = 'income' | 'expense'

export interface Category {
  id: string
  name: string
  icon: string
  color: string
  type: TransactionType | 'both'
  created_at: string
}

export interface Transaction {
  id: string
  description: string
  amount: number
  type: TransactionType
  category_id: string
  category?: Category
  date: string
  notes?: string
  created_at: string
}

export interface Budget {
  id: string
  category_id: string
  category?: Category
  amount: number
  month: number
  year: number
  created_at: string
}

export interface MonthlySummary {
  totalIncome: number
  totalExpenses: number
  balance: number
  byCategory: {
    category: Category
    total: number
    budget?: number
    percentage?: number
  }[]
}
