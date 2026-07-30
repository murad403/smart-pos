"use client";
import React, { useState, useRef, useEffect } from "react";
import { Volume2, VolumeX, ArrowRight, ArrowDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { useGetCurrentCustomerOrdersQuery } from "@/redux/features/order/order.api";
import { getUserData } from "@/utils/auth";



const OrderLifeCycle = () => {
    const t = useTranslations("OrderLifeCycle");
    const [isMuted, setIsMuted] = useState(false);
    const [userId, setUserId] = useState<number | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Fetch user id from local cookies on client mount
    useEffect(() => {
        const user = getUserData();
        if (user) {
            setUserId(user.id);
        }
    }, []);

    // RTK Query hook to get active customer orders, polling every 4 seconds
    const { data: ordersRes, isLoading } = useGetCurrentCustomerOrdersQuery(userId, {
        skip: !userId,
        pollingInterval: 30000,
    });

    const orders = ordersRes?.data ?? [];

    const handleMuteToggle = () => {
        setIsMuted((prev) => {
            if (audioRef.current) {
                audioRef.current.muted = !prev;
            }
            return !prev;
        });
    };

    const getActiveStepIndex = (status: string) => {
        if (status === "PENDING" || status === "PENDING_PROCESSING") return 0;
        if (status === "PROCESSING") return 1;
        if (status === "READY") return 2;
        if (status === "PICKED_UP") return 3;
        return -1;
    };

    const getStepsForOrder = (orderStatus: string) => {
        const activeIdx = getActiveStepIndex(orderStatus);

        return [
            {
                label: t("inComing"),
                color: activeIdx >= 0 ? `bg-red-500 text-white${activeIdx === 0 ? " animate-pulse" : ""}` : "bg-gray-100 text-slate-400 border border-slate-200/50",
                textColor: activeIdx >= 0 ? "text-white" : "text-slate-400",
                subLabel: t("redFlashingAlert"),
                desc: t("redFlashingDesc"),
                hasIcon: activeIdx < 0,
            },
            {
                label: t("okPressed"),
                color: activeIdx >= 1 ? "bg-blue-600 text-white" : "bg-gray-100 text-slate-400 border border-slate-200/50",
                textColor: activeIdx >= 1 ? "text-white" : "text-slate-400",
                subLabel: t("processing"),
                desc: t("processingDesc"),
                hasIcon: activeIdx < 1,
            },
            {
                label: t("ready"),
                color: activeIdx >= 2 ? "bg-green-500 text-white" : "bg-gray-100 text-slate-400 border border-slate-200/50",
                textColor: activeIdx >= 2 ? "text-white" : "text-slate-400",
                subLabel: t("collectionAlertSent"),
                desc: t("collectionDesc"),
                hasIcon: activeIdx < 2,
            },
            {
                label: t("pickUp"),
                color: activeIdx >= 3 ? "bg-yellow-500 text-white" : "bg-gray-100 text-slate-400 border border-slate-200/50",
                textColor: activeIdx >= 3 ? "text-white" : "text-slate-400",
                subLabel: t("clearFromScreen"),
                desc: t("clearDesc"),
                hasIcon: activeIdx < 3,
            },
        ];
    };

    const hasIncomingOrder = orders.some(
        (o) => o.status === "PENDING" || o.status === "PENDING_PROCESSING"
    );

    // Audio sound trigger based on incoming orders and mute preference
    useEffect(() => {
        if (hasIncomingOrder && !isMuted) {
            audioRef.current?.play().catch((err) => {
                console.log("Audio play blocked by browser autoplay policy:", err);
            });
        } else {
            audioRef.current?.pause();
        }
    }, [hasIncomingOrder, isMuted]);

    return (
        <div>
            <div className="max-w-7xl mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold text-gray-900">{t("orderLifeCycle")}</h1>
                <p className="text-sm text-gray-500 mb-6">{t("activeOrders")}</p>

                {isLoading ? (
                    <div className="p-8 text-center text-slate-500 bg-white rounded-xl shadow-sm border border-slate-100/80 animate-pulse font-medium">
                        Loading active orders...
                    </div>
                ) : orders.length === 0 ? (
                    <div className="p-12 text-center text-slate-500 bg-white rounded-xl shadow-sm border border-slate-100">
                        No active orders at this moment.
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => {
                            const steps = getStepsForOrder(order.status);
                            const activeIdx = getActiveStepIndex(order.status);
                            return (
                                <div key={order.id} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                                    {/* Order Details Header */}
                                    <div className="mb-6 flex flex-col gap-1 border-b border-slate-100 pb-4">
                                        <div className="flex items-center justify-between flex-wrap gap-2">
                                            <span className="text-lg font-bold text-slate-900">
                                                Order #{order.slug}
                                            </span>
                                            <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full font-semibold">
                                                {order.customerName || "Guest"} ({order.type})
                                            </span>
                                        </div>
                                        <div className="text-xs text-slate-600 font-medium mt-2 bg-slate-50 rounded-xl p-3 flex flex-wrap items-center gap-x-3 gap-y-1">
                                            <span className="text-slate-400 font-bold uppercase tracking-wider">Items:</span>
                                            {order.orderItems?.map((item, idx) => (
                                                <span key={item.id || idx} className="text-slate-800 font-semibold">
                                                    {item.quantity}x {item.itemName}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Stepper Steps */}
                                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-center gap-4 sm:gap-2">
                                        {steps.map((step, idx) => (
                                            <React.Fragment key={idx}>
                                                <div className="flex sm:flex-col items-start sm:items-center gap-3 sm:gap-2 sm:flex-1 w-full sm:min-w-20">
                                                    <button
                                                        type="button"
                                                        disabled
                                                        className={`w-20 sm:w-full px-3 sm:px-4 py-3 rounded-lg font-semibold text-xs sm:text-sm ${step.color} ${step.textColor} flex items-center justify-center whitespace-nowrap relative`}
                                                    >
                                                        {step.hasIcon && (
                                                            <span className="absolute left-2 flex items-center">🚫</span>
                                                        )}
                                                        {idx === activeIdx && (
                                                            <span className="absolute left-2.5 flex h-2 w-2">
                                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                                                            </span>
                                                        )}
                                                        <span>{step.label}</span>
                                                    </button>

                                                    <div className="flex-1 text-center">
                                                        <p className="text-sm md:text-base text-text-color font-semibold text-center">
                                                            {step.subLabel}
                                                        </p>
                                                        <p className="text-xs md:text-sm text-text-color text-center max-w-full sm:max-w-35 mx-auto">
                                                            {step.desc}
                                                        </p>
                                                    </div>
                                                </div>

                                                {idx < steps.length - 1 && (
                                                    <>
                                                        {/* 👉 Mobile Arrow (Down) */}
                                                        <div className="flex justify-center sm:hidden">
                                                            <ArrowDown size={18} className="text-gray-400" />
                                                        </div>

                                                        {/* 👉 Desktop Arrow (Right) */}
                                                        <div className="hidden sm:flex items-start pt-3">
                                                            <ArrowRight size={19} className="text-gray-400 shrink-0" />
                                                        </div>
                                                    </>
                                                )}
                                            </React.Fragment>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Order Notification Panel */}
                <div className="bg-white rounded-xl p-6 shadow-sm mt-6 border border-slate-100">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">{t("orderNotificationPanel")}</h2>
                    <h3 className="text-sm font-bold text-gray-700 mb-1">{t("alarmControls")}</h3>
                    <p className="text-sm text-gray-500 mb-3">{t("cardFlashingAlert")}</p>

                    <button
                        type="button"
                        onClick={handleMuteToggle}
                        className="w-full flex items-center justify-between px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all cursor-pointer"
                    >
                        <span className="text-gray-700 font-medium text-sm">
                            {isMuted ? t("unmute") : t("mute")}
                        </span>
                        {isMuted ? (
                            <VolumeX size={18} className="text-gray-500" />
                        ) : (
                            <Volume2 size={18} className="text-gray-500" />
                        )}
                    </button>
                </div>
            </div>

            {/* Hidden audio element */}
            {/* <audio ref={audioRef} loop>
                <source src="/alarm.mp3" type="audio/mpeg" />
            </audio> */}
        </div>
    );
};

export default OrderLifeCycle;