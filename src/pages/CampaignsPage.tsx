import { useCampaigns } from '@/context/CampaignsContext';
import { useLeads } from '@/context/LeadsContext';
import { useOverlays } from '@/context/OverlaysContext';
import { useRole } from '@/context/RoleContext';
import { CampaignsKpis } from '@/components/campaigns/CampaignsKpis';
import { CampaignsTable } from '@/components/campaigns/CampaignsTable';

// Ported from the #view-campaigns pane in the original index.html.
// Admin can create/delete campaigns; Manager sees performance read-only
// (per the RBAC model established for this app).
export function CampaignsPage() {
  const { campaigns } = useCampaigns();
  const { scopedLeads } = useLeads();
  const { openNewCampaignModal } = useOverlays();
  const { currentRole } = useRole();

  return (
    <div className="view-pane active">
      <div className="page-header">
        <div>
          <h1>Campaign Management</h1>
          <p className="page-subtitle">Track spend, lead generation, and ROI across acquisition channels.</p>
        </div>
        <div className="page-actions">
          {currentRole === 'ADMIN' && (
            <button className="btn btn-primary" onClick={openNewCampaignModal}>
              + New Campaign
            </button>
          )}
        </div>
      </div>

      <CampaignsKpis campaigns={campaigns} leads={scopedLeads} />
      <CampaignsTable campaigns={campaigns} />
    </div>
  );
}
