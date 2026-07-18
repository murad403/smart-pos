"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Eye, Loader2, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useGetAllCollectionQuery, usePickupOrderCollectionMutation } from "@/redux/features/collection/collection.api";
import { CollectionOrder } from "@/redux/features/collection/collection.type";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import OrderDetailsModal from "@/components/modal/OrderDetailsModal";


declare global {
  interface Window {
    io?: any;
  }
}

const statusView = {
  READY: {
    cardClass: "border-l-emerald-500 bg-emerald-50/35",
    statusClass: "text-emerald-600",
  },
  PICKED_UP: {
    cardClass: "border-l-slate-400 bg-slate-100/70",
    statusClass: "text-slate-600",
  },
};

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

const toDuration = (startDateString: string | null | undefined, endDateString: string | null | undefined) => {
  if (!startDateString || !endDateString) return "";
  const start = new Date(startDateString).getTime();
  const end = new Date(endDateString).getTime();
  if (Number.isNaN(start) || Number.isNaN(end)) return "";
  const diffInSeconds = Math.max(0, Math.floor((end - start) / 1000));
  const minutes = Math.floor(diffInSeconds / 60);
  const seconds = diffInSeconds % 60;
  return `${minutes}m ${seconds}s`;
};

const CollectionPage = () => {
  const t = useTranslations("CollectionPage");
  const [activeTab, setActiveTab] = useState<"READY" | "PICKED_UP">("READY");
  const [activeActionId, setActiveActionId] = useState<number | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [, setTicker] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTicker((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const { data, isLoading, isFetching } = useGetAllCollectionQuery({
    status: activeTab,
    page: 1,
    limit: 100,
  });

  const [pickupOrder] = usePickupOrderCollectionMutation();

  const [localOrders, setLocalOrders] = useState<CollectionOrder[]>([]);

  // Sync local orders with RTK query data
  useEffect(() => {
    if (data?.data) {
      setLocalOrders(data.data);
    }
  }, [data?.data]);

  // Keep a ref to the current tab to prevent stale closures in socket events
  const activeTabRef = useRef(activeTab);
  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  // Handle Socket connection and events
  useEffect(() => {
    let socket: any = null;

    const connectSocket = () => {
      if (!window.io) return;

      socket = window.io(`${process.env.NEXT_PUBLIC_SOCKET_URL}`, {
        transports: ["websocket"],
      });

      socket.on("connect", () => {
        console.log("Socket connected successfully to Collection/OrderReady Namespace");
      });

      socket.on("orderReady", (newOrder: any) => {
        console.log("Received orderReady socket event:", newOrder);

        if (activeTabRef.current === "READY") {
          setLocalOrders((prev) => {
            // Check for duplicates
            if (prev.some((o) => o.id === newOrder.id)) {
              return prev;
            }
            return [newOrder, ...prev];
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

  const sortedOrders = useMemo(() => {
    return [...localOrders].sort((left, right) => {
      const leftTime = new Date(left.readyAt || left.createdAt).getTime();
      const rightTime = new Date(right.readyAt || right.createdAt).getTime();
      return rightTime - leftTime;
    });
  }, [localOrders]);

  const handlePickup = async (orderId: number) => {
    setActiveActionId(orderId);
    try {
      await pickupOrder(orderId).unwrap();
      toast.success(t("successMessage"));
    } catch (error: unknown) {
      const apiError = error as { data?: { message?: string }; message?: string };
      toast.error(apiError?.data?.message || apiError?.message || t("errorMessage"));
    } finally {
      setActiveActionId(null);
    }
  };

  const statusTextKeys: Record<string, string> = {
    READY: "readyTab",
    PICKED_UP: "completedTab",
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t("title")}</h1>
          <p className="mt-1 text-sm text-slate-600">{t("subtitle")}</p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl w-fit border border-slate-200">
          <button
            onClick={() => setActiveTab("READY")}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
              activeTab === "READY"
                ? "bg-white text-emerald-600 shadow-sm"
                : "text-slate-600 hover:text-slate-800"
            }`}
          >
            {t("readyTab")}
          </button>
          <button
            onClick={() => setActiveTab("PICKED_UP")}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 ${
              activeTab === "PICKED_UP"
                ? "bg-white text-slate-700 shadow-sm"
                : "text-slate-600 hover:text-slate-800"
            }`}
          >
            {t("completedTab")}
          </button>
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
          <div className="space-y-3">
            {sortedOrders.map((order) => {
              const elapsed = toElapsed(order.readyAt || order.processedAt || order.createdAt);
              const duration = toDuration(
                order.readyAt || order.processedAt || order.createdAt,
                order.pickedUpAt || order.updatedAt
              );
              const isActionBusy = activeActionId === order.id;

              return (
                <article
                  key={order.id}
                  className={`rounded-xl border border-slate-200 p-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)] border-l-3 ${
                    statusView[order.status as keyof typeof statusView]?.cardClass || "border-l-slate-200 bg-white"
                  }`}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 text-slate-800">
                        <span className="text-sm font-bold uppercase tracking-tight">{t("orderLabel")} {order.slug.toUpperCase()}</span>
                        <span className="text-xs font-semibold text-slate-455">-</span>
                        <span className="text-xs font-semibold text-slate-500">{toClock(order.createdAt)}</span>
                        <span
                          className={`text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md border ${
                            statusView[order.status as keyof typeof statusView]?.statusClass || "text-slate-605"
                          } bg-white/70`}
                        >
                          {t(statusTextKeys[order.status])}
                        </span>
                        {order.status === "READY" && elapsed && (
                          <span className="text-xs font-semibold text-blue-500">{elapsed}</span>
                        )}
                        {order.status === "PICKED_UP" && duration && (
                          <span className="text-xs font-semibold text-slate-500">{duration}</span>
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
                                {item.packetChoices.map((choice, choiceIndex) => (
                                  <p
                                    key={`${choice.section}-${choice.choice}-${choiceIndex}`}
                                    className="text-xs font-medium text-slate-500"
                                  >
                                    {choice.choice} x{choice.quantity}
                                  </p>
                                ))}
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
                        {order.status === "READY" && (
                          <Button
                            type="button"
                            className="h-9 rounded-md bg-slate-900 px-4 text-xs font-semibold text-white hover:bg-slate-800 flex items-center gap-1.5"
                            onClick={() => handlePickup(order.id)}
                            disabled={isActionBusy}
                          >
                            {isActionBusy ? (
                              <Loader2 className="size-3.5 animate-spin" />
                            ) : (
                              <ShoppingBag className="size-3.5" />
                            )}
                            <span>{t("pickup")}</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
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

export default CollectionPage;
