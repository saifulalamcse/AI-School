-- =====================================================
-- Storage: Create course-assets bucket with public access
-- =====================================================

-- Create the bucket (public = true so images are publicly accessible)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'course-assets',
  'course-assets',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];

-- Allow authenticated users (admins) to upload files
DROP POLICY IF EXISTS "Authenticated users can upload course assets" ON storage.objects;
CREATE POLICY "Authenticated users can upload course assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'course-assets');

-- Allow authenticated users to update/delete their files
DROP POLICY IF EXISTS "Authenticated users can update course assets" ON storage.objects;
CREATE POLICY "Authenticated users can update course assets"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'course-assets');

DROP POLICY IF EXISTS "Authenticated users can delete course assets" ON storage.objects;
CREATE POLICY "Authenticated users can delete course assets"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'course-assets');

-- Allow everyone to read/view public files
DROP POLICY IF EXISTS "Public can view course assets" ON storage.objects;
CREATE POLICY "Public can view course assets"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'course-assets');
