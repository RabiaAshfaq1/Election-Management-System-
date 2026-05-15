-- Enable live results updates via Supabase Realtime (run in SQL Editor)

ALTER PUBLICATION supabase_realtime ADD TABLE public.votes;

-- Allow clients to receive vote change events for active/completed elections
CREATE POLICY "votes_select_public_results"
  ON public.votes FOR SELECT
  TO authenticated, anon
  USING (
    EXISTS (
      SELECT 1 FROM public.elections e
      WHERE e.id = election_id
        AND e.status IN ('active', 'completed')
    )
  );
