-- Module 1: Auth & User Profiles Schema
-- This schema extends Supabase Auth to include role-based access control.

-- 1. Create a custom ENUM type for roles (matching the vanilla app's roles)
CREATE TYPE user_role AS ENUM ('ADMIN', 'MANAGER', 'SALES_EXEC');

-- 2. Create the Profiles table to store user metadata
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role user_role DEFAULT 'SALES_EXEC'::user_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Enable Row Level Security (RLS) on Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies for Profiles
-- Users can read their own profile
CREATE POLICY "Users can view own profile" 
    ON profiles FOR SELECT 
    USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" 
    ON profiles FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN'
        )
    );

-- Only Admins can insert/update profiles
CREATE POLICY "Admins can insert profiles" 
    ON profiles FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN'
        )
    );

CREATE POLICY "Admins can update profiles" 
    ON profiles FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() AND profiles.role = 'ADMIN'
        )
    );

-- 5. Trigger to automatically create a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
      new.id, 
      new.email, 
      COALESCE(new.raw_user_meta_data->>'full_name', 'Unknown User'),
      COALESCE((new.raw_user_meta_data->>'role')::user_role, 'SALES_EXEC'::user_role)
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Seed data for demo purposes (Run these after setting up Auth users, replacing the UUIDs)
-- UPDATE profiles SET role = 'ADMIN' WHERE email = 'admin@pipeline.com';
-- UPDATE profiles SET role = 'MANAGER' WHERE email = 'manager@pipeline.com';
-- UPDATE profiles SET role = 'SALES_EXEC' WHERE email = 'exec@pipeline.com';
