import type { Lead, LeadSource } from '@/types/lead';
import { SOURCE_LABELS, SOURCE_COLORS } from '@/lib/constants';
import { Card, CardHeader } from '@/components/ui/Card';

// Ported from renderDonut() in the original app.js.
export function SourceDonut({ leads }: { leads: Lead[] }) {
  const bySource: Partial<Record<LeadSource, number>> = {};
  leads.forEach((l) => {
    bySource[l.source] = (bySource[l.source] || 0) + 1;
  });
  const total = leads.length || 1;
  const entries = Object.entries(bySource).sort((a, b) => (b[1] as number) - (a[1] as number)) as [
    LeadSource,
    number,
  ][];

  const r = 50;
  const cx = 60;
  const cy = 60;
  const circumference = 2 * Math.PI * r;
  let offsetAcc = 0;

  return (
    <Card span={4}>
      <CardHeader>
        <h3>Leads by Source</h3>
      </CardHeader>
      <div className="donut-wrap">
        <svg viewBox="0 0 120 120" className="donut">
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--color-line)" strokeWidth={16} />
          {entries.map(([source, count]) => {
            const frac = count / total;
            const dash = frac * circumference;
            const el = (
              <circle
                key={source}
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke={SOURCE_COLORS[source] || '#9ca3af'}
                strokeWidth={16}
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={-offsetAcc}
                strokeLinecap="round"
              />
            );
            offsetAcc += dash;
            return el;
          })}
        </svg>
        <div className="legend">
          {entries.map(([source, count]) => (
            <div className="legend-item" key={source}>
              <span className="legend-swatch" style={{ background: SOURCE_COLORS[source] || '#9ca3af' }} />
              <span>{SOURCE_LABELS[source] || source}</span>
              <span className="legend-value">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
