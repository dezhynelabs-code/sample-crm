import { useState } from 'react';
import type { Lead, LeadStatus } from '@/types/lead';
import { Card, CardHeader } from '@/components/ui/Card';
import { Table } from '@/components/ui/Table';
import { LeadTableRow } from '@/components/leads/LeadTableRow';

const STATUS_OPTIONS: LeadStatus[] = [
  'NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST',
];

// Ported from renderRecentLeadsTable() in the original app.js.
export function RecentLeadsCard({ leads }: { leads: Lead[] }) {
  const [nameFilter, setNameFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filtered = leads
    .filter((l) => {
      const fullName = `${l.firstName} ${l.lastName || ''}`.toLowerCase();
      const matchesName = fullName.includes(nameFilter.toLowerCase());
      const matchesStatus = !statusFilter || l.status === statusFilter;
      return matchesName && matchesStatus;
    })
    .slice(0, 10);

  return (
    <Card>
      <CardHeader>
        <h3>Recent Leads</h3>
        <div className="filter-row">
          <input
            className="filter-input"
            placeholder="Filter by name…"
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
          />
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0) + s.slice(1).toLowerCase()}
              </option>
            ))}
          </select>
        </div>
      </CardHeader>
      <Table>
        <thead>
          <tr>
            <th>Score</th>
            <th>Name</th>
            <th>Source</th>
            <th>Status</th>
            <th>Owner</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr>
              <td colSpan={6} style={{ color: 'var(--color-slate)', textAlign: 'center' }}>
                No leads match this filter
              </td>
            </tr>
          ) : (
            filtered.map((lead) => <LeadTableRow key={lead.id} lead={lead} />)
          )}
        </tbody>
      </Table>
    </Card>
  );
}
