"use client";
import { useState, use } from "react";
import { FileText, FileSpreadsheet } from "lucide-react";
import SalesSummary from "./SalesSummary";
import TopSales from "./TopSales";
import OrderBreakdown from "./OrderBreakdown";
import ProductionPerformance from "./ProductionPerformance";
import LongestPreTime from "./LongestPreTime";
import DateRangePicker from "@/components/shared/DateRangePicker";
import { useTranslations } from "next-intl";

const ReportsPage = ({ params }: { params?: Promise<{ locale: string }> }) => {
  if (params) use(params);
  const t = useTranslations("Reports");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [quickFilter, setQuickFilter] = useState<"0Days" | "7Days" | "30Days">("0Days");

  return (
    <div >
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-900">{t("title")}</h1>

        <div className="flex flex-wrap items-center gap-2">
          {/* Date range */}
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onChange={(s, e) => { setStartDate(s); setEndDate(e); }}
          />

          {/* Quick filter */}
          {(["0Days", "7Days", "30Days"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setQuickFilter(f)}
              className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${quickFilter === f
                  ? "bg-slate-700 text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                }`}
            >
              {f === "0Days" ? t("zeroDays") : f === "7Days" ? t("sevenDays") : t("thirtyDays")}
            </button>
          ))}
        </div>
      </div>

      {/* Sales Summary + Monthly Earning */}
      <SalesSummary />

      {/* Top Sales Table */}
      <div className="mt-5">
        <TopSales />
      </div>

      {/* Order Breakdown + Production Performance */}
      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <OrderBreakdown />
        <ProductionPerformance />
      </div>

      {/* Longest Prep Time */}
      <div className="mt-5">
        <LongestPreTime />
      </div>
    </div>
  );
};

export default ReportsPage;