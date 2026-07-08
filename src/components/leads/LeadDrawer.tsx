import React from 'react';
import type { Lead } from '../../types';
import { StatusBadge, SourceChip } from './LeadsTable';
import { formatDistanceToNow, format } from 'date-fns';

interface LeadDrawerProps {
  lead: Lead | null;
  onClose: () => void;
}

export const LeadDrawer = ({ lead, onClose }: LeadDrawerProps) => {
  if (!lead) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-ink/40 backdrop-blur-sm z-40 transition-opacity" 
        onClick={onClose} 
      />
      
      <div className="fixed top-0 right-0 h-screen w-full max-w-[400px] bg-paper shadow-drawer z-50 flex flex-col animate-[drawerSlideIn_0.3s_cubic-bezier(0.23,1,0.32,1)] border-l border-line">
        
        <div className="flex items-center justify-between p-6 border-b border-line shrink-0">
          <h3 className="font-bold text-[18px] m-0 text-ink">Lead Profile</h3>
          <button 
            onClick={onClose} 
            className="border-none bg-mist w-8 h-8 rounded-full flex items-center justify-center cursor-pointer text-slate hover:bg-line hover:text-ink transition-colors"
          >
            &times;
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8">
          
          <div className="flex flex-col gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-[22px] font-bold text-ink leading-tight">
                  {lead.first_name} {lead.last_name || ''}
                </h2>
                <StatusBadge status={lead.status} />
              </div>
              <div className="text-[13px] text-slate mt-2 flex items-center gap-2">
                <span className="font-semibold text-ink">Source:</span>
                <SourceChip source={lead.source} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-mist p-4 rounded-md border border-line">
                <div className="text-[11px] font-semibold text-slate uppercase tracking-wider mb-1">Score</div>
                <div className="text-2xl font-mono font-bold text-ink">{lead.score}/100</div>
              </div>
              <div className="bg-mist p-4 rounded-md border border-line">
                <div className="text-[11px] font-semibold text-slate uppercase tracking-wider mb-1">Created</div>
                <div className="text-[13.5px] font-semibold text-ink mt-2">
                  {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
                </div>
              </div>
            </div>
            
            <div className="bg-mist p-4 rounded-md border border-line">
              <div className="text-[11px] font-semibold text-slate uppercase tracking-wider mb-2">Assigned Owner</div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center font-bold text-xs">
                  {lead.owner ? lead.owner.full_name.charAt(0) : '?'}
                </div>
                <div>
                  <div className="text-[13px] font-bold text-ink leading-tight">
                    {lead.owner ? lead.owner.full_name : 'Unassigned'}
                  </div>
                  {lead.owner && <div className="text-[11px] text-slate">{lead.owner.email}</div>}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-4">
            <h4 className="text-[14px] font-bold text-ink border-b border-line pb-2">Activity Timeline</h4>
            
            <div className="flex flex-col gap-4 relative">
              <div className="absolute left-2.5 top-2 bottom-2 w-px bg-line"></div>
              
              {lead.history && lead.history.length > 0 ? (
                lead.history.map((event, idx) => (
                  <div key={event.id || idx} className="flex gap-4 relative z-10">
                    <div className="w-5 h-5 rounded-full bg-mist border-2 border-paper flex items-center justify-center shrink-0 mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-accent"></div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="text-[13px] text-ink leading-snug">{event.label}</div>
                      <div className="text-[11px] font-mono text-slate">
                        {format(new Date(event.created_at), "MMM d, yyyy 'at' h:mm a")}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-[13px] text-slate pl-8">No activity recorded.</div>
              )}
            </div>
          </div>
          
        </div>
        
      </div>
    </>
  );
};
