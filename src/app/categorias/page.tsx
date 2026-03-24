'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useCategories } from '@/hooks/useCategories'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { EmptyState } from '@/components/ui/EmptyState'
import { TransactionType } from '@/types'

const ICONS = ['🍽️', '🚌', '🏥', '🎉', '📚', '🏠', '👕', '🛒', '💼', '💻', '📈', '🎮', '✈️', '🐾', '💊', '⚽', '🎵', '📦', '🐷', '💰', '🏦', '💳', '🪙', '🛍️', '🎓', '🔧', '🍕', '☕']
const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316', '#84CC16', '#6B7280']

export default function CategoriasPage() {
  const { categories, loading, addCategory, deleteCategory } = useCategories()
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('📦')
  const [color, setColor] = useState('#10B981')
  const [type, setType] = useState<TransactionType | 'both'>('expense')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return setError('Nome é obrigatório')
    setSaving(true)
    setError('')
    try {
      await addCategory({ name: name.trim(), icon, color, type })
      setIsOpen(false)
      setName('')
      setIcon('📦')
      setColor('#10B981')
      setType('expense')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao guardar')
    } finally {
      setSaving(false)
    }
  }

  const incomeCategories = categories.filter(c => c.type === 'income' || c.type === 'both')
  const expenseCategories = categories.filter(c => c.type === 'expense' || c.type === 'both')

  return (
    <div>
      <div className="bg-gradient-to-br from-emerald-600 to-teal-500 px-4 pt-12 pb-6 text-white">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">Categorias</h1>
          <button
            onClick={() => setIsOpen(true)}
            className="bg-white/20 backdrop-blur-sm p-2.5 rounded-xl hover:bg-white/30 transition-colors"
          >
            <Plus size={22} />
          </button>
        </div>
      </div>

      <div className="px-4 py-4 space-y-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <CategoryGroup
              title="Receitas"
              categories={incomeCategories.filter(c => c.type === 'income')}
              onDelete={deleteCategory}
            />
            <CategoryGroup
              title="Despesas"
              categories={expenseCategories.filter(c => c.type === 'expense')}
              onDelete={deleteCategory}
            />
            {categories.filter(c => c.type === 'both').length > 0 && (
              <CategoryGroup
                title="Ambos"
                categories={categories.filter(c => c.type === 'both')}
                onDelete={deleteCategory}
              />
            )}
          </>
        )}
      </div>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Nova Categoria">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tipo</label>
            <div className="flex rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
              {(['income', 'expense', 'both'] as const).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`flex-1 py-2 text-sm font-medium transition-colors ${
                    type === t ? 'bg-emerald-500 text-white' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:bg-slate-800'
                  }`}
                >
                  {t === 'income' ? 'Receita' : t === 'expense' ? 'Despesa' : 'Ambos'}
                </button>
              ))}
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nome</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ex: Alimentação"
              className="w-full border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Icon picker */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Ícone</label>
            <div className="flex flex-wrap gap-2">
              {ICONS.map(i => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIcon(i)}
                  className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${
                    icon === i ? 'bg-emerald-100 ring-2 ring-emerald-500' : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:bg-slate-700'
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          {/* Color picker */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Cor</label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full transition-all ${color === c ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: `${color}20` }}>
              {icon}
            </div>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{name || 'Nome da categoria'}</span>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex gap-3">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={saving}>
              {saving ? 'A guardar...' : 'Criar'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

function CategoryGroup({
  title,
  categories,
  onDelete,
}: {
  title: string
  categories: { id: string; name: string; icon: string; color: string }[]
  onDelete: (id: string) => Promise<void>
}) {
  if (categories.length === 0) return null
  return (
    <div>
      <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">{title}</h2>
      <div className="space-y-2">
        {categories.map(c => (
          <div key={c.id} className="bg-white dark:bg-slate-900 rounded-2xl p-3 flex items-center gap-3 border border-slate-100 dark:border-slate-800">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: `${c.color}20` }}>
              {c.icon}
            </div>
            <span className="flex-1 text-sm font-medium text-slate-900 dark:text-slate-100">{c.name}</span>
            <button
              onClick={() => onDelete(c.id)}
              className="p-2 rounded-xl hover:bg-red-50 transition-colors"
            >
              <Trash2 size={16} className="text-gray-300 hover:text-red-400 transition-colors" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
