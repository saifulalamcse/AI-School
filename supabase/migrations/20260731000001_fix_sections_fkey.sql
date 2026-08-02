-- Fix foreign key to support course slug updates (ON UPDATE CASCADE)
ALTER TABLE public.sections
  DROP CONSTRAINT IF EXISTS sections_course_slug_fkey;

ALTER TABLE public.sections
  ADD CONSTRAINT sections_course_slug_fkey
  FOREIGN KEY (course_slug)
  REFERENCES public.courses(slug)
  ON DELETE CASCADE
  ON UPDATE CASCADE;
