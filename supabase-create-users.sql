-- Run this script in your Supabase SQL Editor to automatically create the 3 demo users!

-- Ensure the pgcrypto extension is available (it usually is by default in Supabase)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  admin_id UUID := gen_random_uuid();
  manager_id UUID := gen_random_uuid();
  exec_id UUID := gen_random_uuid();
BEGIN
  -- 1. Create the Administrator User
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@pipeline.com') THEN
    INSERT INTO auth.users (
      id, instance_id, role, aud, email, encrypted_password, email_confirmed_at, 
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      admin_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin@pipeline.com', 
      crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Administrator"}', now(), now()
    );
    -- Update the profile role
    UPDATE public.profiles SET role = 'ADMIN' WHERE id = admin_id;
  END IF;

  -- 2. Create the Sales Manager User
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'manager@pipeline.com') THEN
    INSERT INTO auth.users (
      id, instance_id, role, aud, email, encrypted_password, email_confirmed_at, 
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      manager_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'manager@pipeline.com', 
      crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Sales Manager"}', now(), now()
    );
    -- Update the profile role
    UPDATE public.profiles SET role = 'MANAGER' WHERE id = manager_id;
  END IF;

  -- 3. Create the Sales Executive User
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'exec@pipeline.com') THEN
    INSERT INTO auth.users (
      id, instance_id, role, aud, email, encrypted_password, email_confirmed_at, 
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      exec_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'exec@pipeline.com', 
      crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Sales Executive"}', now(), now()
    );
    -- The default profile role is already SALES_EXEC
  END IF;

END $$;
