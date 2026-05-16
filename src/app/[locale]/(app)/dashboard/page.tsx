"use client";
import { useState, use } from "react";
import DashboardStats from "./DashboardStats";
import SalesOverTime from "./SalesOverTime";
import OrdersPerHour from "./OrdersPerHour";
import TopSellingItems from "./TopSellingItems";
import Alerts from "./Alerts";
import DateRangePicker from "@/components/shared/DateRangePicker";

import { useTranslations } from "next-intl";

const DashboardPage = ({ params }: { params?: Promise<{ locale: string }> }) => {
  if (params) use(params);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const t = useTranslations("Dashboard");

  return (
    <div className="bg-slate-50">
      {/* Page Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-slate-900">{t("title")}</h1>
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onChange={(s, e) => { setStartDate(s); setEndDate(e); }}
        />
      </div>

      {/* Stats Row */}
      <DashboardStats />

      {/* Charts Row */}
      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <SalesOverTime />
        <OrdersPerHour />
      </div>

      {/* Bottom Row */}
      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2">
        <TopSellingItems />
        <Alerts />
      </div>
    </div>
  );
};

export default DashboardPage;