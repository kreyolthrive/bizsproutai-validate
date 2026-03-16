-- ============================================================
-- BizSproutAI — Recommended Row Level Security (RLS) Policies
-- ============================================================
-- Current state: All DB access uses the service_role key
-- (server-side only, never exposed to clients).
--
-- These policies add defense-in-depth so that even if the
-- service_role key were leaked, damage would be limited.
--
-- Run this against your Supabase project:
--   psql $DATABASE_URL -f supabase/rls-policies.sql
-- ============================================================

-- 1. Enable RLS on all tables (idempotent)
ALTER TABLE IF EXISTS validation_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS business_validation_runs ENABLE ROW LEVEL SECURITY;

-- 2. Force RLS even for table owners (prevents bypass by default)
ALTER TABLE IF EXISTS validation_leads FORCE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS business_validation_runs FORCE ROW LEVEL SECURITY;

-- 3. Service role can do everything (this is the key our server uses)
-- These policies use the built-in `auth.role()` function.

-- validation_leads
CREATE POLICY IF NOT EXISTS "service_role_full_access_leads"
  ON validation_leads
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- business_validation_runs
CREATE POLICY IF NOT EXISTS "service_role_full_access_runs"
  ON business_validation_runs
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- 4. Deny anon and authenticated roles by default (no policies = deny)
-- The absence of policies for 'anon' and 'authenticated' roles means
-- they cannot read, insert, update, or delete any rows.

-- 5. Performance indexes for RLS and common query patterns
--    Apply these BEFORE load testing to prevent sequential scans.

CREATE INDEX IF NOT EXISTS idx_validation_leads_email
  ON validation_leads (email);

CREATE INDEX IF NOT EXISTS idx_validation_leads_created_at
  ON validation_leads (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_validation_leads_decision
  ON validation_leads (decision);

CREATE INDEX IF NOT EXISTS idx_validation_leads_language
  ON validation_leads (language);

CREATE INDEX IF NOT EXISTS idx_validation_leads_source
  ON validation_leads (source);

CREATE INDEX IF NOT EXISTS idx_validation_leads_admin_filter
  ON validation_leads (decision, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_validation_runs_email
  ON business_validation_runs (email);

CREATE INDEX IF NOT EXISTS idx_validation_runs_created_at
  ON business_validation_runs (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_validation_runs_locale
  ON business_validation_runs (locale);

CREATE INDEX IF NOT EXISTS idx_validation_runs_request_id
  ON business_validation_runs (request_id);

-- 6. If you later add a user portal, add scoped policies like:
--
-- CREATE POLICY "users_read_own_leads"
--   ON validation_leads
--   FOR SELECT
--   USING (auth.uid()::text = user_id);
--
-- CREATE POLICY "users_read_own_runs"
--   ON business_validation_runs
--   FOR SELECT
--   USING (auth.uid()::text = user_id);
