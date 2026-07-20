"use client";

import React from "react";
import { X, Trash2, Loader2 } from "lucide-react";
import { useDeleteOrderMutation } from "@/redux/features/order/order.api";
import { Order } from "@/redux/features/order/order.type";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

interface DeleteOrderPaymentModalProps {
  order: Order | null;
  onClose: () => void;
}

const DeleteOrderPaymentModal: React.FC<DeleteOrderPaymentModalProps> = ({ order, onClose }) => {
  const tPending = useTranslations("PendingPayments");
  const [deleteOrder, { isLoading }] = useDeleteOrderMutation();

  if (!order) return null;

  const handleDelete = async () => {
    try {
      await deleteOrder(order.id).unwrap();
      toast.success(tPending("orderDeletedSuccess") || "Order payment deleted successfully.");
      onClose();
    } catch (error: any) {
      toast.error(error?.data?.message || error?.message || tPending("orderDeleteFailed") || "Failed to delete order payment.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-6 backdrop-blur-[2px]" onClick={onClose}>
      <div
        className="relative w-full max-w-sm rounded-[24px] bg-white p-8 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-6 top-6 rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          disabled={isLoading}
          aria-label={tPending("close") || "Close"}
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="mb-5 flex size-14 items-center justify-center rounded-full bg-red-50 text-red-500">
            <Trash2 size={28} />
          </div>

          <h3 className="mb-2 text-xl font-bold text-slate-900">
            {tPending("deleteOrderTitle") || "Delete Order?"}
          </h3>
          <p className="mb-8 text-sm text-slate-500 leading-relaxed">
            {tPending("deleteOrderDesc") || "Are you sure you want to delete order"} <span className="font-semibold text-slate-800">"{order.slug}"</span>? {tPending("actionCannotBeUndone") || "This action cannot be undone."}
          </p>

          <div className="flex w-full items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-200 py-3 text-[15px] font-semibold text-slate-900 transition hover:bg-slate-50 disabled:opacity-50"
              disabled={isLoading}
            >
              {tPending("cancel") || "Cancel"}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="flex-1 rounded-xl bg-red-600 py-3 text-[15px] font-semibold text-white shadow-lg shadow-red-500/25 transition hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-1.5"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="size-4 animate-spin" />}
              {tPending("delete") || "Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteOrderPaymentModal;