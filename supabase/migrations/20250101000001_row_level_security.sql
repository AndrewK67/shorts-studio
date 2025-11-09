-- =====================================================
-- Shorts Studio - Row Level Security Policies
-- =====================================================
-- Ensures users can only access their own data

-- =====================================================
-- ENABLE RLS ON ALL TABLES
-- =====================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE regional_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE scripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE batch_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE series ENABLE ROW LEVEL SECURITY;
ALTER TABLE series_episodes ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- HELPER FUNCTION: Get current user's ID from Clerk
-- =====================================================
-- This function extracts the user_id from the JWT token
-- Clerk sets the user_id in the 'sub' claim
CREATE OR REPLACE FUNCTION auth.user_id() RETURNS UUID AS $$
  SELECT
    COALESCE(
      current_setting('request.jwt.claims', true)::json->>'sub',
      (current_setting('request.jwt.claims', true)::json->>'userId')
    )::uuid
$$ LANGUAGE SQL STABLE;

-- =====================================================
-- USERS TABLE POLICIES
-- =====================================================
-- Users can read their own user record
CREATE POLICY "Users can view own user data"
  ON users FOR SELECT
  USING (id = auth.user_id());

-- Users can update their own user record
CREATE POLICY "Users can update own user data"
  ON users FOR UPDATE
  USING (id = auth.user_id())
  WITH CHECK (id = auth.user_id());

-- =====================================================
-- USER PROFILES TABLE POLICIES
-- =====================================================
-- Users can view their own profiles
CREATE POLICY "Users can view own profiles"
  ON user_profiles FOR SELECT
  USING (user_id = auth.user_id());

-- Users can create their own profiles
CREATE POLICY "Users can create own profiles"
  ON user_profiles FOR INSERT
  WITH CHECK (user_id = auth.user_id());

-- Users can update their own profiles
CREATE POLICY "Users can update own profiles"
  ON user_profiles FOR UPDATE
  USING (user_id = auth.user_id())
  WITH CHECK (user_id = auth.user_id());

-- Users can delete their own profiles
CREATE POLICY "Users can delete own profiles"
  ON user_profiles FOR DELETE
  USING (user_id = auth.user_id());

-- =====================================================
-- REGIONAL CONFIGS TABLE POLICIES
-- =====================================================
CREATE POLICY "Users can view own regional configs"
  ON regional_configs FOR SELECT
  USING (user_id = auth.user_id());

CREATE POLICY "Users can create own regional configs"
  ON regional_configs FOR INSERT
  WITH CHECK (user_id = auth.user_id());

CREATE POLICY "Users can update own regional configs"
  ON regional_configs FOR UPDATE
  USING (user_id = auth.user_id())
  WITH CHECK (user_id = auth.user_id());

CREATE POLICY "Users can delete own regional configs"
  ON regional_configs FOR DELETE
  USING (user_id = auth.user_id());

-- =====================================================
-- CUSTOM EVENTS TABLE POLICIES
-- =====================================================
CREATE POLICY "Users can view own custom events"
  ON custom_events FOR SELECT
  USING (user_id = auth.user_id());

CREATE POLICY "Users can create own custom events"
  ON custom_events FOR INSERT
  WITH CHECK (user_id = auth.user_id());

CREATE POLICY "Users can update own custom events"
  ON custom_events FOR UPDATE
  USING (user_id = auth.user_id())
  WITH CHECK (user_id = auth.user_id());

CREATE POLICY "Users can delete own custom events"
  ON custom_events FOR DELETE
  USING (user_id = auth.user_id());

-- =====================================================
-- PROJECTS TABLE POLICIES
-- =====================================================
CREATE POLICY "Users can view own projects"
  ON projects FOR SELECT
  USING (user_id = auth.user_id());

CREATE POLICY "Users can create own projects"
  ON projects FOR INSERT
  WITH CHECK (user_id = auth.user_id());

CREATE POLICY "Users can update own projects"
  ON projects FOR UPDATE
  USING (user_id = auth.user_id())
  WITH CHECK (user_id = auth.user_id());

CREATE POLICY "Users can delete own projects"
  ON projects FOR DELETE
  USING (user_id = auth.user_id());

-- =====================================================
-- TOPICS TABLE POLICIES
-- =====================================================
-- Users can view topics from their projects
CREATE POLICY "Users can view own topics"
  ON topics FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = topics.project_id
      AND projects.user_id = auth.user_id()
    )
  );

-- Users can create topics in their projects
CREATE POLICY "Users can create own topics"
  ON topics FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = topics.project_id
      AND projects.user_id = auth.user_id()
    )
  );

-- Users can update their own topics
CREATE POLICY "Users can update own topics"
  ON topics FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = topics.project_id
      AND projects.user_id = auth.user_id()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = topics.project_id
      AND projects.user_id = auth.user_id()
    )
  );

-- Users can delete their own topics
CREATE POLICY "Users can delete own topics"
  ON topics FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = topics.project_id
      AND projects.user_id = auth.user_id()
    )
  );

-- =====================================================
-- SCRIPTS TABLE POLICIES
-- =====================================================
CREATE POLICY "Users can view own scripts"
  ON scripts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = scripts.project_id
      AND projects.user_id = auth.user_id()
    )
  );

CREATE POLICY "Users can create own scripts"
  ON scripts FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = scripts.project_id
      AND projects.user_id = auth.user_id()
    )
  );

CREATE POLICY "Users can update own scripts"
  ON scripts FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = scripts.project_id
      AND projects.user_id = auth.user_id()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = scripts.project_id
      AND projects.user_id = auth.user_id()
    )
  );

CREATE POLICY "Users can delete own scripts"
  ON scripts FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = scripts.project_id
      AND projects.user_id = auth.user_id()
    )
  );

-- =====================================================
-- BATCH PLANS TABLE POLICIES
-- =====================================================
CREATE POLICY "Users can view own batch plans"
  ON batch_plans FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = batch_plans.project_id
      AND projects.user_id = auth.user_id()
    )
  );

CREATE POLICY "Users can create own batch plans"
  ON batch_plans FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = batch_plans.project_id
      AND projects.user_id = auth.user_id()
    )
  );

CREATE POLICY "Users can update own batch plans"
  ON batch_plans FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = batch_plans.project_id
      AND projects.user_id = auth.user_id()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = batch_plans.project_id
      AND projects.user_id = auth.user_id()
    )
  );

CREATE POLICY "Users can delete own batch plans"
  ON batch_plans FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = batch_plans.project_id
      AND projects.user_id = auth.user_id()
    )
  );

-- =====================================================
-- SERIES TABLE POLICIES
-- =====================================================
CREATE POLICY "Users can view own series"
  ON series FOR SELECT
  USING (user_id = auth.user_id());

CREATE POLICY "Users can create own series"
  ON series FOR INSERT
  WITH CHECK (user_id = auth.user_id());

CREATE POLICY "Users can update own series"
  ON series FOR UPDATE
  USING (user_id = auth.user_id())
  WITH CHECK (user_id = auth.user_id());

CREATE POLICY "Users can delete own series"
  ON series FOR DELETE
  USING (user_id = auth.user_id());

-- =====================================================
-- SERIES EPISODES TABLE POLICIES
-- =====================================================
CREATE POLICY "Users can view own series episodes"
  ON series_episodes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM series
      WHERE series.id = series_episodes.series_id
      AND series.user_id = auth.user_id()
    )
  );

CREATE POLICY "Users can create own series episodes"
  ON series_episodes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM series
      WHERE series.id = series_episodes.series_id
      AND series.user_id = auth.user_id()
    )
  );

CREATE POLICY "Users can update own series episodes"
  ON series_episodes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM series
      WHERE series.id = series_episodes.series_id
      AND series.user_id = auth.user_id()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM series
      WHERE series.id = series_episodes.series_id
      AND series.user_id = auth.user_id()
    )
  );

CREATE POLICY "Users can delete own series episodes"
  ON series_episodes FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM series
      WHERE series.id = series_episodes.series_id
      AND series.user_id = auth.user_id()
    )
  );

-- =====================================================
-- GRANT USAGE ON SCHEMA
-- =====================================================
-- Allow authenticated users to use the public schema
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON POLICY "Users can view own user data" ON users IS
  'Users can only view their own user record';

COMMENT ON FUNCTION auth.user_id() IS
  'Extracts the current user ID from Clerk JWT token';
