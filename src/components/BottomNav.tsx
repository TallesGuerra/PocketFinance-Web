'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ArrowLeftRight, Wallet, MoreHorizontal, RefreshCcw, Tag, X } from 'lucide-react'

const mainLinks = [
  { href: '/',           label: 'Início',      icon: LayoutDashboard },
  { href: '/transacoes', label: 'Transações',   icon: ArrowLeftRight },
  { href: '/poupanca',   label: 'Poupança',     icon: Wallet },
]

const moreLinks = [
  { href: '/recorrentes', label: 'Recorrentes', icon: RefreshCcw },
  { href: '/categorias',  label: 'Categorias',  icon: Tag },
]

export function BottomNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const isMoreActive = moreLinks.some(l => l.href === pathname)

  return (
    <>
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 pb-safe z-40">
        <div className="flex max-w-md mx-auto">
          {mainLinks.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={`flex-1 flex flex-col items-center py-3 gap-0.5 transition-colors ${
                  active
                    ? 'text-emerald-500'
                    : 'text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400'
                }`}
              >
                <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
                <span className="text-[10px] font-medium">{label}</span>
              </Link>
            )
          })}

          {/* Mais button */}
          <button
            onClick={() => setOpen(true)}
            className={`flex-1 flex flex-col items-center py-3 gap-0.5 transition-colors ${
              isMoreActive
                ? 'text-emerald-500'
                : 'text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400'
            }`}
          >
            <MoreHorizontal size={20} strokeWidth={isMoreActive ? 2.5 : 1.8} />
            <span className="text-[10px] font-medium">Mais</span>
          </button>
        </div>
      </nav>

      {/* Drawer overlay */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 z-50"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div className={`lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-950 rounded-t-2xl border-t border-slate-100 dark:border-slate-800 transition-transform duration-300 ${open ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Mais</span>
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X size={18} className="text-slate-500" />
          </button>
        </div>
        <div className="px-4 pb-safe pb-6 space-y-1">
          {moreLinks.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-colors ${
                  active
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
                <span className="text-sm font-medium">{label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </>
  )
}
