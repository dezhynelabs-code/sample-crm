import type { Lead } from '@/types/lead';
import { ScoreRing } from '@/components/ui/ScoreRing';
import { SourceChip } from '@/components/ui/SourceChip';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { timeAgo } from '@/lib/format';
import { useOverlays } from '@/context/OverlaysContext';

interface LeadTableRowProps {
  lead: Lead;
  showActions?: boolean;
  onDelete?: (lead: Lead) => void;
}

// Shared row renderer used by both the Dashboard's "Recent Leads" table
// and the full Leads Directory table (renderRecentLeadsTable() and
// renderLeadsDirectory() in the original app.js rendered near-identical
// row markup — this component removes that duplication).
export function LeadTableRow({ lead, showActions = false, onDelete }: LeadTableRowProps) {
  const { openLeadDrawer } = useOverlays();

  return (
    <tr className="lead-row-click" onClick={() => openLeadDrawer(lead.id)}>
      <td>
        <ScoreRing score={lead.score || 0} size={32} />
      </td>
      <td className="lead-name">
        {lead.firstName} {lead.lastName || ''}
      </td>
      <td>
        <SourceChip source={lead.source} />
      </td>
      <td>
        <StatusBadge status={lead.status} />
      </td>
      <td>{lead.owner || <span style={{ color: 'var(--color-slate)' }}>Unassigned</span>}</td>
      <td style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-slate)' }}>
        {timeAgo(lead.createdAt)}
      </td>
      {showActions && (
        <td>
          {onDelete ? (
            <button
              className="btn btn-secondary delete-lead-inline-btn"
              style={{ padding: '4px 8px', fontSize: 11 }}
              onClick={(e) => {
                e.stopPropagation();
                onDelete(lead);
              }}
            >
              Delete
            </button>
          ) : (
            <span style={{ color: 'var(--color-slate)', fontSize: 11 }}>—</span>
          )}
        </td>
      )}
    </tr>
  );
}
