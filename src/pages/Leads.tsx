import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getLeads } from '../api/leads';
import { LeadsTable } from '../components/leads/LeadsTable';
import { LeadsKanban } from '../components/leads/LeadsKanban';
import { LeadModal } from '../components/leads/LeadModal';
import { LeadDrawer } from '../components/leads/LeadDrawer';
import { Download, Plus, Search } from 'lucide-react';
import clsx from 'clsx';
import type { LeadSource, LeadStatus, Lead } from '../types';

export const Leads = () => {
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | ''>('');
  const [sourceFilter, setSourceFilter] = useState<LeadSource | ''>('');
  const [sortOrder, setSortOrder] = useState('newest');

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ['leads'],
    queryFn: getLeads,
  });

  // Filter and sort leads
  const filteredLeads = leads.filter(lead => {
    const fullName = `${lead.first_name} ${lead.last_name || ''}`.toLowerCase();
    const matchesSearch = fullName.includes(search.toLowerCase());
    const matchesStatus = statusFilter === '' || lead.status === statusFilter;
    const matchesSource = sourceFilter === '' || lead.source === sourceFilter;
    return matchesSearch && matchesStatus && matchesSource;
  }).sort((a, b) => {
    if (sortOrder === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    if (sortOrder === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    if (sortOrder === 'score-desc') return b.score - a.score;
    if (sortOrder === 'score-asc') return a.score - b.score;
    return 0;
  });

  return (
    <div className="animate-[viewFadeIn_0.25s_cubic-bezier(0.4,0,0.2,1)]">
      <div className="flex flex-wrap items-end justify-between gap-5 mb-6">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight m-0 text-ink">Leads Directory</h1>
          <p className="mt-1 text-[13.5px] text-slate">Manage, filter, and track all incoming organization leads.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-[18px] py-[9px] rounded-md text-[13px] font-semibold transition-all duration-fast bg-mist text-ink border border-line hover:bg-line active:scale-[0.97]">
            <Download size={16} /> Download Excel
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-[18px] py-[9px] rounded-md text-[13px] font-semibold transition-all duration-fast bg-accent text-white hover:bg-accent-hover active:scale-[0.97]"
          >
            <Plus size={16} /> Add Lead
          </button>
        </div>
      </div>

      <section className="bg-paper border border-line rounded-md shadow-card p-[22px]">
        <div className="flex items-center gap-2.5 mb-5 flex-wrap">
          <div className="flex gap-2 mr-4">
            <button 
              onClick={() => setViewMode('table')}
              className={clsx(
                "px-3 py-1.5 rounded-md text-[13px] font-semibold transition-all duration-fast border",
                viewMode === 'table' ? "bg-accent text-white border-accent" : "bg-mist text-slate border-line hover:bg-line"
              )}
            >
              Table
            </button>
            <button 
              onClick={() => setViewMode('kanban')}
              className={clsx(
                "px-3 py-1.5 rounded-md text-[13px] font-semibold transition-all duration-fast border",
                viewMode === 'kanban' ? "bg-accent text-white border-accent" : "bg-mist text-slate border-line hover:bg-line"
              )}
            >
              Kanban
            </button>
          </div>

          <div className="flex items-center gap-2.5 max-w-[260px] w-full bg-paper border border-line rounded-md px-3 py-[7px] focus-within:border-accent transition-colors duration-fast">
            <Search size={16} className="text-slate shrink-0" />
            <input 
              type="text" 
              placeholder="Search by name..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-transparent border-none outline-none text-[12.5px] text-ink w-full"
            />
          </div>

          <select 
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as LeadStatus | '')}
            className="bg-paper border border-line rounded-md px-3 py-[7px] text-[13px] text-ink outline-none cursor-pointer focus:border-accent transition-colors duration-fast"
          >
            <option value="">All Statuses</option>
            <option value="NEW">New</option>
            <option value="CONTACTED">Contacted</option>
            <option value="QUALIFIED">Qualified</option>
            <option value="PROPOSAL">Proposal</option>
            <option value="NEGOTIATION">Negotiation</option>
            <option value="WON">Won</option>
            <option value="LOST">Lost</option>
          </select>

          <select 
            value={sourceFilter}
            onChange={e => setSourceFilter(e.target.value as LeadSource | '')}
            className="bg-paper border border-line rounded-md px-3 py-[7px] text-[13px] text-ink outline-none cursor-pointer focus:border-accent transition-colors duration-fast"
          >
            <option value="">All Sources</option>
            <option value="META_LEAD_ADS">Meta Lead Ads</option>
            <option value="GOOGLE_ADS">Google Ads</option>
            <option value="WEBSITE_FORM">Website Form</option>
            <option value="LANDING_PAGE">Landing Page</option>
            <option value="WHATSAPP">WhatsApp</option>
            <option value="CSV_IMPORT">CSV Import</option>
            <option value="MANUAL_ENTRY">Manual Entry</option>
          </select>

          <select 
            value={sortOrder}
            onChange={e => setSortOrder(e.target.value)}
            className="bg-paper border border-line rounded-md px-3 py-[7px] text-[13px] text-ink outline-none cursor-pointer focus:border-accent transition-colors duration-fast"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="score-desc">Score: High to Low</option>
            <option value="score-asc">Score: Low to High</option>
          </select>
        </div>

        {isLoading ? (
          <div className="py-20 text-center text-slate">Loading leads...</div>
        ) : (
          viewMode === 'table' 
            ? <LeadsTable leads={filteredLeads} onLeadClick={setSelectedLead} /> 
            : <LeadsKanban leads={filteredLeads} onLeadClick={setSelectedLead} />
        )}
      </section>

      {isModalOpen && (
        <LeadModal onClose={() => setIsModalOpen(false)} />
      )}

      <LeadDrawer lead={selectedLead} onClose={() => setSelectedLead(null)} />
    </div>
  );
};
