-- Fix Missing Profiles by pulling the exact user IDs from auth.users
-- This bypasses all RLS permission errors because it runs as postgres!

INSERT INTO public.profiles (id, email, full_name, role)
SELECT id, email, 'Administrator', 'ADMIN'::user_role
FROM auth.users
WHERE email = 'admin@pipeline.com'
ON CONFLICT (id) DO UPDATE SET role = 'ADMIN'::user_role;

INSERT INTO public.profiles (id, email, full_name, role)
SELECT id, email, 'Sales Manager', 'MANAGER'::user_role
FROM auth.users
WHERE email = 'manager@pipeline.com'
ON CONFLICT (id) DO UPDATE SET role = 'MANAGER'::user_role;

INSERT INTO public.profiles (id, email, full_name, role)
SELECT id, email, 'Sales Executive', 'SALES_EXEC'::user_role
FROM auth.users
WHERE email = 'exec@pipeline.com'
ON CONFLICT (id) DO UPDATE SET role = 'SALES_EXEC'::user_role;
