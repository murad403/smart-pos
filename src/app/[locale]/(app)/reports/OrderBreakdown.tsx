/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useTranslations } from "next-intl";
import { SalesReportOrderBreakdown } from "@/redux/features/dashboard/dashboard.type";

interface OrderBreakdownProps {
    breakdown?: SalesReportOrderBreakdown;
    isLoading?: boolean;
}

const RADIAN = Math.PI / 180;
const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, name, percent }: any) => {
    if (!percent || percent <= 0) return null;
    const x = cx + (outerRadius + 28) * Math.cos(-midAngle * RADIAN);
    const y = cy + (outerRadius + 28) * Math.sin(-midAngle * RADIAN);
    const pct = (percent * 100).toFixed(0);
    const color = name === "Dine-in" ? "#2563eb" : "#ca8a04";
    return (
        <text x={x} y={y} fill={color} textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={500}>
            {name}: {pct}%
        </text>
    );
};

const OrderBreakdown = ({ breakdown, isLoading }: OrderBreakdownProps) => {
    const t = useTranslations("Reports");
    const td = useTranslations("Dashboard");

    if (isLoading) {
        return (
            <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm h-[380px] animate-pulse flex flex-col justify-between">
                <div className="h-6 w-40 bg-slate-100 rounded mb-4" />
                <div className="flex-1 flex items-center justify-center">
                    <div className="h-40 w-40 rounded-full border-8 border-slate-50" />
                </div>
                <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="rounded-xl bg-slate-50 py-4 h-[72px]" />
                    <div className="rounded-xl bg-slate-50 py-4 h-[72px]" />
                </div>
            </div>
        );
    }

    const dineInVal = breakdown?.dineIn ?? 0;
    const takeawayVal = breakdown?.takeaway ?? 0;

    const data = [
        { name: "Dine-in",  value: dineInVal, color: "#2563eb" },
        { name: "Takeaway", value: takeawayVal, color: "#eab308" },
    ];

    // If both values are 0, PieChart might not render anything. We can provide a placeholder or just let it be.
    const hasData = dineInVal > 0 || takeawayVal > 0;

    return (
        <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-base font-semibold text-slate-800">{t("orderBreakdown")}</h3>

            <div className="flex justify-center">
                {hasData ? (
                    <ResponsiveContainer width={260} height={220}>
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                outerRadius={90}
                                dataKey="value"
                                labelLine={false}
                                label={renderLabel}
                                startAngle={90}
                                endAngle={-270}
                            >
                                {data.map((entry, i) => (
                                    <Cell key={i} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(v: any) => [`${v} ${td("orders")}`, ""]} />
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-[220px] flex items-center justify-center text-sm text-slate-400">
                        No orders recorded
                    </div>
                )}
            </div>

            {/* Count badges */}
            <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-blue-50 py-4 text-center">
                    <p className="text-xs text-slate-500">{td("dineIn")}</p>
                    <p className="mt-1 text-2xl font-bold text-blue-600">{dineInVal}</p>
                </div>
                <div className="rounded-xl bg-yellow-50 py-4 text-center">
                    <p className="text-xs text-slate-500">{td("takeaway")}</p>
                    <p className="mt-1 text-2xl font-bold text-yellow-500">{takeawayVal}</p>
                </div>
            </div>
        </div>
    );
};

export default OrderBreakdown;