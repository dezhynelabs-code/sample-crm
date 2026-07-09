import type { Lead } from '@/types/lead';
import { Card, CardHeader } from '@/components/ui/Card';

// Ported from renderSlaGauge() in the original app.js.
export function SlaGauge({ leads }: { leads: Lead[] }) {
  const withFollowUp = leads.filter((l) => l.history && l.history.length > 1);
  let avgMinutes = 12; // fallback so the gauge never renders empty

  if (withFollowUp.length > 0) {
    const total = withFollowUp.reduce((sum, l) => {
      const created = new Date(l.history[0].time).getTime();
      const next = new Date(l.history[1].time).getTime();
      return sum + Math.max(0, (next - created) / 60000);
    }, 0);
    avgMinutes = Math.round(total / withFollowUp.length) || 1;
  }

  const target = 15;
  const pct = Math.min(1, avgMinutes / (target * 2));
  const arcLength = 125;
  const offset = Math.round(arcLength * (1 - pct));
  const strokeColor = avgMinutes <= target ? 'var(--status-won)' : 'var(--status-danger)';

  return (
    <Card span={6}>
      <CardHeader>
        <h3>SLA Performance (Response Time)</h3>
        <span className="card-sub">Time from generation to representative contact</span>
      </CardHeader>
      <div className="chart-placeholder">
        <div className="gauge-meter-wrapper">
          <svg className="gauge-meter" viewBox="0 0 100 50">
            <path
              d="M 10 50 A 40 40 0 0 1 90 50"
              fill="none"
              stroke="var(--color-line)"
              strokeWidth={8}
              strokeLinecap="round"
            />
            <path
              d="M 10 50 A 40 40 0 0 1 90 50"
              fill="none"
              stroke={strokeColor}
              strokeWidth={8}
              strokeDasharray={arcLength}
              strokeDashoffset={offset}
              strokeLinecap="round"
            />
          </svg>
          <div className="gauge-value">{avgMinutes}m</div>
          <div className="gauge-label">Average Response Time (Target: &lt;{target}m)</div>
        </div>
      </div>
    </Card>
  );
}
