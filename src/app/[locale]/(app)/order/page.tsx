"use client";
import React, { useState } from "react";
import { Search, Eye, Filter, Calendar, Send } from "lucide-react";
import { useTranslations } from "next-intl";
import { useGetAllOrdersQuery, useSendOrderToProductionMutation } from "@/redux/features/order/order.api";
import CustomPagination from "@/components/shared/CustomPagination";
import OrderDetailsModal from "@/components/modal/OrderDetailsModal";
import { Order } from "@/redux/features/order/order.type";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

const OrdersPage = ({ params }: { params?: Promise<{ locale: string }> }) => {
  if (params) React.use(params);
  const t = useTranslations("Order");

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchValue, setDebouncedSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [sendingOrderId, setSendingOrderId] = useState<number | null>(null);

  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  // Debounce search query to avoid API spamming
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchValue(searchQuery);
      setCurrentPage(1);
    }, 450);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch orders from API with query params
  const { data: ordersRes, isLoading, isFetching } = useGetAllOrdersQuery({
    page: currentPage,
    limit: 10,
    status: statusFilter || undefined,
    source: sourceFilter || undefined,
    date: dateFilter || undefined,
    search: debouncedSearchValue.trim() || undefined,
  });
  const [sendOrderToProduction] = useSendOrderToProductionMutation();

  const orders = ordersRes?.data ?? [];
  
  const pagination = ordersRes?.pagination;
  const totalPages = pagination?.totalPages ?? 1;

  const handleSendToProduction = async (orderId: number) => {
    try {
      setSendingOrderId(orderId);
      await sendOrderToProduction(orderId).unwrap();
      toast.success("Order sent to production successfully");
    } catch (error: unknown) {
      const apiError = error as { data?: { message?: string }; message?: string };
      toast.error(apiError?.data?.message || apiError?.message || "Failed to send order to production");
    } finally {
      setSendingOrderId(null);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "PENDING_PROCESSING":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "PROCESSING":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "READY":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "PICKED_UP":
        return "bg-slate-100 text-slate-700 border-slate-200";
      case "CANCELLED":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getSourceBadgeClass = (source: string) => {
    switch (source) {
      case "STAFF":
        return "bg-violet-50 text-violet-700 border-violet-200";
      case "QR_TABLE":
        return "bg-teal-50 text-teal-700 border-teal-200";
      case "TOUCHSCREEN":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "ADMIN":
        return "bg-pink-50 text-pink-700 border-pink-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const formatCurrency = (value: string | number) => {
    const numericValue = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(numericValue)) return "Rp 0";
    return `Rp ${numericValue.toLocaleString("en-US")}`;
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-[32px] font-bold tracking-tight text-slate-900">{t("title") || "Orders"}</h1>
          <p className="mt-1 text-slate-500">{t("subtitle") || "Monitor and filter all customer and table orders."}</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="rounded-[24px] border border-slate-100 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] sm:p-8">
        
        {/* Filter and Search Bar */}
        <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-blue-600" />
            <h2 className="text-[12px] font-bold uppercase tracking-wider text-blue-600">Filters</h2>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto xl:justify-end">
            
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-11 min-w-35 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
            >
              <option value="">{t("allStatus") || "All Status"}</option>
              <option value="PENDING">PENDING</option>
              <option value="PENDING_PROCESSING">PENDING PROCESSING</option>
              <option value="PROCESSING">PROCESSING</option>
              <option value="READY">READY</option>
              <option value="PICKED_UP">PICKED UP</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>

            {/* Source Filter */}
            <select
              value={sourceFilter}
              onChange={(e) => {
                setSourceFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-11 min-w-35 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
            >
              <option value="">{t("allSource") || "All Sources"}</option>
              <option value="ADMIN">ADMIN</option>
              <option value="QR_TABLE">QR TABLE</option>
              <option value="TOUCHSCREEN">TOUCHSCREEN</option>
              <option value="STAFF">STAFF</option>
            </select>

            {/* Date Filter */}
            <div className="relative">
              <Calendar size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => {
                  setDateFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-11 min-w-40 rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-600 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
              />
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("searchPlaceholder") || "Search by customer or code..."}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-500/10"
              />
            </div>

          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm text-slate-500">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="px-6 py-4">{t("slug") || "Order #"}</th>
                <th className="px-6 py-4">{t("customer") || "Customer"}</th>
                <th className="px-6 py-4">{t("table") || "Table"}</th>
                <th className="px-6 py-4">{t("source") || "Source"}</th>
                <th className="px-6 py-4">{t("status") || "Status"}</th>
                <th className="px-6 py-4">{t("total") || "Total Amount"}</th>
                <th className="px-6 py-4">{t("createdAt") || "Created At"}</th>
                <th className="px-6 py-4 text-center">{t("actions") || "Actions"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 border-t border-slate-100">
              {isLoading || isFetching ? (
                // Skeletons
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-12" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-20 rounded-full" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-24 rounded-full" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                    <td className="px-6 py-4 text-center"><Skeleton className="h-8 w-8 rounded-full mx-auto" /></td>
                  </tr>
                ))
              ) : orders.length === 0 ? (
                // Empty state
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400">
                    {t("noOrdersFound") || "No orders found."}
                  </td>
                </tr>
              ) : (
                // Orders Rows
                orders.map((order: Order) => {
                  const isPaid = order.payment?.some((payment) => payment.status === "PAID");
                  const shouldShowSendToProduction = order.status === "PENDING" || order.status === "PENDING_PROCESSING";

                  return (
                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-900">{order.slug}</td>
                      <td className="px-6 py-4 font-medium text-slate-700">{order.customerName || "-"}</td>
                      <td className="px-6 py-4 font-semibold text-slate-700">
                        {order.table ? order.table.tableNumber : "-"}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${getSourceBadgeClass(order.source)}`}>
                          {order.source}
                        </span>
                      </td>
                      <td className="px-6 py-4 space-x-1">
                        <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${getStatusBadgeClass(order.status)}`}>
                          {order.status}
                        </span>
                        <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${isPaid ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                          {isPaid ? "Paid" : "Unpaid"}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900">{formatCurrency(order.totalAmount)}</td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-500">
                        {new Date(order.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {shouldShowSendToProduction && (
                          <button
                            onClick={() => handleSendToProduction(order.id)}
                            disabled={sendingOrderId === order.id}
                            className="rounded-full p-2 text-slate-400 hover:bg-amber-50 hover:text-amber-600 transition disabled:cursor-not-allowed disabled:opacity-40"
                            title={t("sendToProduction") || "Send to Production"}
                          >
                            <Send size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedOrderId(order.id)}
                          className="rounded-full p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition"
                          title={t("viewDetails") || "View Details"}
                        >
                          <Eye size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!isLoading && !isFetching && pagination && totalPages > 1 && (
          <div className="mt-6 border-t border-slate-100 pt-4">
            <CustomPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}

      </div>

      {/* Details Modal */}
      <OrderDetailsModal
        orderId={selectedOrderId}
        onClose={() => setSelectedOrderId(null)}
      />
    </div>
  );
};

export default OrdersPage;