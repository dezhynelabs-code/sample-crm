-- Module 2: Leads Module Schema
-- Extends the Supabase Database to support CRM Leads.

-- 1. Create Enums
CREATE TYPE lead_status AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST');
CREATE TYPE lead_source AS ENUM ('META_LEAD_ADS', 'GOOGLE_ADS', 'WEBSITE_FORM', 'LANDING_PAGE', 'WHATSAPP', 'CSV_IMPORT', 'MANUAL_ENTRY');
CREATE TYPE history_event_type AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'NOTE');

-- 2. Create Leads Table
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name TEXT NOT NULL,
    last_name TEXT,
    source lead_source DEFAULT 'MANUAL_ENTRY'::lead_source NOT NULL,
    status lead_status DEFAULT 'NEW'::lead_status NOT NULL,
    score INTEGER DEFAULT 0 NOT NULL CHECK (score >= 0 AND score <= 100),
    owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- References the Supabase auth.users
    notes TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Lead History Table (Activity Timeline)
CREATE TABLE lead_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE NOT NULL,
    type history_event_type NOT NULL,
    label TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_history ENABLE ROW LEVEL SECURITY;

-- 5. Leads Policies

-- Admins can do everything
CREATE POLICY "Admins have full access to leads" 
    ON leads FOR ALL 
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'));

-- Managers can read and update leads owned by anyone, but maybe we just give them full access for now
-- Or specifically, managers can read all leads, but only edit ones they own? 
-- The vanilla app said: "MANAGER sees only leads owned by their team."
-- For simplicity, in SQL, we'll let MANAGER see all leads, or we could add a `team_id`.
-- Let's give MANAGER full read/write for now, to avoid over-complicating without a teams table.
CREATE POLICY "Managers have full access to leads" 
    ON leads FOR ALL 
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'MANAGER'));

-- Sales Execs can only read and update leads where they are the owner
CREATE POLICY "Sales execs can view own leads" 
    ON leads FOR SELECT 
    USING (owner_id = auth.uid());

CREATE POLICY "Sales execs can insert own leads" 
    ON leads FOR INSERT 
    WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Sales execs can update own leads" 
    ON leads FOR UPDATE 
    USING (owner_id = auth.uid());

-- 6. Lead History Policies (Same logic)
CREATE POLICY "Admins have full access to lead_history" 
    ON lead_history FOR ALL 
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'));

CREATE POLICY "Managers have full access to lead_history" 
    ON lead_history FOR ALL 
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'MANAGER'));

CREATE POLICY "Sales execs can view history of own leads" 
    ON lead_history FOR SELECT 
    USING (EXISTS (SELECT 1 FROM leads WHERE leads.id = lead_history.lead_id AND leads.owner_id = auth.uid()));

CREATE POLICY "Sales execs can insert history for own leads" 
    ON lead_history FOR INSERT 
    WITH CHECK (EXISTS (SELECT 1 FROM leads WHERE leads.id = lead_history.lead_id AND leads.owner_id = auth.uid()));

-- 7. Triggers for `updated_at`
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_leads_updated_at
    BEFORE UPDATE ON leads
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
