/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { X, Plus, Trash2, Save, Percent, Coins, ChevronDown } from "lucide-react";
import { useGetAllPriceAdjustmentsQuery } from "@/redux/features/price/price.api";
import { useUpdateOrderPricingAdjustmentMutation } from "@/redux/features/order/order.api";
import { Order, UpdateOrderPricingAdjustmentItem } from "@/redux/features/order/order.type";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

interface UpdatePricingAdjustmentsModalProps {
  open: boolean;
  onClose: () => void;
  order: Order;
}

interface LocalAdjustment {
  id?: number;
  level: string;
  type: "PERCENTAGE" | "FIXED_AMOUNT";
  value: number;
}

const UpdatePricingAdjustmentsModal: React.FC<UpdatePricingAdjustmentsModalProps> = ({
  open,
  onClose,
  order,
}) => {
  const t = useTranslations("Order");
  const tp = useTranslations("Profile");

  const [updateOrderPricingAdjustment, { isLoading: isUpdating }] =
    useUpdateOrderPricingAdjustmentMutation();

  // Load global presets templates
  const { data: presetsRes } = useGetAllPriceAdjustmentsQuery(
    { limit: 100 },
    { skip: !open }
  );
  const presets = presetsRes?.data ?? [];

  // Local state for tracking adjustments being edited
  const [adjustments, setAdjustments] = useState<LocalAdjustment[]>([]);
  const [showPresetsDropdown, setShowPresetsDropdown] = useState(false);

  // Initialize from order's current adjustments
  useEffect(() => {
    if (open && order?.pricingAdjustments) {
      const mapped = order.pricingAdjustments.map((adj) => ({
        id: adj.id,
        level: adj.level,
        type: adj.type,
        value: adj.type === "PERCENTAGE" ? Number(adj.percentage ?? 0) : Number(adj.fixedAmount ?? 0),
      }));
      setAdjustments(mapped);
    } else {
      setAdjustments([]);
    }
    setShowPresetsDropdown(false);
  }, [open, order]);

  if (!open) return null;

  const handleAddCustom = () => {
    setAdjustments((prev) => [
      ...prev,
      {
        level: "Custom adjustment",
        type: "FIXED_AMOUNT",
        value: 0,
      },
    ]);
    setShowPresetsDropdown(false);
  };

  const handleAddPreset = (preset: any) => {
    const presetVal = preset.type === "PERCENTAGE" ? Number(preset.percentage ?? 0) : Number(preset.fixedAmount ?? 0);
    setAdjustments((prev) => [
      ...prev,
      {
        level: preset.level,
        type: preset.type as "PERCENTAGE" | "FIXED_AMOUNT",
        value: presetVal,
      },
    ]);
    setShowPresetsDropdown(false);
  };

  const handleRemove = (index: number) => {
    setAdjustments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFieldChange = (index: number, field: keyof LocalAdjustment, val: any) => {
    setAdjustments((prev) =>
      prev.map((adj, i) => {
        if (i === index) {
          const updated = { ...adj, [field]: val };
          return updated;
        }
        return adj;
      })
    );
  };

  // Live calculations
  const subtotal = Number(order.subtotal || 0);
  let totalAmount = subtotal;

  const calculatedAdjustments = adjustments.map((adj) => {
    const amount =
      adj.type === "PERCENTAGE"
        ? (subtotal * adj.value) / 100
        : adj.value;
    totalAmount += amount;
    return {
      ...adj,
      amount,
    };
  });

  const formatCurrency = (val: number) => {
    const sign = val < 0 ? "-" : "";
    return `${sign}Rp ${Math.abs(val).toLocaleString("en-US")}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    for (const adj of adjustments) {
      if (!adj.level.trim()) {
        toast.error("Adjustment label cannot be empty");
        return;
      }
      if (adj.type === "PERCENTAGE" && (adj.value < -100 || adj.value > 100)) {
        toast.error("Percentage adjustment must be between -100% and 100%");
        return;
      }
    }

    const payload: UpdateOrderPricingAdjustmentItem[] = adjustments.map((adj) => ({
      id: adj.id,
      level: adj.level,
      type: adj.type,
      percentage: adj.type === "PERCENTAGE" ? adj.value : null,
      fixedAmount: adj.type === "FIXED_AMOUNT" ? adj.value : null,
    }));

    try {
      toast.loading("Saving pricing adjustments...", { id: "pricing-adjust-toast" });
      await updateOrderPricingAdjustment({
        id: order.id,
        data: { pricingAdjustments: payload },
      }).unwrap();
      toast.success("Pricing adjustments updated successfully!", { id: "pricing-adjust-toast" });
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Failed to update pricing adjustments", {
        id: "pricing-adjust-toast",
      });
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-[2px]">
      <div className="relative w-full max-w-2xl rounded-[28px] bg-white p-6 shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4 shrink-0">
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 leading-tight">
              Adjust Pricing - {order.slug}
            </h3>
            <p className="text-xs text-slate-505 mt-1 font-semibold">
              Add, modify, or remove taxes, service fees, or discounts applied to this order.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors border border-slate-100 text-slate-400 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Wrapper */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto space-y-4 px-1 py-1">
            {adjustments.length === 0 ? (
              <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                <p className="text-sm text-slate-500 font-medium">No pricing adjustments applied yet.</p>
                <p className="text-xs text-slate-400 mt-1">Click below to add a preset or custom adjustment.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {adjustments.map((adj, index) => (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 bg-slate-50/55 rounded-2xl border border-slate-100 hover:border-slate-200 transition"
                  >
                    {/* Level input */}
                    <div className="flex-1 min-w-0">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Adjustment Name
                      </label>
                      <input
                        type="text"
                        value={adj.level}
                        onChange={(e) => handleFieldChange(index, "level", e.target.value)}
                        className="w-full text-sm font-semibold text-slate-800 bg-white border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        placeholder="e.g. Service Charge"
                        required
                      />
                    </div>

                    {/* Type Selector (Segmented control) */}
                    <div className="w-full sm:w-auto">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Type
                      </label>
                      <div className="flex items-center bg-white border border-slate-200 rounded-xl p-1 shadow-sm shrink-0">
                        <button
                          type="button"
                          onClick={() => handleFieldChange(index, "type", "PERCENTAGE")}
                          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                            adj.type === "PERCENTAGE"
                              ? "bg-blue-50 text-blue-600"
                              : "text-slate-500 hover:text-slate-700"
                          }`}
                        >
                          <Percent size={12} />
                          <span>Percentage</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleFieldChange(index, "type", "FIXED_AMOUNT")}
                          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                            adj.type === "FIXED_AMOUNT"
                              ? "bg-blue-50 text-blue-600"
                              : "text-slate-500 hover:text-slate-700"
                          }`}
                        >
                          <Coins size={12} />
                          <span>Fixed</span>
                        </button>
                      </div>
                    </div>

                    {/* Value Input */}
                    <div className="w-full sm:w-28">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        {adj.type === "PERCENTAGE" ? "Value (%)" : "Value (Rp)"}
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step={adj.type === "PERCENTAGE" ? "0.01" : "1"}
                          value={adj.value || ""}
                          onChange={(e) => handleFieldChange(index, "value", parseFloat(e.target.value) || 0)}
                          className="w-full text-sm font-bold text-slate-800 bg-white border border-slate-200 rounded-xl pl-3 pr-7 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          placeholder="0"
                          required
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
                          {adj.type === "PERCENTAGE" ? "%" : "Rp"}
                        </span>
                      </div>
                    </div>

                    {/* Remove Action */}
                    <div className="sm:self-end sm:pb-1">
                      <button
                        type="button"
                        onClick={() => handleRemove(index)}
                        className="p-2.5 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition cursor-pointer self-end"
                        title="Delete adjustment"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Actions for adding adjustment */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowPresetsDropdown(!showPresetsDropdown)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 cursor-pointer transition"
                >
                  <span>Add Preset Template</span>
                  <ChevronDown size={14} className={`transition-transform duration-200 ${showPresetsDropdown ? "rotate-180" : ""}`} />
                </button>

                {showPresetsDropdown && (
                  <div className="absolute left-0 mt-1.5 z-110 w-64 rounded-2xl border border-slate-100 bg-white p-1.5 shadow-xl ring-1 ring-black/5 max-h-56 overflow-y-auto">
                    {presets.length === 0 ? (
                      <p className="text-[11px] text-slate-400 p-3 text-center">No preset templates found in settings.</p>
                    ) : (
                      presets.map((preset) => (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => handleAddPreset(preset)}
                          className="w-full text-left rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                        >
                          <span className="font-bold text-slate-800">{preset.level}</span>{" "}
                          <span className="text-slate-400 font-medium">
                            ({preset.type === "PERCENTAGE" ? `${preset.percentage}%` : `Rp${Number(preset.fixedAmount).toLocaleString()}`})
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleAddCustom}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 cursor-pointer transition"
              >
                <Plus size={14} />
                <span>Add Custom Adjustment</span>
              </button>
            </div>

            {/* Calculations Summary Card */}
            <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50/40 p-4 space-y-2.5">
              <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                New Total Preview
              </h4>
              <div className="flex justify-between text-sm text-slate-650 font-medium">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>

              {calculatedAdjustments.map((adj, i) => (
                <div key={i} className="flex justify-between text-xs text-slate-500">
                  <span className="truncate max-w-[70%]">
                    {adj.level} {adj.type === "PERCENTAGE" && `(${adj.value}%)`}
                  </span>
                  <span className={adj.amount < 0 ? "text-red-500" : "text-slate-600 font-semibold"}>
                    {adj.amount < 0 ? "-" : "+"}{formatCurrency(Math.abs(adj.amount))}
                  </span>
                </div>
              ))}

              <div className="flex justify-between items-end pt-2 border-t border-slate-200/60 mt-1">
                <span className="text-sm font-bold text-slate-850">Estimated Total Amount</span>
                <span className="text-lg font-extrabold text-blue-600">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center gap-3 shrink-0 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 text-sm hover:bg-slate-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 cursor-pointer"
            >
              <Save size={16} />
              <span>Save Adjustments</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdatePricingAdjustmentsModal;
