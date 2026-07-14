/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer,
} from "recharts";
import { useTranslations, useLocale } from "next-intl";
import { SalesReportSummary, MonthlyEarnings, SalesReportPeriod } from "@/redux/features/dashboard/dashboard.type";

interface SalesSummaryProps {
    salesSummary?: SalesReportSummary[];
    monthlyEarnings?: MonthlyEarnings;
    period?: SalesReportPeriod;
    isLoading?: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
        return (
            <div className="rounded-lg border border-slate-100 bg-white px-3 py-2 shadow-lg">
                <p className="text-xs text-slate-500">{label}</p>
                <p className="text-sm font-bold text-blue-600">Rp {payload[0].value.toLocaleString()}</p>
            </div>
        );
    }
    return null;
};

const SalesSummary = ({ salesSummary, monthlyEarnings, period, isLoading }: SalesSummaryProps) => {
    const t = useTranslations("Reports");
    const locale = useLocale();

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm h-[320px] animate-pulse flex flex-col">
                    <div className="h-6 w-40 bg-slate-100 rounded mb-2" />
                    <div className="h-4 w-60 bg-slate-50 rounded mb-5" />
                    <div className="flex-1 bg-slate-50 rounded" />
                </div>
                <div className="rounded-2xl bg-blue-50 px-6 py-5 h-[94px] animate-pulse flex items-center justify-between">
                    <div className="h-10 w-48 bg-blue-100 rounded" />
                    <div className="h-10 w-24 bg-blue-100 rounded" />
                </div>
            </div>
        );
    }

    const formatDateRange = (startStr?: string, endStr?: string) => {
        if (!startStr || !endStr) return "";
        try {
            const start = new Date(startStr);
            const end = new Date(endStr);
            const options: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" };
            return `${start.toLocaleDateString(locale === "id" ? "id-ID" : "en-US", options)} – ${end.toLocaleDateString(locale === "id" ? "id-ID" : "en-US", options)}`;
        } catch {
            return `${startStr} – ${endStr}`;
        }
    };

    const chartData = salesSummary && salesSummary.length > 0
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
                  date: label,
                  sales: item.revenue,
              };
          })
        : [];

    return (
        <div className="space-y-4">
            {/* Chart card */}
            <div className="rounded-xl border border-slate-100 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900">{t("salesSummary")}</h2>
                {period && (
                    <p className="mt-0.5 text-sm font-medium text-blue-500">
                        {formatDateRange(period.startDate, period.endDate)}
                    </p>
                )}
                <div className="mt-5">
                    <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }} style={{ outline: "none" }}>
                            <CartesianGrid stroke="#f1f5f9" />
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 11, fill: "#94a3b8" }}
                            />
                            <YAxis
                                tickFormatter={(v) => v === 0 ? "0" : v.toLocaleString("en-US")}
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 11, fill: "#94a3b8" }}
                                width={58}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Line
                                type="monotone"
                                dataKey="sales"
                                stroke="#2563eb"
                                strokeWidth={2.5}
                                dot={{ r: 4, fill: "#2563eb", strokeWidth: 0 }}
                                activeDot={{ r: 6 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Monthly earning card */}
            {/* <div className="flex items-center justify-between rounded-2xl bg-blue-50 px-6 py-5">
                <div>
                    <p className="text-lg font-bold text-slate-800">{t("thisMonthEarning")}</p>
                    <p className="mt-1 text-2xl font-bold text-slate-900">
                        Rp {(monthlyEarnings?.currentMonth ?? 0).toLocaleString("en-US")}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-2xl font-bold text-slate-900">
                        {monthlyEarnings?.comparisonText ?? "+0.0%"}
                    </p>
                    <p className="mt-1 text-sm text-blue-500">{t("comparedToLastMonth")}</p>
                </div>
            </div> */}
        </div>
    );
};

export default SalesSummary;