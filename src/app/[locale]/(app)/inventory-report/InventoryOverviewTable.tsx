"use client";
import { useTranslations, useLocale } from "next-intl";
import { InventoryItem } from "@/redux/features/dashboard/dashboard.type";
import CustomPagination from "@/components/shared/CustomPagination";

type StockStatus = "in_stock" | "low_stock" | "out_of_stock";

interface InventoryOverviewTableProps {
  items?: InventoryItem[];
  isLoading?: boolean;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
}

const InventoryOverviewTable = ({
  items,
  isLoading,
  currentPage,
  totalPages,
  onPageChange,
}: InventoryOverviewTableProps) => {
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
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden h-85 animate-pulse p-4">
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
      <h2 className="text-sm font-semibold text-gray-800 px-4 py-4 border-b border-gray-100">
        {t("inventoryOverview")}
      </h2>
      <div className="p-4">
        {/* Mobile Card List View */}
        <div className="md:hidden divide-y divide-slate-100">
          {itemsToRender.map((item) => {
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
              <div key={item.id} className="py-3.5 first:pt-0 last:pb-0 flex flex-col gap-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-100 shrink-0"
                      />
                    )}
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 truncate text-sm">{item.name}</p>
                      <p className="text-xs font-semibold text-slate-500 mt-0.5">{formattedPrice}</p>
                    </div>
                  </div>
                  <span className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full ${badge.className}`}>
                    {badge.label}
                  </span>
                </div>
                
                <div className="flex justify-between items-center bg-slate-50/50 rounded-xl px-3 py-2 border border-slate-100">
                  <span className="text-xs font-medium text-slate-500">
                    {locale === "id" ? "Jumlah Inventaris" : "Inventory Quantity"}
                  </span>
                  <span className="text-sm font-bold text-slate-900">{displayQty}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm border-collapse table-fixed">
            <thead className="border-b border-gray-100 text-gray-900 font-semibold bg-slate-50/50">
              <tr>
                <th className="text-left px-4 py-3 w-[35%]">{t("item")}</th>
                <th className="text-left px-4 py-3 w-[20%]">Price</th>
                <th className="text-left px-4 py-3 w-[25%] whitespace-nowrap">
                  {locale === "id" ? "Jumlah Inventaris" : "Inventory Quantity"}
                </th>
                <th className="text-left px-4 py-3 w-[20%]">{t("status")}</th>
              </tr>
            </thead>
            <tbody>
              {itemsToRender.map((item) => {
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
                  <tr key={item.id} className="border-t border-gray-50 hover:bg-slate-50/50 transition-colors first:border-t-0">
                    <td className="px-4 py-3 text-gray-900 font-medium flex items-center gap-3 overflow-hidden text-ellipsis whitespace-nowrap">
                      {item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-8 h-8 rounded-lg object-cover border border-slate-100 shrink-0"
                        />
                      )}
                      <span className="truncate">{item.name}</span>
                    </td>
                    <td className="px-4 py-3 text-left text-gray-900 font-semibold">{formattedPrice}</td>
                    <td className="px-4 py-3 text-left text-gray-900 font-semibold">{displayQty}</td>
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

        {/* Pagination */}
        {!isLoading && totalPages && totalPages > 1 && onPageChange && currentPage && (
          <div className="mt-6 border-t border-slate-100 pt-4">
            <CustomPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={onPageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryOverviewTable;