import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const getPages = () => {
    const delta = 2;
    const range = [];
    const left = Math.max(1, currentPage - delta);
    const right = Math.min(totalPages, currentPage + delta);
    if (left > 1) { range.push(1); if (left > 2) range.push('...'); }
    for (let i = left; i <= right; i++) range.push(i);
    if (right < totalPages) { if (right < totalPages - 1) range.push('...'); range.push(totalPages); }
    return range;
  };

  const btn = 'flex items-center justify-center w-9 h-9 rounded-lg text-sm font-medium transition-all duration-200';

  return (
    <div className="flex items-center justify-center gap-1 py-6">
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}
        className={`${btn} text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed`}>
        <ChevronLeft size={16} />
      </button>
      {getPages().map((p, i) =>
        p === '...' ? (
          <span key={i} className="w-9 h-9 flex items-center justify-center text-gray-500 text-sm">…</span>
        ) : (
          <button key={p} onClick={() => onPageChange(p)}
            className={`${btn} ${currentPage === p ? 'bg-orange-500 text-white shadow-md shadow-orange-900/40' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}>
            {p}
          </button>
        )
      )}
      <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}
        className={`${btn} text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed`}>
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
