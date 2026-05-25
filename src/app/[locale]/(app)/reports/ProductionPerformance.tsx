"use client";
import { useTranslations } from "next-intl";
import { ProductionPerformance as ProductionPerformanceType } from "@/redux/features/dashboard/dashboard.type";

interface ProductionPerformanceProps {
    performance?: ProductionPerformanceType[];
    isLoading?: boolean;
}

const ProductionPerformance = ({ performance, isLoading }: ProductionPerformanceProps) => {
    const t = useTranslations("Reports");

    if (isLoading) {
        return (
            <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm h-95 animate-pulse flex flex-col justify-between">
                <div>
                    <div className="h-6 w-48 bg-slate-100 rounded mb-5" />
                    {/* Avg prep time skeleton */}
                    <div className="rounded-xl bg-slate-50 px-4 py-3 h-18 mb-5" />
                    {/* Slowest items skeleton */}
                    <div className="h-4 w-32 bg-slate-100 rounded mb-3" />
                    <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="flex justify-between">
                                <div className="h-4 w-32 bg-slate-50 rounded" />
                                <div className="h-4 w-12 bg-slate-50 rounded" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    const itemsToRender = performance ?? [];
    const totalPrepTime = itemsToRender.reduce((s, p) => s + p.avgPrepTime, 0);
    const avgKitchenPrepTime = itemsToRender.length > 0 ? Math.round(totalPrepTime / itemsToRender.length) : 0;

    return (
        <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
            <h3 className="mb-5 text-base font-semibold text-slate-800">{t("productionPerformance")}</h3>

            {/* Avg prep time */}
            <div className="mb-5 rounded-xl bg-slate-50 px-4 py-3">
                <p className="text-xs text-slate-500">{t("avgPrepTime")}</p>
                <p className="mt-0.5 text-3xl font-bold text-slate-900">
                    {avgKitchenPrepTime} {t("min")}
                </p>
            </div>

            {/* Slowest items */}
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">{t("slowestItems")}</p>
            {itemsToRender.length > 0 ? (
                <div className="space-y-3">
                    {itemsToRender.map((item, i) => (
                        <div key={i} className="flex items-center justify-between">
                            <span className="text-sm text-slate-600 font-medium">{item.itemName}</span>
                            <span className="text-sm font-semibold text-slate-800">
                                {item.avgPrepTime} {t("min")}
                            </span>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-sm text-slate-400">No performance data recorded</div>
            )}
        </div>
    );
};

export default ProductionPerformance;