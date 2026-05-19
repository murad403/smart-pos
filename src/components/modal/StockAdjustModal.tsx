"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { X, Search, Check, Loader2, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  useGetItemsQuery,
  useStockInMutation,
  useStockOutMutation,
} from "@/redux/features/dashboard/dashboard.api";
import { GetItemsItem } from "@/redux/features/dashboard/dashboard.type";

interface StockAdjustModalProps {
  open: boolean;
  onClose: () => void;
  mode: "in" | "out";
  onSuccess?: () => void;
}

const StockAdjustModal: React.FC<StockAdjustModalProps> = ({
  open,
  onClose,
  mode,
  onSuccess,
}) => {
  const t = useTranslations("Inventory");

  // Form states
  const [selectedItem, setSelectedItem] = useState<GetItemsItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [quantity, setQuantity] = useState<number | "">("");
  const [remarks, setRemarks] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Fetch items with limit=100
  const { data: itemsRes, isLoading: isItemsLoading } = useGetItemsQuery(
    { limit: 100 },
    { skip: !open }
  );

  // Mutations
  const [stockIn, { isLoading: isStockInLoading }] = useStockInMutation();
  const [stockOut, { isLoading: isStockOutLoading }] = useStockOutMutation();

  const isSubmitting = isStockInLoading || isStockOutLoading;

  // Refs for closing dropdown on click outside
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Reset form when modal closes or opens
  useEffect(() => {
    if (open) {
      setSelectedItem(null);
      setSearchQuery("");
      setQuantity("");
      setRemarks("");
      setIsDropdownOpen(false);
    }
  }, [open]);

  // Click outside handler for item dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Filter items client-side based on search query
  const filteredItems = useMemo(() => {
    const items = itemsRes?.data ?? [];
    if (!searchQuery.trim()) return items;
    return items.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [itemsRes, searchQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedItem) {
      toast.error(t("selectItem") || "Please select an item");
      return;
    }

    if (quantity === "" || Number(quantity) <= 0) {
      toast.error(t("quantityPlaceholder") || "Please enter a valid quantity");
      return;
    }

    try {
      const payload = {
        itemId: selectedItem.id,
        qty: Number(quantity),
        remarks: remarks.trim() || undefined,
      };

      let result;
      if (mode === "in") {
        result = await stockIn(payload).unwrap();
      } else {
        result = await stockOut(payload).unwrap();
      }

      if (result.success) {
        toast.success(result.message || "Stock adjusted successfully");
        if (onSuccess) {
          onSuccess();
        }
        onClose();
      } else {
        toast.error(result.message || "Failed to adjust stock");
      }
    } catch (err: any) {
      console.error("Stock adjust error:", err);
      toast.error(err?.data?.message || err?.message || "An error occurred");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 px-4 py-6 backdrop-blur-[2px]">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute right-4 top-4 rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2 mb-4 pr-8">
          <div
            className={`p-2 rounded-lg ${
              mode === "in" ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
            }`}
          >
            {mode === "in" ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            {mode === "in" ? t("stockIn") : t("stockOut")}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Item Selector Dropdown */}
          <div className="relative">
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              {t("item") || "Item"} <span className="text-red-500">*</span>
            </label>

            <button
              ref={triggerRef}
              type="button"
              onClick={() => !isSubmitting && setIsDropdownOpen(!isDropdownOpen)}
              disabled={isSubmitting}
              className="w-full flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-left text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-50"
            >
              {selectedItem ? (
                <div className="flex items-center gap-2 truncate">
                  {selectedItem.imageUrl && (
                    <img
                      src={selectedItem.imageUrl}
                      alt={selectedItem.name}
                      className="w-5 h-5 rounded object-cover flex-shrink-0 border border-slate-100"
                    />
                  )}
                  <span className="truncate font-medium">{selectedItem.name}</span>
                </div>
              ) : (
                <span className="text-slate-400">
                  {t("selectItem") || "Select Item"}
                </span>
              )}
              <Search size={16} className="text-slate-400 flex-shrink-0" />
            </button>

            {isDropdownOpen && (
              <div
                ref={dropdownRef}
                className="absolute z-10 mt-1 w-full rounded-lg border border-slate-200 bg-white shadow-lg max-h-60 overflow-y-auto flex flex-col"
              >
                {/* Search field in dropdown */}
                <div className="p-2 border-b border-slate-100 flex items-center gap-2 sticky top-0 bg-white">
                  <Search size={14} className="text-slate-400 flex-shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t("searchItemPlaceholder") || "Search item by name..."}
                    className="w-full text-xs text-slate-800 outline-none border-none p-1 placeholder-slate-400"
                    autoFocus
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>

                {/* Items List */}
                <div className="py-1">
                  {isItemsLoading ? (
                    <div className="p-4 flex items-center justify-center text-xs text-slate-400 gap-2">
                      <Loader2 size={14} className="animate-spin text-slate-400" />
                      <span>Loading items...</span>
                    </div>
                  ) : filteredItems.length === 0 ? (
                    <div className="p-3 text-center text-xs text-slate-400">
                      No items found.
                    </div>
                  ) : (
                    filteredItems.map((item) => {
                      const isSelected = selectedItem?.id === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setSelectedItem(item);
                            setIsDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs transition-colors hover:bg-slate-50 ${
                            isSelected ? "bg-blue-50/50" : ""
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            {item.imageUrl && (
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="w-6 h-6 rounded object-cover flex-shrink-0 border border-slate-100"
                              />
                            )}
                            <div className="truncate">
                              <p className="font-semibold text-slate-800 truncate">
                                {item.name}
                              </p>
                              <p className="text-[10px] text-slate-400">
                                Stock: {item.inventoryQty !== null ? item.inventoryQty : "-"}
                              </p>
                            </div>
                          </div>
                          {isSelected && (
                            <Check size={14} className="text-blue-600 flex-shrink-0" />
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quantity Input */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              {t("quantity") || "Quantity"} <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => {
                const val = e.target.value;
                setQuantity(val === "" ? "" : Number(val));
              }}
              placeholder={t("quantityPlaceholder") || "Enter quantity"}
              disabled={isSubmitting}
              className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-50"
              required
            />
          </div>

          {/* Remarks Input */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              {t("remarks") || "Remarks"}
            </label>
            <textarea
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder={t("remarksPlaceholder") || "Enter remarks (optional)"}
              disabled={isSubmitting}
              className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-50 resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              {t("cancel") || "Cancel"}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex items-center justify-center gap-1.5 rounded-lg px-6 py-2.5 text-sm font-bold text-white transition disabled:opacity-75 ${
                mode === "in"
                  ? "bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/10"
                  : "bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-600/10"
              }`}
            >
              {isSubmitting && <Loader2 size={14} className="animate-spin" />}
              {t("submit") || "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockAdjustModal;
