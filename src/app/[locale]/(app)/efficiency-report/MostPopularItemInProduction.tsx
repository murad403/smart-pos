"use client";
import React from "react";
import { useTranslations } from "next-intl";

interface PopularItem {
  id: number;
  itemName: string;
  prepTime: string | number;
  totalOrders: number;
}

interface StationPopularItems {
  stationId: number;
  stationName: string;
  items: PopularItem[];
}

interface Props {
  stationsData?: StationPopularItems[];
  isLoading?: boolean;
}

const MostPopularItemInProduction: React.FC<Props> = ({ stationsData = [], isLoading }) => {
  const t = useTranslations("EfficiencyReport");

  // Helper to format prepTime: if string/number in seconds, format to minutes
  const formatTime = (timeVal: string | number) => {
    const secs = typeof timeVal === "string" ? parseInt(timeVal, 10) : timeVal;
    if (isNaN(secs)) return String(timeVal);
    if (secs === 0) return "0s";
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    if (mins > 0) {
      return `${mins}m ${remainingSecs}s`;
    }
    return `${remainingSecs}s`;
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm animate-pulse">
            <div className="h-6 w-48 bg-slate-100 rounded mb-4" />
            <div className="space-y-3">
              {[1, 2, 3].map((j) => (
                <div key={j} className="flex justify-between items-center py-2 border-b border-slate-55">
                  <div className="h-4 w-32 bg-slate-100 rounded" />
                  <div className="h-4 w-12 bg-slate-100 rounded" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {stationsData.map((station) => (
        <div
          key={station.stationId}
          className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm flex flex-col"
        >
          <h3 className="text-base font-bold text-slate-800 mb-4 border-b border-slate-100 pb-3">
            {t("mostPopularItems", { station: station.stationName })}
          </h3>
          <div className="flex-1 space-y-4">
            {station.items && station.items.length > 0 ? (
              station.items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center py-1.5 border-b border-slate-50 last:border-0"
                >
                  <span className="text-[14px] font-semibold text-slate-700 truncate max-w-50">
                    {item.itemName}
                  </span>
                  <span className="text-[14px] font-bold text-red-500 whitespace-nowrap">
                    {formatTime(item.prepTime)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-400 text-center py-6">No items found</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MostPopularItemInProduction;