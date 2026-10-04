import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const metadata = { title: 'Welcome — My Life Planner' }

export default async function WelcomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, onboarding_completed')
    .eq('user_id', user.id)
    .single()

  // If they've already been through this, send them to the dashboard
  if (profile?.onboarding_completed) redirect('/dashboard')

  const firstName = profile?.full_name?.split(' ')[0] ?? 'there'

  const options = [
    {
      href: '/onboarding',
      icon: '✨',
      title: 'Discover My Life Goals',
      description: 'Have a guided AI conversation to uncover what truly matters to you. The best place to start.',
      badge: 'Recommended',
      badgeColor: 'bg-primary-100 text-primary-700',
    },
    {
      href: '/mission',
      icon: '🧭',
      title: 'Write My Life Mission & Vision',
      description: 'Define your personal mission statement and the vision for your future.',
      badge: null,
      badgeColor: '',
    },
    {
      href: '/projects',
      icon: '📋',
      title: 'Start a New Project',
      description: "Have something specific in mind? Jump straight in and create your first project.",
      badge: null,
      badgeColor: '',
    },
    {
      href: '/dashboard',
      icon: '🏠',
      title: 'Explore the App First',
      description: 'Take a look around and come back to goal-setting when you\'re ready.',
      badge: null,
      badgeColor: '',
    },
  ]

  return (
    <div className="min-h-full flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        {/* Greeting */}
        <div className="text-center mb-10">
          <div className="text-5xl mb-4">🎉</div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Welcome, {firstName}!
          </h1>
          <p className="text-slate-500 text-lg">
            You're all set. Where would you like to begin?
          </p>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {options.map(opt => (
            <Link
              key={opt.href}
              href={opt.href}
              className="flex items-start gap-4 p-5 bg-white border border-slate-200 rounded-xl hover:border-primary-300 hover:shadow-md transition-all group"
            >
              <span className="text-3xl mt-0.5">{opt.icon}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="font-semibold text-slate-900 group-hover:text-primary-700 transition-colors">
                    {opt.title}
                  </h2>
                  {opt.badge && (
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${opt.badgeColor}`}>
                      {opt.badge}
                    </span>
                  )}
                </div>
                <p className="text-sm text-slate-500">{opt.description}</p>
              </div>
              <span className="text-slate-300 group-hover:text-primary-400 transition-colors mt-1">→</span>
            </Link>
          ))}
        </div>

        <p className="text-center text-xs text-slate-400 mt-8">
          You can always change direction — everything here is flexible.
        </p>
      </div>
    </div>
  )
}
