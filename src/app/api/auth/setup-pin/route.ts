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
    const { profile, pin, displayName, emoji } = await req.json()
    if (!profile || !['talles', 'nanda'].includes(profile)) {
      return NextResponse.json({ ok: false }, { status: 400 })
    }
    if (typeof pin !== 'string' || !/^\d{4}$/.test(pin)) {
      return NextResponse.json({ ok: false }, { status: 400 })
    }
    const salt = bufToB64(crypto.getRandomValues(new Uint8Array(16)).buffer as ArrayBuffer)
    const pin_hash = await hashPin(pin, salt)
    const supabase = getSupabaseServer()
    const { error } = await supabase.from('profiles').upsert(
      { id: profile, display_name: displayName, avatar_emoji: emoji, pin_hash, pin_salt: salt },
      { onConflict: 'id' }
    )
    if (error) return NextResponse.json({ ok: false, error: 'connection_error' }, { status: 503 })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false, error: 'connection_error' }, { status: 500 })
  }
}
