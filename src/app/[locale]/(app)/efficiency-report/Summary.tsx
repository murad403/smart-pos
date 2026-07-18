"use client";
import React from "react";
import { useTranslations } from "next-intl";

interface SummaryData {
    totalOrders: number;
    totalItems: number;
    avgCollectionTime: string;
    avgWaitTime: string;
    [key: string]: any; // Allow dynamic avg[Station]Time properties
}

interface Props {
    summary?: SummaryData;
    isLoading?: boolean;
}

const Summary: React.FC<Props> = ({ summary, isLoading }) => {
    const t = useTranslations("EfficiencyReport");

    if (isLoading || !summary) {
        return (
            <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm mt-6 animate-pulse">
                <div className="h-6 w-32 bg-slate-100 rounded mb-6" />
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="h-24 bg-slate-50 rounded" />
                    ))}
                </div>
            </div>
        );
    }

    // Extract station times dynamically (keys like avgKitchenTime, avgBarTime, etc.)
    const stationCards = Object.entries(summary)
        .filter(([key]) => key.startsWith("avg") && key !== "avgCollectionTime" && key !== "avgWaitTime")
        .map(([key, value]) => {
            // e.g., avgKitchenTime -> Kitchen
            const stationName = key.replace(/^avg/, "").replace(/Time$/, "");
            return {
                label: t("avgStationTime", { station: stationName }),
                value: String(value),
                isSpecial: false,
            };
        });

    const cards = [
        {
            label: t("totalOrders"),
            value: String(summary.totalOrders),
            isSpecial: false,
        },
        {
            label: t("totalItems"),
            value: String(summary.totalItems),
            isSpecial: false,
        },
        ...stationCards,
        {
            label: t("avgCollectionTime"),
            value: summary.avgCollectionTime,
            isSpecial: false,
        },
        {
            label: t("avgWaitTime"),
            value: summary.avgWaitTime,
            isSpecial: true, // Wait time has special blue styling in mockup
        },
    ];

    return (
        <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-800 mb-6 border-b border-slate-100 pb-3">
                {t("summary")}
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {cards.map((card, idx) => (
                    <div
                        key={idx}
                        className={`rounded-2xl p-4 border flex flex-col justify-between min-h-25 transition-all ${card.isSpecial
                                ? "bg-blue-50/50 border-blue-200 text-blue-600 shadow-sm"
                                : "bg-slate-50/40 border-slate-100 text-slate-700"
                            }`}
                    >
                        <span className={`text-xs font-semibold uppercase tracking-wider block mb-2 ${card.isSpecial ? "text-blue-500" : "text-slate-400"
                            }`}>
                            {card.label}
                        </span>
                        <span className={`text-xl font-extrabold ${card.isSpecial ? "text-blue-600" : "text-slate-800"
                            }`}>
                            {card.value}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Summary;