import React from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@clerk/nextjs'

export interface User {
  id: string
  clerk_user_id: string
  email: string
  name: string | null
  created_at: string
  updated_at: string
}

/**
 * Get the current user's database record from their Clerk ID
 */
export async function getCurrentUser(clerkUserId: string): Promise<User | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('clerk_user_id', clerkUserId)
    .single()

  if (error) {
    // User might not exist yet if webhook hasn't fired
    if (error.code === 'PGRST116') {
      return null
    }
    console.error('Error fetching user:', error)
    return null
  }

  return data
}

/**
 * Create a user record (usually done by webhook, but available as fallback)
 */
export async function createUser(
  clerkUserId: string,
  email: string,
  name?: string
): Promise<User> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('users')
    .insert({
      clerk_user_id: clerkUserId,
      email,
      name: name || null,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating user:', error)
    throw error
  }

  return data
}

/**
 * Hook to get current user's database ID
 * Returns null if user doesn't exist in database yet
 */
export function useCurrentUser() {
  const { userId: clerkUserId } = useAuth()
  const [user, setUser] = React.useState<User | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function fetchUser() {
      if (!clerkUserId) {
        setUser(null)
        setLoading(false)
        return
      }

      try {
        const userData = await getCurrentUser(clerkUserId)
        setUser(userData)
      } catch (error) {
        console.error('Error fetching user:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [clerkUserId])

  return { user, loading, clerkUserId }
}
