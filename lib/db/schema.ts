/**
 * Database Schema Definitions
 * TypeScript interfaces matching database tables
 */

export interface User {
  id: string;
  email: string;
  name: string;
  password_hash?: string; // Optional for OAuth users
  avatar_url?: string;
  created_at: Date;
  updated_at: Date;
  last_login?: Date;
  email_verified: boolean;
  oauth_provider?: 'google' | 'github' | null;
  oauth_id?: string;
  subscription_tier?: 'free' | 'pro' | 'enterprise';
  subscription_expires_at?: Date;
}

export interface Profile {
  id: string;
  user_id: string;
  name: string;
  channel_name: string;
  niche: string;
  unique_angle: string;
  country: string;
  city: string;
  primary_tone: string;
  secondary_tone: string;
  accent_tone: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Project {
  id: string;
  profile_id: string;
  user_id: string;
  month: string;
  posts_per_day: number;
  buffer_videos: number;
  production_mode: 'traditional' | 'ai_voice' | 'fully_ai';
  tone_mix: {
    emotional: number;
    calming: number;
    storytelling: number;
    educational: number;
    humor: number;
  };
  total_videos_needed: number;
  status: 'planning' | 'in_progress' | 'filming' | 'editing' | 'completed';
  created_at: Date;
  updated_at: Date;
}

export interface Topic {
  id: string;
  project_id: string;
  user_id: string;
  title: string;
  hook: string;
  core_value: string;
  emotional_driver: string;
  format_type: string;
  tone: string;
  longevity_type: 'evergreen' | 'seasonal' | 'trending';
  target_date_range?: string;
  fact_check_status: 'pending' | 'verified' | 'needs_review';
  created_at: Date;
  updated_at: Date;
}

export interface Script {
  id: string;
  project_id: string;
  topic_id?: string;
  user_id: string;
  title: string;
  content: string;
  hook: string;
  delivery_notes?: string;
  visual_cues?: string;
  reading_time_seconds: number;
  verification_status: 'needs_review' | 'verified' | 'pending';
  fact_check_status: 'pending' | 'verified' | 'needs_review';
  version: number;
  parent_script_id?: string; // For versioning
  created_at: Date;
  updated_at: Date;
}

export interface BatchPlan {
  id: string;
  project_id: string;
  user_id: string;
  filming_date?: Date;
  clusters: {
    cluster_number: number;
    theme: string;
    script_ids: string[];
    outfit: string;
    location: string;
    props: string[];
    lighting_setup: string;
    estimated_time_minutes: number;
  }[];
  total_estimated_time_minutes: number;
  checklist: string[];
  notes?: string;
  status: 'draft' | 'scheduled' | 'completed';
  created_at: Date;
  updated_at: Date;
}

export interface Analytics {
  id: string;
  user_id: string;
  project_id?: string;
  script_id?: string;
  video_id?: string;
  platform: 'youtube' | 'tiktok' | 'instagram';
  views: number;
  likes: number;
  comments: number;
  shares: number;
  watch_time_seconds: number;
  engagement_rate: number;
  created_at: Date;
  updated_at: Date;
}

export interface Video {
  id: string;
  user_id: string;
  project_id: string;
  script_id: string;
  title: string;
  description?: string;
  file_url?: string;
  thumbnail_url?: string;
  duration_seconds: number;
  status: 'draft' | 'ready' | 'published' | 'archived';
  published_at?: Date;
  platform_ids?: {
    youtube?: string;
    tiktok?: string;
    instagram?: string;
  };
  created_at: Date;
  updated_at: Date;
}

// Database table names
export const TABLE_NAMES = {
  USERS: 'users',
  PROFILES: 'profiles',
  PROJECTS: 'projects',
  TOPICS: 'topics',
  SCRIPTS: 'scripts',
  BATCH_PLANS: 'batch_plans',
  ANALYTICS: 'analytics',
  VIDEOS: 'videos',
} as const;
