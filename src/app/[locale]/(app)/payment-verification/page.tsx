/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useMemo, useState } from "react";
import { File, Search } from "lucide-react";
import PaymentVerificationCard, { PaymentVerificationItem } from "./PaymentVerificationCard";
import PaymentVerificationModal from "@/components/modal/PaymentVerificationModal";
import PaymentVerifyModal from "@/components/modal/PaymentVerifyModal";
import CustomPagination from "@/components/shared/CustomPagination";
import { useTranslations } from "next-intl";
import { useGetPaymentsQuery } from "@/redux/features/dashboard/dashboard.api";
import TodayPaymentVerification from "./TodayPaymentVerification";

const PaymentVerificationPage = ({ params }: { params?: Promise<{ locale: string }> }) => {
  if (params) React.use(params);
  const t = useTranslations("Payment");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<PaymentVerificationItem | null>(null);
  const [verifyingItem, setVerifyingItem] = useState<PaymentVerificationItem | null>(null);

  // Fetch payments list from API with page, limit, status, method, and search criteria
  const { data: paymentsRes, isLoading, refetch } = useGetPaymentsQuery({
    page: currentPage,
    limit: 6,
    search: searchQuery.trim() || undefined,
  });

  const payments = paymentsRes?.data ?? [];
  const pagination = paymentsRes?.pagination;
  const totalPages = pagination?.totalPages ?? 1;

  // Map API payment objects to PaymentVerificationItem structures for identical UI rendering
  const mappedRows: PaymentVerificationItem[] = useMemo(() => {
    return payments.map((item) => {

      const displayImage = item.proofImages && item.proofImages.length > 0
        ? item.proofImages[0]
        : undefined;

      return {
        id: String(item.id),
        orderNumber: item.order?.slug ?? `pay-${item.id}`,
        amount: Number(item.totalAmount),
        amountReceived: item.cashReceived !== null ? Number(item.cashReceived) : Number(item.totalAmount),
        paymentMethod: item.method,
        personLabel: t("customer") || "Customer",
        personName: item.order?.customerName ?? "Guest",
        dateTime: item.paidAt ? new Date(item.paidAt).toLocaleString("en-US", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false
        }) : "-",
        status: item.status,
        image: displayImage,
        cashierName: item.cashier?.name,
        markAsMissMatch: item.markAsMissMatch,
        isVerified: item.isVerified,
        verificationStatus: item.verificationStatus,
      };
    });
  }, [payments, t]);

  return (
    <div>
      {/* Header and Filter Bar */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{t("proof")}</h1>
          <p className="mt-1 text-sm text-slate-600">{t("subtitle")}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search Input */}
          <div className="relative">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setCurrentPage(1);
                setSelectedItem(null);
              }}
              placeholder={t("searchPlaceholder")}
              className="h-10 w-full sm:w-64 rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <a className="flex items-center gap-1 bg-green-400 hover:bg-green-300 duration-300 transition-discrete text-white rounded-lg px-4 py-2" href={`${process.env.NEXT_PUBLIC_BASE_URL}/payments/export/today`}>
            <File size={16} />
            <span>Download</span>
          </a>
        </div>
      </div>

      {/* Cards list / Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:gap-6 md:grid-cols-2 xl:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-xl border border-slate-200 bg-white p-4 h-100 flex flex-col justify-between"
            >
              <div className="h-60 w-full bg-slate-50 rounded-lg" />
              <div className="space-y-3 mt-3">
                <div className="h-4 bg-slate-50 rounded w-3/4" />
                <div className="h-4 bg-slate-50 rounded w-1/2" />
                <div className="h-4 bg-slate-50 rounded w-5/6" />
              </div>
              <div className="h-9 bg-slate-50 rounded mt-3" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:gap-6 md:grid-cols-2 xl:grid-cols-3">
          {mappedRows.map((item) => (
            <PaymentVerificationCard
              key={item.id}
              item={item}
              onViewDetails={setSelectedItem}
              onVerify={setVerifyingItem}
            />
          ))}
        </div>
      )}

      {/* No results placeholder */}
      {!isLoading && mappedRows.length === 0 && (
        <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm text-slate-500">
          {t("noTransactions")}
        </div>
      )}

      {/* Pagination Footer */}
      {!isLoading && totalPages > 1 && (
        <div className="mt-4">
          <CustomPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => {
              if (page >= 1 && page <= totalPages) {
                setCurrentPage(page);
                setSelectedItem(null);
              }
            }}
          />
        </div>
      )}

      <TodayPaymentVerification/>

      {/* Details Verification Modal */}
      <PaymentVerificationModal item={selectedItem} onClose={() => setSelectedItem(null)} />

      {/* Verify Input Modal */}
      <PaymentVerifyModal
        open={verifyingItem !== null}
        onClose={() => setVerifyingItem(null)}
        item={verifyingItem}
        onSuccess={() => {
          refetch();
        }}
      />
    </div>
  );
};

export default PaymentVerificationPage;
