import { createClient } from '@supabase/supabase-js'

// ============================================
// SUPABASE CLIENT SETUP
// ============================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
}

if (!supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false, // We're not using auth yet
  },
})

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: UserProfile
        Insert: UserProfileInsert
        Update: UserProfileUpdate
      }
      projects: {
        Row: Project
        Insert: ProjectInsert
        Update: ProjectUpdate
      }
      topics: {
        Row: Topic
        Insert: TopicInsert
        Update: TopicUpdate
      }
      scripts: {
        Row: Script
        Insert: ScriptInsert
        Update: ScriptUpdate
      }
      batch_plans: {
        Row: BatchPlan
        Insert: BatchPlanInsert
        Update: BatchPlanUpdate
      }
      custom_events: {
        Row: CustomEvent
        Insert: CustomEventInsert
        Update: CustomEventUpdate
      }
    }
  }
}

export interface UserProfile {
  id: string
  profile_name: string
  name: string
  channel_name: string | null
  niche: string
  unique_angle: string | null
  location: string | null
  country: string | null
  language_variant: string | null
  target_audience: string | null
  primary_tone: string | null
  secondary_tone: string | null
  accent_tone: string | null
  catchphrases: string[]
  wont_cover: string[]
  privacy_limits: string[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface UserProfileInsert {
  id?: string
  profile_name: string
  name: string
  channel_name?: string
  niche: string
  unique_angle?: string
  location?: string
  country?: string
  language_variant?: string
  target_audience?: string
  primary_tone?: string
  secondary_tone?: string
  accent_tone?: string
  catchphrases?: string[]
  wont_cover?: string[]
  privacy_limits?: string[]
  is_active?: boolean
}

export interface UserProfileUpdate {
  profile_name?: string
  name?: string
  channel_name?: string
  niche?: string
  unique_angle?: string
  location?: string
  country?: string
  language_variant?: string
  target_audience?: string
  primary_tone?: string
  secondary_tone?: string
  accent_tone?: string
  catchphrases?: string[]
  wont_cover?: string[]
  privacy_limits?: string[]
  is_active?: boolean
}

export interface Project {
  id: string
  profile_id: string
  name: string
  month: string
  videos_needed: number
  production_mode: 'traditional' | 'ai-voice' | 'fully-ai'
  tone_mix: {
    emotional: number
    calming: number
    storytelling: number
    educational: number
    humor: number
  }
  status: 'planning' | 'filming' | 'editing' | 'publishing' | 'complete'
  created_at: string
  updated_at: string
}

export interface ProjectInsert {
  id?: string
  profile_id: string
  name: string
  month: string
  videos_needed: number
  production_mode?: 'traditional' | 'ai-voice' | 'fully-ai'
  tone_mix: Record<string, number>
  status?: 'planning' | 'filming' | 'editing' | 'publishing' | 'complete'
}

export interface ProjectUpdate {
  name?: string
  month?: string
  videos_needed?: number
  production_mode?: 'traditional' | 'ai-voice' | 'fully-ai'
  tone_mix?: Record<string, number>
  status?: 'planning' | 'filming' | 'editing' | 'publishing' | 'complete'
}

export interface Topic {
  id: string
  project_id: string
  title: string
  hook: string
  core_value: string | null
  emotional_driver: string | null
  format_type: string | null
  tone: string
  longevity: 'evergreen' | 'seasonal' | 'trending' | null
  date_range_start: string | null
  date_range_end: string | null
  fact_check_status: 'verified' | 'needs_review' | 'opinion'
  production_notes: string | null
  order_index: number | null
  created_at: string
  updated_at: string
}

export interface TopicInsert {
  id?: string
  project_id: string
  title: string
  hook: string
  core_value?: string
  emotional_driver?: string
  format_type?: string
  tone: string
  longevity?: 'evergreen' | 'seasonal' | 'trending'
  date_range_start?: string
  date_range_end?: string
  fact_check_status?: 'verified' | 'needs_review' | 'opinion'
  production_notes?: string
  order_index?: number
}

export interface TopicUpdate {
  title?: string
  hook?: string
  core_value?: string
  emotional_driver?: string
  format_type?: string
  tone?: string
  longevity?: 'evergreen' | 'seasonal' | 'trending'
  date_range_start?: string
  date_range_end?: string
  fact_check_status?: 'verified' | 'needs_review' | 'opinion'
  production_notes?: string
  order_index?: number
}

export interface Script {
  id: string
  topic_id: string
  project_id: string
  content: string
  hook: string
  reading_time: number | null
  delivery_notes: any
  visual_cues: any
  fact_check_notes: any
  verification_status: 'verified' | 'needs_review'
  verified_at: string | null
  version: number
  production_mode: string | null
  created_at: string
  updated_at: string
}

export interface ScriptInsert {
  id?: string
  topic_id: string
  project_id: string
  content: string
  hook: string
  reading_time?: number
  delivery_notes?: any
  visual_cues?: any
  fact_check_notes?: any
  verification_status?: 'verified' | 'needs_review'
  verified_at?: string
  version?: number
  production_mode?: string
}

export interface ScriptUpdate {
  content?: string
  hook?: string
  reading_time?: number
  delivery_notes?: any
  visual_cues?: any
  fact_check_notes?: any
  verification_status?: 'verified' | 'needs_review'
  verified_at?: string
  version?: number
  production_mode?: string
}

export interface BatchPlan {
  id: string
  project_id: string
  name: string | null
  filming_date: string | null
  total_videos: number | null
  estimated_hours: number | null
  clusters: any
  timeline: any
  checklist: any
  status: 'planned' | 'in_progress' | 'complete'
  created_at: string
  updated_at: string
}

export interface BatchPlanInsert {
  id?: string
  project_id: string
  name?: string
  filming_date?: string
  total_videos?: number
  estimated_hours?: number
  clusters?: any
  timeline?: any
  checklist?: any
  status?: 'planned' | 'in_progress' | 'complete'
}

export interface BatchPlanUpdate {
  name?: string
  filming_date?: string
  total_videos?: number
  estimated_hours?: number
  clusters?: any
  timeline?: any
  checklist?: any
  status?: 'planned' | 'in_progress' | 'complete'
}

export interface CustomEvent {
  id: string
  profile_id: string
  name: string
  date: string
  event_type: 'personal' | 'business' | 'cultural' | null
  priority: 'critical' | 'important' | 'optional' | null
  notes: string | null
  created_at: string
}

export interface CustomEventInsert {
  id?: string
  profile_id: string
  name: string
  date: string
  event_type?: 'personal' | 'business' | 'cultural'
  priority?: 'critical' | 'important' | 'optional'
  notes?: string
}

export interface CustomEventUpdate {
  name?: string
  date?: string
  event_type?: 'personal' | 'business' | 'cultural'
  priority?: 'critical' | 'important' | 'optional'
  notes?: string
}

// ============================================
// HELPER FUNCTIONS
// ============================================

export async function testConnection() {
  try {
    const { data, error } = await supabase.from('user_profiles').select('count').single()
    if (error) throw error
    console.log('✅ Supabase connection successful')
    return true
  } catch (error) {
    console.error('❌ Supabase connection failed:', error)
    return false
  }
}
