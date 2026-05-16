"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import CustomSwitch from "@/components/shared/CustomeSwitch";
import { useTranslations } from "next-intl";

type DayConfig = {
  key: string;
  isOpen: boolean;
  startTime: string;
  endTime: string;
};

const OperatingHoursPage = ({ params }: { params?: Promise<{ locale: string }> }) => {
  if (params) React.use(params);
  const t = useTranslations("Profile");
  const td = useTranslations("Days");

  const initialDays: DayConfig[] = [
    { key: "monday",    isOpen: true,  startTime: "09:00 AM", endTime: "10:00 PM" },
    { key: "tuesday",   isOpen: true,  startTime: "09:00 AM", endTime: "10:00 PM" },
    { key: "wednesday", isOpen: true,  startTime: "09:00 AM", endTime: "10:00 PM" },
    { key: "thursday",  isOpen: true,  startTime: "09:00 AM", endTime: "10:00 PM" },
    { key: "friday",    isOpen: true,  startTime: "09:00 AM", endTime: "10:00 PM" },
    { key: "saturday",  isOpen: true,  startTime: "09:00 AM", endTime: "10:00 PM" },
    { key: "sunday",    isOpen: false, startTime: "09:00 AM", endTime: "10:00 PM" },
  ];

  const [days, setDays] = React.useState<DayConfig[]>(initialDays);

  const toggleDay = (index: number) => {
    setDays((curr) =>
      curr.map((d, i) => (i === index ? { ...d, isOpen: !d.isOpen } : d))
    );
  };

  const updateTime = (index: number, type: "startTime" | "endTime", value: string) => {
    setDays((curr) =>
      curr.map((d, i) => (i === index ? { ...d, [type]: value } : d))
    );
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">{t("operatingHoursSettings")}</h1>
          <p className="mt-1 text-slate-500">{t("subtitle")}</p>
        </div>
        <div className="inline-flex items-center rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold tracking-wide text-blue-600">
          {t("verified")}
        </div>
      </div>

      <div className="rounded-[24px] border border-slate-100 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] sm:p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-[13px] font-bold uppercase tracking-[0.15em] text-slate-400">{t("operatingHours")}</h2>
            <p className="mt-2 text-[14px] text-slate-500">{t("hoursDescription")}</p>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1.5">
            <div className="size-2 rounded-full bg-orange-400" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-orange-600">{t("securityEnforcementActive") || "SECURITY ENFORCEMENT ACTIVE"}</span>
          </div>
        </div>

        <div className="grid gap-x-6 gap-y-4 md:grid-cols-2">
          {days.map((config, idx) => (
            <div key={config.key} className={cn("rounded-2xl border border-slate-100 p-5 transition-all", !config.isOpen && "bg-slate-50/50 opacity-60")}>
              <div className="flex items-center justify-between">
                <span className="text-[16px] font-semibold text-slate-900">{td(config.key)}</span>
                <CustomSwitch
                  label=""
                  checked={config.isOpen}
                  onChange={() => toggleDay(idx)}
                />
              </div>
              
              <div className="mt-4 flex items-center gap-3">
                <div className="flex-1">
                  <input
                    type="text"
                    value={config.startTime}
                    disabled={!config.isOpen}
                    onChange={(e) => updateTime(idx, "startTime", e.target.value)}
                    className="w-full rounded-xl border border-slate-100 bg-white px-4 py-2.5 text-[14px] text-slate-600 outline-none focus:border-blue-500/50"
                  />
                </div>
                <span className="text-slate-300">-</span>
                <div className="flex-1">
                  <input
                    type="text"
                    value={config.endTime}
                    disabled={!config.isOpen}
                    onChange={(e) => updateTime(idx, "endTime", e.target.value)}
                    className="w-full rounded-xl border border-slate-100 bg-white px-4 py-2.5 text-[14px] text-slate-600 outline-none focus:border-blue-500/50"
                  />
                </div>
              </div>
              {!config.isOpen && (
                <p className="mt-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">{t("closed")}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Global Save Changes Button */}
      <Button
        type="button"
        className="h-12 cursor-pointer w-full rounded-xl bg-[#3B82F6] text-lg font-semibold text-white shadow-xl shadow-blue-500/20 hover:bg-blue-600"
      >
        {t("saveChanges")}
      </Button>
    </div>
  );
};

// Helper function
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}

export default OperatingHoursPage;