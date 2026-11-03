import React from 'react';

/**
 * Pagination Component
 * Props:
 *   page         — current page number
 *   totalPages   — total number of pages
 *   total        — total records count
 *   startRecord  — first record index shown (1-based)
 *   endRecord    — last record index shown
 *   perPage      — current rows per page
 *   onPageChange — (n) => void
 *   onPerPageChange — (n) => void
 *   onExportCSV  — optional () => void — called when user clicks Export CSV
 */
export default function Pagination({
  page,
  totalPages,
  total,
  startRecord,
  endRecord,
  perPage,
  onPageChange,
  onPerPageChange,
  onExportCSV,
}) {
  if (total === 0) return null;

  // Build the page number buttons with ellipsis
  const buildPages = () => {
    const pages = [];
    const delta = 2; // pages around current
    const left  = Math.max(2, page - delta);
    const right = Math.min(totalPages - 1, page + delta);

    pages.push(1);
    if (left > 2) pages.push('...');
    for (let i = left; i <= right; i++) pages.push(i);
    if (right < totalPages - 1) pages.push('...');
    if (totalPages > 1) pages.push(totalPages);

    return pages;
  };

  const pages = buildPages();

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: 12,
      padding: '14px 18px',
      borderTop: '1px solid var(--border)',
      background: 'var(--bg-elevated)',
      borderRadius: '0 0 var(--radius-lg) var(--radius-lg)',
    }}>
      {/* Left: record count + per-page selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
          Showing <strong style={{ color: 'var(--text-primary)' }}>{startRecord}–{endRecord}</strong> of <strong style={{ color: 'var(--text-primary)' }}>{total.toLocaleString()}</strong> records
        </span>
        <select
          value={perPage}
          onChange={e => onPerPageChange(Number(e.target.value))}
          style={{
            padding: '5px 10px', borderRadius: 'var(--radius)',
            background: 'var(--bg)', border: '1px solid var(--border)',
            color: 'var(--text-primary)', fontSize: 12, cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          {[10, 25, 50, 100].map(n => (
            <option key={n} value={n}>{n} / page</option>
          ))}
        </select>

        {onExportCSV && (
          <button
            onClick={onExportCSV}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '5px 12px', borderRadius: 'var(--radius)',
              background: 'rgba(20, 184, 166, 0.12)', border: '1px solid rgba(20, 184, 166, 0.35)',
              boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.5), 0 2px 6px rgba(20, 184, 166, 0.15)',
              backdropFilter: 'blur(8px)',
              color: 'var(--teal)', fontSize: 12, fontWeight: 800, cursor: 'pointer',
              transition: 'var(--transition)',
            }}
            title="Export all data as CSV"
          >
            ⬇ CSV
          </button>
        )}
      </div>

      {/* Right: page navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
        <NavBtn label="«" onClick={() => onPageChange(1)} disabled={page === 1} title="First page" />
        <NavBtn label="‹" onClick={() => onPageChange(page - 1)} disabled={page === 1} title="Previous page" />

        {pages.map((p, idx) =>
          p === '...' ? (
            <span key={`ellipsis-${idx}`} style={{ padding: '0 4px', color: 'var(--text-muted)', userSelect: 'none' }}>…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              style={{
                minWidth: 34, height: 32, borderRadius: 'var(--radius)',
                border: p === page ? '1px solid var(--gold)' : '1px solid var(--border)',
                background: p === page ? 'var(--gold)' : 'var(--bg)',
                color: p === page ? '#000' : 'var(--text-primary)',
                fontWeight: p === page ? 800 : 500, fontSize: 13,
                cursor: 'pointer', transition: 'var(--transition)',
                flexShrink: 0
              }}
            >{p}</button>
          )
        )}

        <NavBtn label="›" onClick={() => onPageChange(page + 1)} disabled={page === totalPages} title="Next page" />
        <NavBtn label="»" onClick={() => onPageChange(totalPages)} disabled={page === totalPages} title="Last page" />
      </div>
    </div>
  );
}

function NavBtn({ label, onClick, disabled, title }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        minWidth: 32, height: 32, borderRadius: 'var(--radius)',
        border: '1px solid var(--border)',
        background: disabled ? 'transparent' : 'var(--bg)',
        color: disabled ? 'var(--text-muted)' : 'var(--text-primary)',
        fontWeight: 700, fontSize: 14, cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.4 : 1, transition: 'var(--transition)',
        flexShrink: 0
      }}
    >{label}</button>
  );
}
