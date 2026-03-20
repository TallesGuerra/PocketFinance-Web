'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ArrowLeftRight, Tag, Target } from 'lucide-react'

const links = [
  { href: '/', label: 'Início', icon: LayoutDashboard },
  { href: '/transacoes', label: 'Transações', icon: ArrowLeftRight },
  { href: '/orcamentos', label: 'Orçamentos', icon: Target },
  { href: '/categorias', label: 'Categorias', icon: Tag },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 pb-safe z-40">
      <div className="flex max-w-md mx-auto">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center py-3 gap-1 transition-colors ${
                active ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
