import type { Campaign } from '@/types/campaign';
import type { Lead } from '@/types/lead';
import { KpiCard } from '@/components/ui/KpiCard';

// Ported from renderCampaignsKPIs() in the original app.js.
export function CampaignsKpis({ campaigns, leads }: { campaigns: Campaign[]; leads: Lead[] }) {
  const active = campaigns.filter((c) => c.status === 'active').length;
  const totalSpend = campaigns.reduce((s, c) => s + c.spend, 0);
  const totalLeads = campaigns.reduce((s, c) => s + c.leadsGen, 0);
  const avgCpl = totalLeads > 0 ? totalSpend / totalLeads : 0;
  const wonLeadsValue = leads.filter((l) => l.status === 'WON').length * 250;
  const roi = totalSpend > 0 ? Math.round(((wonLeadsValue - totalSpend) / totalSpend) * 100) : 0;

  return (
    <section className="kpi-grid">
      <KpiCard label="Active Campaigns" value={active} delta={`${campaigns.length} total`} direction="up" />
      <KpiCard
        label="Total Spend"
        value={`$${totalSpend.toLocaleString()}`}
        delta={`Across ${campaigns.length} campaigns`}
        direction="up"
      />
      <KpiCard
        label="Avg. Cost Per Lead"
        value={`$${avgCpl.toFixed(2)}`}
        delta={`${totalLeads} leads generated`}
        direction="up"
      />
      <KpiCard
        label="Estimated ROI"
        value={`${roi}%`}
        delta="Based on won leads"
        direction={roi >= 0 ? 'up' : 'down'}
      />
    </section>
  );
}
