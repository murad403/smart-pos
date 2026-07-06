"use client";
import React from "react";
import { useTranslations } from "next-intl";

interface DetailedReportItem {
  orderNumber: number;
  orderSlug: string;
  orderTime: string;
  totalItems: number;
  stationTimes?: Record<string, string>;
  collectionTime: string;
  deliveryTime: string;
  waitTime: string;
}

interface Props {
  reportData?: DetailedReportItem[];
  isLoading?: boolean;
}

const DetailedReport: React.FC<Props> = ({ reportData = [], isLoading }) => {
  const t = useTranslations("EfficiencyReport");

  // Get unique station names dynamically across all report entries
  const stationNames = React.useMemo(() => {
    const names = new Set<string>();
    reportData.forEach((item) => {
      if (item.stationTimes) {
        Object.keys(item.stationTimes).forEach((k) => names.add(k));
      }
    });
    return Array.from(names);
  }, [reportData]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm mt-6 animate-pulse">
        <div className="h-6 w-40 bg-slate-100 rounded mb-6" />
        <div className="space-y-4">
          <div className="h-10 bg-slate-50 rounded" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-slate-100 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm overflow-hidden w-full min-w-0">
      <h3 className="text-base font-bold text-slate-800 mb-6 border-b border-slate-100 pb-3">
        {t("detailedReport")}
      </h3>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-150">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                {t("numberHeader")}
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                {t("orderTimeHeader")}
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                {t("orderNumberHeader")}
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                {t("totalItemsHeader")}
              </th>
              {stationNames.map((sName) => (
                <th
                  key={sName}
                  className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap"
                >
                  {sName}
                </th>
              ))}
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                {t("collectionHeader")}
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                {t("deliveryTimeHeader")}
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                {t("waitTimeHeader")}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {reportData.length > 0 ? (
              reportData.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/40 transition-colors">
                  <td className="px-4 py-3.5 text-sm font-medium text-slate-500">
                    {idx + 1}
                  </td>
                  <td className="px-4 py-3.5 text-sm font-semibold text-slate-700">
                    {item.orderTime}
                  </td>
                  <td className="px-4 py-3.5 text-sm font-bold text-slate-900 whitespace-nowrap">
                    #{item.orderSlug}
                  </td>
                  <td className="px-4 py-3.5 text-sm font-medium text-slate-500">
                    {item.totalItems}
                  </td>
                  {stationNames.map((sName) => (
                    <td key={sName} className="px-4 py-3.5 text-sm font-semibold text-slate-600">
                      {item.stationTimes?.[sName] || "0s"}
                    </td>
                  ))}
                  <td className="px-4 py-3.5 text-sm font-semibold text-slate-600">
                    {item.collectionTime}
                  </td>
                  <td className="px-4 py-3.5 text-sm font-semibold text-slate-700">
                    {item.deliveryTime}
                  </td>
                  <td className="px-4 py-3.5 text-sm font-bold text-slate-900">
                    {item.waitTime}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={7 + stationNames.length}
                  className="px-4 py-8 text-center text-sm text-slate-400"
                >
                  No detailed records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DetailedReport;