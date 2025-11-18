'use client'

import { createClient } from '@/lib/supabase/client'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function LoginPage() {
  const supabase = createClient()
  const router = useRouter()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          router.push('/dashboard')
        }
        if (event === 'SIGNED_OUT') {
          router.refresh()
        }
      }
    )

    return () => {
      subscription?.unsubscribe()
    }
  }, [supabase, router])

  if (!isMounted) {
    return null
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-900">
          Welcome to Shorts Studio
        </h2>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={['google', 'github']}
          theme="light"
          redirectTo={`${process.env.NEXT_PUBLIC_VERCEL_URL || 'http://localhost:3000'}/auth/callback`}
        />
      </div>
    </div>
  )
}