'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark' | 'system'

const ThemeContext = createContext<{
  theme: Theme
  setTheme: (t: Theme) => void
  isDark: boolean
}>({ theme: 'system', setTheme: () => {}, isDark: false })

export function useTheme() {
  return useContext(ThemeContext)
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system')
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const stored = (localStorage.getItem('theme') as Theme) || 'system'
    setThemeState(stored)
  }, [])

  useEffect(() => {
    const apply = (t: Theme) => {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      const dark = t === 'dark' || (t === 'system' && prefersDark)
      document.documentElement.classList.toggle('dark', dark)
      setIsDark(dark)
    }

    apply(theme)
    localStorage.setItem('theme', theme)

    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      const handler = () => apply('system')
      mq.addEventListener('change', handler)
      return () => mq.removeEventListener('change', handler)
    }
  }, [theme])

  const setTheme = (t: Theme) => setThemeState(t)

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  )
}
