-- Fix Ownership issue (Run this line first to ensure you have permission)
ALTER TABLE public.profiles OWNER TO postgres;

-- 1. Fix the 500 Error on Profiles (Infinite Recursion)
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT USING (auth.role() = 'authenticated');

-- 2. Fix the 400 Error on Leads (Foreign Key to Profiles)
-- The leads table was referencing the hidden auth.users table, which prevented the React 
-- app from joining the Profile data. We will point it to the public.profiles table instead.
ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_owner_id_fkey;
ALTER TABLE leads ADD CONSTRAINT leads_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.profiles(id) ON DELETE SET NULL;
