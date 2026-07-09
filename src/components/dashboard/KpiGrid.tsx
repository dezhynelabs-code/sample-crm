import type { Lead } from '@/types/lead';
import { KpiCard } from '@/components/ui/KpiCard';

// Ported from renderKPIs() in the original app.js.
export function KpiGrid({ leads }: { leads: Lead[] }) {
  const total = leads.length;
  const won = leads.filter((l) => l.status === 'WON').length;
  const conv = total ? Math.round((won / total) * 1000) / 10 : 0;
  const unassigned = leads.filter((l) => !l.owner).length;
  const avgScore = total ? Math.round(leads.reduce((s, l) => s + (l.score || 0), 0) / total) : 0;

  return (
    <section className="kpi-grid">
      <KpiCard label="Total Leads" value={total.toLocaleString()} delta="+12.4% (mo/mo)" direction="up" />
      <KpiCard label="Conversion Rate" value={`${conv}%`} delta="+2.1% target" direction="up" />
      <KpiCard label="Avg. Lead Score" value={avgScore} delta="Stable quality" direction="up" />
      <KpiCard
        label="Unassigned Leads"
        value={unassigned}
        delta={unassigned > 5 ? 'High response latency' : 'Optimal pipeline'}
        direction={unassigned > 5 ? 'down' : 'up'}
      />
    </section>
  );
}
