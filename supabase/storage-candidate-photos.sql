-- Run in Supabase SQL Editor after creating bucket "candidate-photos" (public)

INSERT INTO storage.buckets (id, name, public)
VALUES ('candidate-photos', 'candidate-photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Creators upload via service role in API routes.
-- Public read for candidate photos on ballots and listings.

CREATE POLICY "candidate_photos_public_read"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'candidate-photos');
