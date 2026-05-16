"use client";

import { useState, use } from "react";
import InventoryReportStats from "./InventoryReportStats";
import InventoryOverviewTable from "./InventoryOverviewTable";
import { useTranslations } from "next-intl";
import AddMenuModal from "@/components/modal/AddMenuModal";

const InventoryReportPage = ({ params }: { params?: Promise<{ locale: string }> }) => {
  if (params) use(params);
  const t = useTranslations("Inventory");
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div>
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t("title")}</h1>
          <p className="text-sm text-gray-400 mt-1">{t("subtitle")}</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
        >
          <span className="text-base leading-none">+</span> {t("addItem")}
        </button>
      </div>
      <InventoryReportStats />
      <InventoryOverviewTable />

      <AddMenuModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={(data) => {
          console.log("Saving item:", data);
          setIsModalOpen(false);
        }}
      />
    </div>
  );
};

export default InventoryReportPage;