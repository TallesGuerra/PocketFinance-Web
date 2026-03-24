'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ArrowLeftRight, RefreshCcw, Wallet, Tag, Sun, Moon, LogOut } from 'lucide-react'
import { useTheme } from '@/components/ThemeProvider'
import { useAuthContext } from '@/components/AuthProvider'

const links = [
  { href: '/', label: 'Início', icon: LayoutDashboard },
  { href: '/transacoes', label: 'Transações', icon: ArrowLeftRight },
  { href: '/recorrentes', label: 'Recorrentes', icon: RefreshCcw },
  { href: '/poupanca', label: 'Poupança', icon: Wallet },
  { href: '/categorias', label: 'Categorias', icon: Tag },
]

export function Sidebar() {
  const pathname = usePathname()
  const { isDark, setTheme } = useTheme()
  const { logout } = useAuthContext()

  return (
    <aside className="hidden lg:flex flex-col w-60 shrink-0 min-h-screen border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 sticky top-0">
      {/* Logo */}
      <div className="px-5 pt-8 pb-6 flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/pocketFinance_icon.svg" alt="PocketFinance" className="w-9 h-9 rounded-xl" />
        <div>
          <p className="font-bold text-slate-900 dark:text-slate-100 text-sm leading-tight">PocketFinance</p>
          <p className="text-xs text-slate-400">Finanças Pessoais</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                active
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Icon size={18} strokeWidth={active ? 2.5 : 1.8} />
              {label}
              {active && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-500" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer actions */}
      <div className="px-3 pb-6 space-y-0.5">
        <button
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
          {isDark ? 'Modo claro' : 'Modo escuro'}
        </button>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition-colors"
        >
          <LogOut size={18} />
          Sair
        </button>
      </div>
    </aside>
  )
}
