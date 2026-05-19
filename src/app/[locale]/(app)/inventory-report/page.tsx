"use client";
import { useState, use } from "react";
import InventoryReportStats from "./InventoryReportStats";
import InventoryOverviewTable from "./InventoryOverviewTable";
import { useTranslations } from "next-intl";
import { useGetInventoryReportQuery } from "@/redux/features/dashboard/dashboard.api";
import { ArrowUpRight, ArrowDownLeft } from "lucide-react";
import StockAdjustModal from "@/components/modal/StockAdjustModal";

const InventoryReportPage = ({ params }: { params?: Promise<{ locale: string }> }) => {
  if (params) use(params);
  const t = useTranslations("Inventory");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"in" | "out">("in");

  // Fetch live inventory data from API
  const { data: inventoryReportRes, isLoading, refetch } = useGetInventoryReportQuery();
  const inventoryItems = inventoryReportRes?.data;

  return (
    <div>
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>
          <p className="text-sm text-gray-400 mt-1">{t("subtitle")}</p>
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
        </div>
      </div>
      
      <InventoryReportStats items={inventoryItems} isLoading={isLoading} />
      
      <InventoryOverviewTable items={inventoryItems} isLoading={isLoading} />

      <StockAdjustModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={modalMode}
        onSuccess={() => refetch()}
      />
    </div>
  );
};

export default InventoryReportPage;