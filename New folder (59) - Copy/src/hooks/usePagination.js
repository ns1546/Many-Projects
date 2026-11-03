import { useState, useEffect, useMemo } from 'react';

/**
 * usePagination
 * @param {Array}  data           - Full dataset
 * @param {number} defaultPerPage - Default rows per page (default 25)
 * @returns paginated slice + control helpers
 */
export function usePagination(data = [], defaultPerPage = 25) {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(defaultPerPage);

  // Reset to page 1 whenever data or perPage changes
  useEffect(() => { setPage(1); }, [data.length, perPage]);

  const totalPages = Math.max(1, Math.ceil(data.length / perPage));

  const paged = useMemo(() => {
    const start = (page - 1) * perPage;
    return data.slice(start, start + perPage);
  }, [data, page, perPage]);

  const goTo   = (p) => setPage(Math.min(Math.max(1, p), totalPages));
  const next   = () => goTo(page + 1);
  const prev   = () => goTo(page - 1);
  const first  = () => goTo(1);
  const last   = () => goTo(totalPages);

  const startRecord = data.length === 0 ? 0 : (page - 1) * perPage + 1;
  const endRecord   = Math.min(page * perPage, data.length);

  return {
    paged,
    page,
    perPage,
    totalPages,
    total: data.length,
    startRecord,
    endRecord,
    goTo,
    next,
    prev,
    first,
    last,
    setPerPage,
    hasPrev: page > 1,
    hasNext: page < totalPages,
  };
}
