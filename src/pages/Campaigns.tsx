import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCampaigns } from '../api/campaigns';
import { CampaignModal } from '../components/campaigns/CampaignModal';
import { Plus, Download } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';

export const Campaigns = () => {
  const { profile } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: getCampaigns,
  });

  const totalSpend = campaigns.reduce((sum, c) => sum + c.spend, 0);
  const totalLeads = campaigns.reduce((sum, c) => sum + c.leads_gen, 0);
  const cpl = totalLeads ? (totalSpend / totalLeads).toFixed(2) : '0.00';
  const activeCampaigns = campaigns.filter(c => c.status === 'ACTIVE').length;

  const canManageCampaigns = profile?.role === 'ADMIN' || profile?.role === 'MANAGER';

  return (
    <div className="animate-[viewFadeIn_0.25s_cubic-bezier(0.4,0,0.2,1)]">
      <div className="flex flex-wrap items-end justify-between gap-5 mb-6">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight m-0 text-ink">Campaigns</h1>
          <p className="mt-1 text-[13.5px] text-slate">Track ROI and performance across all integrated lead sources.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-[18px] py-[9px] rounded-md text-[13px] font-semibold transition-all duration-fast bg-mist text-ink border border-line hover:bg-line active:scale-[0.97]">
            <Download size={16} /> Export Data
          </button>
          {canManageCampaigns && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-[18px] py-[9px] rounded-md text-[13px] font-semibold transition-all duration-fast bg-accent text-white hover:bg-accent-hover active:scale-[0.97]"
            >
              <Plus size={16} /> New Campaign
            </button>
          )}
        </div>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
        <div className="bg-paper border border-line rounded-md shadow-card p-5 relative overflow-hidden transition-all duration-fast hover:-translate-y-0.5 hover:shadow-modal hover:border-accent">
          <div className="text-[12px] font-semibold text-slate uppercase tracking-wider mb-2">Total Ad Spend</div>
          <div className="text-[28px] font-bold text-ink leading-none font-mono">${totalSpend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>
        <div className="bg-paper border border-line rounded-md shadow-card p-5 relative overflow-hidden transition-all duration-fast hover:-translate-y-0.5 hover:shadow-modal hover:border-accent">
          <div className="text-[12px] font-semibold text-slate uppercase tracking-wider mb-2">Avg. CPL (Cost Per Lead)</div>
          <div className="text-[28px] font-bold text-ink leading-none font-mono">${cpl}</div>
        </div>
        <div className="bg-paper border border-line rounded-md shadow-card p-5 relative overflow-hidden transition-all duration-fast hover:-translate-y-0.5 hover:shadow-modal hover:border-accent">
          <div className="text-[12px] font-semibold text-slate uppercase tracking-wider mb-2">Active Campaigns</div>
          <div className="text-[28px] font-bold text-ink leading-none font-mono">{activeCampaigns}</div>
        </div>
      </section>

      <section className="bg-paper border border-line rounded-md shadow-card mb-6">
        <div className="px-5 py-4 border-b border-line flex justify-between items-center">
          <h3 className="m-0 text-[15px] font-bold text-ink">Campaign Performance</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr>
                <th className="text-left text-[11px] uppercase tracking-wider text-slate font-semibold px-5 py-3 border-b border-line">Campaign</th>
                <th className="text-left text-[11px] uppercase tracking-wider text-slate font-semibold px-5 py-3 border-b border-line">Status</th>
                <th className="text-left text-[11px] uppercase tracking-wider text-slate font-semibold px-5 py-3 border-b border-line">Spend</th>
                <th className="text-left text-[11px] uppercase tracking-wider text-slate font-semibold px-5 py-3 border-b border-line">Leads Gen</th>
                <th className="text-left text-[11px] uppercase tracking-wider text-slate font-semibold px-5 py-3 border-b border-line">CPL</th>
                <th className="text-left text-[11px] uppercase tracking-wider text-slate font-semibold px-5 py-3 border-b border-line">Started</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} className="text-center py-10 text-slate">Loading campaigns...</td></tr>
              ) : campaigns.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-10 text-slate">No campaigns found. Create one to get started.</td></tr>
              ) : (
                campaigns.map(campaign => {
                  const campCpl = campaign.leads_gen ? (campaign.spend / campaign.leads_gen).toFixed(2) : '0.00';
                  return (
                    <tr key={campaign.id} className="hover:bg-mist transition-colors border-b border-line last:border-b-0">
                      <td className="px-5 py-3 align-middle">
                        <div className="font-[650] text-ink">{campaign.name}</div>
                        {campaign.subtitle && <div className="text-[11px] text-slate mt-0.5">{campaign.subtitle}</div>}
                      </td>
                      <td className="px-5 py-3 align-middle">
                        <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${
                          campaign.status === 'ACTIVE' 
                            ? 'bg-[#d1fae5] text-[#059669] dark:bg-[#064e3b] dark:text-[#6ee7b7]' 
                            : 'bg-[#f3f4f6] text-[#4b5563] dark:bg-[#1f2937] dark:text-[#9ca3af]'
                        }`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                          {campaign.status === 'ACTIVE' ? 'Active' : 'Ended'}
                        </span>
                      </td>
                      <td className="px-5 py-3 align-middle font-mono font-medium">${Number(campaign.spend).toLocaleString()}</td>
                      <td className="px-5 py-3 align-middle font-mono font-medium">{campaign.leads_gen}</td>
                      <td className="px-5 py-3 align-middle font-mono font-medium">${campCpl}</td>
                      <td className="px-5 py-3 align-middle text-[11px] font-mono text-slate">
                        {formatDistanceToNow(new Date(campaign.created_at), { addSuffix: true })}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {isModalOpen && (
        <CampaignModal onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
};
