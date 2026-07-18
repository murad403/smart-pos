"use client";
import React, { useState, useEffect } from "react";
import { Home, Menu, Pencil, ShieldCheck, Package, TrendingUp, BarChart3, User } from "lucide-react";
import { Link, useRouter } from "@/i18n/routing";
import { useSidebar } from "@/components/ui/sidebar";
import { getUserData } from "@/utils/auth";
import { useTranslations } from "next-intl";
import { useGetAnalyticsQuery, useGetPaymentsQuery } from "@/redux/features/dashboard/dashboard.api";
import DashboardStats from "../dashboard/DashboardStats";

const MobileOwnerLayoutPage = () => {
    const t = useTranslations("Common");
    const { toggleSidebar } = useSidebar();
    const [user, setUser] = useState<any>(null);
    const router = useRouter();

    useEffect(() => {
        setUser(getUserData());
    }, []);

    useEffect(() => {
        const handleResize = () => {
            if (typeof window !== "undefined" && window.innerWidth >= 768) {
                router.push("/menu-management");
            }
        };
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [router]);

    // Fetch Dashboard Analytics
    const { data: analyticsRes, isLoading: isLoadingAnalytics } = useGetAnalyticsQuery();
    const analyticsData = analyticsRes?.data;

    // Fetch Recent Orders (Limit: 5)
    // const { data: paymentsRes, isLoading: isLoadingPayments } = useGetPaymentsQuery({ limit: 5 });
    // const paymentsData = paymentsRes?.data;

    const userName = user?.name || "John Wick";
    const userPhoto = user?.photoUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150";

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col pb-10">
            {/* Top Header Bar */}
            <div className="bg-[#1A56DB] px-6 py-4 flex items-center justify-between shadow-md">
                <Link
                    href="/mobile-owner-layout"
                    className="flex items-center gap-1.5 bg-white text-slate-800 px-4 py-2 rounded-xl font-bold text-sm shadow-xs transition hover:bg-slate-50"
                >
                    <Home className="size-4 text-[#1A56DB]" />
                    <span>{t("dashboard")}</span>
                </Link>
                <button
                    onClick={toggleSidebar}
                    className="p-2 rounded-xl text-white hover:bg-white/10 active:bg-white/20 transition-all animate-none outline-none"
                >
                    <Menu className="size-6" />
                </button>
            </div>

            {/* Hello Profile Greeting */}
            <div className="px-6 pt-8 pb-6 flex items-center justify-between">
                <div>
                    <p className="text-slate-400 font-medium text-base">{t("hello")}</p>
                    <h2 className="text-3xl font-extrabold text-[#1E3A8A] mt-1">{userName}</h2>
                </div>
                <div className="size-16 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm shrink-0">
                    <img
                        src={userPhoto}
                        alt="User profile"
                        className="h-full w-full object-cover"
                    />
                </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="px-6">
                <h3 className="text-base font-bold text-slate-850 tracking-wide mb-4">{t("quickActions")}</h3>
                <div className="grid grid-cols-3 gap-4">
                    {/* Edit (Menu Management) */}
                    <Link
                        href="/menu-management"
                        className="flex flex-col items-center justify-center bg-white rounded-2xl p-4 shadow-sm border border-slate-100/80 transition hover:shadow-md active:scale-95 duration-200"
                    >
                        <div className="flex size-12 items-center justify-center rounded-xl bg-blue-50 text-[#1A56DB] mb-3">
                            <Pencil className="size-6" />
                        </div>
                        <span className="text-[13px] font-bold text-slate-700">{t("menuManagement")}</span>
                    </Link>

                    {/* Verify (Payment Verification) */}
                    <Link
                        href="/payment-verification"
                        className="flex flex-col items-center justify-center bg-white rounded-2xl p-4 shadow-sm border border-slate-100/80 transition hover:shadow-md active:scale-95 duration-200"
                    >
                        <div className="flex size-12 items-center justify-center rounded-xl bg-blue-50 text-[#1A56DB] mb-3">
                            <ShieldCheck className="size-6" />
                        </div>
                        <span className="text-[13px] font-bold text-slate-700 text-center">{t("paymentVerification")}</span>
                    </Link>

                    {/* Inventory (Inventory Report) */}
                    <Link
                        href="/inventory-report"
                        className="flex flex-col items-center justify-center bg-white rounded-2xl p-4 shadow-sm border border-slate-100/80 transition hover:shadow-md active:scale-95 duration-200"
                    >
                        <div className="flex size-12 items-center justify-center rounded-xl bg-blue-50 text-[#1A56DB] mb-3">
                            <Package className="size-6" />
                        </div>
                        <span className="text-[13px] font-bold text-slate-700">{t("inventoryReport")}</span>
                    </Link>

                    {/* Efficiency (Production Station) */}
                    <Link
                        href="/efficiency-report"
                        className="flex flex-col items-center justify-center bg-white rounded-2xl p-4 shadow-sm border border-slate-100/80 transition hover:shadow-md active:scale-95 duration-200"
                    >
                        <div className="flex size-12 items-center justify-center rounded-xl bg-blue-50 text-[#1A56DB] mb-3">
                            <TrendingUp className="size-6" />
                        </div>
                        <span className="text-[13px] font-bold text-slate-700">{t("efficiencyReport")}</span>
                    </Link>

                    {/* Report (Reports) */}
                    <Link
                        href="/reports"
                        className="flex flex-col items-center justify-center bg-white rounded-2xl p-4 shadow-sm border border-slate-100/80 transition hover:shadow-md active:scale-95 duration-200"
                    >
                        <div className="flex size-12 items-center justify-center rounded-xl bg-blue-50 text-[#1A56DB] mb-3">
                            <BarChart3 className="size-6" />
                        </div>
                        <span className="text-[13px] font-bold text-slate-700">{t("salesReportsOwner")}</span>
                    </Link>

                    {/* User (Profile Users) */}
                    <Link
                        href="/profile/users"
                        className="flex flex-col items-center justify-center bg-white rounded-2xl p-4 shadow-sm border border-slate-100/80 transition hover:shadow-md active:scale-95 duration-200"
                    >
                        <div className="flex size-12 items-center justify-center rounded-xl bg-blue-50 text-[#1A56DB] mb-3">
                            <User className="size-6" />
                        </div>
                        <span className="text-[13px] font-bold text-slate-700">{t("users")}</span>
                    </Link>
                </div>
            </div>

            {/* Dashboard Metrics */}
            <div className="px-6 mt-6">
                <h3 className="text-base font-bold text-slate-850 tracking-wide mb-4">{t("dashboard")}</h3>
                <DashboardStats overview={analyticsData?.overview}
                    orderTypeBreakdown={analyticsData?.orderTypeBreakdown}
                    isLoading={isLoadingAnalytics} />
                <Link className="flex justify-end mt-4 text-blue-500 text-sm hover:underline" href={"/view-all"}>{t("viewAll")}</Link>
            </div>
        </div>
    );
};

export default MobileOwnerLayoutPage;