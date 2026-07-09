import type { Lead } from '@/types/lead';
import { Card, CardHeader } from '@/components/ui/Card';

// Ported from renderMonthlyVelocityChart() in the original app.js. Kept as
// the original's hand-rolled CSS bar chart (rather than swapped to
// Recharts) to preserve the exact visual/animation behavior per the
// "do not redesign" instruction — Recharts is wired into the project
// (see package.json) and is the right tool for new charts going forward,
// but re-implementing this *existing* pixel-matched chart in it would
// change its rendering/transition behavior for no functional gain.
export function MonthlyVelocityChart({ leads }: { leads: Lead[] }) {
  const now = new Date();
  const buckets: { key: string; label: string; count: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: d.toLocaleString('default', { month: 'short' }),
      count: 0,
    });
  }

  leads.forEach((l) => {
    const d = new Date(l.createdAt);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const bucket = buckets.find((b) => b.key === key);
    if (bucket) bucket.count++;
  });

  const max = Math.max(...buckets.map((b) => b.count), 1);

  return (
    <Card span={6}>
      <CardHeader>
        <h3>Monthly Lead Velocity</h3>
        <span className="card-sub">Growth rate comparison</span>
      </CardHeader>
      <div className="chart-placeholder">
        <div className="bar-chart-visual">
          {buckets.map((b) => (
            <div className="bar-col" key={b.key}>
              <div
                className="bar-value"
                style={{ height: `${Math.max(4, (b.count / max) * 100)}%` }}
                title={`${b.count} leads`}
              />
              <span className="bar-lbl">{b.label}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
