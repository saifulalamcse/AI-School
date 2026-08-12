-- 1. Enrollments Table Policies: Allow admins to view, create, update, and delete all records
DROP POLICY IF EXISTS "Admins can manage all enrollments" ON public.enrollments;
CREATE POLICY "Admins can manage all enrollments" ON public.enrollments
FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 2. Profiles Table Policies: Allow admins to insert any profile
DROP POLICY IF EXISTS "Admins can insert all profiles" ON public.profiles;
CREATE POLICY "Admins can insert all profiles" ON public.profiles
FOR INSERT TO authenticated
WITH CHECK (public.is_admin());

-- 3. Profiles Table Policies: Allow admins to update any profile
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles" ON public.profiles
FOR UPDATE TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 4. Profiles Table Policies: Allow admins to delete any profile
DROP POLICY IF EXISTS "Admins can delete all profiles" ON public.profiles;
CREATE POLICY "Admins can delete all profiles" ON public.profiles
FOR DELETE TO authenticated
USING (public.is_admin());
