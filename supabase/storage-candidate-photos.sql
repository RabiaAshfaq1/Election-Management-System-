-- Candidate photos storage bucket and policies.
-- Run in Supabase SQL Editor.

INSERT INTO storage.buckets (id, name, public)
VALUES ('candidate-photos', 'candidate-photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "candidate_photos_public_read" ON storage.objects;
DROP POLICY IF EXISTS "candidate_photos_authenticated_insert" ON storage.objects;
DROP POLICY IF EXISTS "candidate_photos_authenticated_update" ON storage.objects;
DROP POLICY IF EXISTS "candidate_photos_authenticated_delete" ON storage.objects;

CREATE POLICY "candidate_photos_public_read"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'candidate-photos');

CREATE POLICY "candidate_photos_authenticated_insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'candidate-photos');

CREATE POLICY "candidate_photos_authenticated_update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'candidate-photos')
  WITH CHECK (bucket_id = 'candidate-photos');

CREATE POLICY "candidate_photos_authenticated_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'candidate-photos');
