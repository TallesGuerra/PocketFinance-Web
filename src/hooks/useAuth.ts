'use client'

import { useState, useEffect, useCallback } from 'react'

const CREDENTIAL_KEY = 'pf_credential_id'
const SESSION_KEY = 'pf_session'
const SESSION_DURATION = 8 * 60 * 60 * 1000 // 8h

function isSessionValid(): boolean {
  try {
    const expires = sessionStorage.getItem(SESSION_KEY)
    if (!expires) return false
    return Date.now() < Number(expires)
  } catch {
    return false
  }
}

function startSession() {
  sessionStorage.setItem(SESSION_KEY, String(Date.now() + SESSION_DURATION))
}

function bufToB64(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
}

function b64ToBuf(b64: string): ArrayBuffer {
  return Uint8Array.from(atob(b64), c => c.charCodeAt(0)).buffer
}

export function useAuth() {
  const [status, setStatus] = useState<'loading' | 'setup' | 'login' | 'authenticated'>('loading')
  const [supported, setSupported] = useState(false)

  useEffect(() => {
    const isSupported =
      typeof window !== 'undefined' &&
      !!window.PublicKeyCredential &&
      typeof navigator.credentials?.create === 'function'
    setSupported(isSupported)

    const credId = localStorage.getItem(CREDENTIAL_KEY)
    if (!credId) {
      setStatus('setup')
    } else if (isSessionValid()) {
      setStatus('authenticated')
    } else {
      setStatus('login')
    }
  }, [])

  // First-time setup: register device credential (triggers Face ID / device PIN)
  const setup = useCallback(async (): Promise<boolean> => {
    try {
      const challenge = crypto.getRandomValues(new Uint8Array(32))
      const cred = await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: {
            name: 'PocketFinance',
            id: window.location.hostname,
          },
          user: {
            id: crypto.getRandomValues(new Uint8Array(16)),
            name: 'pocketfinance_user',
            displayName: 'Utilizador',
          },
          pubKeyCredParams: [
            { alg: -7, type: 'public-key' },   // ES256
            { alg: -257, type: 'public-key' },  // RS256
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
      localStorage.setItem(CREDENTIAL_KEY, bufToB64(cred.rawId))
      startSession()
      setStatus('authenticated')
      return true
    } catch {
      return false
    }
  }, [])

  // Login: authenticate with stored device credential (Face ID / device PIN)
  const login = useCallback(async (): Promise<boolean> => {
    try {
      const stored = localStorage.getItem(CREDENTIAL_KEY)
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
      startSession()
      setStatus('authenticated')
      return true
    } catch {
      return false
    }
  }, [])

  const logout = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY)
    setStatus('login')
  }, [])

  const resetAuth = useCallback(() => {
    localStorage.removeItem(CREDENTIAL_KEY)
    sessionStorage.removeItem(SESSION_KEY)
    setStatus('setup')
  }, [])

  return { status, supported, setup, login, logout, resetAuth }
}
