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
  const { status, supported, setup, login, logout, resetAuth } = useAuth()

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
        supported={supported}
        onSetup={setup}
        onLogin={login}
      />
    )
  }

  return (
    <AuthContext.Provider value={{ logout, resetAuth }}>
      {children}
    </AuthContext.Provider>
  )
}
