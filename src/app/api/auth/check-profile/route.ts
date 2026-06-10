import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  try {
    const { profile } = await req.json()
    if (!profile || !['talles', 'nanda'].includes(profile)) {
      return NextResponse.json({ hasPin: false }, { status: 400 })
    }
    const supabase = getSupabaseServer()
    const { data } = await supabase
      .from('profiles')
      .select('pin_hash')
      .eq('id', profile)
      .maybeSingle()
    return NextResponse.json({ hasPin: !!data?.pin_hash })
  } catch {
    return NextResponse.json({ hasPin: false }, { status: 500 })
  }
}
