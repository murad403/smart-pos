"use client";

import React, { useState, useEffect } from "react";
import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useCreateOrderMutation } from "@/redux/features/order/order.api";
import { getUserData } from "@/utils/auth";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

type CartItem = {
  itemId: number;
  itemName: string;
  price: number;
  quantity: number;
  imageUrl?: string | null;
  packetChoices?: Array<{
    section: string;
    choice: string;
    quantity: number;
  }>;
};

type Props = {
  open: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateCartItemQuantity: (itemId: number, packetChoices: any[] | undefined, delta: number) => void;
  onClearCart: () => void;
};

const CreateOrderModal: React.FC<Props> = ({
  open,
  onClose,
  cartItems,
  onUpdateCartItemQuantity,
  onClearCart,
}) => {
  const t = useTranslations("Menu");
  const searchParams = useSearchParams();
  const tableParam = searchParams.get("table");

  // Local Form States
  const [customerName, setCustomerName] = useState("");
  const [orderType, setOrderType] = useState<"DINE_IN" | "TAKEAWAY">("DINE_IN");

  // RTK Query hooks
  const [createOrder, { isLoading: isSubmitting }] = useCreateOrderMutation();

  // Reset form on open
  useEffect(() => {
    if (open) {
      setCustomerName("");
      setOrderType("DINE_IN");
    }
  }, [open]);

  if (!open) return null;

  // Calculate Subtotal and Total
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const total = subtotal; // If there are additional charges, add them here.

  // Determine Source and Table ID
  const currentUser = getUserData();
  let detectedSource: "QR_TABLE" | "TOUCHSCREEN" | "STAFF" | "ADMIN" = "TOUCHSCREEN";
  let autoTableId: number | undefined = undefined;

  if (tableParam) {
    detectedSource = "QR_TABLE";
    autoTableId = parseInt(tableParam, 10);
  } else if (currentUser) {
    if (currentUser.role === "ADMIN" || currentUser.role === "OWNER") {
      detectedSource = "ADMIN";
    } else if (currentUser.role === "STAFF" || currentUser.role === "SERVICE") {
      detectedSource = "STAFF";
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim()) {
      toast.error(t("customerNameRequired"));
      return;
    }

    if (cartItems.length === 0) {
      toast.error(t("cartEmpty"));
      return;
    }

    const payload = {
      source: detectedSource,
      type: orderType,
      tableId: autoTableId || undefined,
      customerName,
      items: cartItems.map((item) => ({
        itemId: item.itemId,
        quantity: item.quantity,
        ...(item.packetChoices && item.packetChoices.length > 0
          ? { packetChoices: item.packetChoices }
          : {}),
      })),
    };

    try {
      toast.loading(t("submittingOrder"), { id: "create-order-toast" });
      await createOrder(payload).unwrap();
      toast.success(t("orderCreatedSuccess"), { id: "create-order-toast" });
      onClearCart();
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || t("orderCreateFailed"), {
        id: "create-order-toast",
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-[2px]">
      <div className="relative w-full max-w-lg rounded-[28px] bg-white p-6 shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4 shrink-0">
          <div>
            <h3 className="text-xl font-bold text-slate-900 leading-tight">{t("yourOrder")}</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {t("sourceLabel")}: <span className="font-semibold text-blue-600">{detectedSource}</span>
              {autoTableId && (
                <span>
                  {" "}
                  • {t("tableLabel")}: <span className="font-semibold text-blue-600">{autoTableId}</span>
                </span>
              )}
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

        {/* Form Wrap */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          {/* Scrollable list of items and extra form fields */}
          <div className="flex-1 overflow-y-auto space-y-5 px-1.5 py-1">
            {/* Selected Items list */}
            <div className="space-y-3">
              {cartItems.map((item, idx) => {
                const itemKey = `${item.itemId}-${idx}`;
                return (
                  <div
                    key={itemKey}
                    className="flex items-center justify-between p-3.5 bg-slate-50/50 rounded-2xl border border-slate-100"
                  >
                    {/* Item Image and Name */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative size-12 overflow-hidden rounded-xl border border-slate-100 shrink-0 bg-white flex items-center justify-center">
                        {item.imageUrl ? (
                          <Image
                            src={item.imageUrl}
                            alt={item.itemName}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <ShoppingBag className="size-5 text-slate-300" />
                        )}
                      </div>
                      <div className="min-w-0 leading-tight">
                        <span className="text-[14px] font-bold text-slate-800 block truncate">
                          {item.itemName}
                        </span>
                        <span className="text-[13px] font-medium text-slate-550 block mt-0.5">
                          Rp{item.price.toLocaleString("en-US")}
                        </span>
                        {item.packetChoices && item.packetChoices.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {item.packetChoices.map((choice, cidx) => (
                              <span
                                key={cidx}
                                className="text-[10px] font-semibold bg-white border border-slate-205 text-slate-500 px-1.5 py-0.5 rounded-md"
                              >
                                {choice.section}: {choice.choice}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Quantity Controls and Total */}
                    <div className="flex items-center gap-4 shrink-0 pl-2">
                      <div className="flex items-center gap-2.5 bg-white border border-slate-100 rounded-xl p-1 shadow-sm">
                        <button
                          type="button"
                          onClick={() => onUpdateCartItemQuantity(item.itemId, item.packetChoices, -1)}
                          className="size-7 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-slate-200 text-slate-600 transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="text-sm font-bold text-slate-800 w-4 text-center">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateCartItemQuantity(item.itemId, item.packetChoices, 1)}
                          className="size-7 rounded-lg bg-blue-600 flex items-center justify-center hover:bg-blue-700 text-white transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <span className="text-sm font-extrabold text-slate-800 w-20 text-right">
                        Rp{(item.price * item.quantity).toLocaleString("en-US")}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Calculations */}
            <div className="space-y-2 border-t border-b border-slate-100 py-3 text-slate-600 text-sm font-medium">
              <div className="flex justify-between">
                <span>{t("subtotal")}</span>
                <span className="text-slate-850">Rp{subtotal.toLocaleString("en-US")}</span>
              </div>
              <div className="flex justify-between items-end pt-1">
                <span className="text-base font-bold text-slate-850">{t("total")}</span>
                <span className="text-xl font-extrabold text-blue-600">
                  Rp{total.toLocaleString("en-US")}
                </span>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              {/* Customer Name */}
              <div>
                <label className="block text-[13px] font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                  {t("enterYourName")}
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder={t("yourNamePlaceholder")}
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50 placeholder:text-slate-400 font-medium"
                />
              </div>

              {/* Order Type */}
              <div>
                <label className="block text-[13px] font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                  {t("orderTypeLabel")}
                </label>
                <div className="relative">
                  <select
                    value={orderType}
                    onChange={(e) => setOrderType(e.target.value as any)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50 text-slate-800 appearance-none cursor-pointer pr-8 font-medium"
                  >
                    <option value="DINE_IN">{t("dineIn")}</option>
                    <option value="TAKEAWAY">{t("takeaway")}</option>
                  </select>
                  <svg
                    className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-450"
                    width="14"
                    height="14"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>

            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 text-sm hover:bg-slate-50 transition-colors"
            >
              {t("back")}
            </button>
            <button
              type="submit"
              disabled={isSubmitting || cartItems.length === 0}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
            >
              <ShoppingBag size={16} />
              {t("payAtCounter")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateOrderModal;