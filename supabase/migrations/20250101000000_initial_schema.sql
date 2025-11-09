-- =====================================================
-- Shorts Studio - Initial Database Schema
-- =====================================================
-- This migration creates all core tables for the application
-- Based on the comprehensive requirements specification

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. USERS TABLE
-- =====================================================
-- Stores core user information synced from Clerk
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_user_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for fast lookups by Clerk ID
CREATE INDEX idx_users_clerk_id ON users(clerk_user_id);

-- =====================================================
-- 2. USER PROFILES TABLE
-- =====================================================
-- Stores user content creator profiles (can have multiple per user)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  profile_name VARCHAR(255) NOT NULL, -- e.g., "Christian Poetry Channel"
  channel_name VARCHAR(255), -- YouTube channel name
  niche TEXT,
  unique_angle TEXT,

  -- Signature Tone (60%, 25%, 15% split)
  primary_tone VARCHAR(100), -- Storytelling, Educational, etc.
  secondary_tone VARCHAR(100), -- Emotional, Calming, etc.
  accent_tone VARCHAR(100), -- Humor, Inspirational, etc.

  -- Voice characteristics
  catchphrases TEXT[], -- Array of signature catchphrases

  -- Content boundaries
  wont_cover TEXT[], -- Topics to avoid
  privacy_limits TEXT[], -- Privacy boundaries
  ethics_agreement BOOLEAN DEFAULT false,

  -- Metadata
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_active ON user_profiles(user_id, is_active);

-- =====================================================
-- 3. REGIONAL CONFIGS TABLE
-- =====================================================
-- Stores location-based configuration for content customization
CREATE TABLE regional_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  profile_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,

  -- Location details
  location VARCHAR(255), -- City
  country VARCHAR(255) NOT NULL,
  country_code VARCHAR(3), -- ISO 3166-1 alpha-3
  hemisphere VARCHAR(20), -- 'Northern' or 'Southern'
  timezone VARCHAR(50), -- IANA timezone

  -- Language and formatting
  language VARCHAR(50), -- 'British English', 'American English'
  date_format VARCHAR(20), -- 'DD/MM/YYYY' or 'MM/DD/YYYY'
  currency_code VARCHAR(3), -- 'GBP', 'USD'
  currency_symbol VARCHAR(5), -- '£', '$'

  -- Comprehensive regional data (stored as JSONB)
  config_data JSONB, -- Holidays, cultural events, seasonal themes, content nuances

  -- Metadata
  is_active BOOLEAN DEFAULT true,
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_regional_configs_user_id ON regional_configs(user_id);
CREATE INDEX idx_regional_configs_profile_id ON regional_configs(profile_id);
CREATE INDEX idx_regional_configs_active ON regional_configs(user_id, is_active);

-- =====================================================
-- 4. CUSTOM EVENTS TABLE
-- =====================================================
-- User-defined personal or business events for content planning
CREATE TABLE custom_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  profile_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,

  -- Event details
  name VARCHAR(255) NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  event_type VARCHAR(50), -- 'personal', 'business', 'product_launch', 'holiday'
  priority VARCHAR(20), -- 'critical', 'important', 'optional'

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_custom_events_user_id ON custom_events(user_id);
CREATE INDEX idx_custom_events_profile_id ON custom_events(profile_id);
CREATE INDEX idx_custom_events_date ON custom_events(event_date);

-- =====================================================
-- 5. PROJECTS TABLE
-- =====================================================
-- Monthly content planning projects
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  profile_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,

  -- Project details
  name VARCHAR(255) NOT NULL,
  month DATE NOT NULL, -- First day of the month
  videos_needed INTEGER NOT NULL DEFAULT 30,

  -- Tone mix (percentages should add up to 100)
  tone_mix JSONB, -- { "emotional": 30, "calming": 20, "storytelling": 20, "educational": 20, "humor": 10 }

  -- Project status
  status VARCHAR(50) DEFAULT 'planning', -- 'planning', 'filming', 'editing', 'publishing', 'complete'

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_profile_id ON projects(profile_id);
CREATE INDEX idx_projects_month ON projects(month);
CREATE INDEX idx_projects_status ON projects(status);

-- =====================================================
-- 6. TOPICS TABLE
-- =====================================================
-- Generated video topic ideas
CREATE TABLE topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,

  -- Topic content
  title VARCHAR(255) NOT NULL,
  hook TEXT, -- 3-second opening line
  core_value TEXT, -- What viewers will learn/feel
  emotional_driver VARCHAR(50), -- 'surprise', 'nostalgia', 'awe', 'curiosity', 'inspiration'
  format_type VARCHAR(50), -- 'story', 'tutorial', 'list', 'challenge', 'myth-busting'
  tone VARCHAR(50), -- 'emotional', 'calming', 'storytelling', 'educational', 'humor'

  -- Scheduling
  longevity VARCHAR(20), -- 'evergreen', 'seasonal', 'trending'
  date_range_start DATE,
  date_range_end DATE,

  -- Fact-checking
  fact_check_status VARCHAR(20) DEFAULT 'needs_review', -- 'verified', 'needs_review', 'opinion'
  fact_check_notes TEXT,
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID REFERENCES users(id),
  review_date DATE, -- Auto-set to 60 days from verified_at

  -- Organization
  order_index INTEGER,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_topics_project_id ON topics(project_id);
CREATE INDEX idx_topics_fact_check_status ON topics(fact_check_status);
CREATE INDEX idx_topics_review_date ON topics(review_date);
CREATE INDEX idx_topics_order ON topics(project_id, order_index);

-- =====================================================
-- 7. SCRIPTS TABLE
-- =====================================================
-- Written scripts for video topics
CREATE TABLE scripts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,

  -- Script content
  content TEXT NOT NULL, -- Full script with delivery notes
  hook TEXT, -- 3-second hook (may differ from topic hook after editing)
  reading_time INTEGER, -- Seconds when read aloud

  -- Delivery guidance
  delivery_notes JSONB, -- { "pacing": "fast", "energy": 8, "pauses": [...], "emphasis": [...] }
  visual_cues JSONB, -- { "gestures": [...], "bRoll": [...], "framing": "...", "lighting": "..." }

  -- Fact-checking
  fact_check_notes JSONB, -- { "claims": [...], "sources": [...], "verifiedAt": "..." }
  verification_status VARCHAR(20) DEFAULT 'pending', -- 'verified', 'needs_review', 'pending'
  verified_at TIMESTAMP WITH TIME ZONE,

  -- Version control
  version INTEGER DEFAULT 1,
  parent_script_id UUID REFERENCES scripts(id), -- For version history

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_scripts_topic_id ON scripts(topic_id);
CREATE INDEX idx_scripts_project_id ON scripts(project_id);
CREATE INDEX idx_scripts_verification_status ON scripts(verification_status);
CREATE INDEX idx_scripts_version ON scripts(topic_id, version);

-- =====================================================
-- 8. BATCH PLANS TABLE
-- =====================================================
-- Production planning for batch filming
CREATE TABLE batch_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,

  -- Plan details
  name VARCHAR(255),
  filming_date DATE,
  estimated_duration_minutes INTEGER,

  -- Production details
  clusters JSONB, -- Array of thematic clusters with production requirements
  /*
  Example cluster structure:
  {
    "clusters": [
      {
        "name": "Motivational Morning",
        "scriptIds": ["uuid1", "uuid2"],
        "outfit": "Casual blue",
        "location": "Home office",
        "lighting": "Natural window light",
        "props": ["Coffee mug", "Plant"],
        "energy": 8,
        "estimatedTime": 45
      }
    ]
  }
  */

  -- Checklist
  checklist JSONB, -- Array of checklist items
  checklist_completed BOOLEAN DEFAULT false,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_batch_plans_project_id ON batch_plans(project_id);
CREATE INDEX idx_batch_plans_filming_date ON batch_plans(filming_date);

-- =====================================================
-- 9. SERIES TABLE
-- =====================================================
-- Recurring content series
CREATE TABLE series (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  profile_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,

  -- Series details
  name VARCHAR(255) NOT NULL,
  description TEXT,
  hook_framework TEXT, -- Template for series hooks
  episode_structure JSONB, -- Standard structure for episodes

  -- Publishing schedule
  frequency VARCHAR(50), -- 'daily', 'weekly', 'biweekly', 'monthly'
  publishing_day VARCHAR(20), -- 'Monday', 'Tuesday', etc.

  -- Status
  is_active BOOLEAN DEFAULT true,

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_series_user_id ON series(user_id);
CREATE INDEX idx_series_profile_id ON series(profile_id);
CREATE INDEX idx_series_active ON series(is_active);

-- =====================================================
-- 10. SERIES EPISODES TABLE
-- =====================================================
-- Individual episodes within a series
CREATE TABLE series_episodes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  series_id UUID REFERENCES series(id) ON DELETE CASCADE NOT NULL,
  topic_id UUID REFERENCES topics(id) ON DELETE SET NULL,
  script_id UUID REFERENCES scripts(id) ON DELETE SET NULL,

  -- Episode details
  episode_number INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  scheduled_date DATE,
  published_date DATE,

  -- Status
  status VARCHAR(50) DEFAULT 'planned', -- 'planned', 'scripted', 'filmed', 'edited', 'published'

  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(series_id, episode_number)
);

CREATE INDEX idx_series_episodes_series_id ON series_episodes(series_id);
CREATE INDEX idx_series_episodes_scheduled_date ON series_episodes(scheduled_date);
CREATE INDEX idx_series_episodes_status ON series_episodes(status);

-- =====================================================
-- UPDATED_AT TRIGGER FUNCTION
-- =====================================================
-- Automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_regional_configs_updated_at BEFORE UPDATE ON regional_configs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_custom_events_updated_at BEFORE UPDATE ON custom_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_topics_updated_at BEFORE UPDATE ON topics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scripts_updated_at BEFORE UPDATE ON scripts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_batch_plans_updated_at BEFORE UPDATE ON batch_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_series_updated_at BEFORE UPDATE ON series
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_series_episodes_updated_at BEFORE UPDATE ON series_episodes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================
COMMENT ON TABLE users IS 'Core user accounts synced from Clerk authentication';
COMMENT ON TABLE user_profiles IS 'Content creator profiles with voice and boundaries';
COMMENT ON TABLE regional_configs IS 'Location-based content customization data';
COMMENT ON TABLE custom_events IS 'User-defined events for content planning';
COMMENT ON TABLE projects IS 'Monthly content planning projects';
COMMENT ON TABLE topics IS 'AI-generated video topic ideas with fact-checking';
COMMENT ON TABLE scripts IS 'Written scripts with delivery notes and verification';
COMMENT ON TABLE batch_plans IS 'Production planning for efficient batch filming';
COMMENT ON TABLE series IS 'Recurring content series with publishing schedules';
COMMENT ON TABLE series_episodes IS 'Individual episodes within a series';
