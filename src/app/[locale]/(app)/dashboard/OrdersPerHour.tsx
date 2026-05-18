/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useTranslations } from "next-intl";
import { OrdersPerHour as OrdersPerHourType } from "@/redux/features/dashboard/dashboard.type";

interface OrdersPerHourProps {
    ordersPerHour?: OrdersPerHourType[];
    isLoading?: boolean;
}

const CustomTooltip = ({ active, payload, label, t }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="rounded-lg border border-slate-100 bg-white px-3 py-2 shadow-lg">
                <p className="text-xs font-medium text-slate-500">{label}</p>
                <p className="text-sm font-bold text-blue-600">{payload[0].value} {t("orders")}</p>
            </div>
        );
    }
    return null;
};

const OrdersPerHour = ({ ordersPerHour, isLoading }: OrdersPerHourProps) => {
    const t = useTranslations("Dashboard");

    if (isLoading) {
        return (
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm h-[340px] flex flex-col">
                <div className="h-6 w-40 bg-slate-100 rounded mb-5 animate-pulse" />
                <div className="flex-1 bg-slate-50 rounded animate-pulse" />
            </div>
        );
    }

    const formatHourLabel = (hour: number) => {
        if (hour === 0) return "12AM";
        if (hour === 12) return "12PM";
        return hour > 12 ? `${hour - 12}PM` : `${hour}AM`;
    };

    // Prepare chart data: format hours
    const chartData = ordersPerHour && ordersPerHour.length > 0
        ? ordersPerHour.map((item) => ({
              hour: formatHourLabel(item.hour),
              orders: item.count,
          }))
        : [];

    return (
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <h3 className="mb-5 text-base font-semibold text-slate-800">{t("ordersPerHour")}</h3>
            <ResponsiveContainer width="100%" height={260}>
                <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid stroke="#f1f5f9" />
                    <XAxis
                        dataKey="hour"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11, fill: "#94a3b8" }}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11, fill: "#94a3b8" }}
                        width={30}
                    />
                    <Tooltip content={<CustomTooltip t={t} />} />
                    <Line
                        type="monotone"
                        dataKey="orders"
                        stroke="#2563eb"
                        strokeWidth={2.5}
                        dot={{ r: 4, fill: "#2563eb", strokeWidth: 0 }}
                        activeDot={{ r: 6, fill: "#2563eb" }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default OrdersPerHour;