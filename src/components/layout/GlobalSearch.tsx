import { useEffect, useRef, useState } from 'react';
import { useLeads } from '@/context/LeadsContext';
import { useOverlays } from '@/context/OverlaysContext';
import { SOURCE_LABELS } from '@/lib/constants';
import { ScoreRing } from '@/components/ui/ScoreRing';
import { StatusBadge } from '@/components/ui/StatusBadge';

// Ported from initSearchAutoComplete() in the original app.js.
export function GlobalSearch() {
  const { scopedLeads } = useLeads();
  const { openLeadDrawer } = useOverlays();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const trimmed = query.toLowerCase().trim();
  const matches = trimmed
    ? scopedLeads
        .filter((l) => {
          const name = `${l.firstName} ${l.lastName || ''}`.toLowerCase();
          const source = (SOURCE_LABELS[l.source] || '').toLowerCase();
          return name.includes(trimmed) || source.includes(trimmed);
        })
        .slice(0, 5)
    : [];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false);
    }
    function handleShortcut(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    document.addEventListener('keydown', handleShortcut);
    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('keydown', handleShortcut);
    };
  }, []);

  function handleSelect(id: string) {
    openLeadDrawer(id);
    setIsOpen(false);
    setQuery('');
  }

  return (
    <div className="search-container" ref={containerRef}>
      <div className="search-box">
        <span className="search-icon">⌕</span>
        <input
          ref={inputRef}
          type="text"
          placeholder="Search leads, campaigns, people…"
          autoComplete="off"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(Boolean(e.target.value));
          }}
        />
        <kbd className="search-kbd">⌘K</kbd>
      </div>
      <div className={`search-dropdown ${isOpen ? 'show' : ''}`}>
        <div className="search-dropdown-header">Recent Leads</div>
        <div className="search-dropdown-results">
          {matches.length === 0 ? (
            <div style={{ padding: 14, textAlign: 'center', color: 'var(--color-slate)', fontSize: 12.5 }}>
              No match found
            </div>
          ) : (
            matches.map((l) => (
              <div key={l.id} className="search-dropdown-item" onClick={() => handleSelect(l.id)}>
                <div style={{ fontSize: 12 }}>
                  <ScoreRing score={l.score} size={24} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--color-ink)' }}>
                    {l.firstName} {l.lastName || ''}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--color-slate)', marginTop: 1 }}>
                    {SOURCE_LABELS[l.source]}
                  </div>
                </div>
                <div>
                  <StatusBadge status={l.status} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
