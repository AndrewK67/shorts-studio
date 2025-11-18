import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// --- ADD THIS LINE ---
// This tells Vercel to run this route in the Node.js runtime,
// which Supabase needs.
export const runtime = 'nodejs'
// ---------------------

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  // if "next" is in "searchParams", use it as the redirect URL
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Redirect to the dashboard or the intended page
      return NextResponse.redirect(`${origin}/dashboard`)
    }
  }

  // return the user to an error page if the code is invalid
  return NextResponse.redirect(`${origin}/login/error`)
}