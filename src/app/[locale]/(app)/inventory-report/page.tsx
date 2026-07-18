"use client";
import { useState, use } from "react";
import InventoryReportStats from "./InventoryReportStats";
import InventoryOverviewTable from "./InventoryOverviewTable";
import { useTranslations } from "next-intl";
import { useGetInventoryReportQuery } from "@/redux/features/dashboard/dashboard.api";
import { ArrowUpRight, ArrowDownLeft, History } from "lucide-react";
import StockAdjustModal from "@/components/modal/StockAdjustModal";
import InventoryLogsModal from "@/components/modal/InventoryLogsModal";

const InventoryReportPage = ({ params }: { params?: Promise<{ locale: string }> }) => {
  if (params) use(params);
  const t = useTranslations("Inventory");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"in" | "out">("in");
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch paginated inventory data for the main overview table
  const { data: inventoryReportRes, isLoading, refetch } = useGetInventoryReportQuery({ page: currentPage, limit: 15 });
  const inventoryItems = inventoryReportRes?.data;
  const pagination = inventoryReportRes?.pagination;
  const totalPages = pagination?.pages || 1;
  const meta = inventoryReportRes?.meta;

  return (
    <div>
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{t("title")}</h1>
          <p className="text-sm text-slate-600 mt-1">{t("subtitle")}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setModalMode("in");
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors shadow-sm"
          >
            <ArrowUpRight size={16} /> {t("stockIn")}
          </button>
          <button
            onClick={() => {
              setModalMode("out");
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors shadow-sm"
          >
            <ArrowDownLeft size={16} /> {t("stockOut")}
          </button>
          <button
            onClick={() => {
              setIsHistoryOpen(true);
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors shadow-sm"
          >
            <History size={16} /> {t("history") || "History"}
          </button>
        </div>
      </div>
      
      <InventoryReportStats
        lowStockItems={meta?.lowStack}
        outOfStockItems={meta?.outOfStock}
        isLoading={isLoading}
      />
      
      <InventoryOverviewTable
        items={inventoryItems}
        isLoading={isLoading}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      <StockAdjustModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={modalMode}
        onSuccess={() => {
          refetch();
        }}
      />

      <InventoryLogsModal
        open={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
      />
    </div>
  );
};

export default InventoryReportPage;