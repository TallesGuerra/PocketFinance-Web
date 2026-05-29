'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, Delete, Fingerprint } from 'lucide-react'
import { Profile, AuthStatus } from '@/hooks/useAuth'

const PROFILES: Record<Exclude<Profile, 'guest'>, { label: string; emoji: string }> = {
  talles: { label: 'Talles', emoji: '🧑' },
  nanda: { label: 'Nanda', emoji: '👩' },
}

const NUMPAD = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫']

interface LoginScreenProps {
  status: AuthStatus
  selectedProfile: Profile | null
  hasWebAuthnCred: boolean
  webAuthnSupported: boolean
  onSelectProfile: (p: Profile) => void
  onSetupPin: (pin: string) => Promise<boolean>
  onLoginWithPin: (pin: string) => Promise<boolean | 'connection_error'>
  onLoginWithBiometric: () => Promise<boolean>
  onSetupBiometric: () => Promise<boolean>
  onSkipBiometric: () => void
  onBack: () => void
}

function PinDots({ length }: { length: number }) {
  return (
    <div className="flex gap-4 my-3">
      {[0, 1, 2, 3].map(i => (
        <div
          key={i}
          className={`w-3.5 h-3.5 rounded-full transition-all duration-150 ${
            i < length ? 'bg-emerald-400 scale-110' : 'border-2 border-slate-600'
          }`}
        />
      ))}
    </div>
  )
}

function NumPad({ onDigit, onBackspace }: { onDigit: (d: string) => void; onBackspace: () => void }) {
  return (
    <div className="grid grid-cols-3 gap-2 w-full max-w-[252px]">
      {NUMPAD.map((key, idx) => {
        if (key === '') return <div key={idx} />
        if (key === '⌫') return (
          <button
            key={idx}
            onClick={onBackspace}
            className="h-14 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-90 text-white flex items-center justify-center transition-all"
          >
            <Delete size={18} />
          </button>
        )
        return (
          <button
            key={key}
            onClick={() => onDigit(key)}
            className="h-14 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-90 text-white text-lg font-semibold flex items-center justify-center transition-all"
          >
            {key}
          </button>
        )
      })}
    </div>
  )
}

// ── Profile selector ──────────────────────────────────────────────────────────
function ProfileSelector({ onSelect }: { onSelect: (p: Profile) => void }) {
  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-xs">
      <p className="text-slate-400 text-sm">Escolhe o teu perfil para entrar</p>
      <div className="flex gap-4 w-full">
        {(Object.entries(PROFILES) as [Profile, { label: string; emoji: string }][]).map(([id, meta]) => (
          <button
            key={id}
            onClick={() => onSelect(id)}
            className="flex-1 flex flex-col items-center gap-3 py-5 bg-white/10 hover:bg-white/20 active:scale-95 border border-white/10 rounded-3xl transition-all"
          >
            <span className="text-4xl">{meta.emoji}</span>
            <span className="text-white font-semibold">{meta.label}</span>
          </button>
        ))}
      </div>

      <div className="flex flex-col items-center gap-2 w-full">
        <div className="flex items-center gap-3 w-full">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-slate-500 text-xs">ou</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>
        <button
          onClick={() => onSelect('guest')}
          className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 active:scale-95 border border-white/10 rounded-2xl transition-all"
        >
          <span className="text-base">👤</span>
          <span className="text-slate-300 text-sm font-medium">Modo Visitante</span>
          <span className="bg-amber-500/20 text-amber-300 text-xs font-semibold px-2 py-0.5 rounded-full border border-amber-500/30">
            DEMO
          </span>
        </button>
        <p className="text-slate-600 text-xs text-center">Dados fictícios · sem registo necessário</p>
      </div>
    </div>
  )
}

// ── PIN setup (create + confirm) ──────────────────────────────────────────────
function SetupPin({
  profile,
  onSubmit,
}: {
  profile: Exclude<Profile, 'guest'>
  onSubmit: (pin: string) => Promise<boolean>
}) {
  const [phase, setPhase] = useState<'create' | 'confirm'>('create')
  const [firstPin, setFirstPin] = useState('')
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const meta = PROFILES[profile]

  const handleDigit = (d: string) => {
    if (pin.length >= 4) return
    const next = pin + d
    setPin(next)
    setError('')
    if (next.length === 4) handleComplete(next)
  }

  const handleComplete = async (value: string) => {
    if (phase === 'create') {
      setFirstPin(value)
      setPhase('confirm')
      setPin('')
      return
    }
    if (value !== firstPin) {
      setError('PINs não coincidem. Tenta de novo.')
      setPhase('create')
      setFirstPin('')
      setPin('')
      return
    }
    setLoading(true)
    const ok = await onSubmit(value)
    if (!ok) {
      setError('Erro ao guardar PIN. Tenta novamente.')
      setLoading(false)
      setPin('')
    }
  }

  return (
    <div className="flex flex-col items-center gap-1 w-full max-w-xs">
      <span className="text-3xl">{meta.emoji}</span>
      <p className="text-white font-semibold">{meta.label}</p>
      <p className="text-slate-400 text-sm text-center mt-1">
        {phase === 'create' ? 'Escolhe 4 dígitos' : 'Repete o PIN para confirmar'}
      </p>

      <PinDots length={pin.length} />

      {error && <p className="text-red-400 text-xs text-center mb-1">{error}</p>}

      {loading ? (
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mt-2" />
      ) : (
        <NumPad
          onDigit={handleDigit}
          onBackspace={() => {
            if (phase === 'confirm' && pin.length === 0) {
              setPhase('create'); setPin(''); setFirstPin('')
            } else {
              setPin(p => p.slice(0, -1))
            }
          }}
        />
      )}
    </div>
  )
}

// ── PIN login ─────────────────────────────────────────────────────────────────
function LoginPin({
  profile,
  hasWebAuthnCred,
  onSubmit,
  onBiometric,
}: {
  profile: Exclude<Profile, 'guest'>
  hasWebAuthnCred: boolean
  onSubmit: (pin: string) => Promise<boolean | 'connection_error'>
  onBiometric: () => Promise<boolean>
  onBack: () => void
}) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const meta = PROFILES[profile]

  useEffect(() => {
    if (hasWebAuthnCred) onBiometric()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleDigit = (d: string) => {
    if (pin.length >= 4) return
    const next = pin + d
    setPin(next)
    setError('')
    if (next.length === 4) handleComplete(next)
  }

  const handleComplete = async (value: string) => {
    setLoading(true)
    const result = await onSubmit(value)
    if (result !== true) {
      setError(result === 'connection_error'
        ? 'Sem ligação ao servidor.'
        : 'PIN incorreto. Tenta novamente.')
      setLoading(false)
      setPin('')
    }
  }

  return (
    <div className="flex flex-col items-center gap-1 w-full max-w-xs">
      <span className="text-3xl">{meta.emoji}</span>
      <p className="text-white font-semibold">{meta.label}</p>
      <p className="text-slate-400 text-sm mt-1">Qual é o teu PIN?</p>

      <PinDots length={pin.length} />

      {error && <p className="text-red-400 text-xs text-center mb-1">{error}</p>}

      {loading ? (
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mt-2" />
      ) : (
        <>
          <NumPad onDigit={handleDigit} onBackspace={() => setPin(p => p.slice(0, -1))} />
          {hasWebAuthnCred && (
            <button
              onClick={onBiometric}
              className="mt-3 flex items-center gap-2 text-emerald-400 hover:text-emerald-300 text-sm transition-colors"
            >
              <Fingerprint size={16} /> Usar Face ID
            </button>
          )}
        </>
      )}
    </div>
  )
}

// ── Offer biometric after first PIN login ─────────────────────────────────────
function OfferBiometric({
  profile,
  onSetup,
  onSkip,
}: {
  profile: Exclude<Profile, 'guest'>
  onSetup: () => Promise<boolean>
  onSkip: () => void
}) {
  const [loading, setLoading] = useState(false)
  const meta = PROFILES[profile]

  const handleSetup = async () => {
    setLoading(true)
    const ok = await onSetup()
    if (!ok) setLoading(false)
  }

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-xs text-center">
      <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
        <Fingerprint size={32} className="text-emerald-400" />
      </div>
      <div>
        <h2 className="text-white font-semibold text-lg">Ativar Face ID?</h2>
        <p className="text-slate-400 text-sm mt-1 leading-relaxed">
          Olá {meta.label}! Ativar o Face ID para entrar mais rápido?
        </p>
      </div>
      {loading ? (
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      ) : (
        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={handleSetup}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white rounded-2xl font-semibold transition-all"
          >
            Ativar Face ID
          </button>
          <button
            onClick={onSkip}
            className="w-full py-2.5 text-slate-400 hover:text-slate-300 text-sm transition-colors"
          >
            Agora não
          </button>
        </div>
      )}
    </div>
  )
}

// ── Root component ────────────────────────────────────────────────────────────
export function LoginScreen({
  status,
  selectedProfile,
  hasWebAuthnCred,
  webAuthnSupported,
  onSelectProfile,
  onSetupPin,
  onLoginWithPin,
  onLoginWithBiometric,
  onSetupBiometric,
  onSkipBiometric,
  onBack,
}: LoginScreenProps) {
  const showBack = status !== 'select_profile'

  return (
    <div className="h-dvh flex flex-col overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 px-6">
      {/* Top bar */}
      <div className="flex-none h-12 flex items-center" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        {showBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft size={18} /> Voltar
          </button>
        )}
      </div>

      {/* Logo — compact */}
      <div className="flex-none flex flex-col items-center gap-2 pt-2 pb-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/pocketFinance_icon.svg" alt="PocketFinance" className="w-14 h-14 rounded-2xl shadow-xl" />
        <div className="text-center">
          <h1 className="text-lg font-bold text-white tracking-tight">PocketFinance</h1>
          <p className="text-slate-400 text-xs mt-0.5">Finanças Pessoais</p>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center overflow-hidden">
        {status === 'select_profile' && (
          <ProfileSelector onSelect={onSelectProfile} />
        )}

        {status === 'setup_pin' && selectedProfile && selectedProfile !== 'guest' && (
          <SetupPin profile={selectedProfile} onSubmit={onSetupPin} />
        )}

        {status === 'login' && selectedProfile && selectedProfile !== 'guest' && (
          <LoginPin
            profile={selectedProfile}
            hasWebAuthnCred={hasWebAuthnCred}
            onSubmit={onLoginWithPin}
            onBiometric={onLoginWithBiometric}
            onBack={onBack}
          />
        )}

        {status === 'offer_biometric' && selectedProfile && selectedProfile !== 'guest' && (
          <OfferBiometric
            profile={selectedProfile}
            onSetup={onSetupBiometric}
            onSkip={onSkipBiometric}
          />
        )}

        {status === 'select_profile' && (
          <p className="mt-8 text-slate-700 text-xs">
            {webAuthnSupported ? 'Face ID disponível neste dispositivo' : 'Acesso por PIN'}
          </p>
        )}
      </div>
    </div>
  )
}
