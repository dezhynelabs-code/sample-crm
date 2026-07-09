import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { LeadDrawer } from '@/components/leads/LeadDrawer';
import { NewLeadModal } from '@/components/leads/NewLeadModal';
import { NewCampaignModal } from '@/components/campaigns/NewCampaignModal';

// Ported from the .shell / .sidebar / .main / .content structure in the
// original index.html. Route content renders through <Outlet/>; the
// global overlays (drawer + both "create" modals) are mounted once here,
// exactly like the original single #leadDrawer/#leadModal DOM nodes.
export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="shell">
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((v) => !v)}
        mobileOpen={mobileOpen}
      />

      <div className="main">
        <Topbar onToggleMobileSidebar={() => setMobileOpen((v) => !v)} />
        <main className="content">
          <Outlet />
        </main>
      </div>

      <LeadDrawer />
      <NewLeadModal />
      <NewCampaignModal />
    </div>
  );
}
