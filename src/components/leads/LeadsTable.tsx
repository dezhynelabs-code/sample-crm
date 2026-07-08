import React from 'react';
import type { Lead } from '../../types';
import { SOURCE_LABELS, SOURCE_COLORS } from '../../types';
import { formatDistanceToNow } from 'date-fns';

const ScoreRing = ({ score, size = 32 }: { score: number, size?: number }) => {
  const stroke = size <= 32 ? 3 : 4;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const center = size / 2;
  const fillColor = score >= 80 ? '#10b981' : score >= 50 ? '#4f46e5' : '#f59e0b';

  return (
    <div className={`relative inline-flex items-center justify-center ${size <= 32 ? 'w-[34px] h-[34px]' : 'w-16 h-16'}`} title={`Lead score: ${score}/100`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={center} cy={center} r={radius} fill="none" stroke="var(--color-line)" strokeWidth={stroke} />
        <circle cx={center} cy={center} r={radius} fill="none" stroke={fillColor} strokeWidth={stroke}
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`} />
      </svg>
      <span className={`absolute font-mono font-bold text-ink ${size <= 32 ? 'text-[10px]' : 'text-[17px]'}`}>{score}</span>
    </div>
  );
};

export const StatusBadge = ({ status }: { status: Lead['status'] }) => {
  const label = status.charAt(0) + status.slice(1).toLowerCase();
  
  const statusClasses: Record<Lead['status'], string> = {
    NEW: 'bg-[#e0e7ff] text-[#4338ca] dark:bg-[#1e1b4b] dark:text-[#a5b4fc]',
    CONTACTED: 'bg-[#fef3c7] text-[#d97706] dark:bg-[#451a03] dark:text-[#fcd34d]',
    QUALIFIED: 'bg-[#fef3c7] text-[#d97706] dark:bg-[#451a03] dark:text-[#fcd34d]',
    PROPOSAL: 'bg-[#fef3c7] text-[#d97706] dark:bg-[#451a03] dark:text-[#fcd34d]',
    NEGOTIATION: 'bg-[#fef3c7] text-[#d97706] dark:bg-[#451a03] dark:text-[#fcd34d]',
    WON: 'bg-[#d1fae5] text-[#059669] dark:bg-[#064e3b] dark:text-[#6ee7b7]',
    LOST: 'bg-[#f3f4f6] text-[#4b5563] dark:bg-[#1f2937] dark:text-[#9ca3af]',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${statusClasses[status]}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
      {label}
    </span>
  );
};

export const SourceChip = ({ source }: { source: Lead['source'] }) => {
  return (
    <span className="inline-flex items-center gap-1.5 text-[12.5px] text-slate font-medium">
      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: SOURCE_COLORS[source] || '#9ca3af' }}></span>
      {SOURCE_LABELS[source] || source}
    </span>
  );
};

export const LeadsTable = ({ leads, onLeadClick }: { leads: Lead[], onLeadClick?: (lead: Lead) => void }) => {
  if (leads.length === 0) {
    return <div className="text-center py-10 text-slate">No leads match this filter</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-[13px]">
        <thead>
          <tr>
            <th className="text-left text-[11px] uppercase tracking-wider text-slate font-semibold px-3 py-2.5 border-b border-line">Score</th>
            <th className="text-left text-[11px] uppercase tracking-wider text-slate font-semibold px-3 py-2.5 border-b border-line">Name</th>
            <th className="text-left text-[11px] uppercase tracking-wider text-slate font-semibold px-3 py-2.5 border-b border-line">Source</th>
            <th className="text-left text-[11px] uppercase tracking-wider text-slate font-semibold px-3 py-2.5 border-b border-line">Status</th>
            <th className="text-left text-[11px] uppercase tracking-wider text-slate font-semibold px-3 py-2.5 border-b border-line">Owner</th>
            <th className="text-left text-[11px] uppercase tracking-wider text-slate font-semibold px-3 py-2.5 border-b border-line">Created</th>
            <th className="text-left text-[11px] uppercase tracking-wider text-slate font-semibold px-3 py-2.5 border-b border-line">Action</th>
          </tr>
        </thead>
        <tbody>
          {leads.map(lead => (
            <tr key={lead.id} onClick={() => onLeadClick && onLeadClick(lead)} className="hover:bg-mist transition-colors duration-fast cursor-pointer border-b border-line last:border-b-0">
              <td className="px-3 py-3 align-middle"><ScoreRing score={lead.score} /></td>
              <td className="px-3 py-3 align-middle font-[650] text-ink">{lead.first_name} {lead.last_name || ''}</td>
              <td className="px-3 py-3 align-middle"><SourceChip source={lead.source} /></td>
              <td className="px-3 py-3 align-middle"><StatusBadge status={lead.status} /></td>
              <td className="px-3 py-3 align-middle">
                {lead.owner ? lead.owner.full_name : <span className="text-slate">Unassigned</span>}
              </td>
              <td className="px-3 py-3 align-middle font-mono text-xs text-slate">
                {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
              </td>
              <td className="px-3 py-3 align-middle">
                <button className="px-2 py-1 bg-mist text-ink border border-line rounded text-[11px] font-semibold hover:bg-line transition-colors">
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
