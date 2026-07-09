import type { Lead, LeadHistoryEntry } from '@/types/lead';
import { timeAgo } from '@/lib/format';

function iconFor(type: LeadHistoryEntry['type']): string {
  if (type === 'CREATE') return '✦';
  if (type === 'UPDATE') return '↻';
  return '•';
}

// Ported from renderActivityTimeline() in the original app.js.
export function ActivityTimeline({ lead }: { lead: Lead }) {
  if (!lead.history || lead.history.length === 0) {
    return <div className="timeline-empty">No activity recorded yet.</div>;
  }

  const items = [...lead.history].reverse();

  return (
    <>
      {items.map((entry, i) => (
        <div key={i} className={`timeline-item ${i === 0 ? 'latest' : ''}`}>
          <div className="timeline-icon">{iconFor(entry.type)}</div>
          <div className="timeline-line" />
          <div className="timeline-body">
            <div className="timeline-label">{entry.label}</div>
            <div className="timeline-time">
              {timeAgo(entry.time)} · {new Date(entry.time).toLocaleString()}
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
