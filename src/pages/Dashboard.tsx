import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getLeads } from '../api/leads';
import { LeadsTable } from '../components/leads/LeadsTable';
import { LeadDrawer } from '../components/leads/LeadDrawer';
import type { Lead } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { SOURCE_LABELS, SOURCE_COLORS } from '../types';

export const Dashboard = () => {
  const [range, setRange] = useState(30);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ['leads'],
    queryFn: getLeads,
  });

  // Calculate metrics
  const totalLeads = leads.length;
  const wonLeads = leads.filter(l => l.status === 'WON').length;
  const winRate = totalLeads ? Math.round((wonLeads / totalLeads) * 100) : 0;
  const activeProposals = leads.filter(l => l.status === 'PROPOSAL' || l.status === 'NEGOTIATION').length;
  const avgScore = totalLeads ? Math.round(leads.reduce((sum, l) => sum + l.score, 0) / totalLeads) : 0;

  // Funnel data
  const funnelStages = [
    { label: 'New', count: leads.filter(l => l.status === 'NEW').length },
    { label: 'Contacted', count: leads.filter(l => l.status === 'CONTACTED').length },
    { label: 'Qualified', count: leads.filter(l => l.status === 'QUALIFIED').length },
    { label: 'Proposal', count: leads.filter(l => l.status === 'PROPOSAL' || l.status === 'NEGOTIATION').length },
    { label: 'Won', count: wonLeads }
  ];

  // Donut chart data
  const sourceData = Object.keys(SOURCE_LABELS).map(source => {
    return {
      name: SOURCE_LABELS[source as keyof typeof SOURCE_LABELS],
      value: leads.filter(l => l.source === source).length,
      color: SOURCE_COLORS[source as keyof typeof SOURCE_COLORS]
    };
  }).filter(d => d.value > 0);

  // Leaderboard data
  const reps = leads.reduce((acc, lead) => {
    if (!lead.owner) return acc;
    const name = lead.owner.full_name;
    if (!acc[name]) acc[name] = { name, leads: 0, won: 0, score: 0 };
    acc[name].leads += 1;
    acc[name].score += lead.score;
    if (lead.status === 'WON') acc[name].won += 1;
    return acc;
  }, {} as Record<string, { name: string, leads: number, won: number, score: number }>);
  
  const leaderboard = Object.values(reps).map(rep => ({
    ...rep,
    convRate: rep.leads ? Math.round((rep.won / rep.leads) * 100) : 0
  })).sort((a, b) => b.won - a.won);

  return (
    <div className="animate-[viewFadeIn_0.25s_cubic-bezier(0.4,0,0.2,1)]">
      <div className="flex flex-wrap items-end justify-between gap-5 mb-6">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight m-0 text-ink">Admin Dashboard</h1>
          <p className="mt-1 text-[13.5px] text-slate">Org-wide pipeline health, updated in real time.</p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={range}
            onChange={(e) => setRange(Number(e.target.value))}
            className="bg-paper border border-line rounded-md px-3 py-2 text-[13px] font-semibold text-ink outline-none cursor-pointer focus:border-accent transition-colors"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </div>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">
        <div className="bg-paper border border-line rounded-md shadow-card p-5 relative overflow-hidden transition-all duration-fast hover:-translate-y-0.5 hover:shadow-modal hover:border-accent">
          <div className="text-[12px] font-semibold text-slate uppercase tracking-wider mb-2">Total Leads</div>
          <div className="text-[28px] font-bold text-ink leading-none font-mono">{totalLeads}</div>
        </div>
        <div className="bg-paper border border-line rounded-md shadow-card p-5 relative overflow-hidden transition-all duration-fast hover:-translate-y-0.5 hover:shadow-modal hover:border-accent">
          <div className="text-[12px] font-semibold text-slate uppercase tracking-wider mb-2">Win Rate</div>
          <div className="text-[28px] font-bold text-ink leading-none font-mono">{winRate}%</div>
        </div>
        <div className="bg-paper border border-line rounded-md shadow-card p-5 relative overflow-hidden transition-all duration-fast hover:-translate-y-0.5 hover:shadow-modal hover:border-accent">
          <div className="text-[12px] font-semibold text-slate uppercase tracking-wider mb-2">Active Proposals</div>
          <div className="text-[28px] font-bold text-ink leading-none font-mono">{activeProposals}</div>
        </div>
        <div className="bg-paper border border-line rounded-md shadow-card p-5 relative overflow-hidden transition-all duration-fast hover:-translate-y-0.5 hover:shadow-modal hover:border-accent">
          <div className="text-[12px] font-semibold text-slate uppercase tracking-wider mb-2">Avg. Lead Score</div>
          <div className="text-[28px] font-bold text-ink leading-none font-mono">{avgScore}</div>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-12 gap-6 mb-6">
        <div className="xl:col-span-8 bg-paper border border-line rounded-md shadow-card">
          <div className="px-5 py-4 border-b border-line flex justify-between items-center">
            <div>
              <h3 className="m-0 text-[15px] font-bold text-ink">Lead Funnel</h3>
              <span className="text-[12px] text-slate mt-1 block">New → Contacted → Qualified → Proposal → Won</span>
            </div>
          </div>
          <div className="p-6">
            <div className="flex justify-between items-end h-[240px] pt-4 relative">
              {funnelStages.map((stage, i) => {
                const max = Math.max(...funnelStages.map(s => s.count), 1);
                const height = Math.max((stage.count / max) * 100, 10);
                const isLast = i === funnelStages.length - 1;
                return (
                  <div key={stage.label} className="w-[18%] flex flex-col items-center gap-3 group relative">
                    <div className="font-mono font-bold text-[18px] text-ink">{stage.count}</div>
                    <div 
                      className={`w-full rounded-t-sm transition-all duration-base ${isLast ? 'bg-status-won' : 'bg-accent/80 group-hover:bg-accent'}`}
                      style={{ height: `${height}%` }}
                    />
                    <div className="text-[12px] font-semibold text-slate w-full text-center truncate">{stage.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="xl:col-span-4 bg-paper border border-line rounded-md shadow-card">
          <div className="px-5 py-4 border-b border-line">
            <h3 className="m-0 text-[15px] font-bold text-ink">Leads by Source</h3>
          </div>
          <div className="p-6 h-[288px]">
            {sourceData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sourceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {sourceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate">No data available</div>
            )}
          </div>
        </div>
      </section>

      <section className="bg-paper border border-line rounded-md shadow-card mb-6">
        <div className="px-5 py-4 border-b border-line">
          <h3 className="m-0 text-[15px] font-bold text-ink">Rep Leaderboard</h3>
          <span className="text-[12px] text-slate mt-1 block">Ranked by leads won this period</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-[13px]">
            <thead>
              <tr>
                <th className="text-left text-[11px] uppercase tracking-wider text-slate font-semibold px-5 py-3 border-b border-line">Rep</th>
                <th className="text-left text-[11px] uppercase tracking-wider text-slate font-semibold px-5 py-3 border-b border-line">Leads</th>
                <th className="text-left text-[11px] uppercase tracking-wider text-slate font-semibold px-5 py-3 border-b border-line">Won</th>
                <th className="text-left text-[11px] uppercase tracking-wider text-slate font-semibold px-5 py-3 border-b border-line">Conv. %</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.length > 0 ? leaderboard.map((rep, i) => (
                <tr key={rep.name} className="hover:bg-mist transition-colors border-b border-line last:border-b-0">
                  <td className="px-5 py-3 font-semibold flex items-center gap-3">
                    <span className="text-slate font-mono w-4">{i + 1}.</span>
                    {rep.name}
                  </td>
                  <td className="px-5 py-3">{rep.leads}</td>
                  <td className="px-5 py-3 text-status-won font-bold">{rep.won}</td>
                  <td className="px-5 py-3">{rep.convRate}%</td>
                </tr>
              )) : (
                <tr><td colSpan={4} className="text-center py-8 text-slate">No leads assigned</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bg-paper border border-line rounded-md shadow-card">
        <div className="px-5 py-4 border-b border-line">
          <h3 className="m-0 text-[15px] font-bold text-ink">Recent Leads</h3>
        </div>
        {isLoading ? (
          <div className="py-10 text-center text-slate">Loading...</div>
        ) : (
          <LeadsTable leads={leads.slice(0, 5)} onLeadClick={setSelectedLead} />
        )}
      </section>

      <LeadDrawer lead={selectedLead} onClose={() => setSelectedLead(null)} />
    </div>
  );
};
