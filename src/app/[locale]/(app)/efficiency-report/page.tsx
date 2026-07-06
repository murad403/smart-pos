"use client";
import React, { useState, use } from "react";
import { useTranslations } from "next-intl";
import { Clock, FileText, Download } from "lucide-react";
import { useGetEfficiencyReportsQuery } from "@/redux/features/dashboard/dashboard.api";
import DateRangePicker from "@/components/shared/DateRangePicker";
import MostPopularItemInProduction from "./MostPopularItemInProduction";
import ItemsWithLongestPreparationTime from "./ItemsWithLongestPreparationTime";
import DetailedReport from "./DetailedReport";
import Summary from "./Summary";
import { toast } from "sonner";

const EfficiencyReportPage = ({ params }: { params?: Promise<{ locale: string }> }) => {
  if (params) use(params);
  const t = useTranslations("EfficiencyReport");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  // Helper to format Date object as YYYY-MM-DD
  const formatDateString = (date: Date | null) => {
    if (!date) return undefined;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Fetch efficiency report data
  const { data: reportRes, isLoading } = useGetEfficiencyReportsQuery({
    startDate: formatDateString(startDate),
    endDate: formatDateString(endDate),
  });

  const reportData = reportRes?.data;

  // Calculate difference in days for the filter status pill
  const diffDays = React.useMemo(() => {
    if (!startDate || !endDate) return 30; // Default to 30 days
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, [startDate, endDate]);

  const handleExportPdf = () => {
    toast.success("Preparing PDF export...");
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const handleExportExcel = () => {
    if (!reportData) {
      toast.error("No report data available to export");
      return;
    }

    toast.loading("Generating Excel sheet...", { id: "excel-export-toast" });

    try {
      const rows: string[][] = [];
      rows.push(["Efficiency Report"]);
      rows.push([
        "Period",
        `${formatDateString(startDate || new Date(reportData.period?.startDate))} to ${formatDateString(endDate || new Date(reportData.period?.endDate))}`
      ]);
      rows.push(["Average Wait Time", reportData.averageWaitTime || ""]);
      rows.push([]);

      rows.push(["SUMMARY METRICS"]);
      const summaryKeys = Object.keys(reportData.summary || {});
      summaryKeys.forEach((key) => {
        let label = key;
        if (key === "totalOrders") label = "Total Orders";
        else if (key === "totalItems") label = "Total Items";
        else if (key === "avgCollectionTime") label = "Average Collection Time";
        else if (key === "avgWaitTime") label = "Average Wait Time";
        else if (key.startsWith("avg")) {
          const station = key.replace(/^avg/, "").replace(/Time$/, "");
          label = `Average ${station} Time`;
        }
        rows.push([label, String(reportData.summary[key])]);
      });
      rows.push([]);

      rows.push(["MOST POPULAR ITEMS BY STATION (TOP 5)"]);
      if (Array.isArray(reportData.mostPopularByStation)) {
        reportData.mostPopularByStation.forEach((station: any) => {
          rows.push([station.stationName || "Station"]);
          rows.push(["Item Name", "Preparation Time"]);
          if (Array.isArray(station.items)) {
            station.items.forEach((item: any) => {
              rows.push([item.itemName, String(item.prepTime)]);
            });
          }
          rows.push([]);
        });
      }

      rows.push(["ITEMS WITH LONGEST PREPARATION TIME"]);
      if (Array.isArray(reportData.longestPrepTimeItems)) {
        if (reportData.longestPrepTimeItems[0] && Array.isArray(reportData.longestPrepTimeItems[0].items)) {
          reportData.longestPrepTimeItems.forEach((station: any) => {
            rows.push([station.stationName || "Station"]);
            rows.push(["Item Name", "Preparation Time"]);
            station.items.forEach((item: any) => {
              rows.push([item.itemName, String(item.prepTime)]);
            });
            rows.push([]);
          });
        } else {
          rows.push(["Item Name", "Preparation Time", "Station Name"]);
          reportData.longestPrepTimeItems.forEach((item: any) => {
            rows.push([item.itemName, String(item.prepTime), item.stationName || ""]);
          });
          rows.push([]);
        }
      }

      rows.push(["DETAILED ORDER REPORT"]);
      const stationNames = new Set<string>();
      if (Array.isArray(reportData.detailedReport)) {
        reportData.detailedReport.forEach((item: any) => {
          if (item.stationTimes) {
            Object.keys(item.stationTimes).forEach((k) => stationNames.add(k));
          }
        });
      }
      const dynamicStations = Array.from(stationNames);

      const headers = [
        "Order time",
        "Order #",
        "Total number of items",
        ...dynamicStations,
        "Collection Time",
        "Delivery Time",
        "Wait Time",
      ];
      rows.push(headers);

      if (Array.isArray(reportData.detailedReport)) {
        reportData.detailedReport.forEach((item: any) => {
          const row = [
            item.orderTime,
            `#${item.orderSlug}`,
            String(item.totalItems),
            ...dynamicStations.map((sName) => item.stationTimes?.[sName] || "0s"),
            item.collectionTime,
            item.deliveryTime,
            item.waitTime,
          ];
          rows.push(row);
        });
      }

      const csvString = rows
        .map((row) =>
          row
            .map((cell) => {
              const cleanCell = cell === null || cell === undefined ? "" : String(cell);
              if (cleanCell.includes(",") || cleanCell.includes('"') || cleanCell.includes("\n")) {
                return `"${cleanCell.replace(/"/g, '""')}"`;
              }
              return cleanCell;
            })
            .join(",")
        )
        .join("\n");

      const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const filename = `efficiency_report_${formatDateString(startDate || new Date(reportData.period?.startDate))}_to_${formatDateString(endDate || new Date(reportData.period?.endDate))}.csv`;

      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Excel sheet exported successfully!", { id: "excel-export-toast" });
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate Excel sheet", { id: "excel-export-toast" });
    }
  };

  return (
    <div className="flex flex-col space-y-4 md:space-y-6 print:p-4 w-full min-w-0">
      {/* Top Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 print:hidden">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            {t("title")}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Date Picker */}
          <DateRangePicker
            startDate={startDate}
            endDate={endDate}
            onChange={(s, e) => {
              setStartDate(s);
              setEndDate(e);
            }}
          />

          {/* Days count badge */}
          <div className="px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-600 shadow-xs">
            {diffDays} Days
          </div>

          {/* Export PDF Button */}
          <button
            onClick={handleExportPdf}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition shadow-xs"
          >
            <FileText className="size-4 text-red-500" />
            <span>{t("exportPdf")}</span>
          </button>

          {/* Export Excel Button */}
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition shadow-sm shadow-blue-500/10"
          >
            <Download className="size-4" />
            <span>{t("exportExcel")}</span>
          </button>
        </div>
      </div>

      {/* Average Wait Time Hero Card */}
      <div className="flex">
        <div className="bg-white rounded-xl border border-slate-100 p-5 flex items-center gap-4 shadow-sm w-full max-w-70">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <Clock className="size-6" />
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
              {t("averageWaitTime")}
            </span>
            <span className="text-2xl font-extrabold text-blue-600 mt-0.5 block">
              {reportData?.averageWaitTime || "0m 0s"}
            </span>
          </div>
        </div>
      </div>

      {/* Most Popular Items by Production Station Grid */}
      <MostPopularItemInProduction
        stationsData={reportData?.mostPopularByStation}
        isLoading={isLoading}
      />

      {/* Items with Longest Prep Time Progress Section */}
      <ItemsWithLongestPreparationTime
        longestPrepTimeItems={reportData?.longestPrepTimeItems}
        isLoading={isLoading}
      />

      {/* Detailed Report Table */}
      <DetailedReport
        reportData={reportData?.detailedReport}
        isLoading={isLoading}
      />

      {/* Summary Section */}
      <Summary
        summary={reportData?.summary}
        isLoading={isLoading}
      />

      {/* Footnote */}
      <p className="text-xs text-slate-400 mt-2 italic print:block">
        {t("footnote", { stations: "Kitchen + Bar" })}
      </p>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            main {
              min-width: 0 !important;
            }
            @media print {
              /* Hide sidebar, headers, and print-hidden elements */
              aside,
              header,
              nav,
              [data-sidebar="sidebar"],
              .print\\:hidden,
              button,
              input,
              .sidebar-trigger {
                display: none !important;
              }
              /* Reset margins and paddings for printing */
              body, main, .print-container {
                background: white !important;
                color: black !important;
                margin: 0 !important;
                padding: 0 !important;
                width: 100% !important;
                max-width: 100% !important;
              }
              /* Remove sidebar layout flex wrapper constraints during print */
              .sidebar-inset, 
              [data-sidebar-provider="true"] {
                display: block !important;
                margin-left: 0 !important;
                padding-left: 0 !important;
              }
              /* Enable background colors in print */
              * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
            }
          `,
        }}
      />
    </div>
  );
};

export default EfficiencyReportPage;