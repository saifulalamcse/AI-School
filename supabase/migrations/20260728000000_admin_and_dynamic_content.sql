-- Create user_roles table & is_admin function
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  );
$$;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

DROP POLICY IF EXISTS "Allow users to read their own roles" ON public.user_roles;
CREATE POLICY "Allow users to read their own roles" ON public.user_roles
FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Allow admin to manage user roles" ON public.user_roles;
CREATE POLICY "Allow admin to manage user roles" ON public.user_roles
FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());


-- Create courses table
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  price TEXT NOT NULL DEFAULT '1,900',
  period TEXT NOT NULL DEFAULT 'month',
  status TEXT NOT NULL DEFAULT 'active',
  thumbnail_url TEXT,
  tools JSONB DEFAULT '[]'::jsonb,
  stats JSONB DEFAULT '[]'::jsonb,
  topics JSONB DEFAULT '[]'::jsonb,
  inside JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS tools JSONB DEFAULT '[]'::jsonb;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.courses TO anon, authenticated;
GRANT ALL ON public.courses TO service_role;

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Courses are viewable by everyone" ON public.courses;
CREATE POLICY "Courses are viewable by everyone" ON public.courses
FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Admin can manage courses" ON public.courses;
CREATE POLICY "Admin can manage courses" ON public.courses
FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());


-- Create experts table
CREATE TABLE IF NOT EXISTS public.experts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT,
  company TEXT,
  initials TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.experts TO anon, authenticated;
GRANT ALL ON public.experts TO service_role;

ALTER TABLE public.experts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Experts are viewable by everyone" ON public.experts;
CREATE POLICY "Experts are viewable by everyone" ON public.experts
FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Admin can manage experts" ON public.experts;
CREATE POLICY "Admin can manage experts" ON public.experts
FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());


-- Create pricing_plans table
CREATE TABLE IF NOT EXISTS public.pricing_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price TEXT NOT NULL,
  period TEXT NOT NULL,
  badge TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  is_popular BOOLEAN DEFAULT false,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.pricing_plans TO anon, authenticated;
GRANT ALL ON public.pricing_plans TO service_role;

ALTER TABLE public.pricing_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Pricing plans are viewable by everyone" ON public.pricing_plans;
CREATE POLICY "Pricing plans are viewable by everyone" ON public.pricing_plans
FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Admin can manage pricing plans" ON public.pricing_plans;
CREATE POLICY "Admin can manage pricing plans" ON public.pricing_plans
FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());


-- Seed Data
INSERT INTO public.courses (slug, title, subtitle, description, price, period, status, stats, topics, inside)
VALUES (
  'creative-ai-community',
  'Creative AI Community',
  'The community for creators building the next wave of AI-native work.',
  'Master Creative design with AI — 25+ AI Tools Use Cases Covered including text-to-video, composite design, UGC ads and landing pages.',
  '1,900',
  'month',
  'active',
  '[{"label": "25 Hours+", "sub": "of content"}, {"label": "New Classes", "sub": "every week"}, {"label": "2 Live Sessions", "sub": "per month"}, {"label": "Lifetime", "sub": "community access"}]'::jsonb,
  '["AI Generation", "Text-to-Video", "UGC Ads", "Landing Page Design", "Composite Design", "Green Screen", "Brand Systems", "Motion & Editing"]'::jsonb,
  '[{"count": "33+", "title": "Recorded Sessions", "desc": "Watch anytime, anywhere."}, {"count": "New", "title": "Lessons Every Week", "desc": "Stay on the edge as tools evolve."}, {"count": "Live", "title": "Sessions with Instructors", "desc": "Q&A, feedback, real client work."}]'::jsonb
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.experts (name, role, initials) VALUES
('Rezaul Karim', 'Founder, Studio Nine', 'RK'),
('Tahmid Ahmed', 'Creative Director', 'TA'),
('Nabila Rahman', 'Head of Marketing', 'NR'),
('Sadman Islam', 'Freelance Creator', 'SI')
ON CONFLICT DO NOTHING;

INSERT INTO public.pricing_plans (name, price, period, badge, is_popular, display_order, features) VALUES
('Monthly', '1,900', 'month', null, false, 1, '["Full Creative AI Community access", "New classes every single week", "2 Live sessions per month + Q&A", "Access to 150+ prompt templates", "Discord community & feedback"]'::jsonb),
('Yearly', '17,900', 'year', 'MOST POPULAR', true, 2, '["Save ৳4,900 compared to monthly", "Full Creative AI Community access", "New classes every single week", "2 Live sessions per month + Q&A", "1-on-1 Portfolio review session", "All future masterclass releases"]'::jsonb),
('Lifetime', '39,900', 'one-time', null, false, 3, '["Pay once, access forever", "Every present and future course", "All live session recordings (33+)", "Direct DM access to lead instructor", "VIP Discord role & private lounge"]'::jsonb)
ON CONFLICT DO NOTHING;
