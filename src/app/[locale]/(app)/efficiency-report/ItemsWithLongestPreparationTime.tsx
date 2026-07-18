"use client";
import React from "react";
import { useTranslations } from "next-intl";

interface LongestPrepItem {
  id: number;
  itemName: string;
  prepTime: string | number; // seconds
  stationName?: string;
  stationId?: number;
}

interface GroupedStation {
  stationName: string;
  items: LongestPrepItem[];
}

interface Props {
  longestPrepTimeItems?: any[];
  isLoading?: boolean;
}

const ItemsWithLongestPreparationTime: React.FC<Props> = ({ longestPrepTimeItems = [], isLoading }) => {
  const t = useTranslations("EfficiencyReport");

  // Helper to format prepTime: if string/number in seconds, format to minutes/seconds
  const formatTime = (timeVal: string | number) => {
    const secs = typeof timeVal === "string" ? parseInt(timeVal, 10) : timeVal;
    if (isNaN(secs)) return String(timeVal);
    if (secs === 0) return "0s";
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    if (mins > 0) {
      return `${mins} min`;
    }
    return `${remainingSecs}s`;
  };

  // Safe parsing helper to get numerical seconds for progress bar width
  const getSeconds = (timeVal: string | number) => {
    const secs = typeof timeVal === "string" ? parseInt(timeVal, 10) : timeVal;
    return isNaN(secs) ? 0 : secs;
  };

  // Normalize data into dynamic groups
  const stations: GroupedStation[] = React.useMemo(() => {
    if (!longestPrepTimeItems || longestPrepTimeItems.length === 0) return [];

    // Case 1: Already grouped by station (e.g. { stationName: "Kitchen", items: [...] })
    if (longestPrepTimeItems[0] && Array.isArray(longestPrepTimeItems[0].items)) {
      return longestPrepTimeItems.map(s => ({
        stationName: s.stationName || `Station ${s.stationId}`,
        items: s.items || []
      }));
    }

    // Case 2: Flat list (e.g. { itemName: "Nasi", prepTime: 123, stationName: "Kitchen" })
    const groups: Record<string, LongestPrepItem[]> = {};
    longestPrepTimeItems.forEach((item) => {
      const sName = item.stationName || "Other";
      if (!groups[sName]) groups[sName] = [];
      groups[sName].push(item);
    });

    return Object.keys(groups).map((key) => ({
      stationName: key,
      items: groups[key]
    }));
  }, [longestPrepTimeItems]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm mt-6 animate-pulse">
        <div className="h-6 w-56 bg-slate-100 rounded mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[1, 2].map((g) => (
            <div key={g} className="space-y-4">
              <div className="h-5 w-24 bg-slate-100 rounded mb-3" />
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="h-4 w-28 bg-slate-100 rounded" />
                  <div className="flex-1 h-3 bg-slate-100 rounded" />
                  <div className="h-4 w-12 bg-slate-100 rounded" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm">
      <h3 className="text-base font-bold text-slate-800 mb-6 border-b border-slate-100 pb-3">
        {t("longestPrepTime")}
      </h3>

      {stations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {stations.map((station, idx) => {
            // Find max prepTime in this station's items to scale progress bar width
            const maxPrep = Math.max(...station.items.map(item => getSeconds(item.prepTime)), 1);

            return (
              <div key={idx} className="flex flex-col">
                <h4 className="text-sm font-bold text-slate-500 mb-4">{station.stationName}</h4>
                <div className="space-y-3">
                  {station.items.map((item, itemIdx) => {
                    const secs = getSeconds(item.prepTime);
                    const percentage = Math.min(100, Math.max(10, (secs / maxPrep) * 100));

                    return (
                      <div key={itemIdx} className="flex items-center gap-4">
                        <span className="text-xs font-semibold text-slate-600 w-32 truncate" title={item.itemName}>
                          {item.itemName}
                        </span>
                        <div className="flex-1 bg-slate-50 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-red-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold text-red-500 whitespace-nowrap w-16 text-right">
                          {formatTime(item.prepTime)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-slate-400 text-center py-8">No longest preparation items found</p>
      )}
    </div>
  );
};

export default ItemsWithLongestPreparationTime;