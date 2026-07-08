-- Fix for Supabase 500 Login Error (Missing Identity Provider)

-- 1. First, delete from profiles to avoid foreign key constraints
DELETE FROM public.profiles WHERE email IN ('admin@pipeline.com', 'manager@pipeline.com', 'exec@pipeline.com');

-- 2. Then, delete the broken users from auth.users so we can recreate them perfectly
DELETE FROM auth.users WHERE email IN ('admin@pipeline.com', 'manager@pipeline.com', 'exec@pipeline.com');

-- 2. Ensure pgcrypto is enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  admin_id UUID := gen_random_uuid();
  manager_id UUID := gen_random_uuid();
  exec_id UUID := gen_random_uuid();
BEGIN
  -- 1. Create the Administrator User
  INSERT INTO auth.users (
    id, instance_id, role, aud, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at
  ) VALUES (
    admin_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin@pipeline.com', 
    crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Administrator"}', now(), now()
  );
  -- IMPORTANT: Create the required Auth Identity to prevent the 500 error!
  INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at) 
  VALUES (gen_random_uuid(), admin_id, format('{"sub":"%s","email":"%s"}', admin_id, 'admin@pipeline.com')::jsonb, 'email', admin_id, now(), now(), now());
  -- Update the profile role
  UPDATE public.profiles SET role = 'ADMIN' WHERE id = admin_id;


  -- 2. Create the Sales Manager User
  INSERT INTO auth.users (
    id, instance_id, role, aud, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at
  ) VALUES (
    manager_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'manager@pipeline.com', 
    crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Sales Manager"}', now(), now()
  );
  INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at) 
  VALUES (gen_random_uuid(), manager_id, format('{"sub":"%s","email":"%s"}', manager_id, 'manager@pipeline.com')::jsonb, 'email', manager_id, now(), now(), now());
  UPDATE public.profiles SET role = 'MANAGER' WHERE id = manager_id;


  -- 3. Create the Sales Executive User
  INSERT INTO auth.users (
    id, instance_id, role, aud, email, encrypted_password, email_confirmed_at, 
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at
  ) VALUES (
    exec_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'exec@pipeline.com', 
    crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Sales Executive"}', now(), now()
  );
  INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at) 
  VALUES (gen_random_uuid(), exec_id, format('{"sub":"%s","email":"%s"}', exec_id, 'exec@pipeline.com')::jsonb, 'email', exec_id, now(), now(), now());

END $$;
