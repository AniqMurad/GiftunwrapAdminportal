import { useMemo, useState } from 'react';

export function usePagination(items, pageSize = 10) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(page, totalPages);

  const pageItems = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, safePage, pageSize]);

  return { page: safePage, setPage, totalPages, pageItems, pageSize };
}

export default function Pagination({ page, totalPages, onPageChange, totalItems, pageSize }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const windowSize = 1;
  for (let p = 1; p <= totalPages; p += 1) {
    if (p === 1 || p === totalPages || Math.abs(p - page) <= windowSize) {
      pages.push(p);
    } else if (pages[pages.length - 1] !== '…') {
      pages.push('…');
    }
  }

  const rangeStart = totalItems ? (page - 1) * pageSize + 1 : null;
  const rangeEnd = totalItems ? Math.min(page * pageSize, totalItems) : null;

  return (
    <div className="pagination-bar">
      {totalItems != null && (
        <span>
          Showing {rangeStart}–{rangeEnd} of {totalItems}
        </span>
      )}
      <div className="pagination-controls">
        <button
          type="button"
          className="pagination-page-btn"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          aria-label="Previous page"
        >
          <i className="bi bi-chevron-left" aria-hidden="true" />
        </button>
        {pages.map((p, idx) =>
          p === '…' ? (
            <span key={`ellipsis-${idx}`} style={{ padding: '0 0.25rem' }}>
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              className={`pagination-page-btn ${p === page ? 'active' : ''}`}
              onClick={() => onPageChange(p)}
              aria-current={p === page ? 'page' : undefined}
              aria-label={`Page ${p}`}
            >
              {p}
            </button>
          )
        )}
        <button
          type="button"
          className="pagination-page-btn"
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          aria-label="Next page"
        >
          <i className="bi bi-chevron-right" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
