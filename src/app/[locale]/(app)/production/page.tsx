"use client";
import React, { useMemo, useState } from "react";
import { CheckCircle2, Eye, Loader2, Package2, ShoppingBag, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { getUserData } from "@/utils/auth";
import { useAcceptOrderMutation, useCancelOrderMutation, useGetAllProductionsQuery, usePickupOrderMutation, useReadyOrderMutation } from "@/redux/features/production/production.api";
import { ProductionOrder, ProductionOrderStatus, ProductionSource } from "@/redux/features/production/production.type";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import OrderDetailsModal from "@/components/modal/OrderDetailsModal";



declare global {
  interface Window {
    io?: any;
  }
}

type OrderAction = "accept" | "cancel" | "ready" | "pickup";


const statusPriority: Record<ProductionOrderStatus, number> = {
  PENDING_PROCESSING: 0,
  PROCESSING: 1,
  READY: 2,
  PICKED_UP: 3,
  CANCELLED: 4,
};

const statusView: Record<ProductionOrderStatus, {
  cardClass: string;
  statusClass: string;
}> = {
  PENDING_PROCESSING: {
    cardClass: "border-l-red-500 bg-red-50/35",
    statusClass: "text-red-700",
  },
  PROCESSING: {
    cardClass: "border-l-blue-500 bg-blue-50/35",
    statusClass: "text-blue-600",
  },
  READY: {
    cardClass: "border-l-emerald-500 bg-emerald-50/35",
    statusClass: "text-emerald-600",
  },
  PICKED_UP: {
    cardClass: "border-l-slate-400 bg-slate-100/70",
    statusClass: "text-slate-600",
  },
  CANCELLED: {
    cardClass: "border-l-rose-500 bg-rose-50/50",
    statusClass: "text-rose-700",
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
  const t = useTranslations("ProductionPage");

  const [sourceFilter, setSourceFilter] = useState<ProductionSource | "">("");
  const [activeAction, setActiveAction] = useState<{ orderId: number; action: OrderAction } | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

  const { data, isLoading, isFetching } = useGetAllProductionsQuery({
    page: 1,
    limit: 100,
    source: sourceFilter || undefined,
  });

  const [acceptOrder] = useAcceptOrderMutation();
  const [cancelOrder] = useCancelOrderMutation();
  const [readyOrder] = useReadyOrderMutation();
  const [pickupOrder] = usePickupOrderMutation();

  const [localOrders, setLocalOrders] = useState<ProductionOrder[]>([]);

  // Sync local orders with RTK query data
  React.useEffect(() => {
    if (data?.data) {
      setLocalOrders(data.data);
    }
  }, [data?.data]);

  // Keep a ref to the current source filter to prevent stale closures in socket events
  const sourceFilterRef = React.useRef(sourceFilter);
  React.useEffect(() => {
    sourceFilterRef.current = sourceFilter;
  }, [sourceFilter]);

  // Handle Socket connection and events
  React.useEffect(() => {
    let socket: any = null;

    const connectSocket = () => {
      if (!window.io) return;

      socket = window.io(`${process.env.NEXT_PUBLIC_SOCKET_URL}`, {
        transports: ["websocket"],
      });

      socket.on("connect", () => {
        console.log("Socket connected successfully to Production Namespace");
      });

      socket.on("newOrder", (newOrder: any) => {
        console.log("Received newOrder socket event:", newOrder);

        const mappedOrder: ProductionOrder = {
          ...newOrder,
          status: newOrder.status === "PENDING" ? "PENDING_PROCESSING" : newOrder.status,
        };

        const currentFilter = sourceFilterRef.current;
        if (!currentFilter || mappedOrder.source === currentFilter) {
          setLocalOrders((prev) => {
            // Check for duplicates
            if (prev.some((o) => o.id === mappedOrder.id)) {
              return prev;
            }
            return [mappedOrder, ...prev];
          });
        }
      });

      socket.on("connect_error", (err: any) => {
        console.error("Socket connection error:", err);
      });
    };

    const scriptId = "socket-io-cdn-script";
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    if (!script) {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://cdn.socket.io/4.7.5/socket.io.min.js";
      script.async = true;
      script.onload = () => {
        connectSocket();
      };
      document.body.appendChild(script);
    } else {
      if (window.io) {
        connectSocket();
      } else {
        script.addEventListener("load", connectSocket);
      }
    }

    return () => {
      if (socket) {
        socket.disconnect();
      }
      if (script) {
        script.removeEventListener("load", connectSocket);
      }
    };
  }, []);

  const filteredOrders = useMemo(() => {
    const user = getUserData() as any;
    const stationId = user?.productionStationId;

    if (!stationId) {
      return localOrders;
    }

    return localOrders
      .map((order) => {
        const filteredItems = order.orderItems
          .map((item) => {
            if (item.packetChoices && item.packetChoices.length > 0) {
              const filteredChoices = item.packetChoices.filter(
                (choice) => choice.productionStationId === stationId
              );
              return {
                ...item,
                packetChoices: filteredChoices,
              };
            }
            return item;
          })
          .filter((item) => {
            if (item.packetChoices && item.packetChoices.length > 0) {
              return true;
            }
            return item.productionStationId === stationId;
          });

        return {
          ...order,
          orderItems: filteredItems,
        };
      })
      .filter((order) => order.orderItems.length > 0);
  }, [localOrders]);

  const sortedOrders = useMemo(() => {
    return [...filteredOrders].sort((left, right) => {
      const statusDiff = statusPriority[left.status] - statusPriority[right.status];

      if (statusDiff !== 0) return statusDiff;

      return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
    });
  }, [filteredOrders]);

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

      toast.success(t("successMessage"));
    } catch (error: unknown) {
      const apiError = error as { data?: { message?: string }; message?: string };
      toast.error(apiError?.data?.message || apiError?.message || t("errorMessage"));
    } finally {
      setActiveAction(null);
    }
  };

  const statusLabelKeys: Record<ProductionOrderStatus, string> = {
    PENDING_PROCESSING: "newOrders",
    PROCESSING: "processing",
    READY: "completed",
    PICKED_UP: "pickedUp",
    CANCELLED: "cancelled",
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
            <span>{t("accept")}</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-9 rounded-md border-red-200 bg-white px-4 text-xs font-semibold text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={() => runAction(order.id, "cancel")}
            disabled={isActionBusy}
          >
            {isActionBusy && activeAction?.action === "cancel" ? <Loader2 className="size-3.5 animate-spin" /> : <XCircle className="size-3.5" />}
            <span>{t("cancel")}</span>
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
          <span>{t("ready")}</span>
        </Button>
      );
    }

    if (order.status === "READY") {
      return (
        <div className="flex items-center gap-2">
          <Button
            type="button"
            className="h-9 rounded-md bg-blue-600 px-4 text-xs font-semibold text-white hover:bg-blue-700"
            onClick={() => runAction(order.id, "ready")}
            disabled={isActionBusy}
          >
            {isActionBusy && activeAction?.action === "ready" ? <Loader2 className="size-3.5 animate-spin" /> : <Package2 className="size-3.5" />}
            <span>{t("sendAgainToCollection")}</span>
          </Button>
          {/* <Button
            type="button"
            className="h-9 rounded-md bg-slate-900 px-4 text-xs font-semibold text-white hover:bg-slate-800"
            onClick={() => runAction(order.id, "pickup")}
            disabled={isActionBusy}
          >
            {isActionBusy && activeAction?.action === "pickup" ? <Loader2 className="size-3.5 animate-spin" /> : <ShoppingBag className="size-3.5" />}
            <span>{t("pickup")}</span>
          </Button> */}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">{t("title")}</h1>
          <p className="mt-1 text-sm text-slate-600">{t("subtitle")}</p>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="production-source" className="text-sm font-semibold text-slate-600">{t("source")}</label>
          <select
            id="production-source"
            value={sourceFilter}
            onChange={(event) => setSourceFilter(event.target.value as ProductionSource | "")}
            className="h-11 min-w-44 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
          >
            <option value="">{t("allSources")}</option>
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
            {t("noOrders")}
          </div>
        ) : (
          <div className="space-y-5">
            {(Object.keys(groupedOrders) as ProductionOrderStatus[]).map((status) => {
              const ordersByStatus = groupedOrders[status];

              if (ordersByStatus.length === 0) return null;

              return (
                <section key={status} className="space-y-2">
                  {(status === "READY" || status === "PICKED_UP" || status === "CANCELLED") && (
                    <h2 className={`text-base font-bold uppercase tracking-wider ${statusView[status].statusClass}`}>
                      {t(statusLabelKeys[status])}
                    </h2>
                  )}

                  <div className="space-y-3">
                    {ordersByStatus.map((order) => {
                      const elapsed = toElapsed(order.processedAt || order.createdAt);

                      return (
                        <article key={order.id} className={`rounded-xl border border-slate-200 p-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)] border-l-3 ${statusView[order.status].cardClass}`}>
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2 text-slate-800">
                                <span className="text-sm font-bold uppercase tracking-tight">{t("orderLabel")} {order.slug.toUpperCase()}</span>
                                <span className="text-xs font-semibold text-slate-450">-</span>
                                <span className="text-xs font-semibold text-slate-500">{toClock(order.createdAt)}</span>
                                <span className={`text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md border ${statusView[order.status].statusClass} bg-white/70`}>
                                  {t(statusLabelKeys[order.status])}
                                </span>
                                {(order.status === "PROCESSING" || order.status === "READY") && elapsed && (
                                  <span className="text-xs font-semibold text-blue-500">{elapsed}</span>
                                )}
                              </div>

                              <div className="mt-3 space-y-2">
                                {order.orderItems.map((item, index) => (
                                  <div key={item.id} className="space-y-0.5">
                                    <div className="flex items-center gap-2 text-sm font-semibold tracking-tight text-slate-700">
                                      <span>{String.fromCharCode(65 + index)}) {item.itemName}</span>
                                      <span className="text-xs font-medium text-slate-500">{t("qtyLabel")}: {item.quantity}</span>
                                    </div>

                                    {item.packetChoices && item.packetChoices.length > 0 && (
                                      <div className="ml-5 space-y-0.5 border-l border-slate-200 pl-2">
                                        {item.packetChoices.map((choice, choiceIndex) => {
                                          const choiceName = choice.choice || (choice as any).item?.name || (choice as any).choiceItem?.name || "";
                                          return (
                                            <p key={`${choice.section}-${choiceName}-${choiceIndex}`} className="text-xs font-medium text-slate-500">
                                              {choice.quantity}x {choiceName}
                                            </p>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div className="flex flex-col items-end gap-2.5">
                              <p className="text-sm font-bold text-blue-600">
                                {order.table ? `Table ${order.table.tableNumber}` : "No Table"}
                                {order.customerName ? ` | ${order.customerName}` : ""}
                              </p>
                              <div className="flex items-center gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  className="h-9 w-9 rounded-md border-slate-200 bg-white p-0 text-slate-500 hover:bg-slate-50 hover:text-slate-700 flex items-center justify-center"
                                  onClick={() => setSelectedOrderId(order.id)}
                                >
                                  <Eye className="size-4" />
                                </Button>
                                {renderActions(order)}
                              </div>
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

      <OrderDetailsModal
        orderId={selectedOrderId}
        onClose={() => setSelectedOrderId(null)}
      />
    </div>
  );
};

export default ProductionPage;
