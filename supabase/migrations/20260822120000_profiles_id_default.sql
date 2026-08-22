-- Migration: Allow profiles table to have default UUID and drop strict auth FK constraint for manual admin additions
ALTER TABLE public.profiles ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
