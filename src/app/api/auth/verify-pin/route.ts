import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabase-server'

function bufToB64(buf: ArrayBuffer): string {
  return Buffer.from(buf).toString('base64')
}

async function hashPin(pin: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(pin + salt)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return bufToB64(hash)
}

export async function POST(req: NextRequest) {
  try {
    const { profile, pin } = await req.json()
    if (!profile || !['talles', 'nanda'].includes(profile)) {
      return NextResponse.json({ ok: false }, { status: 400 })
    }
    if (typeof pin !== 'string' || !/^\d{4}$/.test(pin)) {
      return NextResponse.json({ ok: false }, { status: 400 })
    }
    const supabase = getSupabaseServer()
    const { data, error } = await supabase
      .from('profiles')
      .select('pin_hash, pin_salt')
      .eq('id', profile)
      .maybeSingle()
    if (error) return NextResponse.json({ ok: false, error: 'connection_error' }, { status: 503 })
    if (!data?.pin_hash || !data?.pin_salt) return NextResponse.json({ ok: false }, { status: 404 })
    const hash = await hashPin(pin, data.pin_salt)
    if (hash !== data.pin_hash) return NextResponse.json({ ok: false }, { status: 401 })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false, error: 'connection_error' }, { status: 500 })
  }
}
