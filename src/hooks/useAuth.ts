'use client'

import { useState, useEffect, useCallback } from 'react'
import { getSupabase } from '@/lib/supabase'

export type Profile = 'talles' | 'nanda' | 'guest'

// Status flow:
// loading → select_profile → setup_pin → authenticated
//                          → login     → authenticated
//                                      → offer_biometric → authenticated
export type AuthStatus =
  | 'loading'
  | 'select_profile'
  | 'setup_pin'
  | 'login'
  | 'offer_biometric'
  | 'authenticated'

const SESSION_KEY = 'pf_session_v2'
const SESSION_DURATION = 8 * 60 * 60 * 1000 // 8h
const CRED_KEY = (p: Profile) => `pf_cred_${p}`

const PROFILE_META: Record<Profile, { label: string; emoji: string }> = {
  talles: { label: 'Talles', emoji: '🧑' },
  nanda: { label: 'Nanda', emoji: '👩' },
  guest: { label: 'Visitante', emoji: '👤' },
}

function getSession(): { profile: Profile; expires: number } | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const s = JSON.parse(raw)
    if (Date.now() > s.expires) return null
    return s
  } catch { return null }
}

function startSession(profile: Profile) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({ profile, expires: Date.now() + SESSION_DURATION }))
}

function bufToB64(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
}

function b64ToBuf(b64: string): ArrayBuffer {
  return Uint8Array.from(atob(b64), c => c.charCodeAt(0)).buffer
}

async function hashPin(pin: string, salt: string): Promise<string> {
  const enc = new TextEncoder()
  const data = enc.encode(pin + salt)
  const hash = await crypto.subtle.digest('SHA-256', data)
  return bufToB64(hash)
}

function isTouchDevice(): boolean {
  return typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0
}

export function useAuth() {
  const [status, setStatus] = useState<AuthStatus>('loading')
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null)
  const [activeProfile, setActiveProfile] = useState<Profile | null>(null)
  const [webAuthnSupported, setWebAuthnSupported] = useState(false)
  const [hasWebAuthnCred, setHasWebAuthnCred] = useState(false)

  useEffect(() => {
    const supported = typeof window !== 'undefined' && !!window.PublicKeyCredential
    setWebAuthnSupported(supported)

    const session = getSession()
    if (session) {
      setActiveProfile(session.profile)
      setStatus('authenticated')
    } else {
      setStatus('select_profile')
    }
  }, [])

  const selectProfile = useCallback(async (profile: Profile) => {
    // Guest: no PIN needed — enter directly
    if (profile === 'guest') {
      startSession('guest')
      setSelectedProfile('guest')
      setActiveProfile('guest')
      setStatus('authenticated')
      return
    }

    setSelectedProfile(profile)
    const credId = localStorage.getItem(CRED_KEY(profile))
    const hasCred = !!(credId && webAuthnSupported && isTouchDevice())
    setHasWebAuthnCred(hasCred)

    try {
      const supabase = getSupabase()
      const { data } = await supabase
        .from('profiles')
        .select('pin_hash')
        .eq('id', profile)
        .maybeSingle()

      setStatus(!data?.pin_hash ? 'setup_pin' : 'login')
    } catch {
      setStatus('login')
    }
  }, [webAuthnSupported])

  // First-time PIN creation
  const setupPin = useCallback(async (pin: string): Promise<boolean> => {
    if (!selectedProfile) return false
    try {
      const salt = bufToB64(crypto.getRandomValues(new Uint8Array(16)).buffer)
      const pin_hash = await hashPin(pin, salt)
      const meta = PROFILE_META[selectedProfile]
      const supabase = getSupabase()
      const { error } = await supabase.from('profiles').upsert(
        { id: selectedProfile, display_name: meta.label, avatar_emoji: meta.emoji, pin_hash, pin_salt: salt },
        { onConflict: 'id' }
      )
      if (error) return false
      startSession(selectedProfile)
      setActiveProfile(selectedProfile)
      setStatus('authenticated')
      return true
    } catch { return false }
  }, [selectedProfile])

  // Login with PIN — on mobile without biometrics set up, offer to register
  const loginWithPin = useCallback(async (pin: string): Promise<boolean> => {
    if (!selectedProfile) return false
    try {
      const supabase = getSupabase()
      const { data } = await supabase
        .from('profiles')
        .select('pin_hash, pin_salt')
        .eq('id', selectedProfile)
        .maybeSingle()
      if (!data?.pin_hash || !data?.pin_salt) return false

      const hash = await hashPin(pin, data.pin_salt)
      if (hash !== data.pin_hash) return false

      startSession(selectedProfile)
      setActiveProfile(selectedProfile)

      // On touch devices without biometric registered, offer to set it up
      const hasCred = !!localStorage.getItem(CRED_KEY(selectedProfile))
      if (isTouchDevice() && webAuthnSupported && !hasCred) {
        setStatus('offer_biometric')
      } else {
        setStatus('authenticated')
      }
      return true
    } catch { return false }
  }, [selectedProfile, webAuthnSupported])

  // Login with Face ID / biometric
  const loginWithBiometric = useCallback(async (): Promise<boolean> => {
    if (!selectedProfile) return false
    try {
      const stored = localStorage.getItem(CRED_KEY(selectedProfile))
      if (!stored) return false
      const challenge = crypto.getRandomValues(new Uint8Array(32))
      const assertion = await navigator.credentials.get({
        publicKey: {
          challenge,
          allowCredentials: [{ type: 'public-key', id: b64ToBuf(stored) }],
          userVerification: 'required',
          timeout: 60000,
        },
      })
      if (!assertion) return false
      startSession(selectedProfile)
      setActiveProfile(selectedProfile)
      setStatus('authenticated')
      return true
    } catch { return false }
  }, [selectedProfile])

  // Register biometric after PIN login (optional, touch devices only)
  const setupBiometric = useCallback(async (): Promise<boolean> => {
    if (!selectedProfile || !webAuthnSupported) return false
    try {
      const meta = PROFILE_META[selectedProfile]
      const challenge = crypto.getRandomValues(new Uint8Array(32))
      const cred = await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: { name: 'PocketFinance', id: window.location.hostname },
          user: {
            id: crypto.getRandomValues(new Uint8Array(16)),
            name: `pocketfinance_${selectedProfile}`,
            displayName: meta.label,
          },
          pubKeyCredParams: [
            { alg: -7, type: 'public-key' },
            { alg: -257, type: 'public-key' },
          ],
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'required',
            residentKey: 'preferred',
          },
          timeout: 60000,
        },
      }) as PublicKeyCredential | null
      if (!cred) return false
      localStorage.setItem(CRED_KEY(selectedProfile), bufToB64(cred.rawId))
      setHasWebAuthnCred(true)
      setStatus('authenticated')
      return true
    } catch { return false }
  }, [selectedProfile, webAuthnSupported])

  const skipBiometric = useCallback(() => {
    setStatus('authenticated')
  }, [])

  const logout = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY)
    setActiveProfile(null)
    setSelectedProfile(null)
    setStatus('select_profile')
  }, [])

  const backToProfiles = useCallback(() => {
    setSelectedProfile(null)
    setStatus('select_profile')
  }, [])

  return {
    status,
    selectedProfile,
    activeProfile,
    webAuthnSupported,
    hasWebAuthnCred,
    selectProfile,
    setupPin,
    loginWithPin,
    loginWithBiometric,
    setupBiometric,
    skipBiometric,
    logout,
    backToProfiles,
  }
}
