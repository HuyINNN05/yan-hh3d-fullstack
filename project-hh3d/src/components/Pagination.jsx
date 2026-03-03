import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Pagination: phân trang đơn giản
 * @param {number}   currentPage  - Trang hiện tại (1-based)
 * @param {number}   totalPages   - Tổng số trang
 * @param {Function} onPageChange - Callback khi đổi trang
 */
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    // Tạo danh sách số trang hiển thị (tối đa 5, xung quanh trang hiện tại)
    const getPages = () => {
        const delta = 2;
        const range = [];
        for (
            let i = Math.max(1, currentPage - delta);
            i <= Math.min(totalPages, currentPage + delta);
            i++
        ) {
            range.push(i);
        }
        return range;
    };

    const pages = getPages();

    return (
        <div className="flex items-center justify-center gap-2 mt-8">
            {/* Prev */}
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg bg-[#1a1a1a] border border-gray-700 text-gray-400 hover:border-purple-500 hover:text-purple-400 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
                <ChevronLeft size={18} />
            </button>

            {/* First page + ellipsis */}
            {pages[0] > 1 && (
                <>
                    <button onClick={() => onPageChange(1)} className="px-3 py-1.5 rounded-lg bg-[#1a1a1a] border border-gray-700 text-gray-400 hover:border-purple-500 hover:text-purple-400 transition text-sm">
                        1
                    </button>
                    {pages[0] > 2 && <span className="text-gray-600 text-sm">…</span>}
                </>
            )}

            {/* Page numbers */}
            {pages.map(page => (
                <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`px-3 py-1.5 rounded-lg border text-sm transition ${
                        page === currentPage
                            ? 'bg-purple-600 border-purple-600 text-white font-semibold'
                            : 'bg-[#1a1a1a] border-gray-700 text-gray-400 hover:border-purple-500 hover:text-purple-400'
                    }`}
                >
                    {page}
                </button>
            ))}

            {/* Last page + ellipsis */}
            {pages[pages.length - 1] < totalPages && (
                <>
                    {pages[pages.length - 1] < totalPages - 1 && <span className="text-gray-600 text-sm">…</span>}
                    <button onClick={() => onPageChange(totalPages)} className="px-3 py-1.5 rounded-lg bg-[#1a1a1a] border border-gray-700 text-gray-400 hover:border-purple-500 hover:text-purple-400 transition text-sm">
                        {totalPages}
                    </button>
                </>
            )}

            {/* Next */}
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg bg-[#1a1a1a] border border-gray-700 text-gray-400 hover:border-purple-500 hover:text-purple-400 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
                <ChevronRight size={18} />
            </button>
        </div>
    );
};

export default Pagination;
