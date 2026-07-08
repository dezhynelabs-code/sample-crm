import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createCampaign } from '../../api/campaigns';
import type { CampaignStatus } from '../../types';

interface CampaignModalProps {
  onClose: () => void;
}

export const CampaignModal = ({ onClose }: CampaignModalProps) => {
  const queryClient = useQueryClient();
  
  const [name, setName] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [status, setStatus] = useState<CampaignStatus>('ACTIVE');
  const [spend, setSpend] = useState<number>(0);
  const [leadsGen, setLeadsGen] = useState<number>(0);

  const createMutation = useMutation({
    mutationFn: createCampaign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      onClose();
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      name,
      subtitle: subtitle || null,
      status,
      spend,
      leads_gen: leadsGen,
    });
  };

  return (
    <>
      <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-40 transition-opacity" onClick={onClose} />
      <div className="fixed top-[10%] left-1/2 -translate-x-1/2 bg-paper w-[90%] max-w-[500px] rounded-lg shadow-modal z-50 animate-[modalSlideUp_0.3s_cubic-bezier(0.34,1.56,0.64,1)]">
        <div className="flex items-center justify-between p-5 border-b border-line">
          <h3 className="font-bold text-[17px] m-0 text-ink">Create New Campaign</h3>
          <button onClick={onClose} className="border-none bg-transparent text-[22px] cursor-pointer text-slate hover:text-ink leading-none">
            &times;
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-slate uppercase tracking-wider">Campaign Name *</label>
            <input required value={name} onChange={e => setName(e.target.value)} type="text" placeholder="e.g. Meta Ads - Retargeting" className="bg-paper border border-line rounded px-3 py-2 text-[13px] text-ink outline-none focus:border-accent transition-colors" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-slate uppercase tracking-wider">Channel / Tracking Source</label>
            <input value={subtitle} onChange={e => setSubtitle(e.target.value)} type="text" placeholder="e.g. Meta Ads Integration" className="bg-paper border border-line rounded px-3 py-2 text-[13px] text-ink outline-none focus:border-accent transition-colors" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-slate uppercase tracking-wider">Status</label>
              <select value={status} onChange={e => setStatus(e.target.value as CampaignStatus)} className="bg-paper border border-line rounded px-3 py-2 text-[13px] text-ink outline-none focus:border-accent transition-colors">
                <option value="ACTIVE">Active</option>
                <option value="ENDED">Ended</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-slate uppercase tracking-wider">Spend ($)</label>
              <input required value={spend} onChange={e => setSpend(Number(e.target.value))} type="number" min="0" step="0.01" className="bg-paper border border-line rounded px-3 py-2 text-[13px] text-ink outline-none focus:border-accent transition-colors" />
            </div>
          </div>
          
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-slate uppercase tracking-wider">Leads Generated So Far</label>
            <input required value={leadsGen} onChange={e => setLeadsGen(Number(e.target.value))} type="number" min="0" className="bg-paper border border-line rounded px-3 py-2 text-[13px] text-ink outline-none focus:border-accent transition-colors" />
          </div>
          
          <div className="flex justify-end gap-3 pt-5 border-t border-line mt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-line bg-mist text-ink text-[13px] font-semibold rounded hover:bg-line transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={createMutation.isPending} className="px-4 py-2 border-none bg-accent text-white text-[13px] font-semibold rounded hover:bg-accent-hover transition-colors disabled:opacity-50">
              {createMutation.isPending ? 'Creating...' : 'Create Campaign'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};
