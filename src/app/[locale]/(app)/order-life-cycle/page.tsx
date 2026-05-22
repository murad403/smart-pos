"use client";
import React, { useState, useRef } from "react";
import { Volume2, VolumeX, ArrowRight, ArrowDown } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

const OrderLifeCycle = () => {
    const t = useTranslations("OrderLifeCycle");
    const [isMuted, setIsMuted] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const handleMuteToggle = () => {
        setIsMuted((prev) => {
            if (audioRef.current) {
                audioRef.current.muted = !prev;
            }
            return !prev;
        });
    };

    const steps = [
        {
            label: t("inComing"),
            color: "bg-red-500",
            textColor: "text-white",
            subLabel: t("redFlashingAlert"),
            desc: t("redFlashingDesc"),
        },
        {
            label: t("okPressed"),
            color: "bg-blue-600",
            textColor: "text-white",
            subLabel: t("processing"),
            desc: t("processingDesc"),
        },
        {
            label: t("ready"),
            color: "bg-green-500",
            textColor: "text-white",
            subLabel: t("collectionAlertSent"),
            desc: t("collectionDesc"),
        },
        {
            label: t("pickUp"),
            color: "bg-gray-400",
            textColor: "text-white",
            subLabel: t("clearFromScreen"),
            desc: t("clearDesc"),
            hasIcon: true,
        },
    ];

    return (
        <div>
            <div className="max-w-7xl mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold text-gray-900">{t("orderLifeCycle")}</h1>
                <p className="text-sm text-gray-500 mb-6">{t("activeOrders")}</p>

                {/* Lifecycle Steps */}
                <div className="p-6 mb-6">
                    <h2 className="text-lg md:text-xl font-bold text-text-color mb-6">{t("orderLifeCycle")}</h2>

                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-center gap-4 sm:gap-2">
                        {steps.map((step, idx) => (
                            <React.Fragment key={idx}>
                                <div className="flex sm:flex-col items-start sm:items-center gap-3 sm:gap-2 sm:flex-1 w-full sm:min-w-20">
                                    <button
                                        className={`w-20 sm:w-full px-3 sm:px-4 py-3 rounded-lg font-semibold text-xs sm:text-sm ${step.color} ${step.textColor} flex items-center justify-center gap-1 shrink-0 whitespace-nowrap`}
                                    >
                                        {step.hasIcon && <span>🚫</span>}
                                        {step.label}
                                    </button>

                                    <div className="flex-1 text-left sm:text-center">
                                        <p className="text-sm md:text-base text-text-color font-semibold">
                                            {step.subLabel}
                                        </p>
                                        <p className="text-xs md:text-sm text-text-color max-w-full sm:max-w-35">
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

                {/* Order Notification Panel */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">{t("orderNotificationPanel")}</h2>
                    <h3 className="text-sm font-bold text-gray-700 mb-1">{t("alarmControls")}</h3>
                    <p className="text-sm text-gray-500 mb-3">{t("cardFlashingAlert")}</p>

                    <button
                        onClick={handleMuteToggle}
                        className="w-full flex items-center justify-between px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
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
            <audio ref={audioRef} loop>
                <source src="/alarm.mp3" type="audio/mpeg" />
            </audio>
        </div>
    );
};

export default OrderLifeCycle;