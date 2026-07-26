'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/dashboard',  icon: '🏠', label: 'Home'      },
  { href: '/goals',      icon: '🎯', label: 'Goals'     },
  { href: '/projects',   icon: '📋', label: 'Projects'  },
  { href: '/priorities', icon: '⚡', label: 'Priorities'},
  { href: '/onboarding', icon: '✨', label: 'Discovery' },
]

export default function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden flex border-t border-slate-200 bg-white">
      {NAV.map(item => {
        const active = pathname === item.href
        return (
          <Link key={item.href} href={item.href}
            className={`flex-1 flex flex-col items-center py-3 text-xs font-medium transition-colors ${
              active ? 'text-primary-600' : 'text-slate-400'
            }`}>
            <span className="text-xl mb-0.5">{item.icon}</span>
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
