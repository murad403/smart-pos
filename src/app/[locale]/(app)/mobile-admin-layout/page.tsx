"use client";
import React, { useState, useEffect } from "react";
import { Home, Menu, Calculator, BellDot, Package, Pencil, CreditCard, ShieldCheck } from "lucide-react";
import { Link, useRouter } from "@/i18n/routing";
import { useSidebar } from "@/components/ui/sidebar";
import { getUserData } from "@/utils/auth";
import { useTranslations } from "next-intl";

const MobileAdminLayoutPage = () => {
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
        router.push("/menu");
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [router]);

  const userName = user?.name || "Jane Smith";

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col pb-10">
      <div className="bg-[#1A56DB] px-6 py-4 flex items-center justify-between shadow-md">
        <Link 
          href="/mobile-admin-layout" 
          className="flex items-center gap-1.5 bg-white text-slate-800 px-4 py-2 rounded-xl font-bold text-sm shadow-xs transition hover:bg-slate-50"
        >
          <Home className="size-4 text-[#1A56DB]" />
          <span>{t("dashboard")}</span>
        </Link>
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-xl text-white hover:bg-white/10 active:bg-white/20 transition-all"
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
        <div className="size-16 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm flex items-center justify-center">
          {user?.photoUrl ? (
            <img
              src={user.photoUrl}
              alt="User profile"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="size-full flex items-center justify-center bg-[#1A56DB]/10 text-[#1A56DB] font-extrabold text-2xl">
              {userName.charAt(0).toUpperCase() || "U"}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="px-6">
        <h3 className="text-base font-bold text-slate-850 tracking-wide mb-5">{t("quickActions")}</h3>
        <div className="grid grid-cols-3 gap-4">
          {/* POS */}
          <Link
            href="/menu"
            className="flex flex-col items-center justify-center bg-white rounded-2xl p-4 shadow-sm border border-slate-100/80 transition hover:shadow-md active:scale-95 duration-200"
          >
            <div className="flex size-12 items-center justify-center rounded-xl bg-blue-50 text-[#1A56DB] mb-3">
              <Calculator className="size-6" />
            </div>
            <span className="text-[13px] font-bold text-slate-700">{t("menu")}</span>
          </Link>

          {/* Collect */}
          <Link
            href="/collection"
            className="relative flex flex-col items-center justify-center bg-white rounded-2xl p-4 shadow-sm border border-slate-100/80 transition hover:shadow-md active:scale-95 duration-200"
          >
            {/* <span className="absolute top-2.5 right-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-extrabold text-white">
              1
            </span> */}
            <div className="flex size-12 items-center justify-center rounded-xl bg-blue-50 text-[#1A56DB] mb-3">
              <BellDot className="size-6" />
            </div>
            <span className="text-[13px] font-bold text-slate-700">{t("collection")}</span>
          </Link>

          {/* Inventory */}
          <Link
            href="/inventory-report"
            className="flex flex-col items-center justify-center bg-white rounded-2xl p-4 shadow-sm border border-slate-100/80 transition hover:shadow-md active:scale-95 duration-200"
          >
            <div className="flex size-12 items-center justify-center rounded-xl bg-blue-50 text-[#1A56DB] mb-3">
              <Package className="size-6" />
            </div>
            <span className="text-[13px] font-bold text-slate-700">{t("inventoryReport")}</span>
          </Link>

          {/* Edit */}
          <Link
            href="/menu-management"
            className="flex flex-col items-center justify-center bg-white rounded-2xl p-4 shadow-sm border border-slate-100/80 transition hover:shadow-md active:scale-95 duration-200"
          >
            <div className="flex size-12 items-center justify-center rounded-xl bg-blue-50 text-[#1A56DB] mb-3">
              <Pencil className="size-6" />
            </div>
            <span className="text-[13px] font-bold text-slate-700">{t("menuManagement")}</span>
          </Link>

          {/* Payment */}
          <Link
            href="/pending-payments"
            className="flex flex-col items-center justify-center bg-white rounded-2xl p-4 shadow-sm border border-slate-100/80 transition hover:shadow-md active:scale-95 duration-200"
          >
            <div className="flex size-12 items-center justify-center rounded-xl bg-blue-50 text-[#1A56DB] mb-3">
              <CreditCard className="size-6" />
            </div>
            <span className="text-[13px] font-bold text-slate-700">{t("pendingPayments")}</span>
          </Link>

          {/* Verify */}
          <Link
            href="/payment-verification"
            className="flex flex-col items-center justify-center bg-white rounded-2xl p-4 shadow-sm border border-slate-100/80 transition hover:shadow-md active:scale-95 duration-200"
          >
            <div className="flex size-12 items-center justify-center rounded-xl bg-blue-50 text-[#1A56DB] mb-3">
              <ShieldCheck className="size-6" />
            </div>
            <span className="text-[13px] font-bold text-slate-700 text-center">{t("paymentVerification")}</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MobileAdminLayoutPage;