"use client";
import { useTranslations } from "next-intl";
import { SalesReportTopItem } from "@/redux/features/dashboard/dashboard.type";

interface TopSalesProps {
    items?: SalesReportTopItem[];
    isLoading?: boolean;
}

const TopSales = ({ items, isLoading }: TopSalesProps) => {
    const t = useTranslations("Reports");

    if (isLoading) {
        return (
            <div className="rounded-xl border border-slate-100 bg-white shadow-sm h-[260px] animate-pulse flex flex-col">
                <div className="px-6 pt-5 pb-2">
                    <div className="h-6 w-32 bg-slate-100 rounded" />
                </div>
                <div className="flex-1 px-6 space-y-4 mt-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex justify-between border-b border-slate-50 pb-3">
                            <div className="h-4 w-40 bg-slate-50 rounded" />
                            <div className="h-4 w-24 bg-slate-50 rounded" />
                            <div className="h-4 w-12 bg-slate-50 rounded" />
                            <div className="h-4 w-20 bg-slate-50 rounded" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const itemsToRender = items ?? [];

    return (
        <div className="rounded-xl border border-slate-100 bg-white shadow-sm">
            <div className="px-6 pt-5 pb-2">
                <h3 className="text-base font-semibold text-slate-800">{t("topSales")}</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-slate-100">
                            <th className="px-6 py-3 text-left font-medium text-slate-500">{t("item")}</th>
                            <th className="px-6 py-3 text-left font-medium text-slate-500">{t("category")}</th>
                            <th className="px-6 py-3 text-right font-medium text-slate-500">{t("quantity")}</th>
                            <th className="px-6 py-3 text-right font-medium text-slate-500">{t("revenue")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {itemsToRender.map((item, i) => (
                            <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60">
                                <td className="px-6 py-3.5 text-slate-700 font-medium">{item.item}</td>
                                <td className="px-6 py-3.5 text-slate-500">{item.category}</td>
                                <td className="px-6 py-3.5 text-right text-slate-700">{item.quantity}</td>
                                <td className="px-6 py-3.5 text-right font-semibold text-slate-800">
                                    Rp {item.revenue.toLocaleString("en-US")}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TopSales;