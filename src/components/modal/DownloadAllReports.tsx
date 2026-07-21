"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, Calendar, Download, Loader2 } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import DateRangePicker from "@/components/shared/DateRangePicker";
import {
  useLazyGetAnalyticsQuery,
  useLazyGetSalesReportsQuery,
  useGetBusinessInformationQuery,
} from "@/redux/features/dashboard/dashboard.api";
import jsPDF from "jspdf";
import html2canvas from "html2canvas-pro";

interface DownloadAllReportsProps {
  onClose: () => void;
}

const DownloadAllReports: React.FC<DownloadAllReportsProps> = ({ onClose }) => {
  const tDashboard = useTranslations("Dashboard");
  const tReports = useTranslations("Reports");
  const locale = useLocale();

  // Selected date ranges for report generation
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  
  // Local loading state for PDF generation
  const [isGenerating, setIsGenerating] = useState(false);

  // Set default date range to today on mount
  useEffect(() => {
    setStartDate(new Date());
    setEndDate(new Date());
  }, []);

  // Fetch business info for brand logo/details in PDF
  const { data: businessRes } = useGetBusinessInformationQuery(undefined);
  const businessData = businessRes?.data;

  // Lazy queries to fetch data only on download click
  const [triggerGetAnalytics] = useLazyGetAnalyticsQuery();
  const [triggerGetSalesReports] = useLazyGetSalesReportsQuery();

  // Hidden DOM ref for html2canvas to capture
  const reportRef = useRef<HTMLDivElement>(null);

  // States to hold fetched report data for rendering
  const [reportAnalytics, setReportAnalytics] = useState<any>(null);
  const [reportSales, setReportSales] = useState<any>(null);

  // Format date helper: YYYY-MM-DD
  const formatDateString = (date: Date | null) => {
    if (!date) return undefined;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Currency helper
  const formatCurrency = (val: number | string | null | undefined) => {
    if (val === null || val === undefined) return "Rp 0";
    const num = typeof val === "string" ? parseFloat(val) : val;
    if (isNaN(num)) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);
  };

  // Format date range text for display
  const formatDateRangeText = (start: Date | null, end: Date | null) => {
    if (!start || !end) return "";
    const options: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" };
    const formatter = new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-GB", options);
    return `${formatter.format(start)} – ${formatter.format(end)}`;
  };

  const handleDownload = async () => {
    if (!startDate || !endDate) {
      toast.error(locale === "id" ? "Pilih rentang tanggal terlebih dahulu" : "Please select a date range first");
      return;
    }

    setIsGenerating(true);
    const startStr = formatDateString(startDate);
    const endStr = formatDateString(endDate);

    try {
      // 1. Fetch both datasets in parallel
      const [analyticsRes, salesReportsRes] = await Promise.all([
        triggerGetAnalytics({ startDate: startStr, endDate: endStr }).unwrap(),
        triggerGetSalesReports({ startDate: startStr, endDate: endStr }).unwrap(),
      ]);

      if (!analyticsRes?.success || !salesReportsRes?.success) {
        throw new Error("Failed to fetch reports data");
      }

      // 2. Set states to update the hidden report view
      setReportAnalytics(analyticsRes.data);
      setReportSales(salesReportsRes.data);

      // Wait a moment for DOM to update and any images to fully render
      await new Promise((resolve) => setTimeout(resolve, 800));

      // 3. Capture the hidden A4 container
      const element = reportRef.current;
      if (!element) {
        throw new Error("Report element not found in DOM");
      }

      const canvas = await html2canvas(element, {
        scale: 2, // High resolution scaling
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      // 4. Generate PDF
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = 210; // A4 width in mm
      const pdfHeight = 297; // A4 height in mm
      
      // Since our canvas is designed to match A4 aspect ratio, fit it exactly into A4 page
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight, undefined, "FAST");

      // Save PDF
      pdf.save(`business_report_${startStr}_to_${endStr}.pdf`);
      toast.success(locale === "id" ? "Laporan berhasil diunduh!" : "Report downloaded successfully!");
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || (locale === "id" ? "Gagal mengunduh PDF" : "Failed to download PDF"));
    } finally {
      setIsGenerating(false);
    }
  };

  // Helper variables for rendering chart bars & paths
  const getSalesSummary = () => {
    return reportSales?.salesSummary || [];
  };

  const getTopSellingItems = () => {
    return reportSales?.topSellingItems || [];
  };

  const getOrdersPerHour = () => {
    return reportAnalytics?.ordersPerHour || [];
  };

  const getOrderBreakdown = () => {
    return reportSales?.orderBreakdown || { dineInPercentage: 0, takeawayPercentage: 0, dineIn: 0, takeaway: 0 };
  };

  const formatHourLabel = (hour: number) => {
    if (hour === 0) return "12AM";
    if (hour === 12) return "12PM";
    return hour > 12 ? `${hour - 12}PM` : `${hour}AM`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-6 backdrop-blur-[2px]" onClick={onClose}>
      {/* Modal Card */}
      <div
        className="relative w-full max-w-md rounded-[24px] bg-white p-6 shadow-2xl transition-all"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-6 top-6 rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          disabled={isGenerating}
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col">
          <h3 className="mb-2 text-xl font-bold text-slate-900">
            {tDashboard("downloadReportModalTitle") || "Download Business Report"}
          </h3>
          <p className="mb-6 text-sm text-slate-500 leading-relaxed">
            {tDashboard("downloadReportModalDesc") || "Select a date range to generate and download a combined dashboard and sales report."}
          </p>

          {/* Date Picker Container */}
          <div className="mb-6 rounded-xl border border-slate-100 bg-slate-50 p-4">
            <label className="mb-2 block text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {locale === "id" ? "Pilih Rentang Tanggal" : "Select Date Range"}
            </label>
            <DateRangePicker
              startDate={startDate}
              endDate={endDate}
              onChange={(s, e) => {
                setStartDate(s);
                setEndDate(e);
              }}
            />
          </div>

          {/* Modal Action Buttons */}
          <div className="flex w-full items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-200 py-3 text-[15px] font-semibold text-slate-900 transition hover:bg-slate-50 disabled:opacity-50"
              disabled={isGenerating}
            >
              {locale === "id" ? "Batal" : "Cancel"}
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="flex-1 rounded-xl bg-teal-600 py-3 text-[15px] font-semibold text-white shadow-lg shadow-teal-600/25 transition hover:bg-teal-700 disabled:opacity-50 flex items-center justify-center gap-2"
              disabled={isGenerating || !startDate || !endDate}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>{tDashboard("downloading") || "Generating..."}</span>
                </>
              ) : (
                <>
                  <Download size={18} />
                  <span>{tDashboard("download") || "Download"}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* HIDDEN A4 TEMPLATE FOR PDF EXPORT                                         */}
      {/* Built to match the design reference. Fits exactly on a single page at     */}
      {/* 794px width (A4 width at 96dpi) and 1123px height (A4 height at 96dpi).  */}
      {/* ========================================================================= */}
      {reportAnalytics && reportSales && (
        <div style={{ position: "absolute", top: "-9999px", left: "-9999px" }}>
          <div
            ref={reportRef}
            className="w-198.5 h-280.75 bg-white p-8 flex flex-col justify-between font-sans text-slate-800 relative select-none"
            style={{ boxSizing: "border-box" }}
          >
            {/* Inner Content Wrapper */}
            <div className="flex flex-col h-full justify-between">
              
              {/* 1. HEADER SECTION */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                {/* Logo & Store Details */}
                <div className="flex items-center gap-3.5">
                  <div className="flex size-14 items-center justify-center rounded-full bg-slate-900 text-white overflow-hidden">
                    {/* Dynamic Business Logo or Custom Panda SVG Logo */}
                    {businessData?.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={businessData.logoUrl}
                        alt="Logo"
                        className="size-full rounded-full object-cover"
                        crossOrigin="anonymous"
                      />
                    ) : (
                      <svg width="40" height="40" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="50" cy="50" r="45" fill="#0f172a" />
                        {/* Panda face shapes */}
                        <circle cx="35" cy="35" r="12" fill="white" />
                        <circle cx="65" cy="35" r="12" fill="white" />
                        <circle cx="35" cy="35" r="6" fill="#0f172a" />
                        <circle cx="65" cy="35" r="6" fill="#0f172a" />
                        {/* White inner eyes highlight */}
                        <circle cx="37" cy="33" r="2" fill="white" />
                        <circle cx="67" cy="33" r="2" fill="white" />
                        {/* Panda cheeks */}
                        <ellipse cx="50" cy="60" rx="20" ry="15" fill="white" />
                        {/* House/Shop outline inside panda nose/mouth */}
                        <path d="M44 65 L50 59 L56 65 V72 H44 Z" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" />
                        <path d="M42 66 L50 58 L58 66" stroke="#d97706" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <h2 className="text-lg font-extrabold text-slate-900 tracking-tight uppercase leading-tight">
                      {businessData?.name || "ALUMI LIFESTORE"}
                    </h2>
                    <p className="text-[10px] text-slate-500 font-medium max-w-60 truncate">
                      {businessData?.address || "123 Business Street, District 404"}
                    </p>
                    <p className="text-[9px] text-slate-400 font-medium">
                      {businessData?.contact ? `Phone: ${businessData.contact}` : ""}
                      {businessData?.email ? ` | Email: ${businessData.email}` : ""}
                    </p>
                  </div>
                </div>

                {/* Report Info */}
                <div className="text-right">
                  <h1 className="text-2xl font-black text-teal-600 uppercase tracking-tight">
                    {locale === "id" ? "LAPORAN PENJUALAN" : "SALES REPORT"}
                  </h1>
                  <div className="mt-1 flex items-center justify-end gap-1.5 text-slate-700 text-xs font-semibold">
                    <Calendar size={14} className="text-teal-600" />
                    <span>{formatDateRangeText(startDate, endDate)}</span>
                  </div>
                  <p className="text-[9px] text-slate-400 mt-0.5">
                    {locale === "id" ? "Semua data berdasarkan periode yang dipilih" : "All data is based on the selected period"}
                  </p>
                </div>
              </div>

              {/* 2. STATS OVERVIEW CARDS */}
              <div className="grid grid-cols-4 gap-3 mt-4">
                {/* Total Sales */}
                <div className="bg-white border border-slate-100 rounded-xl p-3.5 shadow-xs relative flex flex-col justify-between h-19">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {locale === "id" ? "Total Penjualan" : "Total Sales"}
                    </span>
                    <div className="flex size-6 items-center justify-center rounded-full bg-teal-50 text-teal-600">
                      <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-extrabold text-slate-900 leading-none">
                      {formatCurrency(reportAnalytics.overview?.totalRevenue)}
                    </div>
                  </div>
                </div>

                {/* Total Orders */}
                <div className="bg-white border border-slate-100 rounded-xl p-3.5 shadow-xs relative flex flex-col justify-between h-19">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {locale === "id" ? "Total Pesanan" : "Total Orders"}
                    </span>
                    <div className="flex size-6 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                      <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-extrabold text-slate-900 leading-none">
                      {reportAnalytics.overview?.totalOrders}
                    </div>
                  </div>
                </div>

                {/* Avg Order Value */}
                <div className="bg-white border border-slate-100 rounded-xl p-3.5 shadow-xs relative flex flex-col justify-between h-19">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {locale === "id" ? "Rata-rata Pesanan" : "Avg Order Value"}
                    </span>
                    <div className="flex size-6 items-center justify-center rounded-full bg-cyan-50 text-cyan-600">
                      <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-extrabold text-slate-900 leading-none">
                      {formatCurrency(reportAnalytics.overview?.averageOrderValue)}
                    </div>
                  </div>
                </div>

                {/* Best Seller */}
                <div className="bg-white border border-slate-100 rounded-xl p-3.5 shadow-xs relative flex flex-col justify-between h-19">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {locale === "id" ? "Terlaris" : "Best Seller"}
                    </span>
                    <div className="flex size-6 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                      <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499c.174-.297.643-.297.818 0l2.85 4.887 5.378.78c.345.05.483.473.233.717l-3.89 3.79 1.05 5.343c.068.347-.297.612-.607.449L12 16.92l-4.819 2.531c-.31.163-.675-.102-.607-.449l1.05-5.343-3.89-3.79c-.25-.244-.112-.667.233-.717l5.378-.78 2.85-4.887Z" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <div className="text-[11px] font-extrabold text-slate-900 truncate leading-none mb-1 max-w-32.5">
                      {getTopSellingItems()[0]?.item || "N/A"}
                    </div>
                    <div className="text-[9px] font-semibold text-slate-500">
                      {getTopSellingItems()[0]?.quantity || 0} sold
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. CHARTS ROW: SALES SUMMARY & ORDERS COUNT */}
              <div className="grid grid-cols-2 gap-4 mt-4">
                
                {/* Chart A: Sales Summary */}
                <div className="border border-slate-100 rounded-2xl p-4 bg-white shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-tight">
                      {tReports("salesSummary") || "Sales Summary"} <span className="text-[10px] text-slate-400 font-normal normal-case">(Revenue)</span>
                    </h3>
                    <span className="text-[10px] font-bold text-teal-600">
                      Total: {formatCurrency(reportAnalytics.overview?.totalRevenue)}
                    </span>
                  </div>

                  {/* SVG Bar Chart Wrapper */}
                  <div className="h-32 flex items-end justify-between px-2 pt-6 pb-2 border-b border-slate-100 relative bg-slate-50/50 rounded-xl">
                    {/* Render static, styled bars based on report sales summary data */}
                    {getSalesSummary().slice(-7).map((d: any, idx: number, arr: any[]) => {
                      const revenues = arr.map(item => item.revenue || 0);
                      const maxRevenue = Math.max(...revenues, 1);
                      const heightPercent = ((d.revenue || 0) / maxRevenue) * 75; // Cap at 75% for tooltip spacing
                      const isPeak = d.revenue > 0 && d.revenue === maxRevenue;

                      return (
                        <div key={idx} className="flex flex-col items-center justify-end flex-1 h-full relative group">
                          {/* Bar */}
                          <div 
                            style={{ height: `${Math.max(heightPercent, 4)}%` }}
                            className={`w-7 rounded-t-md transition-all duration-300 relative ${isPeak ? "bg-teal-600" : "bg-teal-600/30 hover:bg-teal-600/50"}`}
                          >
                            {/* Tooltip bubble on non-zero value */}
                            {d.revenue > 0 && (
                              <div className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 bg-teal-600 text-white font-bold px-1.5 py-0.5 rounded shadow-sm text-[8px] whitespace-nowrap z-10">
                                <span>{formatCurrency(d.revenue)}</span>
                                {/* Triangle pointer */}
                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-[3.5px] border-transparent border-t-teal-600" />
                              </div>
                            )}
                          </div>
                          {/* Label below axis */}
                          <div className="absolute top-full mt-1.5 flex flex-col items-center">
                            <span className="text-[8px] font-semibold text-slate-700 leading-none">
                              {new Date(d.date).toLocaleDateString(locale === "id" ? "id-ID" : "en-US", { weekday: "short" })}
                            </span>
                            <span className="text-[7px] text-slate-400 mt-0.5">
                              {new Date(d.date).getDate()}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                    {getSalesSummary().length === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-slate-400">
                        No Sales Data Available
                      </div>
                    )}
                  </div>
                </div>

                {/* Chart B: Orders Count */}
                <div className="border border-slate-100 rounded-2xl p-4 bg-white shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-tight">
                      {tReports("ordersCount") || "Orders Count"} <span className="text-[10px] text-slate-400 font-normal normal-case">(Orders)</span>
                    </h3>
                    <span className="text-[10px] font-bold text-teal-600 font-mono">
                      Total: {reportAnalytics.overview?.totalOrders} orders
                    </span>
                  </div>

                  {/* SVG Bar Chart Wrapper */}
                  <div className="h-32 flex items-end justify-between px-2 pt-6 pb-2 border-b border-slate-100 relative bg-slate-50/50 rounded-xl">
                    {/* Render static, styled bars based on report sales summary data */}
                    {getSalesSummary().slice(-7).map((d: any, idx: number, arr: any[]) => {
                      const orders = arr.map(item => item.orders || 0);
                      const maxOrders = Math.max(...orders, 1);
                      const heightPercent = ((d.orders || 0) / maxOrders) * 75; // Cap at 75% for tooltip spacing
                      const isPeak = d.orders > 0 && d.orders === maxOrders;

                      return (
                        <div key={idx} className="flex flex-col items-center justify-end flex-1 h-full relative group">
                          {/* Bar */}
                          <div 
                            style={{ height: `${Math.max(heightPercent, 4)}%` }}
                            className={`w-7 rounded-t-md transition-all duration-300 relative ${isPeak ? "bg-teal-600" : "bg-teal-600/30 hover:bg-teal-600/50"}`}
                          >
                            {/* Tooltip bubble on non-zero value */}
                            {d.orders > 0 && (
                              <div className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 bg-teal-600 text-white font-bold px-1.5 py-0.5 rounded shadow-sm text-[8px] whitespace-nowrap z-10">
                                <span>{d.orders} {locale === "id" ? "pesanan" : d.orders === 1 ? "order" : "orders"}</span>
                                {/* Triangle pointer */}
                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-[3.5px] border-transparent border-t-teal-600" />
                              </div>
                            )}
                          </div>
                          {/* Label below axis */}
                          <div className="absolute top-full mt-1.5 flex flex-col items-center">
                            <span className="text-[8px] font-semibold text-slate-700 leading-none">
                              {new Date(d.date).toLocaleDateString(locale === "id" ? "id-ID" : "en-US", { weekday: "short" })}
                            </span>
                            <span className="text-[7px] text-slate-400 mt-0.5">
                              {new Date(d.date).getDate()}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                    {getSalesSummary().length === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-slate-400">
                        No Orders Data Available
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* 4. DETAILS ROW: TOP PRODUCTS & ORDER DETAILS */}
              <div className="grid grid-cols-5 gap-4 mt-4">
                
                {/* Column Left (3 cols width): Top Products Table */}
                <div className="col-span-3 border border-slate-100 rounded-2xl p-4 bg-white shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-tight">
                      {tReports("topSales") || "Top Sales"}
                    </h3>
                  </div>

                  <table className="w-full text-left text-[9.5px]">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider text-[8px]">
                        <th className="py-2 pl-2">Rank</th>
                        <th className="py-2">Item</th>
                        <th className="py-2">Category</th>
                        <th className="py-2 text-center">Quantity</th>
                        <th className="py-2 pr-2 text-right">Revenue</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 font-medium text-slate-700">
                      {getTopSellingItems().slice(0, 7).map((item: any, idx: number) => {
                        const rankColors = [
                          "bg-amber-400 text-white font-bold", // Gold
                          "bg-slate-300 text-slate-800 font-bold", // Silver
                          "bg-amber-600 text-white font-bold", // Bronze
                        ];

                        return (
                          <tr key={idx} className="hover:bg-slate-50/50">
                            <td className="py-2 pl-2">
                              <span className={`inline-flex size-4.5 items-center justify-center rounded-full text-[8.5px] ${idx < 3 ? rankColors[idx] : "bg-slate-100 text-slate-500 font-semibold"}`}>
                                {idx + 1}
                              </span>
                            </td>
                            <td className="py-2 font-bold text-slate-900 max-w-32.5 truncate">
                              {item.item}
                            </td>
                            <td className="py-2 text-slate-500 uppercase text-[8px] font-bold">
                              {item.category}
                            </td>
                            <td className="py-2 text-center font-bold text-slate-800">
                              {item.quantity}
                            </td>
                            <td className="py-2 pr-2 text-right font-bold text-teal-600 font-mono">
                              {formatCurrency(item.revenue)}
                            </td>
                          </tr>
                        );
                      })}
                      {getTopSellingItems().length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-6 text-center text-xs font-semibold text-slate-400">
                            No Top Selling Items Available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Column Right (2 cols width): Order Type + Orders by Hour */}
                <div className="col-span-2 flex flex-col gap-4">
                  
                  {/* Order Type Donut Section */}
                  <div className="border border-slate-100 rounded-2xl p-4 bg-white shadow-xs flex flex-col justify-between h-31.5">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-tight">
                      {tReports("orderBreakdown") || "Order Breakdown"}
                    </h3>

                    <div className="flex items-center justify-around mt-1">
                      {/* SVG Donut */}
                      <div className="relative flex items-center justify-center size-16">
                        {(() => {
                          const dine = getOrderBreakdown().dineInPercentage || 0;
                          const radius = 22;
                          const circ = 2 * Math.PI * radius;
                          const offset = circ - (dine / 100) * circ;

                          return (
                            <>
                              <svg width="68" height="68" viewBox="0 0 68 68" className="-rotate-90">
                                {/* Base Track (Takeaway) */}
                                <circle cx="34" cy="34" r={radius} fill="transparent" stroke="#e2e8f0" strokeWidth="6" />
                                {/* Segment (Dine In) */}
                                <circle
                                  cx="34"
                                  cy="34"
                                  r={radius}
                                  fill="transparent"
                                  stroke="#0d9488"
                                  strokeWidth="6"
                                  strokeDasharray={circ}
                                  strokeDashoffset={offset}
                                  strokeLinecap="round"
                                />
                              </svg>
                              <div className="absolute text-[8px] font-black text-slate-900 flex flex-col items-center">
                                <span className="leading-none">{Math.round(dine)}%</span>
                                <span className="text-[6.5px] text-slate-400 uppercase tracking-tight font-bold">Dine</span>
                              </div>
                            </>
                          );
                        })()}
                      </div>

                      {/* Legend details */}
                      <div className="flex flex-col gap-1.5 text-[9px] font-semibold text-slate-700">
                        <div className="flex items-center gap-1.5">
                          <span className="size-2 rounded-full bg-teal-600 block" />
                          <span>
                            Dine-in: <strong className="text-slate-900">{getOrderBreakdown().dineIn} orders</strong> ({Math.round(getOrderBreakdown().dineInPercentage)}%)
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="size-2 rounded-full bg-slate-300 block" />
                          <span>
                            Takeaway: <strong className="text-slate-900">{getOrderBreakdown().takeaway} orders</strong> ({Math.round(getOrderBreakdown().takeawayPercentage)}%)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Orders By Hour mini bar chart */}
                  <div className="border border-slate-100 rounded-2xl p-4 bg-white shadow-xs flex flex-col justify-between h-31.5">
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-tight">
                      {tDashboard("ordersPerHour") || "Orders By Hour"}
                    </h3>

                    {/* Miniature Bars */}
                    <div className="h-14 flex items-end justify-between px-1 border-b border-slate-50 relative mt-1 bg-slate-50/30 rounded-lg pt-2 pb-0.5">
                      {getOrdersPerHour().slice(-8).map((hourData: any, idx: number, arr: any[]) => {
                        const counts = arr.map(h => h.count || 0);
                        const maxCount = Math.max(...counts, 1);
                        const height = ((hourData.count || 0) / maxCount) * 85;

                        return (
                          <div key={idx} className="flex flex-col items-center justify-end flex-1 h-full relative group">
                            {/* Bar segment */}
                            <div 
                              style={{ height: `${Math.max(height, 5)}%` }}
                              className={`w-3.5 rounded-t-sm transition-all duration-300 ${hourData.count > 0 ? "bg-teal-600" : "bg-teal-600/10"}`}
                            />
                            {/* Hour label below bar */}
                            <span className="text-[6.5px] font-bold text-slate-400 mt-1 uppercase scale-90 leading-none">
                              {formatHourLabel(hourData.hour)}
                            </span>
                          </div>
                        );
                      })}
                      {getOrdersPerHour().length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center text-[8.5px] font-semibold text-slate-400">
                          No Hourly Data
                        </div>
                      )}
                    </div>
                  </div>

                </div>

              </div>

              {/* 5. FOOTER & COMPLIANCE NOTES */}
              <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-[8px] font-bold text-slate-400 uppercase tracking-wider">
                <div className="flex items-center gap-1">
                  <span className="inline-flex size-3.5 items-center justify-center rounded-full bg-slate-100 text-slate-400 text-[7px]">i</span>
                  <span>Figures may not include voided orders or refunds.</span>
                </div>
                <div>
                  Generated on {new Date().toLocaleDateString(locale === "id" ? "id-ID" : "en-US", { day: "numeric", month: "short", year: "numeric" })}, {new Date().toLocaleTimeString(locale === "id" ? "id-ID" : "en-US", { hour: "2-digit", minute: "2-digit", hour12: true })}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DownloadAllReports;