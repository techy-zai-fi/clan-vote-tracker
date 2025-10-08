-- Create storage bucket for election images
INSERT INTO storage.buckets (id, name, public)
VALUES ('election-images', 'election-images', true)
ON CONFLICT (id) DO NOTHING;

-- Create policies for election images bucket
CREATE POLICY "Public can view election images"
ON storage.objects FOR SELECT
USING (bucket_id = 'election-images');

CREATE POLICY "Public can upload election images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'election-images');

CREATE POLICY "Public can update election images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'election-images');

CREATE POLICY "Public can delete election images"
ON storage.objects FOR DELETE
USING (bucket_id = 'election-images');