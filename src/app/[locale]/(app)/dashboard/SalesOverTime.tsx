/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useTranslations, useLocale } from "next-intl";
import { SalesOverTime as SalesOverTimeType } from "@/redux/features/dashboard/dashboard.type";

interface SalesOverTimeProps {
    sales?: SalesOverTimeType[];
    isLoading?: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="rounded-lg border border-slate-100 bg-white px-3 py-2 shadow-lg">
                <p className="text-xs font-medium text-slate-500">{label}</p>
                <p className="text-sm font-bold text-blue-600">
                    Rp {payload[0].value.toLocaleString()}
                </p>
            </div>
        );
    }
    return null;
};

const SalesOverTime = ({ sales, isLoading }: SalesOverTimeProps) => {
    const t = useTranslations("Dashboard");
    const locale = useLocale();

    if (isLoading) {
        return (
            <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm h-[340px] flex flex-col">
                <div className="h-6 w-40 bg-slate-100 rounded mb-5 animate-pulse" />
                <div className="flex-1 bg-slate-50 rounded animate-pulse" />
            </div>
        );
    }

    const formattedData = sales && sales.length > 0
        ? sales.map((item) => {
              let label = item.date;
              try {
                  const date = new Date(item.date);
                  if (!isNaN(date.getTime())) {
                      label = date.toLocaleDateString(locale === "id" ? "id-ID" : "en-US", {
                          day: "numeric",
                          month: "short",
                      });
                  }
              } catch (e) {
                  // ignore
              }
              return {
                  day: label,
                  sales: item.revenue,
              };
          })
        : [];

    return (
        <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm">
            <h3 className="mb-5 text-base font-semibold text-slate-800">{t("salesOverTime")}</h3>
            <ResponsiveContainer width="100%" height={260}>
                <BarChart data={formattedData} barSize={40} margin={{ top: 5, right: 10, left: 0, bottom: 0 }} style={{ outline: "none" }}>
                    <CartesianGrid vertical={false} stroke="#f1f5f9" />
                    <XAxis
                        dataKey="day"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: "#94a3b8" }}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 11, fill: "#94a3b8" }}
                        width={55}
                        tickFormatter={(v) => {
                            if (v === 0) return "0";
                            return v.toLocaleString("en-US");
                        }}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: "#eff6ff", radius: 6 }} />
                    <Bar dataKey="sales" fill="#2563eb" radius={[6, 6, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default SalesOverTime;