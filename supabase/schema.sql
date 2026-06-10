-- Finanças na Mão - Database Schema
-- Run this in Supabase SQL Editor

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '📦',
  color TEXT NOT NULL DEFAULT '#6B7280',
  type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'both')) DEFAULT 'both',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  description TEXT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Budgets table
CREATE TABLE IF NOT EXISTS budgets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  year INTEGER NOT NULL CHECK (year >= 2020),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(category_id, month, year)
);

-- Migration: add installment and paid fields to transactions
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS is_installment BOOLEAN DEFAULT FALSE;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS installment_end_date DATE;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS installment_amount DECIMAL(12, 2);
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS paid BOOLEAN DEFAULT FALSE;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS paid_date DATE;

-- Recurring transactions table
CREATE TABLE IF NOT EXISTS recurring_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  description TEXT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  recurrence TEXT NOT NULL CHECK (recurrence IN ('monthly', 'weekly', 'yearly')) DEFAULT 'monthly',
  day_of_month INTEGER NOT NULL CHECK (day_of_month BETWEEN 1 AND 31) DEFAULT 1,
  notes TEXT,
  active BOOLEAN DEFAULT TRUE,
  last_generated_month INTEGER,
  last_generated_year INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Migration: add start_date and end_date to recurring_transactions
ALTER TABLE recurring_transactions ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE recurring_transactions ADD COLUMN IF NOT EXISTS end_date DATE;

-- Profiles table (named users with PIN auth)
CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY CHECK (id IN ('talles', 'nanda')),
  display_name TEXT NOT NULL,
  avatar_emoji TEXT NOT NULL DEFAULT '👤',
  pin_hash TEXT,
  pin_salt TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO profiles (id, display_name, avatar_emoji) VALUES
  ('talles', 'Talles', '🧑'),
  ('nanda', 'Nanda', '👩')
ON CONFLICT DO NOTHING;

-- Savings table
CREATE TABLE IF NOT EXISTS savings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  description TEXT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'EUR',
  notes TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_budgets_month_year ON budgets(month, year);
CREATE INDEX IF NOT EXISTS idx_savings_date ON savings(date DESC);
CREATE INDEX IF NOT EXISTS idx_savings_currency ON savings(currency);

-- Default categories
INSERT INTO categories (name, icon, color, type) VALUES
  ('Salário', '💼', '#10B981', 'income'),
  ('Freelance', '💻', '#3B82F6', 'income'),
  ('Investimentos', '📈', '#8B5CF6', 'income'),
  ('Alimentação', '🍽️', '#F59E0B', 'expense'),
  ('Transporte', '🚌', '#6B7280', 'expense'),
  ('Saúde', '🏥', '#EF4444', 'expense'),
  ('Lazer', '🎉', '#EC4899', 'expense'),
  ('Educação', '📚', '#14B8A6', 'expense'),
  ('Casa', '🏠', '#F97316', 'expense'),
  ('Roupas', '👕', '#A78BFA', 'expense'),
  ('Supermercado', '🛒', '#84CC16', 'expense'),
  ('Outros', '📦', '#94A3B8', 'both')
ON CONFLICT DO NOTHING;

-- ─── Row Level Security ────────────────────────────────────────────────────────

-- profiles: fully locked — all PIN operations go through server-side API routes
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
-- No policies for anon = zero access from the browser

-- categories: read-only for anon (app reads categories everywhere, but never writes via client)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories_anon_select" ON categories FOR SELECT TO anon USING (true);

-- transactions: anon full access (app writes transactions client-side)
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "transactions_anon_all" ON transactions FOR ALL TO anon USING (true) WITH CHECK (true);

-- savings: anon full access
ALTER TABLE savings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "savings_anon_all" ON savings FOR ALL TO anon USING (true) WITH CHECK (true);

-- budgets: anon full access
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "budgets_anon_all" ON budgets FOR ALL TO anon USING (true) WITH CHECK (true);

-- recurring_transactions: anon full access
ALTER TABLE recurring_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "recurring_anon_all" ON recurring_transactions FOR ALL TO anon USING (true) WITH CHECK (true);
