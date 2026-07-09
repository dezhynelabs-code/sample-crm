import { useMemo } from 'react';
import type { Lead } from '@/types/lead';
import { Card, CardHeader } from '@/components/ui/Card';
import { Table } from '@/components/ui/Table';

// Ported from renderLeaderboard() in the original app.js. Hidden entirely
// for Sales Executives at the page level (a "leaderboard of one" doesn't
// mean anything — see DashboardPage).
export function Leaderboard({ leads }: { leads: Lead[] }) {
  // useMemo only to keep the per-row random "Avg. Response" stable across
  // re-renders within a session, matching the original's one-render-per-
  // recalculation behavior rather than jittering on every keystroke.
  const rows = useMemo(() => {
    const byOwner: Record<string, { total: number; won: number }> = {};
    leads.forEach((l) => {
      const owner = l.owner || 'Unassigned';
      if (!byOwner[owner]) byOwner[owner] = { total: 0, won: 0 };
      byOwner[owner].total++;
      if (l.status === 'WON') byOwner[owner].won++;
    });

    return Object.entries(byOwner)
      .filter(([owner]) => owner !== 'Unassigned')
      .sort((a, b) => b[1].won - a[1].won)
      .map(([owner, stats]) => ({
        owner,
        ...stats,
        avgResponse: Math.round(Math.random() * 15 + 3),
      }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leads]);

  return (
    <Card>
      <CardHeader>
        <h3>Rep Leaderboard</h3>
        <span className="card-sub">Ranked by leads won this period</span>
      </CardHeader>
      <Table>
        <thead>
          <tr>
            <th>Rep</th>
            <th>Leads</th>
            <th>Won</th>
            <th>Conv. %</th>
            <th>Avg. Response</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={5} style={{ color: 'var(--color-slate)' }}>
                No rep sales data generated yet
              </td>
            </tr>
          ) : (
            rows.map((r) => (
              <tr key={r.owner}>
                <td className="lead-name">{r.owner}</td>
                <td>{r.total}</td>
                <td>{r.won}</td>
                <td>{r.total ? Math.round((r.won / r.total) * 100) : 0}%</td>
                <td>{r.avgResponse} min</td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </Card>
  );
}
