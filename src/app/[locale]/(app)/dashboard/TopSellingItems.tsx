"use client";
import { useTranslations } from "next-intl";
import { TopSellingItem as TopSellingItemType } from "@/redux/features/dashboard/dashboard.type";

interface TopSellingItemsProps {
    items?: TopSellingItemType[];
    isLoading?: boolean;
}

const TopSellingItems = ({ items, isLoading }: TopSellingItemsProps) => {
    const t = useTranslations("Dashboard");

    if (isLoading) {
        return (
            <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm min-h-[200px] flex flex-col">
                <div className="h-6 w-40 bg-slate-100 rounded mb-5 animate-pulse" />
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center justify-between animate-pulse">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-slate-100" />
                                <div className="h-4 w-32 bg-slate-100 rounded" />
                            </div>
                            <div className="h-4 w-12 bg-slate-100 rounded" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const itemsToRender = items ?? [];

    return (
        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
            <h3 className="mb-5 text-base font-semibold text-slate-800">{t("topSellingItems")}</h3>
            <div className="space-y-4">
                {itemsToRender.map((item, index) => (
                    <div
                        key={item.id}
                        className="flex items-center justify-between gap-4 border-b border-slate-50 pb-4 last:border-0 last:pb-0"
                    >
                        <div className="flex items-center gap-3">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                                {index + 1}
                            </span>
                            <span className="text-sm font-medium text-slate-700">{item.name}</span>
                        </div>
                        <span className="shrink-0 text-sm text-slate-500">{item.totalSold} {t("sold")}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TopSellingItems;