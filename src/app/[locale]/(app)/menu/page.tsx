/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState } from "react";
import { SquarePen, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/routing";
import { useGetAllMenuQuery, useGetAllSectionByMenuIdQuery } from "@/redux/features/menu/menu.api";
import { useGetOrderDetailsQuery } from "@/redux/features/order/order.api";
import CustomerMenuCards from "@/components/shared/CustomerMenuCards";
import SelectPacketChoicesModal from "@/components/modal/SelectPacketChoicesModal";
import CreateOrderModal from "@/components/modal/CreateOrderModal";
import EditOrderModal from "@/components/modal/EditOrderModal";

const Page = ({ params }: { params?: Promise<{ locale: string }> }) => {
    if (params) React.use(params);
    const t = useTranslations("Menu");
    const searchParams = useSearchParams();
    const router = useRouter();
    const editOrderIdStr = searchParams.get("editOrderId");
    const editOrderId = editOrderIdStr ? parseInt(editOrderIdStr, 10) : null;

    // Fetch dynamic menus
    const { data: menuRes, isLoading: isMenusLoading } = useGetAllMenuQuery();
    const menus = menuRes?.data ?? [];

    const [selectedCategory, setSelectedCategory] = React.useState("");

    // Cart and Order States
    const [cartItems, setCartItems] = useState<any[]>([]);
    const [isCreateOrderModalOpen, setIsCreateOrderModalOpen] = useState(false);
    const [isPacketChoicesModalOpen, setIsPacketChoicesModalOpen] = useState(false);
    const [selectedPacketItem, setSelectedPacketItem] = useState<any>(null);

    // Fetch order details if we are editing an order
    const { data: orderDetailsRes } = useGetOrderDetailsQuery(editOrderId, {
        skip: !editOrderId,
    });

    // Pre-populate cart items when editing order details are fetched
    React.useEffect(() => {
        if (orderDetailsRes?.data) {
            const mapped = orderDetailsRes.data.orderItems.map((oi: any) => ({
                itemId: oi.itemId,
                itemName: oi.itemName,
                price: parseFloat(oi.promoPrice || oi.unitPrice || "0"),
                quantity: oi.quantity,
                imageUrl: oi.item?.imageUrl || null,
                packetChoices: oi.packetChoices || null,
            }));
            setCartItems(mapped);
        }
    }, [orderDetailsRes]);

    const handleAddItem = (item: any) => {
        if (item.packetSections && item.packetSections.length > 0) {
            setSelectedPacketItem(item);
            setIsPacketChoicesModalOpen(true);
        } else {
            setCartItems((prev) => {
                const existing = prev.find((ci) => ci.itemId === item.id && !ci.packetChoices);
                if (existing) {
                    return prev;
                }
                return [
                    ...prev,
                    {
                        itemId: item.id,
                        itemName: item.itemName,
                        price: item.promoPrice || item.price,
                        quantity: 1,
                        imageUrl: item.imageUrl,
                    },
                ];
            });
        }
    };

    const handleConfirmPacketChoices = (choices: any[]) => {
        if (!selectedPacketItem) return;
        setCartItems((prev) => {
            const sortedChoices = [...choices].sort((a, b) => a.section.localeCompare(b.section));
            const choiceKey = JSON.stringify(sortedChoices);
            const existing = prev.find(
                (ci) =>
                    ci.itemId === selectedPacketItem.id &&
                    ci.packetChoices &&
                    JSON.stringify([...ci.packetChoices].sort((a: any, b: any) => a.section.localeCompare(b.section))) === choiceKey
            );

            if (existing) {
                return prev;
            }

            return [
                ...prev,
                {
                    itemId: selectedPacketItem.id,
                    itemName: selectedPacketItem.itemName,
                    price: selectedPacketItem.promoPrice || selectedPacketItem.price,
                    quantity: 1,
                    imageUrl: selectedPacketItem.imageUrl,
                    packetChoices: sortedChoices,
                },
            ];
        });
        setIsPacketChoicesModalOpen(false);
        setSelectedPacketItem(null);
    };

    const handleUpdateCartItemQuantity = (itemId: number, packetChoices: any[] | undefined, delta: number) => {
        setCartItems((prev) => {
            const targetChoicesKey = packetChoices
                ? JSON.stringify([...packetChoices].sort((a, b) => a.section.localeCompare(b.section)))
                : undefined;

            return prev
                .map((ci) => {
                    const ciChoicesKey = ci.packetChoices
                        ? JSON.stringify([...ci.packetChoices].sort((a: any, b: any) => a.section.localeCompare(b.section)))
                        : undefined;

                    if (ci.itemId === itemId && ciChoicesKey === targetChoicesKey) {
                        return { ...ci, quantity: ci.quantity + delta };
                    }
                    return ci;
                })
                .filter((ci) => ci.quantity > 0);
        });
    };

    const handleClearCart = () => {
        setCartItems([]);
        if (editOrderId) {
            router.push("/pending-payments");
        }
    };
    // Find currently selected menu
    const currentMenu = React.useMemo(
        () => menus.find((m) => m.name === selectedCategory),
        [menus, selectedCategory]
    );
    const currentMenuId = currentMenu?.id;

    // Fetch sections by menuId
    const { data: sectionsRes, isLoading: isSectionsLoading, refetch: refetchSections } = useGetAllSectionByMenuIdQuery(
        currentMenuId as number,
        { skip: !currentMenuId }
    );
    const sections = sectionsRes?.data ?? [];
    const isLoadingSectionsData = isMenusLoading || isSectionsLoading || (menus.length > 0 && !currentMenuId);


    // Set default category name when menus load
    React.useEffect(() => {
        if (menus.length > 0 && !selectedCategory) {
            setSelectedCategory(menus[0].name);
        }
    }, [menus, selectedCategory]);



    return (
        <div className="space-y-4 md:space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{t("menuTab")}</h1>
                <p className="mt-1 text-slate-600 text-sm">Track stock levels and identify shortages</p>
            </div>

            {/* Control Bar */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap items-center gap-3">
                    {isMenusLoading ? (
                        <div className="flex items-center gap-2 py-1">
                            <Skeleton className="h-11 w-24 rounded-[14px]" />
                            <Skeleton className="h-11 w-24 rounded-[14px]" />
                            <Skeleton className="h-11 w-24 rounded-[14px]" />
                        </div>
                    ) : menus.length === 0 ? (
                        <div className="text-sm text-slate-400 py-2">No menus found. Please add a menu.</div>
                    ) : (
                        menus.map((menu) => (
                            <button
                                key={menu.id}
                                onClick={() => setSelectedCategory(menu.name)}
                                className={`rounded-[14px] px-6 py-2.5 text-[15px] font-medium transition-all ${selectedCategory === menu.name
                                        ? "border-2 border-blue-500 bg-white text-blue-600 shadow-sm"
                                        : "bg-[#F1F5F9] text-slate-500 hover:bg-slate-200"
                                    }`}
                            >
                                {menu.name}
                            </button>
                        ))
                    )}
                </div>
            </div>

            {isLoadingSectionsData ? (
                <div className="space-y-6">
                    {[1, 2].map((i) => (
                        <div key={i} className="overflow-hidden rounded-[26px] border border-slate-200 bg-white p-6 shadow-sm space-y-6">
                            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                                <div className="space-y-2">
                                    <Skeleton className="h-7 w-48" />
                                </div>
                            </div>
                            <div className="grid gap-4 lg:grid-cols-3">
                                {[1, 2, 3].map((j) => (
                                    <div key={j} className="flex flex-col gap-4 rounded-[22px] border border-blue-100 bg-white p-4 shadow-sm">
                                        <Skeleton className="h-72 w-full rounded-[18px]" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : sections.length === 0 ? (
                <div className="rounded-[28px] border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-[0_20px_60px_rgba(15,23,42,0.04)]">
                    <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-[#F3F7FF] text-[#1A56DB]">
                        <SquarePen className="size-8" />
                    </div>
                    <h2 className="mt-5 text-2xl font-semibold tracking-tight text-slate-950">
                        {t("noSectionsIn", { category: selectedCategory })}
                    </h2>
                    <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500">
                        {t("clickAddSection", { category: selectedCategory })}
                    </p>
                </div>
            ) : (
                <div className="space-y-5">
                    {sections.map((section, index) => (
                        <CustomerMenuCards
                            key={section.id}
                            sectionId={section.id}
                            sectionNumber={index + 1}
                            sectionName={section.name}
                            layout={section.layout}
                            onAddItem={handleAddItem}
                            cartItems={cartItems}
                            onUpdateCartItemQuantity={handleUpdateCartItemQuantity}
                        />
                    ))}
                </div>
            )}

            {/* Floating bottom bar for Cart preview */}
            {cartItems.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 md:left-[var(--sidebar-width,16rem)] bg-white border-t border-slate-205 px-6 py-4 flex justify-between items-center z-40 shadow-[0_-10px_35px_rgba(15,23,42,0.06)] animate-in slide-in-from-bottom duration-300 pb-safe">
                    <div className="flex items-center gap-3">
                        <span className="flex size-7 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-650">
                            {cartItems.reduce((acc, ci) => acc + ci.quantity, 0)}
                        </span>
                        <span className="text-slate-800 font-semibold text-sm md:text-base">
                            items selected
                        </span>
                        <span className="text-slate-400 font-medium text-xs md:text-sm shrink-0">
                            • Total: Rp{cartItems.reduce((acc, ci) => acc + ci.price * ci.quantity, 0).toLocaleString("en-US")}
                        </span>
                    </div>
                    <div className="flex gap-3">
                        <button 
                            onClick={handleClearCart}
                            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-all active:scale-95"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={() => setIsCreateOrderModalOpen(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 py-2.5 font-bold text-sm flex items-center gap-2 transition-all shadow-md shadow-blue-500/20 active:scale-95"
                        >
                            Next <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* Modals */}
            <SelectPacketChoicesModal
                open={isPacketChoicesModalOpen}
                onClose={() => {
                    setIsPacketChoicesModalOpen(false);
                    setSelectedPacketItem(null);
                }}
                item={selectedPacketItem}
                onConfirm={handleConfirmPacketChoices}
            />

            {editOrderId ? (
                <EditOrderModal
                    open={isCreateOrderModalOpen}
                    onClose={() => setIsCreateOrderModalOpen(false)}
                    cartItems={cartItems}
                    onUpdateCartItemQuantity={handleUpdateCartItemQuantity}
                    onClearCart={handleClearCart}
                    orderId={editOrderId}
                    orderDetail={orderDetailsRes?.data}
                />
            ) : (
                <CreateOrderModal
                    open={isCreateOrderModalOpen}
                    onClose={() => setIsCreateOrderModalOpen(false)}
                    cartItems={cartItems}
                    onUpdateCartItemQuantity={handleUpdateCartItemQuantity}
                    onClearCart={handleClearCart}
                />
            )}
        </div>
    );
};

export default Page;
