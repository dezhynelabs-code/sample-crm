import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createLead } from '../../api/leads';
import type { LeadSource, LeadStatus } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

interface LeadModalProps {
  onClose: () => void;
}

export const LeadModal = ({ onClose }: LeadModalProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [source, setSource] = useState<LeadSource>('MANUAL_ENTRY');
  const [status, setStatus] = useState<LeadStatus>('NEW');
  const [score, setScore] = useState<number>(70);
  const [assignToMe, setAssignToMe] = useState(false);

  const createMutation = useMutation({
    mutationFn: createLead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      onClose();
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      first_name: firstName,
      last_name: lastName,
      source,
      status,
      score,
      owner_id: assignToMe ? user?.id : undefined,
    });
  };

  return (
    <>
      <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-40 transition-opacity" onClick={onClose} />
      <div className="fixed top-[10%] left-1/2 -translate-x-1/2 bg-paper w-[90%] max-w-[500px] rounded-lg shadow-modal z-50 animate-[modalSlideUp_0.3s_cubic-bezier(0.34,1.56,0.64,1)]">
        <div className="flex items-center justify-between p-5 border-b border-line">
          <h3 className="font-bold text-[17px] m-0 text-ink">Create New Lead</h3>
          <button onClick={onClose} className="border-none bg-transparent text-[22px] cursor-pointer text-slate hover:text-ink leading-none">
            &times;
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-slate uppercase tracking-wider">First Name *</label>
              <input required value={firstName} onChange={e => setFirstName(e.target.value)} type="text" placeholder="John" className="bg-paper border border-line rounded px-3 py-2 text-[13px] text-ink outline-none focus:border-accent transition-colors" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-slate uppercase tracking-wider">Last Name</label>
              <input value={lastName} onChange={e => setLastName(e.target.value)} type="text" placeholder="Doe" className="bg-paper border border-line rounded px-3 py-2 text-[13px] text-ink outline-none focus:border-accent transition-colors" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-slate uppercase tracking-wider">Source</label>
              <select value={source} onChange={e => setSource(e.target.value as LeadSource)} className="bg-paper border border-line rounded px-3 py-2 text-[13px] text-ink outline-none focus:border-accent transition-colors">
                <option value="META_LEAD_ADS">Meta Lead Ads</option>
                <option value="GOOGLE_ADS">Google Ads</option>
                <option value="WEBSITE_FORM">Website Form</option>
                <option value="LANDING_PAGE">Landing Page</option>
                <option value="WHATSAPP">WhatsApp</option>
                <option value="CSV_IMPORT">CSV Import</option>
                <option value="MANUAL_ENTRY">Manual Entry</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-slate uppercase tracking-wider">Status</label>
              <select value={status} onChange={e => setStatus(e.target.value as LeadStatus)} className="bg-paper border border-line rounded px-3 py-2 text-[13px] text-ink outline-none focus:border-accent transition-colors">
                <option value="NEW">New</option>
                <option value="CONTACTED">Contacted</option>
                <option value="QUALIFIED">Qualified</option>
                <option value="PROPOSAL">Proposal</option>
                <option value="NEGOTIATION">Negotiation</option>
                <option value="WON">Won</option>
                <option value="LOST">Lost</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-slate uppercase tracking-wider">Lead Score (0-100) *</label>
              <input required value={score} onChange={e => setScore(Number(e.target.value))} type="number" min="0" max="100" className="bg-paper border border-line rounded px-3 py-2 text-[13px] text-ink outline-none focus:border-accent transition-colors" />
            </div>
            
            <div className="flex items-center gap-2 mt-auto pb-2">
              <input type="checkbox" id="assignMe" checked={assignToMe} onChange={e => setAssignToMe(e.target.checked)} className="cursor-pointer" />
              <label htmlFor="assignMe" className="text-[13px] text-ink cursor-pointer">Assign to me</label>
            </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-5 border-t border-line mt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-line bg-mist text-ink text-[13px] font-semibold rounded hover:bg-line transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={createMutation.isPending} className="px-4 py-2 border-none bg-accent text-white text-[13px] font-semibold rounded hover:bg-accent-hover transition-colors disabled:opacity-50">
              {createMutation.isPending ? 'Creating...' : 'Create Lead'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};
