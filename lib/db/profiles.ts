import { createClient } from '@/lib/supabase/client'

export interface UserProfile {
  id: string
  user_id: string
  profile_name: string
  channel_name: string | null
  niche: string | null
  unique_angle: string | null
  primary_tone: string | null
  secondary_tone: string | null
  accent_tone: string | null
  catchphrases: string[] | null
  wont_cover: string[] | null
  privacy_limits: string[] | null
  ethics_agreement: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

/**
 * Get all profiles for the current user
 */
export async function getUserProfiles(): Promise<UserProfile[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching user profiles:', error)
    throw error
  }

  return data || []
}

/**
 * Get a specific profile by ID
 */
export async function getProfileById(profileId: string): Promise<UserProfile | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', profileId)
    .single()

  if (error) {
    console.error('Error fetching profile:', error)
    return null
  }

  return data
}

/**
 * Create a new user profile
 */
export async function createUserProfile(
  userId: string,
  profileData: {
    profile_name: string
    channel_name?: string
    niche?: string
    unique_angle?: string
    primary_tone?: string
    secondary_tone?: string
    accent_tone?: string
    catchphrases?: string[]
    wont_cover?: string[]
    privacy_limits?: string[]
    ethics_agreement?: boolean
  }
): Promise<UserProfile> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('user_profiles')
    .insert({
      user_id: userId,
      ...profileData,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating user profile:', error)
    throw error
  }

  return data
}

/**
 * Update a user profile
 */
export async function updateUserProfile(
  profileId: string,
  updates: Partial<Omit<UserProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<UserProfile> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('user_profiles')
    .update(updates)
    .eq('id', profileId)
    .select()
    .single()

  if (error) {
    console.error('Error updating user profile:', error)
    throw error
  }

  return data
}

/**
 * Delete a user profile (soft delete by setting is_active to false)
 */
export async function deleteUserProfile(profileId: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase
    .from('user_profiles')
    .update({ is_active: false })
    .eq('id', profileId)

  if (error) {
    console.error('Error deleting user profile:', error)
    throw error
  }
}

/**
 * Get the active profile (most recently created)
 */
export async function getActiveProfile(): Promise<UserProfile | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    // No active profile found
    if (error.code === 'PGRST116') {
      return null
    }
    console.error('Error fetching active profile:', error)
    return null
  }

  return data
}
