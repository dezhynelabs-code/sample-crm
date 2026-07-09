import type { LeadSource } from '@/types/lead';
import { SOURCE_LABELS, SOURCE_COLORS } from '@/lib/constants';

// Ported from sourceChip() in the original app.js.
export function SourceChip({ source }: { source: LeadSource }) {
  return (
    <span className="source-chip">
      <span className="source-dot" style={{ background: SOURCE_COLORS[source] || '#9ca3af' }} />
      {SOURCE_LABELS[source] || source}
    </span>
  );
}
