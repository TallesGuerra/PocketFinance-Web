'use client'

import { createContext, useContext } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { LoginScreen } from '@/components/auth/LoginScreen'

const AuthContext = createContext<{ logout: () => void; resetAuth: () => void }>({
  logout: () => {},
  resetAuth: () => {},
})

export function useAuthContext() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const {
    status,
    hasBiometric,
    biometricSupported,
    setupPin,
    loginWithPin,
    registerBiometric,
    loginWithBiometric,
    logout,
    resetAuth,
  } = useAuth()

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (status === 'setup' || status === 'login') {
    return (
      <LoginScreen
        mode={status}
        hasBiometric={hasBiometric}
        biometricSupported={biometricSupported}
        onSetupPin={setupPin}
        onLoginWithPin={loginWithPin}
        onRegisterBiometric={registerBiometric}
        onLoginWithBiometric={loginWithBiometric}
      />
    )
  }

  return (
    <AuthContext.Provider value={{ logout, resetAuth }}>
      {children}
    </AuthContext.Provider>
  )
}
