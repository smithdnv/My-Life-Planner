import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) redirect('/dashboard')

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-accent-700 flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4">
        <span className="text-white font-bold text-xl">🧭 My Life Planner</span>
        <div className="flex gap-3">
          <Link href="/login" className="text-white/80 hover:text-white font-medium px-4 py-2 transition-colors">
            Sign in
          </Link>
          <Link href="/signup" className="bg-white text-primary-700 font-medium px-4 py-2 rounded-lg hover:bg-white/90 transition-colors">
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
        <h1 className="text-4xl sm:text-6xl font-bold text-white mb-6 leading-tight">
          Live with purpose.<br />
          <span className="text-primary-200">Plan with clarity.</span>
        </h1>
        <p className="text-xl text-white/80 max-w-2xl mb-10">
          Start with your deepest life goals. Build the projects and tasks that actually move you toward the life you want.
        </p>
        <Link href="/signup" className="bg-white text-primary-700 font-bold px-8 py-4 rounded-xl text-lg hover:bg-white/90 transition-colors shadow-xl">
          Start planning your life →
        </Link>
      </div>

      {/* Feature highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 px-6 pb-16 max-w-4xl mx-auto w-full">
        {[
          { icon: '🎯', title: 'Discover your true goals', desc: 'AI-guided questions uncover what really matters to you.' },
          { icon: '📋', title: 'Organize projects & tasks', desc: 'Nested projects with A–Z priority groups keep you focused.' },
          { icon: '👨‍👩‍👧', title: 'Share with your family', desc: 'Collaborate on shared goals while keeping your private ones private.' },
        ].map(f => (
          <div key={f.title} className="bg-white/10 backdrop-blur rounded-xl p-6 text-white">
            <div className="text-3xl mb-3">{f.icon}</div>
            <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
            <p className="text-white/70 text-sm">{f.desc}</p>
          </div>
        ))}
      </div>
    </main>
  )
}
