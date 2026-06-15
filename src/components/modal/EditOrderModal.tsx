/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { X, Minus, Plus, ShoppingBag, Save, Receipt } from "lucide-react";
import Image from "next/image";
import { useEditOrderMutation } from "@/redux/features/order/order.api";
import { useGetAllPriceAdjustmentsQuery } from "@/redux/features/price/price.api";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

type CartItem = {
    itemId: number;
    itemName: string;
    price: number;
    quantity: number;
    imageUrl?: string | null;
    productionStationId?: number | null;
    packetChoices?: Array<{
        section: string;
        choice: string;
        choiceItemId: number;
        quantity: number;
        productionStationId?: number | null
    }>;
};

type Props = {
    open: boolean;
    onClose: () => void;
    cartItems: CartItem[];
    onUpdateCartItemQuantity: (itemId: number, packetChoices: any[] | undefined, delta: number) => void;
    onClearCart: () => void;
    orderId: number;
    orderDetail: any;
    onShowReceipt?: (orderId: number) => void;
};

const EditOrderModal: React.FC<Props> = ({
    open,
    onClose,
    cartItems,
    onUpdateCartItemQuantity,
    onClearCart,
    orderId,
    orderDetail,
    onShowReceipt,
}) => {
    const t = useTranslations("Menu");

    // RTK Query hooks
    const [editOrder, { isLoading: isSubmitting }] = useEditOrderMutation();
    const { data: priceAdjRes } = useGetAllPriceAdjustmentsQuery({ limit: 100 }, { skip: !open });
    const priceAdjustments = priceAdjRes?.data ?? [];

    if (!open) return null;

    // Calculate Subtotal and Total
    const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

    let total = subtotal;
    priceAdjustments.forEach((adjustment) => {
        if (adjustment.type === "PERCENTAGE" && adjustment.percentage) {
            total += (subtotal * Number(adjustment.percentage)) / 100;
        } else if (adjustment.type === "FIXED_AMOUNT" && adjustment.fixedAmount) {
            total += Number(adjustment.fixedAmount);
        }
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (cartItems.length === 0) {
            toast.error(t("cartEmpty"));
            return;
        }

        const payload = {
            items: cartItems.map((item) => ({
                itemId: item.itemId,
                quantity: item.quantity,
                productionStationId: item.productionStationId || null,
                ...(item.packetChoices && item.packetChoices.length > 0
                    ? {
                          packetChoices: item.packetChoices.map((pc: any) => ({
                              section: pc.section,
                              choiceItemId: pc.choiceItemId,
                              quantity: pc.quantity,
                              ...(pc.productionStationId ? { productionStationId: Number(pc.productionStationId) } : {}),
                          })),
                      }
                    : {}),
            })),
        };

        try {
            toast.loading("Saving order adjustments...", { id: "edit-order-toast" });
            await editOrder({ orderId, data: payload }).unwrap();
            toast.success("Order edited successfully!", { id: "edit-order-toast" });
            onClearCart();
            onClose();
        } catch (err: any) {
            toast.error(err?.data?.message || err?.message || "Failed to edit order", {
                id: "edit-order-toast",
            });
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-[2px]">
            <div className="relative w-full max-w-lg rounded-[28px] bg-white p-6 shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
                {/* Modal Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4 shrink-0">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 leading-tight">
                            Edit Order {orderDetail?.slug ? `#${orderDetail.slug.toUpperCase()}` : `#${orderId}`}
                        </h3>
                        <p className="text-xs text-slate-550 mt-1 font-semibold">
                            Customer: <span className="text-blue-600 font-bold">{orderDetail?.customerName || "N/A"}</span>
                            {orderDetail?.table && (
                                <span>
                                    {" "}• Table: <span className="text-blue-600 font-bold">{orderDetail.table.tableNumber}</span>
                                </span>
                            )}
                            {orderDetail?.type && (
                                <span>
                                    {" "}• Type: <span className="text-blue-600 font-bold">{orderDetail.type}</span>
                                </span>
                            )}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => onShowReceipt?.(orderId)}
                            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors border border-slate-100 text-slate-500 hover:text-blue-600 cursor-pointer"
                            title="Download Receipt"
                        >
                            <Receipt size={18} />
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors border border-slate-100 text-slate-400 hover:text-slate-600"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Form Wrap */}
                <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
                    {/* Scrollable list of items */}
                    <div className="flex-1 overflow-y-auto space-y-5 px-1.5 py-1">
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
                                                                {choice.section}: {choice.choice || (choice as any).item?.name || (choice as any).choiceItem?.name || ""}
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
                        <div className="space-y-2 border-t border-slate-100 py-3 text-slate-600 text-sm font-medium">
                            <div className="flex justify-between">
                                <span>{t("subtotal")}</span>
                                <span className="text-slate-850 font-semibold">Rp{subtotal.toLocaleString("en-US")}</span>
                            </div>

                            {/* Dynamic Price Adjustments */}
                            {priceAdjustments.map((adj) => {
                                let adjAmount = 0;
                                let displayLabel = adj.level;
                                if (adj.type === "PERCENTAGE" && adj.percentage) {
                                    const pct = Number(adj.percentage);
                                    adjAmount = (subtotal * pct) / 100;
                                    displayLabel = `${adj.level} (${pct}%)`;
                                } else if (adj.type === "FIXED_AMOUNT" && adj.fixedAmount) {
                                    adjAmount = Number(adj.fixedAmount);
                                }
                                return (
                                    <div key={adj.id} className="flex justify-between text-slate-500 text-xs">
                                        <span>{displayLabel}</span>
                                        <span>Rp{adjAmount.toLocaleString("en-US")}</span>
                                    </div>
                                );
                            })}

                            <div className="flex justify-between items-end pt-1 border-t border-slate-100/50">
                                <span className="text-base font-bold text-slate-850">{t("total")}</span>
                                <span className="text-xl font-extrabold text-blue-600">
                                    Rp{total.toLocaleString("en-US")}
                                </span>
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
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || cartItems.length === 0}
                            className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                        >
                            <Save size={16} />
                            Save Adjustments
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditOrderModal;
