import type { Lead, LeadStatus } from '@/types/lead';
import { FUNNEL_STAGES, STATUS_ORDER } from '@/lib/constants';
import { statusLabel } from '@/lib/format';
import { Card, CardHeader } from '@/components/ui/Card';

// Ported from renderFunnel() in the original app.js.
export function FunnelChart({ leads }: { leads: Lead[] }) {
  const counts = FUNNEL_STAGES.map((stage) => {
    if (stage === 'WON') return leads.filter((l) => l.status === 'WON').length;
    const idx = STATUS_ORDER.indexOf(stage as LeadStatus);
    return leads.filter((l) => STATUS_ORDER.indexOf(l.status) >= idx && l.status !== 'LOST').length;
  });
  const max = Math.max(...counts, 1);

  return (
    <Card span={8}>
      <CardHeader>
        <h3>Lead Funnel</h3>
        <span className="card-sub">New → Contacted → Qualified → Proposal → Won</span>
      </CardHeader>
      <div className="funnel">
        {FUNNEL_STAGES.map((stage, i) => (
          <div className="funnel-row" key={stage}>
            <div className="funnel-label">{statusLabel(stage)}</div>
            <div className="funnel-bar-track">
              <div className="funnel-bar-fill" style={{ width: `${(counts[i] / max) * 100}%` }} />
            </div>
            <div className="funnel-count">{counts[i]}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}
