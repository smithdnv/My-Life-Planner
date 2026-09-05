import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Email confirmation flows (signup verify) land on the confirmed page.
      // OAuth and other flows land on the requested next page or dashboard.
      const type = searchParams.get('type')
      if (type === 'signup' || type === 'email_change') {
        return NextResponse.redirect(`${origin}/auth/confirmed`)
      }
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`)
}
