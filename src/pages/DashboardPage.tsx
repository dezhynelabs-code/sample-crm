import { useLeads } from '@/context/LeadsContext';
import { useRole } from '@/context/RoleContext';
import { useOverlays } from '@/context/OverlaysContext';
import { useToast } from '@/context/ToastContext';
import { ROLES } from '@/lib/constants';
import { KpiGrid } from '@/components/dashboard/KpiGrid';
import { FunnelChart } from '@/components/dashboard/FunnelChart';
import { SourceDonut } from '@/components/dashboard/SourceDonut';
import { Leaderboard } from '@/components/dashboard/Leaderboard';
import { RecentLeadsCard } from '@/components/dashboard/RecentLeadsCard';

// Ported from the #view-dashboard pane in the original index.html.
// Header copy adapts per role, ported from the dashboard-header portion
// of applyRoleGating().
export function DashboardPage() {
  const { scopedLeads } = useLeads();
  const { currentRole } = useRole();
  const { openNewLeadModal } = useOverlays();
  const { showToast } = useToast();

  const headerCopy =
    currentRole === 'ADMIN'
      ? { title: 'Admin Dashboard', subtitle: 'Org-wide pipeline health, updated in real time.' }
      : currentRole === 'MANAGER'
        ? {
            title: 'Team Dashboard',
            subtitle: `Pipeline health for your team (${(ROLES.MANAGER.team ?? []).join(', ')}).`,
          }
        : { title: 'My Dashboard', subtitle: 'Your assigned leads and personal performance.' };

  return (
    <div className="view-pane active">
      <div className="page-header">
        <div>
          <h1>{headerCopy.title}</h1>
          <p className="page-subtitle">{headerCopy.subtitle}</p>
        </div>
        <div className="page-actions">
          <select
            className="range-select"
            defaultValue="30"
            onChange={(e) => showToast('Range filter updated: ' + e.target.options[e.target.selectedIndex].text)}
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
          <button className="btn btn-primary" onClick={openNewLeadModal}>
            + New Lead
          </button>
        </div>
      </div>

      <KpiGrid leads={scopedLeads} />

      <section className="grid-2">
        <FunnelChart leads={scopedLeads} />
        <SourceDonut leads={scopedLeads} />
      </section>

      {currentRole !== 'SALES_EXEC' && <Leaderboard leads={scopedLeads} />}

      <RecentLeadsCard leads={scopedLeads} />
    </div>
  );
}
