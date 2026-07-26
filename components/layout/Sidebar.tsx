'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { Profile } from '@/types'

const NAV = [
  { href: '/dashboard',   icon: '🏠', label: 'Dashboard'     },
  { href: '/goals',       icon: '🎯', label: 'Life Goals'    },
  { href: '/projects',    icon: '📋', label: 'Projects'      },
  { href: '/priorities',  icon: '⚡', label: 'Top Priorities'},
  { href: '/onboarding',  icon: '✨', label: 'Discovery'     },
]

export default function Sidebar({ profile }: { profile: Profile | null }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-100">
        <span className="text-xl font-bold text-slate-900">🧭 Life Planner</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}>
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-slate-100">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm">
            {profile?.full_name?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">{profile?.full_name ?? 'You'}</p>
          </div>
        </div>
        <button onClick={signOut} className="w-full text-left px-3 py-2 text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors mt-1">
          Sign out
        </button>
      </div>
    </aside>
  )
}
