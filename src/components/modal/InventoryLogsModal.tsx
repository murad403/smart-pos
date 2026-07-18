"use client";

import React, { useState, useEffect } from "react";
import { X, Loader2, History, ArrowUpRight, ArrowDownLeft, TrendingDown } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { useGetInventoryLogsQuery } from "@/redux/features/dashboard/dashboard.api";
import DateRangePicker from "@/components/shared/DateRangePicker";
import CustomPagination from "@/components/shared/CustomPagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "../ui/button";

interface InventoryLogsModalProps {
  open: boolean;
  onClose: () => void;
}

const InventoryLogsModal: React.FC<InventoryLogsModalProps> = ({ open, onClose }) => {
  const t = useTranslations("Inventory");
  const locale = useLocale();

  // Component States
  const [page, setPage] = useState(1);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  // Reset parameters when opening modal
  useEffect(() => {
    if (open) {
      setPage(1);
      setStartDate(null);
      setEndDate(null);
    }
  }, [open]);

  // Reset page when date filter changes
  useEffect(() => {
    setPage(1);
  }, [startDate, endDate]);

  // Helper to format Date to YYYY-MM-DD for API
  const formatDateForApi = (date: Date | null) => {
    if (!date) return undefined;
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  // Fetch Inventory Logs
  const { data: logsRes, isLoading, isFetching } = useGetInventoryLogsQuery(
    {
      page,
      limit: 15,
      startDate: formatDateForApi(startDate),
      endDate: formatDateForApi(endDate),
    },
    { skip: !open }
  );

  const logs = logsRes?.data ?? [];
  const totalPages = logsRes?.pagination?.pages ?? 1;

  // Format date for UI representation
  const formatDateTime = (dateString: string) => {
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString(locale === "id" ? "id-ID" : "en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const renderSkeleton = () => {
    return (
      <div className="overflow-x-auto border border-slate-100 rounded-xl">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
              <th className="px-4 py-3">{t("date") || "Date"}</th>
              <th className="px-4 py-3">{t("itemName") || "Item Name"}</th>
              <th className="px-4 py-3 text-center">{t("openingStock") || "Opening Stock"}</th>
              <th className="px-4 py-3 text-center">Change</th>
              <th className="px-4 py-3 text-center">{t("closingStock") || "Closing Stock"}</th>
              <th className="px-4 py-3">{t("remarks") || "Remarks"}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {[...Array(5)].map((_, idx) => (
              <tr key={idx}>
                <td className="px-4 py-4">
                  <Skeleton className="h-4 w-28" />
                </td>
                <td className="px-4 py-4">
                  <Skeleton className="h-4 w-36" />
                </td>
                <td className="px-4 py-4">
                  <Skeleton className="h-4 w-12 mx-auto" />
                </td>
                <td className="px-4 py-4">
                  <Skeleton className="h-6 w-16 rounded-full mx-auto" />
                </td>
                <td className="px-4 py-4">
                  <Skeleton className="h-4 w-12 mx-auto" />
                </td>
                <td className="px-4 py-4">
                  <Skeleton className="h-4 w-24" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 px-4 py-6 backdrop-blur-[2px]">
      <div className="relative w-full max-w-4xl rounded-2xl bg-white p-6 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        {/* Modal Header & Date Filter */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 mb-4 pr-8">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <History size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {t("inventoryHistory") || "Inventory History"}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {t("subtitle") || "Track stock levels and identify shortages"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <DateRangePicker
              startDate={startDate}
              endDate={endDate}
              onChange={(start, end) => {
                setStartDate(start);
                setEndDate(end);
              }}
            />
          </div>
          <a href={`${process.env.NEXT_PUBLIC_BASE_URL}/inventory/logs-export`}>
            <Button variant="outline" className="cursor-pointer">Download History</Button>
          </a>
        </div>

        {/* Table/List Area */}
        <div className="flex-1 overflow-y-auto min-h-75 relative">
          {isLoading || isFetching ? (
            renderSkeleton()
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="mb-4 p-3 rounded-full bg-slate-50 text-slate-400">
                <History size={36} />
              </div>
              <p className="text-sm font-semibold text-slate-700">
                {t("noLogsFound") || "No logs found."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-100 rounded-xl">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                    <th className="px-4 py-3">{t("date") || "Date"}</th>
                    <th className="px-4 py-3">{t("itemName") || "Item Name"}</th>
                    <th className="px-4 py-3 text-center">{t("openingStock") || "Opening Stock"}</th>
                    <th className="px-4 py-3 text-center">Change</th>
                    <th className="px-4 py-3 text-center">{t("closingStock") || "Closing Stock"}</th>
                    <th className="px-4 py-3">{t("remarks") || "Remarks"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {logs.map((log) => {
                    const hasStockIn = log.stockIn > 0;
                    const hasStockOut = log.stockOut > 0;
                    const hasStockSold = log.stockSold > 0;

                    return (
                      <tr key={log.id} className="hover:bg-slate-50/40 transition-colors">
                        <td className="px-4 py-3.5 whitespace-nowrap text-xs text-slate-500 font-medium">
                          {formatDateTime(log.createdAt || log.date)}
                        </td>
                        <td className="px-4 py-3.5 font-semibold text-slate-800">
                          {log.itemName}
                        </td>
                        <td className="px-4 py-3.5 text-center text-slate-500 font-mono font-medium">
                          {log.openingStock}
                        </td>
                        <td className="px-4 py-3.5 text-center whitespace-nowrap font-mono font-semibold">
                          {hasStockIn && (
                            <span className="inline-flex items-center gap-0.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                              <ArrowUpRight size={13} className="stroke-[2.5]" />
                              +{log.stockIn}
                            </span>
                          )}
                          {hasStockOut && (
                            <span className="inline-flex items-center gap-0.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700">
                              <ArrowDownLeft size={13} className="stroke-[2.5]" />
                              -{log.stockOut}
                            </span>
                          )}
                          {hasStockSold && (
                            <span className="inline-flex items-center gap-0.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                              <TrendingDown size={13} className="stroke-[2.5]" />
                              -{log.stockSold}
                            </span>
                          )}
                          {!hasStockIn && !hasStockOut && !hasStockSold && (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-center text-slate-900 font-mono font-semibold">
                          {log.closingStock}
                        </td>
                        <td className="px-4 py-3.5 text-slate-500 max-w-xs truncate text-xs" title={log.remarks || ""}>
                          {log.remarks || <span className="text-slate-300">—</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer Area - Pagination */}
        {!isLoading && !isFetching && logs.length > 0 && (
          <div className="border-t border-slate-100 pt-3 mt-4">
            <CustomPagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryLogsModal;