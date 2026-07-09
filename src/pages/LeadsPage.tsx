import { useLeads } from '@/context/LeadsContext';
import { useOverlays } from '@/context/OverlaysContext';
import { LeadsDirectoryTable } from '@/components/leads/LeadsDirectoryTable';

// Ported from the #view-leads pane in the original index.html.
export function LeadsPage() {
  const { scopedLeads } = useLeads();
  const { openNewLeadModal } = useOverlays();

  return (
    <div className="view-pane active">
      <div className="page-header">
        <div>
          <h1>Leads Directory</h1>
          <p className="page-subtitle">Manage, filter, and track all incoming organization leads.</p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={openNewLeadModal}>
            + Add Lead
          </button>
        </div>
      </div>

      <LeadsDirectoryTable leads={scopedLeads} />
    </div>
  );
}
