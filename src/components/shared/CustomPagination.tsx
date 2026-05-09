"use client";
import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CustomPaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const CustomPagination = ({ currentPage, totalPages, onPageChange }: CustomPaginationProps) => {

    const getPageNumbers = () => {
        const pages: (number | string)[] = [];

        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
            return pages;
        }

        pages.push(1);
        if (currentPage > 3) pages.push("...");

        const start = Math.max(2, currentPage - 1);
        const end = Math.min(totalPages - 1, currentPage + 1);

        for (let i = start; i <= end; i++) pages.push(i);

        if (currentPage < totalPages - 2) pages.push("...");
        pages.push(totalPages);

        return pages;
    };

    return (
        <div className="flex items-center justify-center gap-1 py-4 flex-wrap">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-3 py-1.5 rounded-md text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
                <ChevronLeft size={15} />
                <span className="hidden sm:inline">Previous</span>
            </button>

            {getPageNumbers().map((page, idx) =>
                page === "..." ? (
                    <span key={`ellipsis-${idx}`} className="px-2 text-gray-400 text-sm">
                        ...
                    </span>
                ) : (
                    <button
                        key={page}
                        onClick={() => onPageChange(Number(page))}
                        className={`w-8 h-8 rounded-md text-sm font-medium transition-all ${currentPage === page
                                ? "bg-blue-600 text-white"
                                : "text-gray-600 hover:bg-gray-100"
                            }`}
                    >
                        {page}
                    </button>
                )
            )}

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-3 py-1.5 rounded-md text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight size={15} />
            </button>
        </div>
    );
};

export default CustomPagination;