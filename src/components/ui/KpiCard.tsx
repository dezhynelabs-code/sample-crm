interface KpiCardProps {
  label: string;
  value: string | number;
  delta: string;
  direction: 'up' | 'down';
}

// Ported from the .kpi-card markup generated in renderKPIs()/renderCampaignsKPIs().
export function KpiCard({ label, value, delta, direction }: KpiCardProps) {
  return (
    <div className="kpi-card">
      <div className="kpi-label">{label}</div>
      <div className="kpi-value">{value}</div>
      <div className={`kpi-delta ${direction}`}>{delta}</div>
    </div>
  );
}
