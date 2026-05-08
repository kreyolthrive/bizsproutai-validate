-- BizSproutAI — waitlist_leads table
-- Run against your Supabase project via the SQL editor or CLI:
--   psql $DATABASE_URL -f supabase/waitlist-leads.sql

CREATE TABLE IF NOT EXISTS public.waitlist_leads (
  id                 uuid         PRIMARY KEY DEFAULT gen_random_uuid(),
  email              text         NOT NULL,
  name               text,
  source             text         NOT NULL DEFAULT 'free_validation_result',
  locale             text,
  validation_lead_id uuid,
  stage              text,
  idea_summary       text,
  created_at         timestamptz  NOT NULL DEFAULT now(),
  updated_at         timestamptz  NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS waitlist_leads_email_idx
  ON public.waitlist_leads (lower(email));

CREATE INDEX IF NOT EXISTS waitlist_leads_created_at_idx
  ON public.waitlist_leads (created_at DESC);

-- Unique by lower-cased email so upserts stay idempotent
CREATE UNIQUE INDEX IF NOT EXISTS waitlist_leads_email_unique_idx
  ON public.waitlist_leads (lower(email));

-- RLS — server uses service_role; no direct client access allowed
ALTER TABLE public.waitlist_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waitlist_leads FORCE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "service_role_full_access_waitlist"
  ON public.waitlist_leads
  FOR ALL
  USING  (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
