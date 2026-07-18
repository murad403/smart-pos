"use client";
import { ShoppingCart, DollarSign, Package } from "lucide-react";
import { useTranslations } from "next-intl";
import { OverviewStats, OrderTypeBreakdown } from "@/redux/features/dashboard/dashboard.type";

interface DashboardStatsProps {
    overview?: OverviewStats;
    orderTypeBreakdown?: OrderTypeBreakdown[];
    isLoading?: boolean;
}

const DashboardStats = ({ overview, orderTypeBreakdown, isLoading }: DashboardStatsProps) => {
    const t = useTranslations("Dashboard");

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <div
                        key={i}
                        className={`animate-pulse rounded-xl h-33.5 border border-slate-100 bg-white p-5 shadow-sm`}
                    />
                ))}
            </div>
        );
    }

    const isPositive = (overview?.percentageChange ?? 0) >= 0;
    const formattedChange = `${isPositive ? "+" : ""}${overview?.percentageChange ?? 0}% ${t("fromLastWeek")}`;

    const getTypeName = (type: string) => {
        const lower = type.toLowerCase();
        if (lower.includes("dine")) return t("dineIn") || type;
        if (lower.includes("take")) return t("takeaway") || type;
        return type;
    };

    const stats = [
        {
            label: t("totalRevenue"),
            value: `Rp ${(overview?.totalRevenue ?? 0).toLocaleString("en-US")}`,
            change: formattedChange,
            icon: <DollarSign className="size-5 text-white" />,
            variant: "blue" as const,
        },
        {
            label: t("totalOrders"),
            value: (overview?.totalOrders ?? 0).toLocaleString("en-US"),
            change: formattedChange,
            icon: <ShoppingCart className="size-5 text-blue-500" />,
            variant: "white" as const,
        },
        {
            label: t("avgOrderValue"),
            value: `Rp ${(overview?.averageOrderValue ?? 0).toLocaleString("en-US")}`,
            sub: t("acrossAllOrders"),
            icon: <Package className="size-5 text-yellow-500" />,
            variant: "white" as const,
        },
        {
            label: t("orderTypes"),
            orderTypes: orderTypeBreakdown && orderTypeBreakdown.length > 0
                ? orderTypeBreakdown.map((ot) => ({
                      name: getTypeName(ot.type),
                      count: ot.count,
                  }))
                : [
                      { name: t("dineIn"), count: 0 },
                      { name: t("takeaway"), count: 0 },
                  ],
            variant: "types" as const,
        },
    ];

    return (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat, i) => {
                if (stat.variant === "blue") {
                    return (
                        <div
                            key={i}
                            className="relative overflow-hidden rounded-xl bg-blue-600 p-5 text-white shadow-lg"
                        >
                            <div className="mb-3 flex items-center justify-between">
                                <span className="text-sm font-medium text-blue-100">{stat.label}</span>
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                                    {stat.icon}
                                </div>
                            </div>
                            <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
                            {/* <p className="mt-1 flex items-center gap-1 text-xs text-blue-100">
                                <span className={isPositive ? "text-emerald-300" : "text-red-300"}>
                                    {isPositive ? "↑" : "↓"}
                                </span>
                                {stat.change}
                            </p> */}
                            {/* decorative circle */}
                            <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-white/10" />
                        </div>
                    );
                }
                if (stat.variant === "white") {
                    return (
                        <div
                            key={i}
                            className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm"
                        >
                            <div className="mb-3 flex items-center justify-between">
                                <span className="text-sm font-medium text-slate-500">{stat.label}</span>
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50">
                                    {stat.icon}
                                </div>
                            </div>
                            <p className="text-2xl font-bold tracking-tight text-slate-900">{stat.value}</p>
                            {/* {stat.change && (
                                <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                                    <span className={isPositive ? "text-emerald-500" : "text-red-500"}>
                                        {isPositive ? "↑" : "↓"}
                                    </span>
                                    {stat.change}
                                </p>
                            )} */}
                            {/* {stat.sub && (
                                <p className="mt-1 text-xs text-slate-400">{stat.sub}</p>
                            )} */}
                        </div>
                    );
                }
                // Order Types
                return (
                    <div
                        key={i}
                        className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm"
                    >
                        <span className="text-sm font-medium text-slate-500">{stat.label}</span>
                        <div className="mt-4 space-y-3">
                            {stat.orderTypes?.map((ot) => (
                                <div key={ot.name} className="flex items-center justify-between">
                                    <span className="text-sm text-slate-600">{ot.name}</span>
                                    <span className="text-sm font-bold text-slate-900">{ot.count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default DashboardStats;