import { useState } from 'react';

export function usePagination(initialPage = 1, pageSize = 10) {
  const [page, setPage] = useState(initialPage);

  const nextPage = () => setPage((p) => p + 1);
  const prevPage = () => setPage((p) => Math.max(1, p - 1));
  const goToPage = (newPage: number) => setPage(Math.max(1, newPage));

  return {
    page,
    limit: pageSize,
    nextPage,
    prevPage,
    goToPage,
    setPage,
  };
}
