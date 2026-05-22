/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React from "react";
import { X, ShoppingBag, CreditCard, Clock, MapPin, ClipboardList } from "lucide-react";
import { useTranslations } from "next-intl";
import { useGetOrderDetailsQuery } from "@/redux/features/order/order.api";
import { Order } from "@/redux/features/order/order.type";

interface OrderDetailsModalProps {
  orderId: number | null;
  onClose: () => void;
}

const formatCurrency = (value: string | number) => {
  const numericValue = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(numericValue)) return "Rp 0";
  return `Rp ${numericValue.toLocaleString("en-US")}`;
};

const OrderDetailsModal = ({ orderId, onClose }: OrderDetailsModalProps) => {
  const t = useTranslations("Order");

  const { data: detailsRes, isLoading } = useGetOrderDetailsQuery(
    orderId,
    { skip: !orderId }
  );

  if (!orderId) return null;

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 px-4 py-6 backdrop-blur-[2px]">
        <div className="relative w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl animate-pulse flex flex-col gap-4">
          <div className="flex justify-between items-center mb-2">
            <div className="h-6 w-36 bg-slate-100 rounded" />
            <div className="h-5 w-16 bg-slate-100 rounded-full" />
          </div>
          <div className="h-4 bg-slate-100 rounded w-1/2" />
          <div className="h-32 bg-slate-50 rounded-xl" />
          <div className="h-20 bg-slate-50 rounded-xl" />
          <div className="h-10 bg-slate-50 rounded-xl" />
        </div>
      </div>
    );
  }

  const order: Order | undefined = detailsRes?.data;

  if (!order) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 px-4 py-6 backdrop-blur-[2px]">
        <div className="relative w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl text-center">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={16} />
          </button>
          <p className="text-slate-500 font-medium">{t("noOrdersFound")}</p>
        </div>
      </div>
    );
  }

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

  const hasPacketChoices = (choices: any) => {
    return Array.isArray(choices) && choices.length > 0;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 px-4 py-6 backdrop-blur-[2px]">
      <div className="relative w-full max-w-xl rounded-2xl bg-white p-5 shadow-xl max-h-[90vh] overflow-y-auto flex flex-col gap-4">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="border-b border-slate-100 pb-3 pr-8">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-[22px] font-bold text-slate-900">
              {order.slug}
            </h2>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-bold border ${getStatusBadgeClass(
                order.status
              )}`}
            >
              {order.status}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            {t("subtitle") || "Order details details details"}
          </p>
        </div>

        {/* Order Info Row */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 text-xs">
          <div className="rounded-xl border border-slate-100 p-2.5 bg-slate-50/30">
            <p className="text-slate-400 font-bold uppercase tracking-wider">{t("customer")}</p>
            <p className="text-sm font-semibold text-slate-800 mt-0.5">{order.customerName || "Guest"}</p>
          </div>
          <div className="rounded-xl border border-slate-100 p-2.5 bg-slate-50/30">
            <p className="text-slate-400 font-bold uppercase tracking-wider">{t("table")}</p>
            <p className="text-sm font-semibold text-slate-800 mt-0.5">
              {order.table ? `#${order.table.tableNumber}` : "No Table"}
            </p>
          </div>
          <div className="rounded-xl border border-slate-100 p-2.5 bg-slate-50/30">
            <p className="text-slate-400 font-bold uppercase tracking-wider">{t("source")}</p>
            <p className="text-sm font-semibold text-slate-800 mt-0.5">{order.source}</p>
          </div>
          <div className="rounded-xl border border-slate-100 p-2.5 bg-slate-50/30">
            <p className="text-slate-400 font-bold uppercase tracking-wider">{t("type")}</p>
            <p className="text-sm font-semibold text-slate-800 mt-0.5">{order.type}</p>
          </div>
        </div>

        {/* Order Items */}
        <div className="rounded-xl border border-slate-100 p-4 bg-slate-50/30">
          <div className="flex items-center gap-2 mb-3 text-slate-600 font-bold text-xs uppercase tracking-wider">
            <ShoppingBag size={14} />
            <span>{t("items")}</span>
          </div>

          {order.orderItems && order.orderItems.length > 0 ? (
            <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
              {order.orderItems.map((item, idx) => (
                <div key={item.id || idx} className="border-b border-slate-100 pb-2.5 last:border-0 last:pb-0">
                  <div className="flex justify-between items-start text-sm">
                    <div>
                      <span className="font-semibold text-slate-800">
                        {item.itemName}
                      </span>
                      <span className="text-slate-400 text-xs ml-1.5 font-medium">
                        x{item.quantity}
                      </span>
                      {item.productionStation && (
                        <span className="inline-flex items-center gap-0.5 rounded bg-blue-50 px-1 py-0.5 text-[10px] font-medium text-blue-600 ml-2">
                          <MapPin size={8} />
                          {item.productionStation.name}
                        </span>
                      )}
                    </div>
                    <span className="font-bold text-slate-800">
                      {formatCurrency(Number(item.promoPrice || item.unitPrice) * item.quantity)}
                    </span>
                  </div>

                  {/* Packet Choices */}
                  {hasPacketChoices(item.packetChoices) && (
                    <div className="mt-1 ml-3 pl-2 border-l-2 border-slate-200">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                        {t("packetChoices") || "Combo Selections"}
                      </p>
                      <div className="space-y-0.5">
                        {item.packetChoices?.map((choice, cIdx) => (
                          <p key={cIdx} className="text-xs text-slate-500">
                            {choice.section}: <span className="font-medium text-slate-700">{choice.choice}</span>
                            {choice.quantity > 1 && (
                              <span className="text-slate-400 text-[10px] ml-1">x{choice.quantity}</span>
                            )}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 text-center py-4">{t("noItems")}</p>
          )}
        </div>

        {/* Payment Summary */}
        <div className="rounded-xl border border-slate-100 p-4 bg-slate-50/30">
          <div className="flex items-center gap-2 mb-3 text-slate-600 font-bold text-xs uppercase tracking-wider">
            <CreditCard size={14} />
            <span>{t("payment")}</span>
          </div>

          {order.payment && order.payment.length > 0 ? (
            <div className="space-y-2">
              {order.payment.map((pay, idx) => (
                <div key={pay.id || idx} className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between col-span-2 border-b border-slate-100 pb-1.5 mb-1 text-sm font-semibold">
                    <span className="text-slate-500">Method</span>
                    <span className="text-slate-800">{pay.method}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">{t("paymentStatus")}:</span>
                    <span className="ml-1.5 font-bold text-slate-700">{pay.status}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Paid At:</span>
                    <span className="ml-1.5 font-semibold text-slate-700">
                      {pay.paidAt ? new Date(pay.paidAt).toLocaleString() : "-"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-1">{t("noPayment")}</p>
          )}

          {/* Totals */}
          <div className="mt-3.5 pt-3.5 border-t border-dashed border-slate-200 space-y-1.5 text-sm">
            <div className="flex justify-between text-slate-500">
              <span>{t("subtotal")}</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-[16px] font-bold text-slate-900">
              <span>{t("total")}</span>
              <span>{formatCurrency(order.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Footer Meta */}
        <div className="flex items-center gap-3 rounded-xl border border-slate-100 px-3 py-2 text-xs text-slate-500 bg-slate-50/20">
          <div className="flex items-center gap-1">
            <Clock size={12} className="text-slate-400" />
            <span>{t("createdAt")}: {new Date(order.createdAt).toLocaleString()}</span>
          </div>
          {order.table && order.table.notes && (
            <div className="flex items-center gap-1 border-l border-slate-200 pl-3">
              <ClipboardList size={12} className="text-slate-400" />
              <span className="truncate max-w-[200px]" title={order.table.notes}>
                {t("notes")}: {order.table.notes}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;