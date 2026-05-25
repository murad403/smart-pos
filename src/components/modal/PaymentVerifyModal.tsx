"use client";

import React, { useState, useEffect } from "react";
import { X, CheckCircle, AlertCircle } from "lucide-react";
import { PaymentVerificationItem } from "@/app/[locale]/(app)/payment-verification/PaymentVerificationCard";
import { useTranslations } from "next-intl";
import { usePaymentVerifyMutation } from "@/redux/features/dashboard/dashboard.api";
import { getUserData } from "@/utils/auth";
import { toast } from "sonner";

interface PaymentVerifyModalProps {
  open: boolean;
  onClose: () => void;
  item: PaymentVerificationItem | null;
  onSuccess: () => void;
}

const formatCurrency = (value: number) => `Rp ${value.toLocaleString("en-US")}`;

const PaymentVerifyModal: React.FC<PaymentVerifyModalProps> = ({
  open,
  onClose,
  item,
  onSuccess,
}) => {
  const t = useTranslations("Payment");
  const [cashReceived, setCashReceived] = useState("");
  const [verifyPayment, { isLoading: isVerifying }] = usePaymentVerifyMutation();

  // Reset inputs when modal is opened or item changes
  useEffect(() => {
    if (open && item) {
      // Default cashReceived to the total amount to verify, or empty string
      setCashReceived("");
    }
  }, [open, item]);

  if (!open || !item) return null;

  const expectedAmount = item.amount;
  const cashReceivedNum = Number(cashReceived) || 0;
  const difference = cashReceivedNum - expectedAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!cashReceived.trim()) {
      toast.error(t("cashReceivedRequired") || "Cash received is required");
      return;
    }

    const userData = getUserData();
    const ownerId = userData?.id || 9; // Fallback to 9 if no session

    try {
      const response = await verifyPayment({
        cashierId: Number(item.id),
        data: {
          verifiedById: ownerId,
          cashReceived: String(cashReceivedNum),
        },
      }).unwrap();

      if (response.success) {
        toast.success(t("verifySuccess") || "Payment verified successfully");
        onSuccess();
        onClose();
      } else {
        toast.error(response.message || "Failed to verify payment");
      }
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Failed to verify payment");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 px-4 py-6 backdrop-blur-[2px]">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl animate-in fade-in-50 zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="mb-4">
          <h2 className="text-xl font-bold text-slate-900">{t("verifyPayment")}</h2>
          <p className="text-xs text-slate-500 mt-1">
            {t("verifyPaymentSubtitle") || "Reconcile received cash against total amount for order"} #{item.orderNumber}
          </p>
        </div>

        {/* Order Info Summary */}
        <div className="mb-4 rounded-xl bg-slate-50 p-4 border border-slate-100 text-sm space-y-2">
          <div className="flex justify-between">
            <span className="text-slate-500">{t("orderNumber")}</span>
            <span className="font-semibold text-slate-800">#{item.orderNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">{t("cashier")}</span>
            <span className="font-medium text-slate-800">{item.cashierName || "-"}</span>
          </div>
          <div className="flex justify-between border-t border-dashed border-slate-200 pt-2">
            <span className="text-slate-500 font-medium">{t("amount")}</span>
            <span className="font-bold text-blue-600">{formatCurrency(expectedAmount)}</span>
          </div>
        </div>

        {/* Verification Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="cashReceived" className="text-[13px] font-bold text-slate-700">
              {t("amountReceived")} (Rp) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="cashReceived"
              value={cashReceived}
              onChange={(e) => setCashReceived(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-[15px] outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-100 font-semibold"
              placeholder="e.g. 50000"
              required
              min="0"
            />
          </div>

          {/* Dynamic feedback */}
          {cashReceived.trim() !== "" && (
            <div className="rounded-lg p-3 text-xs font-medium border animate-in slide-in-from-top-1 duration-200">
              {difference === 0 ? (
                <div className="flex items-center gap-1.5 text-emerald-600">
                  <CheckCircle size={14} />
                  <span>Exact amount match!</span>
                </div>
              ) : difference > 0 ? (
                <div className="flex items-center justify-between text-emerald-600">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle size={14} />
                    <span>{t("changeGiven") || "Change Given"}</span>
                  </span>
                  <span className="font-bold">{formatCurrency(difference)}</span>
                </div>
              ) : (
                <div className="flex items-center justify-between text-red-600">
                  <span className="flex items-center gap-1.5">
                    <AlertCircle size={14} />
                    <span>Shortage Amount</span>
                  </span>
                  <span className="font-bold">{formatCurrency(Math.abs(difference))}</span>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isVerifying}
              className="flex-1 h-12 rounded-xl border border-slate-200 text-[14px] font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              disabled={isVerifying}
              className="flex-1 h-12 rounded-xl bg-blue-500 text-[14px] font-bold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-600 disabled:opacity-50 transition flex items-center justify-center"
            >
              {isVerifying ? t("submitting") : t("verify")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentVerifyModal;