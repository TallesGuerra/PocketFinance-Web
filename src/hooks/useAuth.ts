'use client'

import { useState, useEffect, useCallback } from 'react'

const PIN_KEY = 'pf_pin_hash'
const BIOMETRIC_KEY = 'pf_biometric_id'
const SESSION_KEY = 'pf_session'
const SESSION_DURATION = 8 * 60 * 60 * 1000 // 8 hours

async function hashPin(pin: string): Promise<string> {
  const data = new TextEncoder().encode(pin + 'pocketfinance_salt')
  const hash = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

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

export function useAuth() {
  const [status, setStatus] = useState<'loading' | 'setup' | 'login' | 'authenticated'>('loading')
  const [hasBiometric, setHasBiometric] = useState(false)
  const [biometricSupported, setBiometricSupported] = useState(false)

  useEffect(() => {
    const pinHash = localStorage.getItem(PIN_KEY)
    const biometricId = localStorage.getItem(BIOMETRIC_KEY)
    setHasBiometric(!!biometricId)
    setBiometricSupported(
      typeof window !== 'undefined' &&
      !!window.PublicKeyCredential &&
      typeof navigator.credentials?.create === 'function'
    )

    if (!pinHash) {
      setStatus('setup')
    } else if (isSessionValid()) {
      setStatus('authenticated')
    } else {
      setStatus('login')
    }
  }, [])

  const setupPin = useCallback(async (pin: string) => {
    const hash = await hashPin(pin)
    localStorage.setItem(PIN_KEY, hash)
    startSession()
    setStatus('authenticated')
  }, [])

  const loginWithPin = useCallback(async (pin: string): Promise<boolean> => {
    const stored = localStorage.getItem(PIN_KEY)
    if (!stored) return false
    const hash = await hashPin(pin)
    if (hash === stored) {
      startSession()
      setStatus('authenticated')
      return true
    }
    return false
  }, [])

  const registerBiometric = useCallback(async (): Promise<boolean> => {
    try {
      const challenge = crypto.getRandomValues(new Uint8Array(32))
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: {
            name: 'PocketFinance',
            id: window.location.hostname === 'localhost' ? 'localhost' : window.location.hostname,
          },
          user: {
            id: crypto.getRandomValues(new Uint8Array(16)),
            name: 'pocketfinance_user',
            displayName: 'PocketFinance User',
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

      if (!credential) return false

      const rawId = btoa(String.fromCharCode(...new Uint8Array(credential.rawId)))
      localStorage.setItem(BIOMETRIC_KEY, rawId)
      setHasBiometric(true)
      return true
    } catch {
      return false
    }
  }, [])

  const loginWithBiometric = useCallback(async (): Promise<boolean> => {
    try {
      const storedId = localStorage.getItem(BIOMETRIC_KEY)
      if (!storedId) return false

      const challenge = crypto.getRandomValues(new Uint8Array(32))
      const rawId = Uint8Array.from(atob(storedId), c => c.charCodeAt(0))

      const assertion = await navigator.credentials.get({
        publicKey: {
          challenge,
          allowCredentials: [{ type: 'public-key', id: rawId }],
          userVerification: 'required',
          timeout: 60000,
        },
      })

      if (assertion) {
        startSession()
        setStatus('authenticated')
        return true
      }
      return false
    } catch {
      return false
    }
  }, [])

  const logout = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY)
    setStatus('login')
  }, [])

  const resetAuth = useCallback(() => {
    localStorage.removeItem(PIN_KEY)
    localStorage.removeItem(BIOMETRIC_KEY)
    sessionStorage.removeItem(SESSION_KEY)
    setHasBiometric(false)
    setStatus('setup')
  }, [])

  return {
    status,
    hasBiometric,
    biometricSupported,
    setupPin,
    loginWithPin,
    registerBiometric,
    loginWithBiometric,
    logout,
    resetAuth,
  }
}
