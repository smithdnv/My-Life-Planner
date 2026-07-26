import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'
import MobileNav from '@/components/layout/MobileNav'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // Redirect to onboarding if not completed
  // (let the onboarding page itself manage this check)

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar — desktop */}
      <Sidebar profile={profile} />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
        {/* Mobile bottom nav */}
        <MobileNav />
      </div>
    </div>
  )
}
