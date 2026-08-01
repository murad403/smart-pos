"use client";
import { useState, use, useEffect } from "react";
import SalesSummary from "./SalesSummary";
import TopSales from "./TopSales";
import OrderBreakdown from "./OrderBreakdown";
import ProductionPerformance from "./ProductionPerformance";
import DateRangePicker from "@/components/shared/DateRangePicker";
import { useTranslations } from "next-intl";
import { useGetSalesReportsQuery } from "@/redux/features/dashboard/dashboard.api";
import OrdersCount from "./OrdersCount";
import { formatDateString } from "@/lib/formateDateString";

const ReportsPage = ({ params }: { params?: Promise<{ locale: string }> }) => {
  if (params) use(params);
  const t = useTranslations("Reports");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  useEffect(() => {
    setStartDate(new Date());
    setEndDate(new Date());
  }, []);


  // Fetch report data
  const { data: salesReportRes, isLoading } = useGetSalesReportsQuery({
    startDate: formatDateString(startDate || new Date()),
    endDate: formatDateString(endDate || new Date()),
  });

  const reportData = salesReportRes?.data;

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{t("title")}</h1>

        <div className="flex flex-wrap items-center gap-2">
          {/* Date range */}
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onChange={(s, e) => {
              setStartDate(s);
              setEndDate(e);
            }}
          />
        </div>
      </div>

      <SalesSummary
        salesSummary={reportData?.salesSummary}
        monthlyEarnings={reportData?.monthlyEarnings}
        period={reportData?.period}
        isLoading={isLoading}
        startDate={startDate}
        endDate={endDate}
      />
      <OrdersCount salesSummary={reportData?.salesSummary} isLoading={isLoading} />

      {/* Top Sales Table */}
      <div className="mt-5">
        <TopSales items={reportData?.topSellingItems} isLoading={isLoading} />
      </div>

      {/* Order Breakdown + Production Performance */}
      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <OrderBreakdown breakdown={reportData?.orderBreakdown} isLoading={isLoading} />
        {/* <ProductionPerformance performance={reportData?.productionPerformance} isLoading={isLoading} /> */}
      </div>
    </div>
  );
};

export default ReportsPage;