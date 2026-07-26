import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function GoalsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: domains } = await supabase
    .from('life_domains')
    .select('*, life_goals(*)')
    .eq('user_id', user.id)
    .eq('is_visible', true)
    .order('sort_order')

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">🎯 Life Goals</h1>
          <p className="text-slate-500 text-sm mt-1">Your goals organized by life domain</p>
        </div>
        <Link href="/onboarding" className="btn-primary">
          ✨ Discover more goals
        </Link>
      </div>

      {(domains ?? []).every((d: any) => !d.life_goals?.length) ? (
        <div className="card p-12 text-center">
          <p className="text-5xl mb-4">🎯</p>
          <h3 className="font-semibold text-slate-900 mb-2">No goals yet</h3>
          <p className="text-slate-500 text-sm mb-6">Use the AI-guided discovery to uncover your true life goals.</p>
          <Link href="/onboarding" className="btn-primary">Start goal discovery ✨</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(domains ?? []).map((domain: any) => {
            const goals = domain.life_goals ?? []
            if (!goals.length) return null
            return (
              <div key={domain.id} className="card p-5">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">{domain.icon}</span>
                  <div>
                    <h3 className="font-semibold text-slate-900">{domain.name}</h3>
                    <p className="text-xs text-slate-400">{goals.length} goal{goals.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {goals.map((goal: any) => (
                    <div key={goal.id} className="border border-slate-100 rounded-lg p-3">
                      <p className="font-medium text-slate-900 text-sm">{goal.title}</p>
                      {goal.why && (
                        <p className="text-xs text-slate-500 mt-1 italic">"{goal.why}"</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-slate-400">{goal.time_horizon}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          goal.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'
                        }`}>{goal.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
