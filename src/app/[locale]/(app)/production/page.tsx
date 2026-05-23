"use client";

import React, { useMemo, useState } from "react";
import { CheckCircle2, Loader2, Package2, ShoppingBag, XCircle } from "lucide-react";
import { toast } from "sonner";
import {
  useAcceptOrderMutation,
  useCancelOrderMutation,
  useGetAllProductionsQuery,
  usePickupOrderMutation,
  useReadyOrderMutation,
} from "@/redux/features/production/production.api";
import { ProductionOrder, ProductionOrderStatus, ProductionSource } from "@/redux/features/production/production.type";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type OrderAction = "accept" | "cancel" | "ready" | "pickup";

const statusPriority: Record<ProductionOrderStatus, number> = {
  PENDING_PROCESSING: 0,
  PROCESSING: 1,
  READY: 2,
  PICKED_UP: 3,
  CANCELLED: 4,
};

const statusView: Record<ProductionOrderStatus, {
  sectionLabel: string;
  cardClass: string;
  statusClass: string;
  statusText: string;
}> = {
  PENDING_PROCESSING: {
    sectionLabel: "New Orders",
    cardClass: "border-l-red-500 bg-red-50/35",
    statusClass: "text-red-700",
    statusText: "NEW ORDER",
  },
  PROCESSING: {
    sectionLabel: "Processing",
    cardClass: "border-l-blue-500 bg-blue-50/35",
    statusClass: "text-blue-600",
    statusText: "Processing",
  },
  READY: {
    sectionLabel: "Order Completed",
    cardClass: "border-l-emerald-500 bg-emerald-50/35",
    statusClass: "text-emerald-600",
    statusText: "Completed",
  },
  PICKED_UP: {
    sectionLabel: "Picked Up",
    cardClass: "border-l-slate-400 bg-slate-100/70",
    statusClass: "text-slate-600",
    statusText: "Picked Up",
  },
  CANCELLED: {
    sectionLabel: "Cancelled",
    cardClass: "border-l-rose-500 bg-rose-50/50",
    statusClass: "text-rose-700",
    statusText: "Cancelled",
  },
};

const sourceOptions: ProductionSource[] = ["QR_TABLE", "TOUCHSCREEN", "STAFF", "ADMIN"];

const toClock = (dateString: string) => {
  const value = new Date(dateString);

  if (Number.isNaN(value.getTime())) return "-";

  return value.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

const toElapsed = (startDateString: string | null | undefined) => {
  if (!startDateString) return "";

  const start = new Date(startDateString).getTime();

  if (Number.isNaN(start)) return "";

  const diffInSeconds = Math.max(0, Math.floor((Date.now() - start) / 1000));
  const minutes = Math.floor(diffInSeconds / 60);
  const seconds = diffInSeconds % 60;

  return `${minutes}m ${seconds}s`;
};

const ProductionPage = ({ params }: { params?: Promise<{ locale: string }> }) => {
  if (params) React.use(params);

  const [sourceFilter, setSourceFilter] = useState<ProductionSource | "">("");
  const [activeAction, setActiveAction] = useState<{ orderId: number; action: OrderAction } | null>(null);

  const { data, isLoading, isFetching } = useGetAllProductionsQuery({
    page: 1,
    limit: 100,
    source: sourceFilter || undefined,
  });

  const [acceptOrder] = useAcceptOrderMutation();
  const [cancelOrder] = useCancelOrderMutation();
  const [readyOrder] = useReadyOrderMutation();
  const [pickupOrder] = usePickupOrderMutation();

  const orders = useMemo(() => data?.data ?? [], [data?.data]);

  const sortedOrders = useMemo(() => {
    return [...orders].sort((left, right) => {
      const statusDiff = statusPriority[left.status] - statusPriority[right.status];

      if (statusDiff !== 0) return statusDiff;

      return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
    });
  }, [orders]);

  const groupedOrders = useMemo(() => {
    const groups: Record<ProductionOrderStatus, ProductionOrder[]> = {
      PENDING_PROCESSING: [],
      PROCESSING: [],
      READY: [],
      PICKED_UP: [],
      CANCELLED: [],
    };

    sortedOrders.forEach((order) => {
      groups[order.status].push(order);
    });

    return groups;
  }, [sortedOrders]);

  const runAction = async (orderId: number, action: OrderAction) => {
    setActiveAction({ orderId, action });

    try {
      if (action === "accept") {
        await acceptOrder(orderId).unwrap();
      }

      if (action === "cancel") {
        await cancelOrder(orderId).unwrap();
      }

      if (action === "ready") {
        await readyOrder(orderId).unwrap();
      }

      if (action === "pickup") {
        await pickupOrder(orderId).unwrap();
      }

      toast.success("Order status updated successfully.");
    } catch (error: unknown) {
      const apiError = error as { data?: { message?: string }; message?: string };
      toast.error(apiError?.data?.message || apiError?.message || "Failed to update order status.");
    } finally {
      setActiveAction(null);
    }
  };

  const renderActions = (order: ProductionOrder) => {
    const isActionBusy = activeAction?.orderId === order.id;

    if (order.status === "PENDING_PROCESSING") {
      return (
        <div className="flex items-center gap-2">
          <Button
            type="button"
            className="h-9 rounded-md bg-blue-600 px-4 text-xs font-semibold text-white hover:bg-blue-700"
            onClick={() => runAction(order.id, "accept")}
            disabled={isActionBusy}
          >
            {isActionBusy && activeAction?.action === "accept" ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCircle2 className="size-3.5" />}
            <span>Accept</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-9 rounded-md border-red-200 bg-white px-4 text-xs font-semibold text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={() => runAction(order.id, "cancel")}
            disabled={isActionBusy}
          >
            {isActionBusy && activeAction?.action === "cancel" ? <Loader2 className="size-3.5 animate-spin" /> : <XCircle className="size-3.5" />}
            <span>Cancel</span>
          </Button>
        </div>
      );
    }

    if (order.status === "PROCESSING") {
      return (
        <Button
          type="button"
          className="h-9 rounded-md bg-emerald-600 px-4 text-xs font-semibold text-white hover:bg-emerald-700"
          onClick={() => runAction(order.id, "ready")}
          disabled={isActionBusy}
        >
          {isActionBusy && activeAction?.action === "ready" ? <Loader2 className="size-3.5 animate-spin" /> : <Package2 className="size-3.5" />}
          <span>Ready</span>
        </Button>
      );
    }

    if (order.status === "READY") {
      return (
        <Button
          type="button"
          className="h-9 rounded-md bg-slate-900 px-4 text-xs font-semibold text-white hover:bg-slate-800"
          onClick={() => runAction(order.id, "pickup")}
          disabled={isActionBusy}
        >
          {isActionBusy && activeAction?.action === "pickup" ? <Loader2 className="size-3.5 animate-spin" /> : <ShoppingBag className="size-3.5" />}
          <span>Pick Up</span>
        </Button>
      );
    }

    return null;
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Production</h1>
          <p className="mt-1 text-sm text-slate-600">Monitor live kitchen workflow and update order statuses quickly.</p>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="production-source" className="text-sm font-semibold text-slate-600">Source</label>
          <select
            id="production-source"
            value={sourceFilter}
            onChange={(event) => setSourceFilter(event.target.value as ProductionSource | "")}
            className="h-11 min-w-44 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
          >
            <option value="">All Sources</option>
            {sourceOptions.map((source) => (
              <option key={source} value={source}>{source}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200/70 bg-[#f4f3f0] p-4 sm:p-5">
        {isLoading || isFetching ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="rounded-2xl border border-slate-200 bg-white p-4">
                <Skeleton className="h-5 w-52" />
                <Skeleton className="mt-3 h-4 w-full" />
                <Skeleton className="mt-2 h-4 w-4/5" />
              </div>
            ))}
          </div>
        ) : sortedOrders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-10 text-center text-sm text-slate-500">
            No production orders found.
          </div>
        ) : (
          <div className="space-y-5">
            {(Object.keys(groupedOrders) as ProductionOrderStatus[]).map((status) => {
              const ordersByStatus = groupedOrders[status];

              if (ordersByStatus.length === 0) return null;

              return (
                <section key={status} className="space-y-3">
                  {(status === "READY" || status === "PICKED_UP" || status === "CANCELLED") && (
                    <h2 className={`text-3xl font-semibold tracking-tight ${statusView[status].statusClass}`}>
                      {statusView[status].sectionLabel}
                    </h2>
                  )}

                  <div className="space-y-3">
                    {ordersByStatus.map((order) => {
                      const elapsed = toElapsed(order.processedAt || order.createdAt);

                      return (
                        <article key={order.id} className={`rounded-xl border border-slate-200 p-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)] border-l-3 ${statusView[order.status].cardClass}`}>
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2 text-[28px] font-bold uppercase tracking-tight text-slate-800">
                                <span className="text-[28px]">ORDER {order.slug.toUpperCase()}</span>
                                <span className="text-base font-semibold text-slate-500">-</span>
                                <span className="text-[22px] font-semibold text-slate-600">{toClock(order.createdAt)}</span>
                                <span className={`text-xl font-semibold ${statusView[order.status].statusClass}`}>{statusView[order.status].statusText}</span>
                                {(order.status === "PROCESSING" || order.status === "READY") && elapsed && (
                                  <span className="text-base font-semibold text-blue-500">{elapsed}</span>
                                )}
                              </div>

                              <div className="mt-3 space-y-2">
                                {order.orderItems.map((item, index) => (
                                  <div key={item.id} className="space-y-1">
                                    <div className="flex items-center gap-3 text-[24px] font-semibold tracking-tight text-slate-700">
                                      <span>{String.fromCharCode(65 + index)}) {item.itemName}</span>
                                      <span className="text-[22px] text-slate-600">Qty: {item.quantity}</span>
                                    </div>

                                    {item.packetChoices && item.packetChoices.length > 0 && (
                                      <div className="ml-8 space-y-0.5">
                                        {item.packetChoices.map((choice, choiceIndex) => (
                                          <p key={`${choice.section}-${choice.choice}-${choiceIndex}`} className="text-[18px] font-medium text-slate-500">
                                            {choice.choice} x{choice.quantity}
                                          </p>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="flex flex-col items-end gap-3">
                              <p className="text-[30px] font-bold text-blue-600">
                                {order.table ? `Table ${order.table.tableNumber}` : "No Table"}
                                {order.customerName ? ` | ${order.customerName}` : ""}
                              </p>
                              {renderActions(order)}
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductionPage;
