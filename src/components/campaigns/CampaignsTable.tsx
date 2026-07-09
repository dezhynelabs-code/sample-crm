import type { Campaign } from '@/types/campaign';
import { Card } from '@/components/ui/Card';
import { Table } from '@/components/ui/Table';
import { campaignCPL, campaignConvRate } from '@/lib/campaignMath';
import { useRole } from '@/context/RoleContext';
import { useCampaigns } from '@/context/CampaignsContext';

// Ported from renderCampaignsTable() in the original app.js.
export function CampaignsTable({ campaigns }: { campaigns: Campaign[] }) {
  const { currentRole } = useRole();
  const { deleteCampaign } = useCampaigns();

  function handleDelete(c: Campaign) {
    if (window.confirm(`Delete campaign "${c.name}"?`)) {
      deleteCampaign(c.id);
    }
  }

  return (
    <Card>
      <Table>
        <thead>
          <tr>
            <th>Campaign</th>
            <th>Status</th>
            <th>Spend</th>
            <th>Leads</th>
            <th>CPL</th>
            <th>Conv. Rate</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {campaigns.length === 0 ? (
            <tr>
              <td colSpan={7} style={{ color: 'var(--color-slate)', textAlign: 'center' }}>
                No campaigns yet
              </td>
            </tr>
          ) : (
            campaigns.map((c) => (
              <tr key={c.id}>
                <td className="lead-name">
                  {c.name}
                  <div className="lead-name-sub">{c.subtitle}</div>
                </td>
                <td>
                  <span className={`status-badge status-${c.status === 'active' ? 'WON' : 'LOST'}`}>
                    {c.status === 'active' ? 'Active' : 'Ended'}
                  </span>
                </td>
                <td>{c.spend > 0 ? `$${c.spend.toLocaleString()}` : '$0 (SEO)'}</td>
                <td>{c.leadsGen}</td>
                <td>${campaignCPL(c).toFixed(2)}</td>
                <td>{campaignConvRate(c)}%</td>
                <td>
                  {currentRole === 'ADMIN' ? (
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '4px 8px', fontSize: 11 }}
                      onClick={() => handleDelete(c)}
                    >
                      Delete
                    </button>
                  ) : (
                    <span style={{ color: 'var(--color-slate)', fontSize: 11 }}>—</span>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </Card>
  );
}
