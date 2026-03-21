'use client'

import { useState } from 'react'
import { Fingerprint, Shield, AlertCircle } from 'lucide-react'

interface LoginScreenProps {
  mode: 'setup' | 'login'
  supported: boolean
  onSetup: () => Promise<boolean>
  onLogin: () => Promise<boolean>
}

export function LoginScreen({ mode, supported, onSetup, onLogin }: LoginScreenProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleAuth = async () => {
    setError('')
    setLoading(true)
    const ok = mode === 'setup' ? await onSetup() : await onLogin()
    if (!ok) {
      setError(
        mode === 'setup'
          ? 'Não foi possível configurar a autenticação. Verifica se o teu dispositivo suporta Face ID ou impressão digital.'
          : 'Autenticação falhou. Tenta novamente.'
      )
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 px-6">
      {/* Logo */}
      <div className="mb-12 flex flex-col items-center gap-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/pocketFinance_icon.svg"
          alt="PocketFinance"
          className="w-24 h-24 rounded-3xl shadow-2xl"
        />
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white tracking-tight">PocketFinance</h1>
          <p className="text-slate-400 text-sm mt-1">Finanças Pessoais</p>
        </div>
      </div>

      {/* Auth card */}
      <div className="w-full max-w-xs flex flex-col items-center gap-6">
        {/* Icon */}
        <div className="w-24 h-24 rounded-3xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
          <Fingerprint size={48} className="text-emerald-400" />
        </div>

        {/* Message */}
        <div className="text-center">
          {mode === 'setup' ? (
            <>
              <h2 className="text-white font-semibold text-lg">Configurar acesso</h2>
              <p className="text-slate-400 text-sm mt-2 leading-relaxed">
                Usa o Face ID, impressão digital ou<br />o PIN do teu dispositivo para entrar.
              </p>
            </>
          ) : (
            <>
              <h2 className="text-white font-semibold text-lg">Bem-vindo de volta</h2>
              <p className="text-slate-400 text-sm mt-2">
                Autentica com o teu dispositivo para continuar.
              </p>
            </>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 w-full">
            <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
            <p className="text-red-400 text-xs leading-relaxed">{error}</p>
          </div>
        )}

        {/* Not supported warning */}
        {!supported && (
          <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3 w-full">
            <AlertCircle size={16} className="text-amber-400 mt-0.5 shrink-0" />
            <p className="text-amber-400 text-xs leading-relaxed">
              O teu browser não suporta autenticação biométrica. Usa Safari no iPhone ou Chrome no Android.
            </p>
          </div>
        )}

        {/* Button */}
        <button
          onClick={handleAuth}
          disabled={loading || !supported}
          className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white rounded-2xl font-semibold text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/20"
        >
          {loading
            ? 'A verificar...'
            : mode === 'setup'
            ? 'Configurar Face ID / PIN'
            : 'Entrar com Face ID / PIN'}
        </button>
      </div>

      {/* Footer note */}
      <div className="mt-12 flex items-center gap-2 text-slate-600 text-xs">
        <Shield size={12} />
        <span>Autenticação gerida pelo teu dispositivo</span>
      </div>
    </div>
  )
}
