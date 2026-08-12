-- Recreate the policy to restrict manage (insert, update, delete) access to the user_roles table to Saiful Alam only
DROP POLICY IF EXISTS "Allow admin to manage user roles" ON public.user_roles;

CREATE POLICY "Allow admin to manage user roles" ON public.user_roles
FOR ALL TO authenticated 
USING (
  (auth.jwt() ->> 'email') = 'saifulalamcse@gmail.com'
) 
WITH CHECK (
  (auth.jwt() ->> 'email') = 'saifulalamcse@gmail.com'
);
