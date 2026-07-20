"use client";
import React, { useState } from "react";
import { BadgeDollarSign, ClipboardClock, Eye, SquarePen, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/routing";
import { useGetPendingPaymentOrdersQuery } from "@/redux/features/order/order.api";
import CustomPagination from "@/components/shared/CustomPagination";
import OrderDetailsModal from "@/components/modal/OrderDetailsModal";
import SubmitOrderPaymentModal from "@/components/modal/SubmitOrderPaymentModal";
import DeleteOrderPaymentModal from "@/components/modal/DeleteOrderPaymentModal";
import { Order } from "@/redux/features/order/order.type";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";




const PendingPaymentsPage = ({ params }: { params?: Promise<{ locale: string }> }) => {
  if (params) React.use(params);
  const tOrder = useTranslations("Order");
  const tPending = useTranslations("PendingPayments");
  const router = useRouter();

  const [currentPage, setCurrentPage] = useState(1);
  const limit = 15;
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [selectedPaymentOrder, setSelectedPaymentOrder] = useState<Order | null>(null);
  const [selectedDeleteOrder, setSelectedDeleteOrder] = useState<Order | null>(null);

  const { data: ordersRes, isLoading, isFetching } = useGetPendingPaymentOrdersQuery({
    page: currentPage,
    limit,
  });

  const orders = ordersRes?.data ?? [];
  const pagination = ordersRes?.pagination;
  const totalPages = pagination?.totalPages ?? 1;

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
    <div className="space-y-6 pb-10 w-full min-w-0">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
            {tPending("title") || "Pending Payment Orders"}
          </h1>
          <p className="mt-1 text-slate-600 text-sm">
            {tPending("subtitle") || "Review and process orders awaiting payment completion."}
          </p>
        </div>
        <Link href={"/payments-history"} className="inline-flex rounded-md bg-blue-400 py-2 gap-2 text-sm font-medium px-4 items-center text-white">
          <ClipboardClock size={16} />
          <span>Payments History</span>
        </Link>  
      </div>

      {/* Main Content */}
      <div className="rounded-[24px] border border-slate-100 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] sm:p-8">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm text-slate-500">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <th className="px-6 py-4">{tPending("image") || "Image"}</th>
                <th className="px-6 py-4 whitespace-nowrap">{tOrder("slug") || "Order #"}</th>
                <th className="px-6 py-4">{tOrder("customer") || "Customer"}</th>
                <th className="px-6 py-4">{tOrder("table") || "Table"}</th>
                <th className="px-6 py-4">{tOrder("source") || "Source"}</th>
                <th className="px-6 py-4">{tOrder("items") || "Items"}</th>
                <th className="px-6 py-4 whitespace-nowrap">{tOrder("total") || "Total Amount"}</th>
                <th className="px-6 py-4 whitespace-nowrap">{tOrder("createdAt") || "Created At"}</th>
                <th className="px-6 py-4 text-center">{tOrder("actions") || "Actions"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 border-t border-slate-100">
              {isLoading || isFetching ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4">
                      <Skeleton className="h-10 w-10 rounded-xl" />
                    </td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-12" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-5 w-20 rounded-full" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-40" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                    <td className="px-6 py-4 text-center"><Skeleton className="h-8 w-8 rounded-full mx-auto" /></td>
                  </tr>
                ))
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-slate-400">
                    {tPending("noOrdersFound") || "No pending payment orders found."}
                  </td>
                </tr>
              ) : (
                orders.map((order: Order) => {
                  const firstItem = order.orderItems?.[0];
                  const imageUrl = firstItem?.item?.imageUrl;
                  const itemNames = order.orderItems?.map(
                    (oi) => `${oi.itemName} x${oi.quantity}`
                  ).join(", ") || "-";

                  return (
                    <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="relative h-10 w-10 overflow-hidden rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center font-bold text-xs text-blue-600">
                          {imageUrl ? (
                            <Image
                              width={500}
                              height={500}
                              src={imageUrl}
                              alt={firstItem?.itemName || "Item"}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            order.slug.slice(-2).toUpperCase()
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900 whitespace-nowrap">{order.slug}</td>
                      <td className="px-6 py-4 font-medium text-slate-700">{order.customerName || "-"}</td>
                      <td className="px-6 py-4 font-semibold text-slate-700">
                        {order.table ? order.table.tableNumber : "-"}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${getSourceBadgeClass(order.source)}`}>
                          {order.source}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-600 max-w-50 truncate" title={itemNames}>
                        {itemNames}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900">{formatCurrency(order.totalAmount)}</td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-500">
                        {new Date(order.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-center flex justify-center items-center gap-1">
                        <button
                          onClick={() => setSelectedOrderId(order.id)}
                          className="rounded-full p-2 text-slate-400 cursor-pointer hover:bg-blue-50 hover:text-blue-600 transition"
                          title={tOrder("viewDetails") || "View Details"}
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => router.push(`/menu?editOrderId=${order.id}`)}
                          className="rounded-full p-2 text-slate-400 cursor-pointer hover:bg-blue-50 hover:text-blue-600 transition"
                          title={tOrder("editOrder") || "Edit Order"}
                        >
                          <SquarePen size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedPaymentOrder(order)}
                          className="rounded-full px-2 py-1 text-slate-400 cursor-pointer flex gap-1 items-center hover:bg-blue-50 hover:text-blue-600 transition border border-slate-200"
                          title={tPending("submitPayment") || "Submit Payment"}
                        >
                          <BadgeDollarSign size={16} />
                          <span className="text-sm">{tOrder("pay")}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedDeleteOrder(order)}
                          className="rounded-full p-2 text-slate-400 cursor-pointer hover:bg-red-50 hover:text-red-600 transition"
                          title={tOrder("deleteOrder") || "Delete Order"}
                        >
                          <Trash2 size={16} />
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

      <SubmitOrderPaymentModal
        key={selectedPaymentOrder?.id ?? "payment-modal"}
        order={selectedPaymentOrder}
        onClose={() => setSelectedPaymentOrder(null)}
      />

      <DeleteOrderPaymentModal
        key={selectedDeleteOrder?.id ?? "delete-modal"}
        order={selectedDeleteOrder}
        onClose={() => setSelectedDeleteOrder(null)}
      />
      <style
        dangerouslySetInnerHTML={{
          __html: `
            main {
              min-width: 0 !important;
            }
          `,
        }}
      />
    </div>
  );
};

export default PendingPaymentsPage;