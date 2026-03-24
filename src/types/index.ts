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
  date: string            // data de vencimento for expenses
  notes?: string
  is_installment?: boolean
  installment_end_date?: string | null
  installment_amount?: number | null
  paid?: boolean
  paid_date?: string | null
  created_at: string
  _virtual?: boolean        // not in DB — projected recurring transaction
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
