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

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_budgets_month_year ON budgets(month, year);

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
