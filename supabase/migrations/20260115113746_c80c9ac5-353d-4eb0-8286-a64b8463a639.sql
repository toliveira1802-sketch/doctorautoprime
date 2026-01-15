-- Create storage bucket for OS photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('os-photos', 'os-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload photos
CREATE POLICY "Authenticated users can upload OS photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'os-photos');

-- Allow anyone to view OS photos (public bucket)
CREATE POLICY "Anyone can view OS photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'os-photos');

-- Allow authenticated users to delete their uploads
CREATE POLICY "Authenticated users can delete OS photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'os-photos');