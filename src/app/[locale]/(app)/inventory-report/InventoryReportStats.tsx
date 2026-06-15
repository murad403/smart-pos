import { AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { InventoryItem } from "@/redux/features/dashboard/dashboard.type";

interface InventoryReportStatsProps {
  lowStockItems?: InventoryItem[];
  outOfStockItems?: InventoryItem[];
  isLoading?: boolean;
}

const InventoryReportStats = ({ lowStockItems = [], outOfStockItems = [], isLoading }: InventoryReportStatsProps) => {
  const t = useTranslations("Inventory");

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-red-50/50 border border-red-100 rounded-xl p-4 h-24 animate-pulse">
          <div className="h-4 w-24 bg-red-100/80 rounded mb-3" />
          <div className="h-3.5 w-32 bg-red-100/50 rounded" />
        </div>
        <div className="bg-yellow-50/50 border border-yellow-100 rounded-xl p-4 h-24 animate-pulse">
          <div className="h-4 w-28 bg-yellow-100/80 rounded mb-3" />
          <div className="h-3.5 w-36 bg-yellow-100/50 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
      {/* Out of Stock Card */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle size={16} className="text-red-500" />
          <span className="text-sm font-semibold text-red-600">{t("outOfStock")}</span>
        </div>
        {outOfStockItems.length === 0 ? (
          <p className="text-sm text-red-400/80 font-medium">All items are in stock</p>
        ) : (
          <div className="space-y-1.5">
            {outOfStockItems.map((item) => (
              <p key={item.id} className="text-sm text-red-500 font-medium truncate">
                • {item.name}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* Low Stock Alert Card */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle size={16} className="text-yellow-500" />
          <span className="text-sm font-semibold text-yellow-600">{t("lowStockAlert")}</span>
        </div>
        {lowStockItems.length === 0 ? (
          <p className="text-sm text-yellow-600/80 font-medium">No low stock warnings</p>
        ) : (
          <div className="space-y-1.5">
            {lowStockItems.map((item) => (
              <p key={item.id} className="text-sm text-yellow-700 font-medium truncate">
                • {item.name} ({item.inventoryQty} {t("left")})
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryReportStats;