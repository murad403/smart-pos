"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Loader2, X, AlertTriangle } from "lucide-react";
import {
  useGetAllAdditionalPricingAdjustmentQuery,
  useCreateAdditionalPricingAdjustmentMutation,
  useUpdateAdditionalPricingAdjustmentMutation,
  useDeleteAdditionalPricingAdjustmentMutation,
} from "@/redux/features/price/price.api";
import CustomPagination from "@/components/shared/CustomPagination";

const PricingAdjustmentPreset = () => {
  const tp = useTranslations("Pricing");

  // Pagination state
  const [page, setPage] = useState(1);
  const limit = 5;

  // API Queries & Mutations
  const { data: apiRes, refetch, isLoading } = useGetAllAdditionalPricingAdjustmentQuery({
    page,
    limit,
  });

  const [createAdjustment, { isLoading: isCreating }] = useCreateAdditionalPricingAdjustmentMutation();
  const [updateAdjustment, { isLoading: isUpdating }] = useUpdateAdditionalPricingAdjustmentMutation();
  const [deleteAdjustment, { isLoading: isDeleting }] = useDeleteAdditionalPricingAdjustmentMutation();

  const additionalData = apiRes?.data ?? [];
  const pagination = apiRes?.pagination;
  const totalPages = pagination?.totalPages ?? 1;

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null); // null if adding
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Form states
  const [level, setLevel] = useState("");
  const [type, setType] = useState<"PERCENTAGE" | "FIXED_AMOUNT">("PERCENTAGE");
  const [value, setValue] = useState("");

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setLevel("");
    setType("PERCENTAGE");
    setValue("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: any) => {
    setEditingItem(item);
    setLevel(item.level);
    setType(item.type);
    setValue(item.type === "PERCENTAGE" ? String(item.percentage) : String(item.fixedAmount));
    setIsModalOpen(true);
  };

  const handleOpenDeleteModal = (id: number) => {
    setDeletingId(id);
    setIsDeleteModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!value.trim() || Number(value) === 0) {
      toast.error(tp("valueMin") || "Value must not be 0");
      return;
    }

    const payload: any = {
      level,
      type,
    };

    if (type === "PERCENTAGE") {
      payload.percentage = Number(value);
      payload.fixedAmount = null;
    } else {
      payload.fixedAmount = Number(value);
      payload.percentage = null;
    }

    try {
      if (editingItem) {
        await updateAdjustment({ id: editingItem.id, data: payload }).unwrap();
        toast.success(tp("successUpdateAdditional") || "Additional pricing adjustment updated successfully");
      } else {
        await createAdjustment(payload).unwrap();
        toast.success(tp("successCreateAdditional") || "Additional pricing adjustment created successfully");
      }
      setIsModalOpen(false);
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Operation failed");
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;

    try {
      await deleteAdjustment({ id: deletingId }).unwrap();
      toast.success(tp("successDeleteAdditional") || "Additional pricing adjustment deleted successfully");
      setIsDeleteModalOpen(false);
      setDeletingId(null);
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Delete failed");
    }
  };

  return (
    <div className="rounded-[24px] border border-slate-100 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            {tp("additionalPricingAdjustments") || "Additional Pricing Adjustments"}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {tp("additionalPricingAdjustmentsSubtitle") || "Manage additional preset pricing adjustments for your products or orders."}
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-600 transition duration-150 cursor-pointer self-start sm:self-center"
        >
          <Plus size={16} />
          <span>{tp("addAdditionalAdjustment") || "Add Additional Pricing Adjustment"}</span>
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="space-y-4">
          <div className="h-12 w-full animate-pulse rounded-xl bg-slate-100" />
          <div className="h-12 w-full animate-pulse rounded-xl bg-slate-100" />
          <div className="h-12 w-full animate-pulse rounded-xl bg-slate-100" />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="overflow-hidden rounded-2xl border border-slate-100">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-500">
                <thead className="bg-slate-50/75 text-xs uppercase tracking-wider text-slate-700 border-b border-slate-100">
                  <tr>
                    <th scope="col" className="px-6 py-4 font-semibold">{tp("level") || "Level"}</th>
                    <th scope="col" className="px-6 py-4 font-semibold">{tp("type") || "Type"}</th>
                    <th scope="col" className="px-6 py-4 font-semibold">{tp("value") || "Value"}</th>
                    <th scope="col" className="px-6 py-4 font-semibold text-right">{tp("action") || "Action"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {additionalData.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-slate-400 font-medium">
                        No additional pricing adjustments found.
                      </td>
                    </tr>
                  ) : (
                    additionalData.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition">
                        <td className="px-6 py-4 text-slate-800 font-semibold">
                          {item.level}
                        </td>
                        <td className="px-6 py-4 text-slate-600 font-medium">
                          {item.type === "PERCENTAGE"
                            ? tp("typePercentage") || "Percentage (%)"
                            : tp("typeFixedAmount") || "Fixed Amount (Rp)"}
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-900">
                          {item.type === "PERCENTAGE"
                            ? `${item.percentage}%`
                            : `Rp ${Number(item.fixedAmount).toLocaleString("en-US")}`}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(item)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenDeleteModal(item.id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <CustomPagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={(p) => {
                  if (p >= 1 && p <= totalPages) {
                    setPage(p);
                  }
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-[2px]">
          <div className="relative w-full max-w-120 rounded-[24px] bg-white p-8 shadow-2xl animate-in fade-in-50 zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute right-6 top-6 rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            >
              <X size={20} />
            </button>

            <div className="mb-6">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                {editingItem
                  ? tp("editAdditionalAdjustment") || "Edit Additional Pricing Adjustment"
                  : tp("addAdditionalAdjustment") || "Add Additional Pricing Adjustment"}
              </h2>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              {/* Level Input */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  {tp("level") || "Level"} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  placeholder="e.g., TAX, DISCOUNT, VAT"
                  className="w-full rounded-[14px] bg-[#F1F5F9] px-4 py-3 text-[16px] text-slate-900 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 font-medium"
                  required
                />
              </div>

              {/* Type Input */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  {tp("type") || "Type"} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full appearance-none rounded-[14px] bg-[#F1F5F9] px-4 py-3 text-[16px] text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="PERCENTAGE">{tp("typePercentage") || "Percentage (%)"}</option>
                    <option value="FIXED_AMOUNT">{tp("typeFixedAmount") || "Fixed Amount (Rp)"}</option>
                  </select>
                  <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Value Input */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  {tp("value") || "Value"}{type === "PERCENTAGE" ? " (%)" : " (Rp)"} <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder={type === "PERCENTAGE" ? "e.g., 10" : "e.g., 50"}
                  className="w-full rounded-[14px] bg-[#F1F5F9] px-4 py-3 text-[16px] text-slate-900 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 font-medium"
                  required
                  step="any"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isCreating || isUpdating}
                  className="rounded-xl border border-slate-200 px-6 py-2.5 text-[15px] font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  {tp("cancel") || "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="rounded-xl bg-blue-500 px-6 py-2.5 text-[15px] font-semibold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-600 transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {(isCreating || isUpdating) && <Loader2 className="size-4 animate-spin" />}
                  {tp("save") || "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-[2px]">
          <div className="relative w-full max-w-md rounded-[24px] bg-white p-8 shadow-2xl animate-in fade-in-50 zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              className="absolute right-6 top-6 rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              disabled={isDeleting}
            >
              <X size={20} />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="mb-5 flex size-14 items-center justify-center rounded-full bg-red-50 text-red-500">
                <AlertTriangle size={28} />
              </div>

              <h3 className="mb-2 text-xl font-bold text-slate-900">
                {tp("deleteAdditionalAdjustment") || "Delete Additional Pricing Adjustment"}
              </h3>
              <p className="mb-8 text-sm text-slate-500 leading-relaxed">
                {tp("deleteAdditionalConfirm") || "Are you sure you want to delete this additional pricing adjustment?"}
              </p>

              <div className="flex w-full items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 rounded-xl border border-slate-200 py-3 text-[15px] font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
                  disabled={isDeleting}
                >
                  {tp("cancel") || "Cancel"}
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="flex-1 rounded-xl bg-red-600 py-3 text-[15px] font-semibold text-white shadow-lg shadow-red-500/25 transition hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
                  disabled={isDeleting}
                >
                  {isDeleting && <Loader2 className="size-4 animate-spin" />}
                  {tp("delete") || "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PricingAdjustmentPreset;