-- ===================================================
-- Lesson System: sections, lessons, lesson_progress
-- ===================================================

-- 1. SECTIONS TABLE (Course Chapters / Weeks)
CREATE TABLE IF NOT EXISTS public.sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_slug TEXT NOT NULL REFERENCES public.courses(slug) ON DELETE CASCADE,
  title TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.sections ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sections TO authenticated;
GRANT SELECT ON public.sections TO anon;
GRANT ALL ON public.sections TO service_role;

DROP POLICY IF EXISTS "Sections are viewable by everyone" ON public.sections;
CREATE POLICY "Sections are viewable by everyone" ON public.sections
FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Admin can manage sections" ON public.sections;
CREATE POLICY "Admin can manage sections" ON public.sections
FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());


-- 2. LESSONS TABLE (Individual Video Lessons)
CREATE TABLE IF NOT EXISTS public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID NOT NULL REFERENCES public.sections(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  youtube_video_id TEXT,        -- e.g. "dQw4w9WgXcQ"
  duration TEXT,                -- e.g. "12:34"
  description TEXT,
  is_free BOOLEAN NOT NULL DEFAULT false,   -- true = preview for anyone
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lessons TO authenticated;
GRANT SELECT ON public.lessons TO anon;
GRANT ALL ON public.lessons TO service_role;

-- Everyone can see free lessons; enrolled users can see all lessons of their enrolled course
DROP POLICY IF EXISTS "Lessons viewable by enrolled users or free lessons" ON public.lessons;
CREATE POLICY "Lessons viewable by enrolled users or free lessons" ON public.lessons
FOR SELECT TO anon, authenticated
USING (
  is_free = true
  OR public.is_admin()
  OR EXISTS (
    SELECT 1 FROM public.enrollments e
    JOIN public.sections s ON s.id = lessons.section_id
    WHERE e.user_id = auth.uid()
      AND e.course_slug = s.course_slug
      AND e.status = 'active'
  )
);

DROP POLICY IF EXISTS "Admin can manage lessons" ON public.lessons;
CREATE POLICY "Admin can manage lessons" ON public.lessons
FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());


-- 3. LESSON PROGRESS TABLE (Track Completed Lessons)
CREATE TABLE IF NOT EXISTS public.lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, lesson_id)
);

ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, DELETE ON public.lesson_progress TO authenticated;
GRANT ALL ON public.lesson_progress TO service_role;

DROP POLICY IF EXISTS "Users manage their own lesson progress" ON public.lesson_progress;
CREATE POLICY "Users manage their own lesson progress" ON public.lesson_progress
FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);


-- 4. ENROLLMENTS: Add payment_method column if not exists
ALTER TABLE public.enrollments ADD COLUMN IF NOT EXISTS payment_method TEXT;
