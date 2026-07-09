import { useEffect, useState } from 'react';
import { useOverlays } from '@/context/OverlaysContext';
import { useLeads } from '@/context/LeadsContext';
import { useRole } from '@/context/RoleContext';
import { Drawer } from '@/components/ui/Drawer';
import { ScoreRing } from '@/components/ui/ScoreRing';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ActivityTimeline } from './ActivityTimeline';
import { SOURCE_LABELS, OWNER_OPTIONS } from '@/lib/constants';
import type { LeadStatus } from '@/types/lead';

const STATUS_OPTIONS: LeadStatus[] = [
  'NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST',
];

// Ported from openLeadDrawer() in the original app.js.
export function LeadDrawer() {
  const { leadDrawerLeadId, closeLeadDrawer } = useOverlays();
  const { leads, updateLead, deleteLead } = useLeads();
  const { currentRole, canManageLead } = useRole();

  const lead = leads.find((l) => l.id === leadDrawerLeadId) || null;

  const [status, setStatus] = useState<LeadStatus>('NEW');
  const [owner, setOwner] = useState('');
  const [notes, setNotes] = useState('');

  // Row-level guard: even if a lead id outside this role's scope somehow
  // reached here, block access rather than trusting the caller.
  const accessDenied = lead !== null && !canManageLead(lead);

  useEffect(() => {
    if (lead) {
      setStatus(lead.status);
      setOwner(lead.owner);
      setNotes(lead.notes || '');
    }
  }, [lead]);

  const canReassign = currentRole !== 'SALES_EXEC';
  const canDelete = currentRole === 'ADMIN';

  function handleSave() {
    if (!lead) return;
    updateLead(lead.id, { status, owner: canReassign ? owner : lead.owner, notes });
    closeLeadDrawer();
  }

  function handleDelete() {
    if (!lead) return;
    if (window.confirm(`Are you sure you want to permanently delete lead ${lead.firstName} ${lead.lastName}?`)) {
      deleteLead(lead.id);
      closeLeadDrawer();
    }
  }

  return (
    <Drawer isOpen={Boolean(lead)} onClose={closeLeadDrawer} title="Lead Profile">
      {lead && accessDenied && (
        <div style={{ padding: 24, textAlign: 'center', color: 'var(--color-slate)' }}>
          You don't have access to this lead.
        </div>
      )}

      {lead && !accessDenied && (
        <>
          <div className="drawer-avatar-section">
            <div className="drawer-avatar">
              {lead.firstName.charAt(0)}
              {lead.lastName ? lead.lastName.charAt(0) : ''}
            </div>
            <div className="drawer-lead-name">
              {lead.firstName} {lead.lastName || ''}
            </div>
            <div className="drawer-lead-status">
              <StatusBadge status={lead.status} />
            </div>
          </div>

          <div className="drawer-meta-section">
            <div className="drawer-meta-row">
              <span className="drawer-meta-lbl">Lead Score</span>
              <span className="drawer-meta-val">
                <ScoreRing score={lead.score} size={48} />
              </span>
            </div>
            <div className="drawer-meta-row">
              <span className="drawer-meta-lbl">Acquisition Source</span>
              <span className="drawer-meta-val">{SOURCE_LABELS[lead.source] || lead.source}</span>
            </div>
            <div className="drawer-meta-row">
              <span className="drawer-meta-lbl">Created Date</span>
              <span className="drawer-meta-val">{new Date(lead.createdAt).toLocaleString()}</span>
            </div>
          </div>

          <div className="drawer-timeline-section">
            <h4>Activity Timeline</h4>
            <div className="activity-timeline">
              <ActivityTimeline lead={lead} />
            </div>
          </div>

          <div className="drawer-actions-section">
            <h4>Pipeline Management</h4>
            <div className="form-group">
              <label>Sales Pipeline Status</label>
              <select
                className="filter-select w-100"
                value={status}
                onChange={(e) => setStatus(e.target.value as LeadStatus)}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0) + s.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Assigned Lead Representative</label>
              <select
                className="filter-select w-100"
                value={owner}
                disabled={!canReassign}
                title={canReassign ? undefined : 'Sales Executives cannot reassign leads'}
                onChange={(e) => setOwner(e.target.value)}
              >
                <option value="">Unassigned</option>
                {OWNER_OPTIONS.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Internal Activity Notes</label>
              <textarea
                className="drawer-notes-area"
                placeholder="Record feedback, interaction records, or qualification queries..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="drawer-actions-section" style={{ marginTop: 'auto', flexDirection: 'row', gap: 10 }}>
            <button className="btn btn-primary w-100" onClick={handleSave}>
              Save Changes
            </button>
            {canDelete && (
              <button className="btn btn-danger" title="Delete Lead" onClick={handleDelete}>
                🗑️
              </button>
            )}
          </div>
        </>
      )}
    </Drawer>
  );
}
