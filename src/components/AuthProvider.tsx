'use client'

import { createContext, useContext } from 'react'
import { useAuth, Profile } from '@/hooks/useAuth'
import { LoginScreen } from '@/components/auth/LoginScreen'

interface AuthContextValue {
  activeProfile: Profile | null
  logout: () => void
}

const AuthContext = createContext<AuthContextValue>({
  activeProfile: null,
  logout: () => {},
})

export function useAuthContext() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const {
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
  } = useAuth()

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (status !== 'authenticated') {
    return (
      <LoginScreen
        status={status}
        selectedProfile={selectedProfile}
        hasWebAuthnCred={hasWebAuthnCred}
        webAuthnSupported={webAuthnSupported}
        onSelectProfile={selectProfile}
        onSetupPin={setupPin}
        onLoginWithPin={loginWithPin}
        onLoginWithBiometric={loginWithBiometric}
        onSetupBiometric={setupBiometric}
        onSkipBiometric={skipBiometric}
        onBack={backToProfiles}
      />
    )
  }

  return (
    <AuthContext.Provider value={{ activeProfile, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
