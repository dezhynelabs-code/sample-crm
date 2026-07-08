-- Module 4: Campaigns Schema

CREATE TYPE campaign_status AS ENUM ('ACTIVE', 'ENDED');

CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    subtitle TEXT,
    status campaign_status DEFAULT 'ACTIVE'::campaign_status NOT NULL,
    spend DECIMAL(10, 2) DEFAULT 0.00 NOT NULL,
    leads_gen INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- Admins and Managers can manage campaigns
CREATE POLICY "Full access to campaigns for Admins and Managers" 
    ON campaigns FOR ALL 
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'MANAGER')));

-- Sales Execs can only view campaigns
CREATE POLICY "Sales execs can view campaigns" 
    ON campaigns FOR SELECT 
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'SALES_EXEC'));

-- Insert some dummy data for the demo
-- INSERT INTO campaigns (name, subtitle, status, spend, leads_gen) VALUES 
-- ('Google Ads - Search Brand', 'Google Ads Integration', 'ACTIVE', 4500, 362),
-- ('Meta Ads - Lookalike Leads', 'Meta Ads Integration', 'ACTIVE', 3800, 290),
-- ('YouTube Influencer Placement', 'Partner Integration', 'ENDED', 3000, 210);
