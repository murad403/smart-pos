/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useTranslations, useLocale } from "next-intl";
import { SalesReportSummary } from "@/redux/features/dashboard/dashboard.type";

interface OrdersCountProps {
    salesSummary?: SalesReportSummary[];
    isLoading?: boolean;
}

const CustomTooltip = ({ active, payload, label, t }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="rounded-lg border border-slate-100 bg-white px-3 py-2 shadow-lg">
                <p className="text-xs font-medium text-slate-500">{label}</p>
                <p className="text-sm font-bold text-blue-600">
                    {payload[0].value} {t("orders")}
                </p>
            </div>
        );
    }
    return null;
};

const OrdersCount = ({ salesSummary, isLoading }: OrdersCountProps) => {
    const t = useTranslations("Reports");
    const locale = useLocale();

    if (isLoading) {
        return (
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm h-[340px] flex flex-col mt-5">
                <div className="h-6 w-40 bg-slate-100 rounded mb-5 animate-pulse" />
                <div className="flex-1 bg-slate-50 rounded animate-pulse" />
            </div>
        );
    }

    const formattedData = salesSummary && salesSummary.length > 0
        ? salesSummary.map((item) => {
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
                  orders: item.orders,
              };
          })
        : [];

    return (
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm mt-5">
            <h3 className="mb-5 text-base font-semibold text-slate-800">{t("ordersCount")}</h3>
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
                        width={30}
                        allowDecimals={false}
                    />
                    <Tooltip content={<CustomTooltip t={t} />} cursor={{ fill: "#eff6ff", radius: 6 }} />
                    <Bar dataKey="orders" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default OrdersCount;