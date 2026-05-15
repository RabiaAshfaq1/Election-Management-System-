-- Run in Supabase SQL Editor (after schema.sql)

CREATE TABLE IF NOT EXISTS public.notifications (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  type          TEXT NOT NULL DEFAULT 'general',
  title         TEXT NOT NULL,
  message       TEXT NOT NULL,
  link          TEXT,
  election_id   UUID REFERENCES public.elections (id) ON DELETE SET NULL,
  read_at       TIMESTAMPTZ,
  sent_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user
  ON public.notifications (user_id);

CREATE INDEX IF NOT EXISTS idx_notifications_sent
  ON public.notifications (sent_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_unread
  ON public.notifications (user_id, read_at)
  WHERE read_at IS NULL;

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notifications_select_own" ON public.notifications;
CREATE POLICY "notifications_select_own"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "notifications_update_own" ON public.notifications;
CREATE POLICY "notifications_update_own"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

ALTER TABLE public.elections
  ADD COLUMN IF NOT EXISTS start_reminder_sent_at TIMESTAMPTZ;

ALTER TABLE public.elections
  ADD COLUMN IF NOT EXISTS end_notification_sent_at TIMESTAMPTZ;
