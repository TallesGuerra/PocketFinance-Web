export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          name: string
          icon: string
          color: string
          type: 'income' | 'expense' | 'both'
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          icon?: string
          color?: string
          type?: 'income' | 'expense' | 'both'
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          icon?: string
          color?: string
          type?: 'income' | 'expense' | 'both'
          created_at?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          id: string
          description: string
          amount: number
          type: 'income' | 'expense'
          category_id: string | null
          date: string
          notes: string | null
          is_installment: boolean | null
          installment_end_date: string | null
          installment_amount: number | null
          paid: boolean | null
          paid_date: string | null
          created_at: string
        }
        Insert: {
          id?: string
          description: string
          amount: number
          type: 'income' | 'expense'
          category_id?: string | null
          date?: string
          notes?: string | null
          is_installment?: boolean | null
          installment_end_date?: string | null
          installment_amount?: number | null
          paid?: boolean | null
          paid_date?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          description?: string
          amount?: number
          type?: 'income' | 'expense'
          category_id?: string | null
          date?: string
          notes?: string | null
          is_installment?: boolean | null
          installment_end_date?: string | null
          installment_amount?: number | null
          paid?: boolean | null
          paid_date?: string | null
          created_at?: string
        }
        Relationships: []
      }
      recurring_transactions: {
        Row: {
          id: string
          description: string
          amount: number
          type: 'income' | 'expense'
          category_id: string | null
          recurrence: 'monthly' | 'weekly' | 'yearly'
          day_of_month: number
          notes: string | null
          active: boolean
          last_generated_month: number | null
          last_generated_year: number | null
          created_at: string
        }
        Insert: {
          id?: string
          description: string
          amount: number
          type: 'income' | 'expense'
          category_id?: string | null
          recurrence?: 'monthly' | 'weekly' | 'yearly'
          day_of_month?: number
          notes?: string | null
          active?: boolean
          last_generated_month?: number | null
          last_generated_year?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          description?: string
          amount?: number
          type?: 'income' | 'expense'
          category_id?: string | null
          recurrence?: 'monthly' | 'weekly' | 'yearly'
          day_of_month?: number
          notes?: string | null
          active?: boolean
          last_generated_month?: number | null
          last_generated_year?: number | null
          created_at?: string
        }
        Relationships: []
      }
      budgets: {
        Row: {
          id: string
          category_id: string
          amount: number
          month: number
          year: number
          created_at: string
        }
        Insert: {
          id?: string
          category_id: string
          amount: number
          month: number
          year: number
          created_at?: string
        }
        Update: {
          id?: string
          category_id?: string
          amount?: number
          month?: number
          year?: number
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
