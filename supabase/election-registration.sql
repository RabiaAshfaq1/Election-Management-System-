-- Run in Supabase SQL Editor after schema.sql

ALTER TABLE public.elections
  ADD COLUMN IF NOT EXISTS registrations_locked BOOLEAN NOT NULL DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS public.election_waitlist (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id   UUID NOT NULL REFERENCES public.elections (id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (election_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_election_waitlist_election
  ON public.election_waitlist (election_id);

ALTER TABLE public.election_waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "election_waitlist_select_own"
  ON public.election_waitlist FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "election_waitlist_insert_self"
  ON public.election_waitlist FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());
