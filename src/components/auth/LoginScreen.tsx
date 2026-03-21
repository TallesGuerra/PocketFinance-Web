'use client'

import { useState, useCallback } from 'react'
import { Fingerprint, ScanFace, KeyRound, Shield } from 'lucide-react'
import { PinInput } from './PinInput'

interface LoginScreenProps {
  mode: 'setup' | 'login'
  hasBiometric: boolean
  biometricSupported: boolean
  onSetupPin: (pin: string) => Promise<void>
  onLoginWithPin: (pin: string) => Promise<boolean>
  onLoginWithBiometric: () => Promise<boolean>
  onRegisterBiometric: () => Promise<boolean>
}

export function LoginScreen({
  mode,
  hasBiometric,
  biometricSupported,
  onSetupPin,
  onLoginWithPin,
  onLoginWithBiometric,
  onRegisterBiometric,
}: LoginScreenProps) {
  const [step, setStep] = useState<'main' | 'confirm_pin' | 'biometric_offer'>('main')
  const [firstPin, setFirstPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [biometricError, setBiometricError] = useState('')

  const handlePinSetup = useCallback(async (pin: string) => {
    if (step === 'main') {
      setFirstPin(pin)
      setStep('confirm_pin')
      setError('')
    } else if (step === 'confirm_pin') {
      if (pin !== firstPin) {
        setError('PINs não coincidem. Tenta novamente.')
        setStep('main')
        setFirstPin('')
        return
      }
      setLoading(true)
      await onSetupPin(pin)
      if (biometricSupported) {
        setStep('biometric_offer')
      }
      setLoading(false)
    }
  }, [step, firstPin, onSetupPin, biometricSupported])

  const handlePinLogin = useCallback(async (pin: string) => {
    setLoading(true)
    const ok = await onLoginWithPin(pin)
    if (!ok) {
      setError('PIN incorreto. Tenta novamente.')
    }
    setLoading(false)
  }, [onLoginWithPin])

  const handleBiometric = useCallback(async () => {
    setBiometricError('')
    setLoading(true)
    const ok = await onLoginWithBiometric()
    if (!ok) {
      setBiometricError('Falha na autenticação biométrica')
    }
    setLoading(false)
  }, [onLoginWithBiometric])

  const handleRegisterBiometric = useCallback(async () => {
    setLoading(true)
    await onRegisterBiometric()
    setLoading(false)
  }, [onRegisterBiometric])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 px-6">
      {/* Logo */}
      <div className="mb-10 flex flex-col items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/pocketFinance_icon.svg" alt="PocketFinance" className="w-20 h-20 rounded-3xl shadow-2xl" />
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white tracking-tight">PocketFinance</h1>
          <p className="text-slate-400 text-sm mt-1">
            {mode === 'setup'
              ? step === 'confirm_pin'
                ? 'Confirma o teu PIN'
                : 'Define o teu PIN de acesso'
              : 'Introduz o teu PIN'}
          </p>
        </div>
      </div>

      {/* Biometric offer screen (after PIN setup) */}
      {step === 'biometric_offer' ? (
        <div className="flex flex-col items-center gap-6 w-full max-w-xs">
          <div className="w-20 h-20 rounded-3xl bg-emerald-500/20 flex items-center justify-center">
            <ScanFace size={40} className="text-emerald-400" />
          </div>
          <div className="text-center">
            <h2 className="text-white font-semibold text-lg">Ativar Face ID / Biometria</h2>
            <p className="text-slate-400 text-sm mt-1">
              Usa o reconhecimento facial ou impressão digital para acesso rápido
            </p>
          </div>
          <div className="flex flex-col gap-3 w-full">
            <button
              onClick={handleRegisterBiometric}
              disabled={loading}
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-semibold transition-colors disabled:opacity-50"
            >
              {loading ? 'A configurar...' : 'Ativar biometria'}
            </button>
            <button
              onClick={() => setStep('main')}
              className="w-full py-3 text-slate-400 hover:text-slate-300 text-sm transition-colors"
            >
              Ignorar por agora
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Biometric login button */}
          {mode === 'login' && hasBiometric && (
            <div className="mb-8 flex flex-col items-center gap-3">
              <button
                onClick={handleBiometric}
                disabled={loading}
                className="w-20 h-20 rounded-3xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/30 flex items-center justify-center transition-all active:scale-95 disabled:opacity-50"
              >
                <Fingerprint size={36} className="text-emerald-400" />
              </button>
              <p className="text-slate-400 text-xs">
                {loading ? 'A verificar...' : 'Face ID / Impressão digital'}
              </p>
              {biometricError && (
                <p className="text-red-400 text-xs">{biometricError}</p>
              )}
            </div>
          )}

          {/* PIN */}
          <div className="flex flex-col items-center gap-2">
            {mode === 'login' && hasBiometric && (
              <div className="flex items-center gap-2 text-slate-500 text-xs mb-2">
                <div className="h-px w-16 bg-slate-700" />
                <KeyRound size={12} />
                <span>ou usa o PIN</span>
                <div className="h-px w-16 bg-slate-700" />
              </div>
            )}
            <PinInput
              onComplete={mode === 'setup' ? handlePinSetup : handlePinLogin}
              error={error}
              loading={loading}
            />
          </div>
        </>
      )}

      {/* Security note */}
      <div className="mt-10 flex items-center gap-2 text-slate-600 text-xs">
        <Shield size={12} />
        <span>PIN guardado localmente, encriptado</span>
      </div>
    </div>
  )
}
