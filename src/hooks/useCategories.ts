'use client'

import { useState, useEffect } from 'react'
import { getSupabase } from '@/lib/supabase'
import { Category, TransactionType } from '@/types'

export function useCategories(type?: TransactionType) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      const supabase = getSupabase()
      let query = supabase.from('categories').select('*').order('name')
      if (type) {
        query = query.or(`type.eq.${type},type.eq.both`)
      }
      const { data } = await query
      setCategories((data as unknown as Category[]) || [])
      setLoading(false)
    }
    fetchCategories()
  }, [type])

  const addCategory = async (category: Omit<Category, 'id' | 'created_at'>) => {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('categories')
      .insert({
        name: category.name,
        icon: category.icon,
        color: category.color,
        type: category.type,
      })
      .select()
      .single()
    if (error) throw error
    const newCat = data as unknown as Category
    setCategories(prev => [...prev, newCat].sort((a, b) => a.name.localeCompare(b.name)))
    return newCat
  }

  const deleteCategory = async (id: string) => {
    const supabase = getSupabase()
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (error) throw error
    setCategories(prev => prev.filter(c => c.id !== id))
  }

  return { categories, loading, addCategory, deleteCategory }
}
