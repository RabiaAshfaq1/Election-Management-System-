-- VoteFlow — paste into Supabase SQL Editor
-- https://supabase.com/dashboard/project/_/sql

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

CREATE TABLE public.profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email        TEXT NOT NULL UNIQUE,
  name         TEXT NOT NULL,
  phone        TEXT,
  role         TEXT NOT NULL DEFAULT 'voter'
                 CHECK (role IN ('super_admin', 'election_creator', 'voter')),
  is_approved  BOOLEAN NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.election_requests (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id        UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  purpose           TEXT NOT NULL,
  organization      TEXT NOT NULL,
  phone             TEXT,
  email             TEXT,
  status            TEXT NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason  TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.elections (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id              UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  title                   TEXT NOT NULL,
  description             TEXT,
  category                TEXT,
  start_time              TIMESTAMPTZ,
  end_time                TIMESTAMPTZ,
  registration_deadline   TIMESTAMPTZ,
  max_voters              INTEGER NOT NULL CHECK (max_voters > 0),
  status                  TEXT NOT NULL DEFAULT 'draft'
                            CHECK (status IN ('draft', 'published', 'active', 'completed')),
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT elections_end_after_start
    CHECK (start_time IS NULL OR end_time IS NULL OR end_time > start_time)
);

CREATE TABLE public.candidates (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id   UUID NOT NULL REFERENCES public.elections (id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  designation   TEXT,
  manifesto     TEXT,
  photo_url     TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT candidates_id_election_id_key UNIQUE (id, election_id)
);

CREATE TABLE public.voter_registrations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id   UUID NOT NULL REFERENCES public.elections (id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  secret_id     TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(24), 'hex'),
  has_voted     BOOLEAN NOT NULL DEFAULT FALSE,
  registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (election_id, user_id)
);

CREATE TABLE public.votes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id   UUID NOT NULL REFERENCES public.elections (id) ON DELETE CASCADE,
  candidate_id  UUID NOT NULL,
  voted_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT votes_candidate_belongs_to_election
    FOREIGN KEY (candidate_id, election_id)
    REFERENCES public.candidates (id, election_id)
);

CREATE TABLE public.audit_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES public.profiles (id) ON DELETE SET NULL,
  action      TEXT NOT NULL,
  details     JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------
CREATE INDEX idx_profiles_role ON public.profiles (role);
CREATE INDEX idx_profiles_is_approved ON public.profiles (is_approved);

CREATE INDEX idx_election_requests_creator ON public.election_requests (creator_id);
CREATE INDEX idx_election_requests_status ON public.election_requests (status);

CREATE INDEX idx_elections_creator ON public.elections (creator_id);
CREATE INDEX idx_elections_status ON public.elections (status);
CREATE INDEX idx_elections_start_time ON public.elections (start_time);

CREATE INDEX idx_candidates_election ON public.candidates (election_id);

CREATE INDEX idx_voter_registrations_election ON public.voter_registrations (election_id);
CREATE INDEX idx_voter_registrations_user ON public.voter_registrations (user_id);
CREATE INDEX idx_voter_registrations_secret ON public.voter_registrations (secret_id);

CREATE INDEX idx_votes_election ON public.votes (election_id);
CREATE INDEX idx_votes_candidate ON public.votes (candidate_id);
CREATE INDEX idx_votes_voted_at ON public.votes (voted_at DESC);

CREATE INDEX idx_audit_logs_user ON public.audit_logs (user_id);
CREATE INDEX idx_audit_logs_created ON public.audit_logs (created_at DESC);

-- ---------------------------------------------------------------------------
-- Auth helpers (SECURITY DEFINER)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'super_admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_election_creator()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'election_creator'
  );
$$;

CREATE OR REPLACE FUNCTION public.owns_election(election_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.elections
    WHERE id = election_uuid AND creator_id = auth.uid()
  );
$$;

-- ---------------------------------------------------------------------------
-- Signup trigger: auto-create profile
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, phone, role, is_approved)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(
      NEW.raw_user_meta_data ->> 'name',
      NEW.raw_user_meta_data ->> 'full_name',
      'User'
    ),
    NEW.raw_user_meta_data ->> 'phone',
    'voter',
    FALSE
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Anonymous vote (validates secret_id, active election window)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.cast_vote(
  p_secret_id TEXT,
  p_candidate_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_registration public.voter_registrations%ROWTYPE;
  v_election       public.elections%ROWTYPE;
  v_vote_id        UUID;
BEGIN
  SELECT * INTO v_registration
  FROM public.voter_registrations
  WHERE secret_id = p_secret_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid voting credential';
  END IF;

  IF v_registration.has_voted THEN
    RAISE EXCEPTION 'Already voted in this election';
  END IF;

  SELECT * INTO v_election
  FROM public.elections
  WHERE id = v_registration.election_id;

  IF v_election.status <> 'active' THEN
    RAISE EXCEPTION 'Election is not active';
  END IF;

  IF v_election.start_time IS NOT NULL AND NOW() < v_election.start_time THEN
    RAISE EXCEPTION 'Voting has not started';
  END IF;

  IF v_election.end_time IS NOT NULL AND NOW() > v_election.end_time THEN
    RAISE EXCEPTION 'Voting has ended';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.candidates
    WHERE id = p_candidate_id AND election_id = v_registration.election_id
  ) THEN
    RAISE EXCEPTION 'Candidate does not belong to this election';
  END IF;

  INSERT INTO public.votes (election_id, candidate_id)
  VALUES (v_registration.election_id, p_candidate_id)
  RETURNING id INTO v_vote_id;

  UPDATE public.voter_registrations
  SET has_voted = TRUE
  WHERE id = v_registration.id;

  RETURN v_vote_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.cast_vote(TEXT, UUID) TO authenticated, anon;

-- Aggregate counts only (no individual vote rows exposed)
CREATE OR REPLACE FUNCTION public.get_election_vote_counts(p_election_id UUID)
RETURNS TABLE (candidate_id UUID, vote_count BIGINT)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT v.candidate_id, COUNT(*)::BIGINT AS vote_count
  FROM public.votes v
  WHERE v.election_id = p_election_id
  GROUP BY v.candidate_id;
$$;

GRANT EXECUTE ON FUNCTION public.get_election_vote_counts(UUID) TO authenticated;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.election_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.elections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voter_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- profiles -------------------------------------------------------------------
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "profiles_select_admin"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.is_super_admin());

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid())
    AND is_approved = (SELECT p.is_approved FROM public.profiles p WHERE p.id = auth.uid())
  );

CREATE POLICY "profiles_update_admin"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

-- election_requests ----------------------------------------------------------
CREATE POLICY "election_requests_insert_creator"
  ON public.election_requests FOR INSERT
  TO authenticated
  WITH CHECK (
    creator_id = auth.uid()
    AND public.is_election_creator()
  );

CREATE POLICY "election_requests_select_own"
  ON public.election_requests FOR SELECT
  TO authenticated
  USING (creator_id = auth.uid());

CREATE POLICY "election_requests_select_admin"
  ON public.election_requests FOR SELECT
  TO authenticated
  USING (public.is_super_admin());

CREATE POLICY "election_requests_update_admin"
  ON public.election_requests FOR UPDATE
  TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

-- elections ------------------------------------------------------------------
CREATE POLICY "elections_select_public"
  ON public.elections FOR SELECT
  TO authenticated, anon
  USING (status IN ('published', 'active', 'completed'));

CREATE POLICY "elections_select_own"
  ON public.elections FOR SELECT
  TO authenticated
  USING (creator_id = auth.uid());

CREATE POLICY "elections_select_admin"
  ON public.elections FOR SELECT
  TO authenticated
  USING (public.is_super_admin());

CREATE POLICY "elections_insert_creator"
  ON public.elections FOR INSERT
  TO authenticated
  WITH CHECK (
    creator_id = auth.uid()
    AND public.is_election_creator()
  );

CREATE POLICY "elections_update_own"
  ON public.elections FOR UPDATE
  TO authenticated
  USING (creator_id = auth.uid() AND public.is_election_creator())
  WITH CHECK (creator_id = auth.uid());

CREATE POLICY "elections_delete_own_draft"
  ON public.elections FOR DELETE
  TO authenticated
  USING (creator_id = auth.uid() AND status = 'draft');

CREATE POLICY "elections_all_admin"
  ON public.elections FOR ALL
  TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

-- candidates -----------------------------------------------------------------
CREATE POLICY "candidates_select_public"
  ON public.candidates FOR SELECT
  TO authenticated, anon
  USING (
    EXISTS (
      SELECT 1 FROM public.elections e
      WHERE e.id = election_id
        AND e.status IN ('published', 'active', 'completed')
    )
  );

CREATE POLICY "candidates_select_own_election"
  ON public.candidates FOR SELECT
  TO authenticated
  USING (public.owns_election(election_id));

CREATE POLICY "candidates_insert_own_election"
  ON public.candidates FOR INSERT
  TO authenticated
  WITH CHECK (public.owns_election(election_id));

CREATE POLICY "candidates_update_own_election"
  ON public.candidates FOR UPDATE
  TO authenticated
  USING (public.owns_election(election_id))
  WITH CHECK (public.owns_election(election_id));

CREATE POLICY "candidates_delete_own_election"
  ON public.candidates FOR DELETE
  TO authenticated
  USING (public.owns_election(election_id));

-- voter_registrations --------------------------------------------------------
CREATE POLICY "voter_registrations_select_own"
  ON public.voter_registrations FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "voter_registrations_select_creator"
  ON public.voter_registrations FOR SELECT
  TO authenticated
  USING (public.owns_election(election_id));

CREATE POLICY "voter_registrations_select_admin"
  ON public.voter_registrations FOR SELECT
  TO authenticated
  USING (public.is_super_admin());

CREATE POLICY "voter_registrations_insert_self"
  ON public.voter_registrations FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.elections e
      WHERE e.id = election_id
        AND e.status IN ('published', 'active')
        AND (e.registration_deadline IS NULL OR NOW() <= e.registration_deadline)
        AND (
          SELECT COUNT(*) FROM public.voter_registrations vr
          WHERE vr.election_id = e.id
        ) < e.max_voters
    )
  );

-- votes: no SELECT policies — use get_election_vote_counts() for aggregates.
-- Inserts only via cast_vote() (SECURITY DEFINER).

-- audit_logs -----------------------------------------------------------------
CREATE POLICY "audit_logs_select_admin"
  ON public.audit_logs FOR SELECT
  TO authenticated
  USING (public.is_super_admin());

-- Inserts: service role only (no INSERT policy for authenticated/anon).

-- ---------------------------------------------------------------------------
-- First super admin (run after you sign up)
-- ---------------------------------------------------------------------------
-- UPDATE public.profiles
-- SET role = 'super_admin', is_approved = TRUE
-- WHERE email = 'you@example.com';
