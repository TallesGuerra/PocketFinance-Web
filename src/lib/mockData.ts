/**
 * Mock data for the demo/guest profile.
 * All dates are computed relative to today so the demo always looks current.
 */
import { Category, Transaction, Budget, Saving } from '@/types'
import { RecurringTransaction } from '@/hooks/useRecurring'

// ── Helpers ───────────────────────────────────────────────────────────────────

function offsetMonth(offset: number): { year: number; month: number } {
  const d = new Date()
  d.setDate(1)
  d.setMonth(d.getMonth() + offset)
  return { year: d.getFullYear(), month: d.getMonth() + 1 }
}

function dt(year: number, month: number, day: number): string {
  const safe = Math.min(day, new Date(year, month, 0).getDate())
  return `${year}-${String(month).padStart(2, '0')}-${String(safe).padStart(2, '0')}`
}

// ── Categories ────────────────────────────────────────────────────────────────

export const MOCK_CATEGORIES: Category[] = [
  { id: 'mc-1', name: 'Habitação',    icon: '🏠', color: '#3B82F6', type: 'expense', created_at: '2024-01-01' },
  { id: 'mc-2', name: 'Restaurantes', icon: '🍽️', color: '#F59E0B', type: 'expense', created_at: '2024-01-01' },
  { id: 'mc-3', name: 'Supermercado', icon: '🛒', color: '#14B8A6', type: 'expense', created_at: '2024-01-01' },
  { id: 'mc-4', name: 'Carro',        icon: '🚗', color: '#EF4444', type: 'expense', created_at: '2024-01-01' },
  { id: 'mc-5', name: 'Saúde',        icon: '💊', color: '#8B5CF6', type: 'expense', created_at: '2024-01-01' },
  { id: 'mc-6', name: 'Lazer',        icon: '🎉', color: '#EC4899', type: 'expense', created_at: '2024-01-01' },
  { id: 'mc-7', name: 'Salário',      icon: '💼', color: '#10B981', type: 'income',  created_at: '2024-01-01' },
  { id: 'mc-8', name: 'Freelance',    icon: '💻', color: '#6366F1', type: 'income',  created_at: '2024-01-01' },
]

const catById = Object.fromEntries(MOCK_CATEGORIES.map(c => [c.id, c]))

// ── Transactions ──────────────────────────────────────────────────────────────

function makeTx(
  id: string,
  description: string,
  amount: number,
  type: 'income' | 'expense',
  catId: string,
  year: number,
  month: number,
  day: number,
  paid: boolean,
  notes?: string,
): Transaction {
  const date = dt(year, month, day)
  return {
    id,
    description,
    amount,
    type,
    category_id: catId,
    category: catById[catId],
    date,
    notes,
    paid,
    paid_date: paid ? date : null,
    is_installment: false,
    created_at: date,
  }
}

function monthTransactions(offset: number): Transaction[] {
  const { year: y, month: m } = offsetMonth(offset)
  const pfx = `mt${offset}`

  if (offset === 0) {
    return [
      makeTx(`${pfx}-1`,  'Salário',                   1850, 'income',  'mc-7', y, m, 1,  true),
      makeTx(`${pfx}-2`,  'Freelance — Site E-commerce', 400, 'income',  'mc-8', y, m, 14, true),
      makeTx(`${pfx}-3`,  'Renda',                       750, 'expense', 'mc-1', y, m, 1,  true),
      makeTx(`${pfx}-4`,  'Netflix',                      16, 'expense', 'mc-6', y, m, 2,  true),
      makeTx(`${pfx}-5`,  'Spotify',                      10, 'expense', 'mc-6', y, m, 2,  true),
      makeTx(`${pfx}-6`,  'Seguro Automóvel',              45, 'expense', 'mc-4', y, m, 3,  true),
      makeTx(`${pfx}-7`,  'Gasolina — Repsol',             64, 'expense', 'mc-4', y, m, 6,  true),
      makeTx(`${pfx}-8`,  'Continente',                    87, 'expense', 'mc-3', y, m, 8,  true),
      makeTx(`${pfx}-9`,  'Ginásio Holmes Place',          35, 'expense', 'mc-6', y, m, 9,  true),
      makeTx(`${pfx}-10`, 'Farmácia Holon',                32, 'expense', 'mc-5', y, m, 11, true),
      makeTx(`${pfx}-11`, 'Pingo Doce',                    74, 'expense', 'mc-3', y, m, 16, true),
      makeTx(`${pfx}-12`, 'Almoço com colegas',            42, 'expense', 'mc-2', y, m, 19, false, 'Restaurante Tasca do Chico'),
    ]
  }

  if (offset === -1) {
    return [
      makeTx(`${pfx}-1`,  'Salário',                1850, 'income',  'mc-7', y, m, 1,  true),
      makeTx(`${pfx}-2`,  'Renda',                   750, 'expense', 'mc-1', y, m, 1,  true),
      makeTx(`${pfx}-3`,  'Netflix',                  16, 'expense', 'mc-6', y, m, 2,  true),
      makeTx(`${pfx}-4`,  'Spotify',                  10, 'expense', 'mc-6', y, m, 2,  true),
      makeTx(`${pfx}-5`,  'Seguro Automóvel',          45, 'expense', 'mc-4', y, m, 3,  true),
      makeTx(`${pfx}-6`,  'Gasolina — BP',             71, 'expense', 'mc-4', y, m, 7,  true),
      makeTx(`${pfx}-7`,  'Continente',                92, 'expense', 'mc-3', y, m, 9,  true),
      makeTx(`${pfx}-8`,  'Ginásio Holmes Place',      35, 'expense', 'mc-6', y, m, 9,  true),
      makeTx(`${pfx}-9`,  'Farmácia',                  18, 'expense', 'mc-5', y, m, 14, true),
      makeTx(`${pfx}-10`, 'Pingo Doce',                83, 'expense', 'mc-3', y, m, 17, true),
      makeTx(`${pfx}-11`, 'Jantar de Aniversário',     95, 'expense', 'mc-2', y, m, 20, true, 'Restaurante Vista Tejo'),
      makeTx(`${pfx}-12`, 'Manutenção Carro',         120, 'expense', 'mc-4', y, m, 22, true, 'Revisão 20000km'),
    ]
  }

  // offset === -2
  return [
    makeTx(`${pfx}-1`,  'Salário',               1850, 'income',  'mc-7', y, m, 1,  true),
    makeTx(`${pfx}-2`,  'Freelance — App Móvel',  250, 'income',  'mc-8', y, m, 21, true),
    makeTx(`${pfx}-3`,  'Renda',                  750, 'expense', 'mc-1', y, m, 1,  true),
    makeTx(`${pfx}-4`,  'Netflix',                 16, 'expense', 'mc-6', y, m, 2,  true),
    makeTx(`${pfx}-5`,  'Spotify',                 10, 'expense', 'mc-6', y, m, 2,  true),
    makeTx(`${pfx}-6`,  'Seguro Automóvel',         45, 'expense', 'mc-4', y, m, 3,  true),
    makeTx(`${pfx}-7`,  'Gasolina — Galp',          58, 'expense', 'mc-4', y, m, 5,  true),
    makeTx(`${pfx}-8`,  'Continente',              104, 'expense', 'mc-3', y, m, 10, true),
    makeTx(`${pfx}-9`,  'Ginásio Holmes Place',     35, 'expense', 'mc-6', y, m, 9,  true),
    makeTx(`${pfx}-10`, 'Farmácia',                 45, 'expense', 'mc-5', y, m, 12, true),
    makeTx(`${pfx}-11`, 'Consulta Médica',           60, 'expense', 'mc-5', y, m, 16, true, 'Clínica São João'),
    makeTx(`${pfx}-12`, 'Pingo Doce',               78, 'expense', 'mc-3', y, m, 18, true),
    makeTx(`${pfx}-13`, 'Cinema + Jantar',           68, 'expense', 'mc-2', y, m, 24, true),
  ]
}

export const MOCK_TRANSACTIONS: Transaction[] = [
  ...monthTransactions(0),
  ...monthTransactions(-1),
  ...monthTransactions(-2),
]

// ── Budgets ───────────────────────────────────────────────────────────────────

export function getMockBudgets(month: number, year: number): Budget[] {
  return [
    { id: 'mb-1', category_id: 'mc-3', category: catById['mc-3'], amount: 300, month, year, created_at: dt(year, month, 1) },
    { id: 'mb-2', category_id: 'mc-4', category: catById['mc-4'], amount: 200, month, year, created_at: dt(year, month, 1) },
    { id: 'mb-3', category_id: 'mc-6', category: catById['mc-6'], amount: 100, month, year, created_at: dt(year, month, 1) },
    { id: 'mb-4', category_id: 'mc-5', category: catById['mc-5'], amount: 80,  month, year, created_at: dt(year, month, 1) },
    { id: 'mb-5', category_id: 'mc-2', category: catById['mc-2'], amount: 120, month, year, created_at: dt(year, month, 1) },
  ]
}

// ── Recurring ─────────────────────────────────────────────────────────────────

export const MOCK_RECURRING: RecurringTransaction[] = [
  {
    id: 'mr-1', description: 'Renda',            amount: 750, type: 'expense',
    category_id: 'mc-1', category: catById['mc-1'],
    recurrence: 'monthly', day_of_month: 1, active: true,
    start_date: null, end_date: null,
    last_generated_month: null, last_generated_year: null, created_at: '2024-01-01',
  },
  {
    id: 'mr-2', description: 'Netflix',          amount: 16,  type: 'expense',
    category_id: 'mc-6', category: catById['mc-6'],
    recurrence: 'monthly', day_of_month: 2, active: true,
    start_date: null, end_date: null,
    last_generated_month: null, last_generated_year: null, created_at: '2024-01-01',
  },
  {
    id: 'mr-3', description: 'Spotify',          amount: 10,  type: 'expense',
    category_id: 'mc-6', category: catById['mc-6'],
    recurrence: 'monthly', day_of_month: 2, active: true,
    start_date: null, end_date: null,
    last_generated_month: null, last_generated_year: null, created_at: '2024-01-01',
  },
  {
    id: 'mr-4', description: 'Ginásio Holmes Place', amount: 35, type: 'expense',
    category_id: 'mc-6', category: catById['mc-6'],
    recurrence: 'monthly', day_of_month: 9, active: true,
    start_date: null, end_date: null,
    last_generated_month: null, last_generated_year: null, created_at: '2024-01-01',
  },
  {
    id: 'mr-5', description: 'Seguro Automóvel', amount: 45,  type: 'expense',
    category_id: 'mc-4', category: catById['mc-4'],
    recurrence: 'monthly', day_of_month: 3, active: true,
    start_date: null, end_date: null,
    last_generated_month: null, last_generated_year: null, created_at: '2024-01-01',
  },
]

// ── Savings ───────────────────────────────────────────────────────────────────

const { year: sy, month: sm } = offsetMonth(0)

export const MOCK_SAVINGS: Saving[] = [
  {
    id: 'ms-1',
    description: 'Fundo de Emergência',
    amount: 3200,
    currency: 'EUR',
    notes: '6 meses de despesas cobertas',
    date: dt(sy, sm - 6 < 1 ? sm - 6 + 12 : sm - 6, 1),
    created_at: '2024-06-01',
  },
  {
    id: 'ms-2',
    description: 'Poupança Casa',
    amount: 8500,
    currency: 'EUR',
    notes: 'Entrada para apartamento',
    date: dt(sy - 1, sm, 1),
    created_at: '2023-06-01',
  },
  {
    id: 'ms-3',
    description: 'Viagem ao Japão',
    amount: 1200,
    currency: 'EUR',
    notes: 'Verão 2026',
    date: dt(sy, sm > 3 ? sm - 3 : sm - 3 + 12, 1),
    created_at: '2024-09-01',
  },
]
