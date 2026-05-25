/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useState, useEffect } from "react";
import { AlertTriangle, X, ImageOff, ChevronLeft, ChevronRight } from "lucide-react";
import { PaymentVerificationItem } from "@/app/[locale]/(app)/payment-verification/PaymentVerificationCard";
import { useTranslations } from "next-intl";
import { useGetPaymentDetailsQuery } from "@/redux/features/dashboard/dashboard.api";

interface PaymentVerificationModalProps {
  item: PaymentVerificationItem | null;
  onClose: () => void;
}

const formatCurrency = (value: number) => `Rp ${value.toLocaleString("en-US")}`;

const PaymentVerificationModal = ({ item, onClose }: PaymentVerificationModalProps) => {
  const t = useTranslations("Payment");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Reset image index when item changes
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [item?.id]);
  
  // Call detailed API query hook
  const { data: detailsRes, isLoading } = useGetPaymentDetailsQuery(
    Number(item?.id),
    { skip: !item }
  );

  if (!item) return null;

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 px-4 py-6 backdrop-blur-[2px]">
        <div className="relative w-full max-w-lg rounded-2xl bg-white p-4 shadow-xl sm:p-5 animate-pulse flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <div className="h-6 w-32 bg-slate-100 rounded" />
            <div className="h-5 w-16 bg-slate-100 rounded-full" />
          </div>
          <div className="h-48 w-full bg-slate-50 rounded-xl mb-4" />
          <div className="space-y-3 mb-4">
            <div className="h-4 bg-slate-50 rounded w-3/4" />
            <div className="h-4 bg-slate-50 rounded w-1/2" />
          </div>
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="h-16 bg-slate-50 rounded" />
            <div className="h-16 bg-slate-50 rounded" />
            <div className="h-16 bg-slate-50 rounded" />
            <div className="h-16 bg-slate-50 rounded" />
          </div>
          <div className="h-10 bg-slate-50 rounded" />
        </div>
      </div>
    );
  }

  const details = detailsRes?.data;
  
  const amount = details?.totalAmount ?? item.amount;
  const amountReceived = details?.cashReceived !== null && details?.cashReceived !== undefined
    ? details.cashReceived
    : (details?.totalAmount ?? item.amountReceived);
  const difference = amountReceived - amount;
  
  const changeGiven = details?.changeAmount !== null && details?.changeAmount !== undefined
    ? details.changeAmount
    : Math.max(0, difference);

  const paymentMethod = details?.method ?? item.paymentMethod;
  const customerName = details?.order?.customerName ?? item.personName;
  const dateTime = item.dateTime;
  const isMismatch = item.status === "mismatch";

  const imagesToRender = details?.proofImages && details.proofImages.length > 0
    ? details.proofImages
    : (item.image ? [item.image] : []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 px-4 py-6 backdrop-blur-[2px]">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-4 shadow-xl sm:p-5 max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 z-10"
          aria-label="Close modal"
        >
          <X size={16} />
        </button>

        <div className="mb-2 flex items-center gap-2 pr-8">
          <h2 className="text-[26px] font-bold leading-none text-slate-900">{t("orderNumber")}{details?.order?.slug ?? item.orderNumber}</h2>
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
              isMismatch ? "bg-red-500 text-white" : "bg-emerald-500 text-white"
            }`}
          >
            {isMismatch ? t("mismatch") : t("match")}
          </span>
        </div>
        <p className="mb-3 text-sm text-slate-500">
          {t("paymentVerificationDetails") || "Payment verification details for order"} {details?.order?.slug ?? item.orderNumber}
        </p>

        {/* Proof Images Slider / Scrollable Grid */}
        {imagesToRender.length > 0 ? (
          <div className="relative mb-4">
            <div className="relative overflow-hidden rounded-xl border border-slate-100">
              <img
                src={typeof imagesToRender[currentImageIndex] === "string" 
                  ? (imagesToRender[currentImageIndex] as string)
                  : (imagesToRender[currentImageIndex] as any).src
                }
                alt={`Payment proof ${currentImageIndex + 1} for order ${item.orderNumber}`}
                className="h-52 w-full object-cover sm:h-60"
              />
              
              {imagesToRender.length > 1 && (
                <div className="absolute bottom-2 right-2 rounded bg-black/60 px-2 py-0.5 text-xs text-white">
                  {currentImageIndex + 1} / {imagesToRender.length}
                </div>
              )}
            </div>

            {imagesToRender.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? imagesToRender.length - 1 : prev - 1))}
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-1.5 text-slate-700 shadow transition hover:bg-white hover:text-slate-900 active:scale-95 z-10"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentImageIndex((prev) => (prev === imagesToRender.length - 1 ? 0 : prev + 1))}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-1.5 text-slate-700 shadow transition hover:bg-white hover:text-slate-900 active:scale-95 z-10"
                  aria-label="Next image"
                >
                  <ChevronRight size={18} />
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="h-52 w-full bg-slate-50 flex flex-col items-center justify-center text-slate-400 gap-2 border border-slate-100 rounded-xl mb-4 sm:h-60">
            <ImageOff size={36} className="text-slate-300" />
            <span className="text-sm font-semibold uppercase tracking-wider text-slate-400">No Image Proof Available</span>
          </div>
        )}

        {/* Order Items Breakdown */}
        {details?.order?.orderItems && details.order.orderItems.length > 0 && (
          <div className="mb-4 rounded-xl border border-slate-100 p-3 bg-slate-50/30">
            <h4 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-slate-400">Order Details</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
              {details.order.orderItems.map((orderItem) => (
                <div key={orderItem.id} className="flex justify-between text-sm">
                  <span className="text-slate-600 font-medium">
                    {orderItem.itemName} <span className="text-slate-400 text-xs">x{orderItem.quantity}</span>
                  </span>
                  <span className="font-semibold text-slate-800">
                    Rp {(Number(orderItem.unitPrice) * orderItem.quantity).toLocaleString("en-US")}
                  </span>
                </div>
              ))}
            </div>
            
            {/* Subtotal & Charges */}
            <div className="mt-3 pt-2.5 border-t border-dashed border-slate-200 space-y-1.5 text-xs text-slate-500">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>Rp {(details.subtotal ?? 0).toLocaleString("en-US")}</span>
              </div>
              <div className="flex justify-between">
                <span>Charges / Tax</span>
                <span>Rp {(details.chargesTotal ?? 0).toLocaleString("en-US")}</span>
              </div>
            </div>
          </div>
        )}

        {/* Financial Highlights */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-2">
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-xs text-slate-500">{t("amount")}</p>
            <p className="text-[20px] sm:text-[24px] font-semibold leading-tight text-slate-900">{formatCurrency(amount)}</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-xs text-slate-500">{t("amountReceived")}</p>
            <p className="text-[20px] sm:text-[24px] font-semibold leading-tight text-slate-900">{formatCurrency(amountReceived)}</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-xs text-slate-500">{t("changeGiven")}</p>
            <p className="text-[20px] sm:text-[24px] font-semibold leading-tight text-slate-900">
              {formatCurrency(changeGiven)}
            </p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-xs text-slate-500">{t("paymentMethod")}</p>
            <p className="text-[20px] sm:text-[24px] font-semibold leading-tight text-slate-900">{paymentMethod}</p>
          </div>
        </div>

        <div className="mt-3 flex flex-col gap-2 rounded-lg border border-slate-100 px-3 py-2 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <p>
            {item.personLabel}: <span className="font-semibold text-slate-800">{customerName}</span>
          </p>
          <p>
            {t("cashier")}: <span className="font-semibold text-slate-800">{details?.cashier?.name ?? item.cashierName ?? "-"}</span>
          </p>
          <p>
            {t("dateTime")}: <span className="font-semibold text-slate-800">{dateTime}</span>
          </p>
        </div>

        {isMismatch && (
          <div className="mt-3 rounded-lg border border-red-200 bg-red-50/60 p-3">
            <div className="mb-1 flex items-center gap-1 text-sm font-semibold text-red-600">
              <AlertTriangle size={14} />
              <span>{t("mismatchesDetected")}</span>
            </div>
            <p className="text-xs text-red-500 font-medium">
              {t("expected")}: {formatCurrency(amount)} | {t("received")}: {formatCurrency(amountReceived)} | {t("difference")}: {formatCurrency(Math.abs(difference))}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentVerificationModal;
