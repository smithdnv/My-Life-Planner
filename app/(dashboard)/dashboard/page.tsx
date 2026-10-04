import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: goals }, { data: tasks }] = await Promise.all([
    supabase.from('profiles').select('*').eq('user_id', user.id).single(),
    supabase.from('life_goals').select('*, life_domains(*)').eq('user_id', user.id).eq('status', 'active').order('sort_order'),
    supabase.from('tasks')
      .select('*, projects(title, user_id)')
      .eq('projects.user_id', user.id)
      .neq('status', 'completed')
      .eq('priority_group', 'A')
      .order('priority_number')
      .limit(10),
  ])

  // New users go to the welcome/choose-your-path screen first
  if (profile && !profile.onboarding_completed) redirect('/welcome')

  const firstName = profile?.full_name?.split(' ')[0] ?? 'there'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">{greeting}, {firstName}! 👋</h1>
        <p className="text-slate-500 mt-1">Here's your life at a glance.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Top Priorities */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">⚡ Today's Top Priorities</h2>
            <Link href="/priorities" className="text-sm text-primary-600 hover:underline">See all</Link>
          </div>
          {tasks && tasks.length > 0 ? (
            <div className="space-y-2">
              {tasks.map((task: any) => (
                <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 group">
                  <button className="w-5 h-5 rounded-full border-2 border-slate-300 hover:border-primary-500 flex-shrink-0 transition-colors" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{task.title}</p>
                    <p className="text-xs text-slate-400">{task.projects?.title}</p>
                  </div>
                  <span className={`priority-badge priority-${task.priority_group}`}>
                    {task.priority_group}{task.priority_number}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-slate-400 text-sm">No A-priority tasks yet.</p>
              <Link href="/projects" className="text-primary-600 text-sm hover:underline mt-1 block">Add a project to get started</Link>
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="card p-6">
          <h2 className="font-semibold text-slate-900 mb-4">🚀 Quick Actions</h2>
          <div className="space-y-2">
            {[
              { href: '/projects', icon: '➕', label: 'New project' },
              { href: '/priorities', icon: '📊', label: 'All priorities' },
              { href: '/onboarding', icon: '✨', label: 'Goal discovery' },
              { href: '/goals', icon: '🗺️', label: 'Manage my goals' },
              { href: '/settings', icon: '⚙️', label: 'Settings' },
            ].map(a => (
              <Link key={a.href} href={a.href}
                className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition-colors">
                <span className="text-lg w-7 text-center">{a.icon}</span>
                <span className="text-sm font-medium text-slate-700">{a.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Life Goals — full width summary */}
      <div className="card p-6 mt-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-semibold text-slate-900 text-lg">🎯 My Life Goals</h2>
            <p className="text-xs text-slate-400 mt-0.5">The things that matter most to you</p>
          </div>
          <div className="flex gap-2">
            <Link href="/onboarding" className="btn-secondary text-sm">✨ Discover more</Link>
            <Link href="/goals" className="btn-primary text-sm">Manage all</Link>
          </div>
        </div>

        {goals && goals.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {goals.map((goal: any) => (
              <div key={goal.id}
                className="bg-slate-50 rounded-xl p-4 border border-slate-100 hover:border-primary-200 hover:shadow-sm transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl">{goal.life_domains?.icon ?? '🎯'}</span>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: goal.life_domains?.color ?? '#0ea5e9' }}>
                    {goal.life_domains?.name ?? 'General'}
                  </span>
                </div>
                <p className="text-sm font-semibold text-slate-900 mb-1">{goal.title}</p>
                {goal.why && (
                  <p className="text-xs text-slate-500 italic line-clamp-2">"{goal.why}"</p>
                )}
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-slate-400 capitalize">{goal.time_horizon}</span>
                  <Link href="/onboarding" className="text-xs text-primary-600 hover:underline">Refine →</Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-slate-400 mb-4">You haven't set any life goals yet.</p>
            <Link href="/onboarding" className="btn-primary">✨ Discover my goals</Link>
          </div>
        )}
      </div>
    </div>
  )
}
