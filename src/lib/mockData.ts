import type { Lead } from '@/types/lead';
import type { AppNotification } from '@/types/notification';
import type { Campaign } from '@/types/campaign';
import { SOURCE_LABELS, OWNER_OPTIONS } from '@/lib/constants';

// Ported verbatim from generateMockLeads() in the original app.js —
// same name pools, same distribution, same 48-lead count — so local/demo
// mode looks identical to the original dashboard.
export function generateMockLeads(): Lead[] {
  const firstNames = [
    'Aarav', 'Priya', 'Rahul', 'Sneha', 'Vikram', 'Ananya', 'Karthik', 'Divya',
    'Arjun', 'Meera', 'Rohan', 'Kavya', 'Elena', 'Marcus', 'Chloe', 'Jin',
  ];
  const lastNames = [
    'Sharma', 'Patel', 'Iyer', 'Nair', 'Reddy', 'Gupta', 'Menon', 'Rao',
    'Singh', 'Krishnan', 'Chen', 'Vance', 'Dupont', 'Novak',
  ];
  const sources = Object.keys(SOURCE_LABELS) as Lead['source'][];
  const statuses: Lead['status'][] = [
    'NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST',
  ];

  const leads: Lead[] = [];
  for (let i = 0; i < 48; i++) {
    const source = sources[Math.floor(Math.random() * sources.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const daysAgo = Math.floor(Math.random() * 30);
    const created = new Date();
    created.setDate(created.getDate() - daysAgo);

    leads.push({
      id: 'lead_' + Math.floor(Math.random() * 10000000),
      firstName: firstNames[Math.floor(Math.random() * firstNames.length)],
      lastName: lastNames[Math.floor(Math.random() * lastNames.length)],
      source,
      status,
      score: Math.floor(Math.random() * 100),
      owner: OWNER_OPTIONS[Math.floor(Math.random() * OWNER_OPTIONS.length)],
      createdAt: created.toISOString(),
      notes: '',
      history: [
        {
          type: 'CREATE',
          label: 'Lead generated from ' + SOURCE_LABELS[source],
          time: created.toISOString(),
        },
      ],
    });
  }
  return leads;
}

// Ported verbatim from generateMockNotifications().
export function generateMockNotifications(): AppNotification[] {
  return [
    {
      id: 'notif_1',
      title: 'High-score Lead Alert',
      desc: 'Marcus Novak registered via Google Ads with a lead score of 92.',
      time: new Date(Date.now() - 3600000 * 2).toISOString(),
      unread: true,
      category: 'alert',
    },
    {
      id: 'notif_2',
      title: 'Lead SLA Warning',
      desc: 'Lead Aarav Sharma is in Contacted stage with no owner response for 24h.',
      time: new Date(Date.now() - 3600000 * 5).toISOString(),
      unread: true,
      category: 'warning',
    },
    {
      id: 'notif_3',
      title: 'New Integration Synced',
      desc: 'Slack alerts integrated successfully with standard channels.',
      time: new Date(Date.now() - 3600000 * 12).toISOString(),
      unread: true,
      category: 'info',
    },
  ];
}

// Ported verbatim from seedDefaultCampaigns().
export function seedDefaultCampaigns(): Campaign[] {
  return [
    { id: 'camp_1', name: 'Google Ads - Search Brand', subtitle: 'Google Ads Integration', status: 'active', spend: 4500, leadsGen: 362 },
    { id: 'camp_2', name: 'Meta Ads - Lookalike Leads', subtitle: 'Meta Ads Integration', status: 'active', spend: 3800, leadsGen: 290 },
    { id: 'camp_3', name: 'Newsletter Sponsor - Q3 Promo', subtitle: 'Manual Link Tracking', status: 'active', spend: 1500, leadsGen: 145 },
    { id: 'camp_4', name: 'Blog Post Call to Action', subtitle: 'Website Organic', status: 'active', spend: 0, leadsGen: 88 },
    { id: 'camp_5', name: 'YouTube Influencer Placement', subtitle: 'Partner Integration', status: 'ended', spend: 3000, leadsGen: 210 },
  ];
}
