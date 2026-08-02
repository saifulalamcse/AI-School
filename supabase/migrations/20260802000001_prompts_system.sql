-- =====================================================
-- Prompt Library System Table
-- =====================================================

CREATE TABLE IF NOT EXISTS public.prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  prompt TEXT NOT NULL,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}'::TEXT[],
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;

-- Allow public read access to all prompts
DROP POLICY IF EXISTS "Everyone can view prompts" ON public.prompts;
CREATE POLICY "Everyone can view prompts"
ON public.prompts FOR SELECT
TO public
USING (true);

-- Allow admins to insert, update, and delete prompts
DROP POLICY IF EXISTS "Admins can manage prompts" ON public.prompts;
CREATE POLICY "Admins can manage prompts"
ON public.prompts FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'
  )
);

-- Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.prompts TO authenticated;
GRANT ALL ON public.prompts TO service_role;
