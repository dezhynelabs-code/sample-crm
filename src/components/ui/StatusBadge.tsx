import type { LeadStatus } from '@/types/lead';
import { statusLabel } from '@/lib/format';

// Ported from statusBadge() in the original app.js.
export function StatusBadge({ status }: { status: LeadStatus }) {
  return <span className={`status-badge status-${status}`}>{statusLabel(status)}</span>;
}
