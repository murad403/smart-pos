"use client";
import { useState, use, useEffect } from "react";
import DashboardStats from "./DashboardStats";
import SalesOverTime from "./SalesOverTime";
import OrdersPerHour from "./OrdersPerHour";
import TopSellingItems from "./TopSellingItems";
import DateRangePicker from "@/components/shared/DateRangePicker";
import { useTranslations } from "next-intl";
import { useGetAnalyticsQuery } from "@/redux/features/dashboard/dashboard.api";


const DashboardPage = ({ params }: { params?: Promise<{ locale: string }> }) => {
  if (params) use(params);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const t = useTranslations("Dashboard");

  // Set default dates to today on mount
  useEffect(() => {
    setStartDate(new Date());
    setEndDate(new Date());
  }, []);

  // Helper function to format Date object as YYYY-MM-DD format in local timezone
  const formatDateString = (date: Date | null) => {
    if (!date) return undefined;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Fetch dashboard data based on selected start and end dates
  const { data: analyticsRes, isLoading } = useGetAnalyticsQuery({
    startDate: formatDateString(startDate || new Date()),
    endDate: formatDateString(endDate || new Date()),
  });

  const analyticsData = analyticsRes?.data;

  return (
    <div className="bg-slate-50">
      {/* Page Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{t("title")}</h1>
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onChange={(s, e) => { setStartDate(s); setEndDate(e); }}
        />
      </div>

      {/* Stats Row */}
      <DashboardStats
        overview={analyticsData?.overview}
        orderTypeBreakdown={analyticsData?.orderTypeBreakdown}
        isLoading={isLoading}
      />

      {/* Charts Row */}
      <div className="mt-5">
        {/* <SalesOverTime sales={analyticsData?.salesOverTime} isLoading={isLoading} /> */}
        <OrdersPerHour ordersPerHour={analyticsData?.ordersPerHour} isLoading={isLoading} />
      </div>

      {/* Bottom Row */}
      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <TopSellingItems items={analyticsData?.topSellingItems} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default DashboardPage;