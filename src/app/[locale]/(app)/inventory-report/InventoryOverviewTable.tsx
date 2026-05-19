"use client";
import { useTranslations, useLocale } from "next-intl";
import { InventoryItem } from "@/redux/features/dashboard/dashboard.type";

type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

interface InventoryOverviewTableProps {
  items?: InventoryItem[];
  isLoading?: boolean;
}

const InventoryOverviewTable = ({ items, isLoading }: InventoryOverviewTableProps) => {
  const t = useTranslations("Inventory");
  const locale = useLocale();
  // console.log(items)
  
  const statusBadge: Record<StockStatus, { label: string; className: string }> = {
    in_stock:     { label: t("inStock") || "In Stock",     className: "bg-green-500 text-white" },
    low_stock:    { label: t("lowStock") || "Low Stock",    className: "bg-orange-400 text-white" },
    out_of_stock: { label: t("outOfStock") || "Out of Stock", className: "bg-red-500 text-white" },
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden h-[340px] animate-pulse p-4">
        <div className="h-6 w-48 bg-slate-100 rounded mb-4" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex justify-between border-t border-slate-50 pt-3">
              <div className="h-4 w-40 bg-slate-50 rounded" />
              <div className="h-4 w-20 bg-slate-50 rounded" />
              <div className="h-4 w-12 bg-slate-50 rounded" />
              <div className="h-5 w-16 bg-slate-50 rounded-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Filter items that have managed stock quantity
  const itemsToRender = items ?? [];

  return (
    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
      <h2 className="text-sm font-semibold text-gray-800 px-4 py-4">
        {t("inventoryOverview")}
      </h2>
      <div className="overflow-x-auto p-4">
        <table className="w-full text-sm border-collapse table-fixed">
          <thead className="border-t border-b border-gray-100 text-gray-900 font-semibold bg-slate-50/50">
            <tr>
              <th className="text-left px-4 py-3 w-[35%]">{t("item")}</th>
              <th className="text-left px-4 py-3 w-[20%]">Price</th>
              <th className="text-left px-4 py-3 w-[25%]">
                {locale === "id" ? "Jumlah Inventaris" : "Inventory Quantity"}
              </th>
              <th className="text-left px-4 py-3 w-[20%]">{t("status")}</th>
            </tr>
          </thead>
          <tbody>
            {itemsToRender.map((item) => {
              // Calculate status badge based on isOutOfStock and inventoryQty
              let status: StockStatus = "in_stock";
              if (item.isOutOfStock) {
                status = "out_of_stock";
              } else if (item.inventoryQty !== null && item.inventoryQty <= 10) {
                status = "low_stock";
              }
              
              const badge = statusBadge[status];
              const displayQty = item.inventoryQty !== null ? item.inventoryQty : "-";
              const formattedPrice = `Rp ${Number(item.price).toLocaleString("en-US")}`;

              return (
                <tr key={item.id} className="border-t border-gray-50 hover:bg-slate-50/50 transition-colors">
                  {/* Item Image Thumbnail and Name */}
                  <td className="px-4 py-3 text-gray-900 font-medium flex items-center gap-3 overflow-hidden text-ellipsis whitespace-nowrap">
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-8 h-8 rounded-lg object-cover border border-slate-100 flex-shrink-0"
                      />
                    )}
                    <span className="truncate">{item.name}</span>
                  </td>
                  
                  {/* Price */}
                  <td className="px-4 py-3 text-left text-gray-900 font-semibold">{formattedPrice}</td>
                  
                  {/* Closing Stock Quantity */}
                  <td className="px-4 py-3 text-left text-gray-900 font-semibold">{displayQty}</td>
                  
                  {/* Status Badge */}
                  <td className="px-4 py-3 text-left">
                    <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full ${badge.className}`}>
                      {badge.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryOverviewTable;