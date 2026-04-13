/**
 * Custom hook for pagination
 */

import { useState, useMemo } from 'react';

export const usePagination = (items, itemsPerPage = 10) => {
  const [currentPage, setCurrentPage] = useState(1);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return items.slice(startIndex, endIndex);
  }, [items, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(items.length / itemsPerPage);

  const goToPage = (page) => {
    const pageNum = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(pageNum);
  };

  const goToFirstPage = () => goToPage(1);

  const goToLastPage = () => goToPage(totalPages);

  const nextPage = () => goToPage(currentPage + 1);

  const prevPage = () => goToPage(currentPage - 1);

  return {
    paginatedData,
    currentPage,
    totalPages,
    goToPage,
    goToFirstPage,
    goToLastPage,
    nextPage,
    prevPage,
    totalItems: items.length,
    startIndex: (currentPage - 1) * itemsPerPage,
    endIndex: Math.min((currentPage - 1) * itemsPerPage + itemsPerPage, items.length),
  };
};
