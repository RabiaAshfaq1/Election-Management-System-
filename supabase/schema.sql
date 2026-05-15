-- VoteFlow — run this in the Supabase SQL Editor
-- https://supabase.com/dashboard/project/_/sql

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
CREATE TYPE public.user_role AS ENUM (
  'super_admin',
  'election_creator',
  'voter'
);

CREATE TYPE public.election_request_status AS ENUM (
  'pending',
  'approved',
  'rejected'
);

CREATE TYPE public.election_status AS ENUM (
  'draft',
  'scheduled',
  'active',
  'completed',
  'cancelled'
);

CREATE TYPE public.notification_type AS ENUM (
  'election_request_approved',
  'election_request_rejected',
  'election_started',
  'election_ended',
  'registration_confirmed',
  'vote_confirmed',
  'general'
);

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

CREATE TABLE public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  name        TEXT,
  phone       TEXT,
  role        public.user_role NOT NULL DEFAULT 'voter',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.election_requests (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id        UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  purpose           TEXT NOT NULL,
  organization      TEXT NOT NULL,
  status            public.election_request_status NOT NULL DEFAULT 'pending',
  rejection_reason  TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.elections (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id              UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  title                   TEXT NOT NULL,
  description             TEXT,
  category                TEXT,
  start_time              TIMESTAMPTZ NOT NULL,
  end_time                TIMESTAMPTZ NOT NULL,
  registration_deadline   TIMESTAMPTZ NOT NULL,
  max_voters              INTEGER CHECK (max_voters IS NULL OR max_voters > 0),
  status                  public.election_status NOT NULL DEFAULT 'draft',
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT elections_time_order CHECK (end_time > start_time),
  CONSTRAINT elections_registration_before_start CHECK (registration_deadline <= start_time)
);

CREATE TABLE public.candidates (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id   UUID NOT NULL REFERENCES public.elections (id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  designation   TEXT,
  manifesto     TEXT,
  photo_url     TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.voter_registrations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id   UUID NOT NULL REFERENCES public.elections (id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  secret_id     UUID NOT NULL DEFAULT gen_random_uuid(),
  has_voted     BOOLEAN NOT NULL DEFAULT FALSE,
  registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (election_id, user_id),
  UNIQUE (secret_id)
);

-- Composite unique on candidates so votes cannot cross elections
ALTER TABLE public.candidates
  ADD CONSTRAINT candidates_id_election_id_key UNIQUE (id, election_id);

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
  details     JSONB DEFAULT '{}'::JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  type        public.notification_type NOT NULL DEFAULT 'general',
  message     TEXT NOT NULL,
  sent_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------
CREATE INDEX idx_profiles_role ON public.profiles (role);
CREATE INDEX idx_profiles_email ON public.profiles (email);

CREATE INDEX idx_election_requests_creator ON public.election_requests (creator_id);
CREATE INDEX idx_election_requests_status ON public.election_requests (status);

CREATE INDEX idx_elections_creator ON public.elections (creator_id);
CREATE INDEX idx_elections_status ON public.elections (status);
CREATE INDEX idx_elections_times ON public.elections (start_time, end_time);

CREATE INDEX idx_candidates_election ON public.candidates (election_id);

CREATE INDEX idx_voter_registrations_election ON public.voter_registrations (election_id);
CREATE INDEX idx_voter_registrations_user ON public.voter_registrations (user_id);

CREATE INDEX idx_votes_election ON public.votes (election_id);
CREATE INDEX idx_votes_candidate ON public.votes (candidate_id);

CREATE INDEX idx_audit_logs_user ON public.audit_logs (user_id);
CREATE INDEX idx_audit_logs_created ON public.audit_logs (created_at DESC);

CREATE INDEX idx_notifications_user ON public.notifications (user_id);
CREATE INDEX idx_notifications_sent ON public.notifications (sent_at DESC);

-- ---------------------------------------------------------------------------
-- Helper functions (SECURITY DEFINER for RLS checks)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS public.user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

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

CREATE OR REPLACE FUNCTION public.is_registered_voter(election_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.voter_registrations
    WHERE election_id = election_uuid AND user_id = auth.uid()
  );
$$;

-- ---------------------------------------------------------------------------
-- Auth trigger: auto-create profile on signup
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, phone, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.raw_user_meta_data ->> 'full_name'),
    NEW.raw_user_meta_data ->> 'phone',
    'voter'
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
-- Anonymous voting: cast vote via secret_id (no user_id stored on votes)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.cast_vote(
  p_secret_id UUID,
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

  IF NOW() < v_election.start_time OR NOW() > v_election.end_time THEN
    RAISE EXCEPTION 'Voting is outside the election window';
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

GRANT EXECUTE ON FUNCTION public.cast_vote(UUID, UUID) TO authenticated;

-- ---------------------------------------------------------------------------
-- updated_at helper (optional audit convenience)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.log_audit(
  p_action TEXT,
  p_details JSONB DEFAULT '{}'::JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO public.audit_logs (user_id, action, details)
  VALUES (auth.uid(), p_action, p_details)
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.log_audit(TEXT, JSONB) TO authenticated;

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
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- profiles -------------------------------------------------------------------
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "profiles_select_super_admin"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (public.is_super_admin());

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "profiles_update_super_admin"
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

CREATE POLICY "election_requests_select_super_admin"
  ON public.election_requests FOR SELECT
  TO authenticated
  USING (public.is_super_admin());

CREATE POLICY "election_requests_update_super_admin"
  ON public.election_requests FOR UPDATE
  TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

-- elections ------------------------------------------------------------------
CREATE POLICY "elections_select_public_active"
  ON public.elections FOR SELECT
  TO authenticated
  USING (status IN ('scheduled', 'active', 'completed'));

CREATE POLICY "elections_select_own"
  ON public.elections FOR SELECT
  TO authenticated
  USING (creator_id = auth.uid());

CREATE POLICY "elections_select_super_admin"
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

CREATE POLICY "elections_update_super_admin"
  ON public.elections FOR UPDATE
  TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

CREATE POLICY "elections_delete_own_draft"
  ON public.elections FOR DELETE
  TO authenticated
  USING (creator_id = auth.uid() AND status = 'draft');

-- candidates -----------------------------------------------------------------
CREATE POLICY "candidates_select_registered_or_public"
  ON public.candidates FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.elections e
      WHERE e.id = election_id
        AND (
          e.status IN ('scheduled', 'active', 'completed')
          OR e.creator_id = auth.uid()
          OR public.is_super_admin()
        )
    )
  );

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

CREATE POLICY "voter_registrations_select_election_creator"
  ON public.voter_registrations FOR SELECT
  TO authenticated
  USING (public.owns_election(election_id));

CREATE POLICY "voter_registrations_select_super_admin"
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
        AND e.status IN ('scheduled', 'active')
        AND NOW() <= e.registration_deadline
        AND (
          e.max_voters IS NULL
          OR (
            SELECT COUNT(*) FROM public.voter_registrations vr
            WHERE vr.election_id = e.id
          ) < e.max_voters
        )
    )
  );

-- has_voted is updated only by public.cast_vote() (SECURITY DEFINER).

-- votes (anonymous — no direct client writes; use cast_vote()) ---------------
CREATE POLICY "votes_select_election_creator"
  ON public.votes FOR SELECT
  TO authenticated
  USING (public.owns_election(election_id));

CREATE POLICY "votes_select_super_admin"
  ON public.votes FOR SELECT
  TO authenticated
  USING (public.is_super_admin());

-- No INSERT/UPDATE/DELETE policies for authenticated users on votes.
-- Inserts happen only through public.cast_vote() (SECURITY DEFINER).

-- audit_logs -----------------------------------------------------------------
CREATE POLICY "audit_logs_select_super_admin"
  ON public.audit_logs FOR SELECT
  TO authenticated
  USING (public.is_super_admin());

CREATE POLICY "audit_logs_select_own"
  ON public.audit_logs FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "audit_logs_insert_authenticated"
  ON public.audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

-- notifications --------------------------------------------------------------
CREATE POLICY "notifications_select_own"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "notifications_insert_super_admin"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (public.is_super_admin());

-- Service role bypasses RLS; use from API routes for system notifications.

-- ---------------------------------------------------------------------------
-- Realtime (optional — enable in Supabase dashboard if needed)
-- ---------------------------------------------------------------------------
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.elections;
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.votes;

-- ---------------------------------------------------------------------------
-- Storage buckets (create in Dashboard or via API)
-- ---------------------------------------------------------------------------
-- candidate-photos: public read, creator upload for own elections
