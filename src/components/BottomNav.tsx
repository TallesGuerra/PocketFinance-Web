'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ArrowLeftRight, RefreshCcw, Wallet, Tag } from 'lucide-react'

const links = [
  { href: '/',            label: 'Início',      icon: LayoutDashboard },
  { href: '/transacoes',  label: 'Transações',  icon: ArrowLeftRight },
  { href: '/recorrentes', label: 'Recorrentes', icon: RefreshCcw },
  { href: '/poupanca',    label: 'Poupança',    icon: Wallet },
  { href: '/categorias',  label: 'Categorias',  icon: Tag },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 pb-safe z-40">
      <div className="flex">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center py-2.5 gap-0.5 transition-colors ${
                active
                  ? 'text-emerald-500'
                  : 'text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400'
              }`}
            >
              <Icon size={18} strokeWidth={active ? 2.5 : 1.8} />
              <span className="text-[9px] font-medium leading-tight">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
