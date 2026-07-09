import { useMemo, useState } from 'react';
import type { Lead, LeadSource, LeadStatus } from '@/types/lead';
import { Card } from '@/components/ui/Card';
import { Table } from '@/components/ui/Table';
import { LeadTableRow } from './LeadTableRow';
import { SOURCE_LABELS } from '@/lib/constants';
import { useRole } from '@/context/RoleContext';
import { useLeads } from '@/context/LeadsContext';

const STATUS_OPTIONS: LeadStatus[] = [
  'NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST',
];
const SOURCE_OPTIONS = Object.keys(SOURCE_LABELS) as LeadSource[];

type SortOption = 'newest' | 'oldest' | 'score-desc' | 'score-asc';

// Ported from renderLeadsDirectory() in the original app.js.
export function LeadsDirectoryTable({ leads }: { leads: Lead[] }) {
  const { currentRole } = useRole();
  const { deleteLead } = useLeads();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [sort, setSort] = useState<SortOption>('newest');

  const filtered = useMemo(() => {
    let result = leads.filter((l) => {
      const fullName = `${l.firstName} ${l.lastName || ''}`.toLowerCase();
      const matchesSearch = fullName.includes(search.toLowerCase());
      const matchesStatus = !statusFilter || l.status === statusFilter;
      const matchesSource = !sourceFilter || l.source === sourceFilter;
      return matchesSearch && matchesStatus && matchesSource;
    });

    result = [...result];
    if (sort === 'newest') {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sort === 'oldest') {
      result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (sort === 'score-desc') {
      result.sort((a, b) => (b.score || 0) - (a.score || 0));
    } else if (sort === 'score-asc') {
      result.sort((a, b) => (a.score || 0) - (b.score || 0));
    }
    return result;
  }, [leads, search, statusFilter, sourceFilter, sort]);

  function handleDelete(lead: Lead) {
    if (window.confirm(`Delete lead ${lead.firstName} ${lead.lastName}?`)) {
      deleteLead(lead.id);
    }
  }

  return (
    <Card>
      <div className="toolbar-row">
        <div className="search-box inline-search">
          <span className="search-icon">⌕</span>
          <input
            type="text"
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0) + s.slice(1).toLowerCase()}
            </option>
          ))}
        </select>
        <select className="filter-select" value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)}>
          <option value="">All Sources</option>
          {SOURCE_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {SOURCE_LABELS[s]}
            </option>
          ))}
        </select>
        <select className="filter-select" value={sort} onChange={(e) => setSort(e.target.value as SortOption)}>
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="score-desc">Score: High to Low</option>
          <option value="score-asc">Score: Low to High</option>
        </select>
      </div>

      <Table>
        <thead>
          <tr>
            <th>Score</th>
            <th>Name</th>
            <th>Source</th>
            <th>Status</th>
            <th>Owner</th>
            <th>Created</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr>
              <td colSpan={7} style={{ color: 'var(--color-slate)', textAlign: 'center' }}>
                No leads found inside the directory
              </td>
            </tr>
          ) : (
            filtered.map((lead) => (
              <LeadTableRow
                key={lead.id}
                lead={lead}
                showActions
                onDelete={currentRole !== 'SALES_EXEC' ? handleDelete : undefined}
              />
            ))
          )}
        </tbody>
      </Table>
    </Card>
  );
}
