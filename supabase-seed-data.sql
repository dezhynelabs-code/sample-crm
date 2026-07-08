-- Supabase Seed Data Script
-- Run this in your Supabase SQL Editor to populate your database with dummy data

-- 1. Get the first Admin user to own the leads (assuming you created at least one user)
DO $$ 
DECLARE
  demo_owner_id UUID;
BEGIN
  -- Get any available user profile to assign leads to (preferably an admin)
  SELECT id INTO demo_owner_id FROM profiles LIMIT 1;

  IF demo_owner_id IS NULL THEN
    RAISE NOTICE 'No users found in profiles table. Please create a user first before seeding leads.';
    RETURN;
  END IF;

  -- 2. Insert Campaigns
  INSERT INTO campaigns (name, subtitle, status, spend, leads_gen) VALUES 
  ('Google Ads - Search Brand', 'Google Ads Integration', 'ACTIVE', 4500, 362),
  ('Meta Ads - Lookalike Leads', 'Meta Ads Integration', 'ACTIVE', 3800, 290),
  ('YouTube Influencer Placement', 'Partner Integration', 'ENDED', 3000, 210),
  ('LinkedIn B2B Outreach', 'LinkedIn Integration', 'ACTIVE', 1200, 45);

  -- 3. Insert Leads
  -- We'll insert 10 mock leads assigned to the demo owner
  
  -- Lead 1
  INSERT INTO leads (id, first_name, last_name, source, status, score, owner_id, notes) 
  VALUES (gen_random_uuid(), 'Sarah', 'Connor', 'LANDING_PAGE', 'NEW', 92, demo_owner_id, 'Very interested in our enterprise plan.');
  
  -- Lead 2
  INSERT INTO leads (id, first_name, last_name, source, status, score, owner_id, notes) 
  VALUES (gen_random_uuid(), 'John', 'Wick', 'META_LEAD_ADS', 'CONTACTED', 85, demo_owner_id, 'Needs a quick response.');
  
  -- Lead 3
  INSERT INTO leads (id, first_name, last_name, source, status, score, owner_id, notes) 
  VALUES (gen_random_uuid(), 'Ellen', 'Ripley', 'WEBSITE_FORM', 'QUALIFIED', 78, demo_owner_id, 'Looking for long-term partnership.');
  
  -- Lead 4
  INSERT INTO leads (id, first_name, last_name, source, status, score, owner_id, notes) 
  VALUES (gen_random_uuid(), 'Tony', 'Stark', 'GOOGLE_ADS', 'PROPOSAL', 99, demo_owner_id, 'High budget.');
  
  -- Lead 5
  INSERT INTO leads (id, first_name, last_name, source, status, score, owner_id, notes) 
  VALUES (gen_random_uuid(), 'Bruce', 'Wayne', 'WHATSAPP', 'NEGOTIATION', 95, demo_owner_id, 'Discussing terms.');
  
  -- Lead 6
  INSERT INTO leads (id, first_name, last_name, source, status, score, owner_id, notes) 
  VALUES (gen_random_uuid(), 'Clark', 'Kent', 'CSV_IMPORT', 'WON', 88, demo_owner_id, 'Deal closed successfully.');
  
  -- Lead 7
  INSERT INTO leads (id, first_name, last_name, source, status, score, owner_id, notes) 
  VALUES (gen_random_uuid(), 'Diana', 'Prince', 'MANUAL_ENTRY', 'WON', 90, demo_owner_id, 'Great client.');
  
  -- Lead 8
  INSERT INTO leads (id, first_name, last_name, source, status, score, owner_id, notes) 
  VALUES (gen_random_uuid(), 'Arthur', 'Curry', 'META_LEAD_ADS', 'LOST', 45, demo_owner_id, 'Went with a competitor.');
  
  -- Lead 9
  INSERT INTO leads (id, first_name, last_name, source, status, score, owner_id, notes) 
  VALUES (gen_random_uuid(), 'Barry', 'Allen', 'GOOGLE_ADS', 'NEW', 60, demo_owner_id, 'Needs followup.');
  
  -- Lead 10
  INSERT INTO leads (id, first_name, last_name, source, status, score, owner_id, notes) 
  VALUES (gen_random_uuid(), 'Hal', 'Jordan', 'WEBSITE_FORM', 'CONTACTED', 72, demo_owner_id, 'Followed up via email.');

  -- Note: The trigger on the leads table will automatically create the initial 'CREATE' history logs for these leads!

END $$;
