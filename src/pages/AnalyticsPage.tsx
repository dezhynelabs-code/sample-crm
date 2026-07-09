import { useLeads } from '@/context/LeadsContext';
import { MonthlyVelocityChart } from '@/components/analytics/MonthlyVelocityChart';
import { SlaGauge } from '@/components/analytics/SlaGauge';

// Ported from the #view-analytics pane in the original index.html.
export function AnalyticsPage() {
  const { scopedLeads } = useLeads();

  return (
    <div className="view-pane active">
      <div className="page-header">
        <div>
          <h1>Performance Analytics</h1>
          <p className="page-subtitle">
            Detailed breakdown of acquisition growth trends, SLA metrics, and conversions.
          </p>
        </div>
      </div>

      <section className="grid-2">
        <MonthlyVelocityChart leads={scopedLeads} />
        <SlaGauge leads={scopedLeads} />
      </section>
    </div>
  );
}
