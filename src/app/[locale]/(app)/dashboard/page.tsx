"use client";
import { useState, use, useEffect } from "react";
import DashboardStats from "./DashboardStats";
import OrdersPerHour from "./OrdersPerHour";
import TopSellingItems from "./TopSellingItems";
import DateRangePicker from "@/components/shared/DateRangePicker";
import { useTranslations } from "next-intl";
import { useGetAnalyticsQuery } from "@/redux/features/dashboard/dashboard.api";
import DownloadAllReports from "@/components/modal/DownloadAllReports";
import { Download } from "lucide-react";
import { formatDateString } from "@/lib/formateDateString";


const DashboardPage = ({ params }: { params?: Promise<{ locale: string }> }) => {
  if (params) use(params);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const t = useTranslations("Dashboard");

  // Set default dates to today on mount
  useEffect(() => {
    setStartDate(new Date());
    setEndDate(new Date());
  }, []);

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
        <div className="flex flex-wrap items-center gap-3">
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onChange={(s, e) => { setStartDate(s); setEndDate(e); }}
          />
          <button
            onClick={() => setIsDownloadModalOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-blue-700 transition cursor-pointer"
          >
            <Download size={16} />
            <span>{t("downloadPdf")}</span>
          </button>
        </div>
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

      {isDownloadModalOpen && (
        <DownloadAllReports onClose={() => setIsDownloadModalOpen(false)} />
      )}
    </div>
  );
};

export default DashboardPage;