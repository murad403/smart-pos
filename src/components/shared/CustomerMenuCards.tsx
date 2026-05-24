"use client";

import React, { useState } from "react";
import Image from "next/image";
import item1 from "@/assets/images/menu1.jpg";
import item2 from "@/assets/images/menu2.png";
import { SectionLayoutType } from "@/redux/features/menu/menu.type";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight, Minus, Plus } from "lucide-react";

import { useGetAllSectionDetailsByMenuIdQuery } from "@/redux/features/menu/menu.api";

export type MenuItemCardData = {
  id?: number;
  itemNumber: string;
  itemName: string;
  price: number;
  inventory: number;
  stock: number;
  statusLabel: string;
  promoPrice: number;
  imageType: "menu1" | "menu2";
  imageUrl?: string | null;
  badges: [string, string];
  packetSections?: any[];
  maxPacketItems?: number | null;
};

type Props = {
  sectionId: number;
  sectionNumber: number;
  sectionName: string;
  layout: SectionLayoutType;
  onAddItem: (item: MenuItemCardData) => void;
  cartItems: any[];
  onUpdateCartItemQuantity?: (itemId: number, packetChoices: any[] | undefined, delta: number) => void;
};

const imageMap = {
  menu1: item1,
  menu2: item2,
};

const PacketSlider = ({ packetSections }: { packetSections: any[] }) => {
  const choices = packetSections.flatMap(section =>
    (section.choices || []).map((choice: any) => ({
      ...choice,
      sectionName: section.name
    }))
  );

  const [currentIndex, setCurrentIndex] = useState(0);

  if (choices.length === 0) return null;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? choices.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === choices.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="relative mt-3 rounded-xl border border-slate-100 bg-slate-50/50 p-2.5">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
        Packet Options
      </p>

      <div className="relative overflow-hidden h-12">
        <div
          className="flex transition-transform duration-300 ease-in-out h-full"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {choices.map((choice, index) => (
            <div key={choice.id || index} className="w-full shrink-0 flex flex-col justify-center px-6 text-center sm:text-left">
              <span className="text-[10px] font-bold text-blue-500 uppercase leading-none mb-0.5">
                {choice.sectionName}
              </span>
              <span className="text-sm font-semibold text-slate-800 truncate">
                {choice.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {choices.length > 1 && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-1 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-white border border-slate-100 shadow-sm text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <ChevronLeft size={14} />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-1 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-white border border-slate-100 shadow-sm text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <ChevronRight size={14} />
          </button>
        </>
      )}

      {/* Dots indicator */}
      {choices.length > 1 && (
        <div className="mt-1 flex justify-center gap-1">
          {choices.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(index);
              }}
              className={`h-1 rounded-full transition-all duration-200 ${index === currentIndex ? "w-2.5 bg-blue-500" : "w-1 bg-slate-200"
                }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const CustomerMenuCards = ({
  sectionId,
  sectionNumber,
  sectionName,
  layout,
  onAddItem,
  cartItems,
  onUpdateCartItemQuantity
}: Props) => {
  const t = useTranslations("Menu");

  const handleDecrement = (item: MenuItemCardData) => {
    const matchingItems = cartItems.filter(ci => ci.itemId === item.id);
    if (matchingItems.length === 0) return;
    const targetItem = matchingItems[matchingItems.length - 1];
    if (onUpdateCartItemQuantity) {
      onUpdateCartItemQuantity(targetItem.itemId, targetItem.packetChoices, -1);
    }
  };

  const handleIncrement = (item: MenuItemCardData) => {
    const matchingItems = cartItems.filter(ci => ci.itemId === item.id);
    if (matchingItems.length === 0) return;
    const targetItem = matchingItems[matchingItems.length - 1];
    if (onUpdateCartItemQuantity) {
      onUpdateCartItemQuantity(targetItem.itemId, targetItem.packetChoices, 1);
    }
  };

  const { data: sectionDetailsRes, isLoading } = useGetAllSectionDetailsByMenuIdQuery(sectionId);
  const sectionDetails = sectionDetailsRes?.data;
  const sectionItems = sectionDetails?.sectionItems || [];

  const items: MenuItemCardData[] = (sectionItems || []).map((sectionItem: any) => {
    const item = sectionItem.item || sectionItem;
    return {
      id: item.id,
      itemNumber: item.slug || `i-${item.id}`,
      itemName: item.name,
      price: Number(item.price || 0),
      inventory: item.inventoryQty || 0,
      stock: item.inventoryQty || 0,
      statusLabel: item.isOutOfStock ? "Out of Stock" : "In Stock",
      promoPrice: item.promoPrice ? Number(item.promoPrice) : 0,
      imageType: "menu1",
      imageUrl: item.imageUrl || null,
      badges: [item.labels?.[0] || "", item.labels?.[1] || ""],
      packetSections: item.packetSections || [],
      maxPacketItems: item.maxPacketItems || null,
    };
  });

  const layoutLabel: Record<SectionLayoutType, string> = {
    SINGLE: t("1-image") || "1 Large Image",
    DOUBLE: t("2-image") || "2 Images Side-by-Side",
    TRIPLE: t("3-image-row") || "3-Image Row",
    QUADRUPLE: "4-Image Row",
    LIST_WITH_IMAGE: t("images-list") || "Images List View",
    LIST_NO_IMAGE: t("no-image-list") || "No-Image List View",
  };

  const isNoImageLayout = layout === "LIST_NO_IMAGE";
  const isImageListLayout = layout === "LIST_WITH_IMAGE";

  const gridColsClass = {
    SINGLE: "grid gap-4 lg:grid-cols-1",
    DOUBLE: "grid gap-4 lg:grid-cols-2",
    TRIPLE: "grid gap-4 lg:grid-cols-3",
    QUADRUPLE: "grid gap-4 lg:grid-cols-4",
    LIST_WITH_IMAGE: "space-y-4",
    LIST_NO_IMAGE: "space-y-4",
  }[layout] || "grid gap-4 lg:grid-cols-3";

  return (
    <section className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
      <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-start sm:justify-between sm:px-6">
        <div>
          <h2 className="text-[1.75rem] font-bold tracking-tight text-slate-950">
            {sectionName || t("untitledSection")}
          </h2>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        {isLoading || items.length === 0 ? (
          layout === "LIST_NO_IMAGE" ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-center rounded-[18px] border border-blue-500 bg-white p-3">
                  <div className="h-16 w-full rounded-xl bg-[#E2E8F0]" />
                </div>
              ))}
            </div>
          ) : layout === "LIST_WITH_IMAGE" ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="grid gap-4 rounded-[18px] border border-blue-500 bg-white p-3 grid-cols-[280px_1fr] items-center">
                  <div className="h-24 w-full rounded-xl bg-[#E2E8F0]" />
                </div>
              ))}
            </div>
          ) : (
            <div className={gridColsClass}>
              {Array.from({ length: ({ SINGLE: 1, DOUBLE: 2, TRIPLE: 3, QUADRUPLE: 4 }[layout] || 1) }).map((_, i) => (
                <div key={i} className="flex flex-col gap-4 rounded-[22px] border border-blue-500 bg-white p-4 shadow-sm">
                  <div className="relative h-72 w-full overflow-hidden rounded-[18px] bg-[#E2E8F0]" />
                  {/* <div className="text-center text-sm font-semibold text-slate-500 pb-1">
                    1 Large Image
                  </div> */}
                </div>
              ))}
            </div>
          )
        ) : isNoImageLayout ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 text-sm font-semibold text-slate-500">
                  <th className="pb-4 pl-2 font-medium">{t("id")}</th>
                  <th className="pb-4 font-medium">{t("itemName")}</th>
                  <th className="pb-4 font-medium text-center">{t("stock")}</th>
                  <th className="pb-4 font-medium">{t("price")}</th>
                  <th className="pb-4 font-medium">{t("promoPrice")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item, idx) => {
                  const isSelected = cartItems.some(ci => ci.itemId === item.id);
                  const totalQty = cartItems.filter(ci => ci.itemId === item.id).reduce((acc, curr) => acc + curr.quantity, 0);

                  return (
                    <tr
                      key={`${item.itemNumber}-${idx}`}
                      onClick={() => onAddItem(item)}
                      className={`group transition-all duration-150 hover:bg-slate-50/70 cursor-pointer ${isSelected ? "bg-blue-50/30 text-blue-900 border-l-4 border-l-blue-600" : ""
                        }`}
                    >
                      <td className="py-4 pl-2 text-[15px] text-slate-600">
                        {item.itemNumber.split("-").pop()}
                      </td>
                      <td className="py-4 text-[15px] font-bold text-slate-900 flex items-center gap-2">
                        {item.itemName}
                        {isSelected && (
                          <span className="inline-flex size-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                            {totalQty}
                          </span>
                        )}
                      </td>
                      <td className="py-4 text-[15px] text-slate-600 text-center">
                        {item.inventory}
                      </td>
                      <td className="py-4 text-[15px] text-slate-600">
                        Rp{item.price.toLocaleString("en-US")}
                      </td>
                      <td className="py-4 text-[15px] text-slate-600">
                        {item.promoPrice ? `Rp${item.promoPrice.toLocaleString("en-US")}` : "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className={isImageListLayout ? "space-y-3" : gridColsClass}>
            {items.map((item, index) => {
              const isSelected = cartItems.some(ci => ci.itemId === item.id);
              const totalQty = cartItems.filter(ci => ci.itemId === item.id).reduce((acc, curr) => acc + curr.quantity, 0);

              return (
                <article
                  key={`${item.itemNumber}-${index}`}
                  onClick={() => onAddItem(item)}
                  className={
                    (isImageListLayout
                      ? "grid gap-4 rounded-2xl border bg-slate-50 p-3 sm:grid-cols-[280px_1fr] cursor-pointer transition-all duration-200"
                      : "overflow-hidden rounded-2xl border bg-white cursor-pointer transition-all duration-200") +
                    ` ${isSelected ? "border-blue-600 bg-blue-50/10 ring-1 ring-blue-600 shadow-md" : "border-slate-200 hover:border-slate-350 hover:shadow-sm"}`
                  }
                >
                  <div className={isImageListLayout ? "relative h-40 overflow-hidden rounded-2xl sm:h-full w-full" : "relative h-72 overflow-hidden w-full"}>
                    <Image
                      src={item.imageUrl || imageMap[item.imageType]}
                      alt={item.itemName}
                      fill
                      className="h-full w-full object-cover"
                      priority={index === 0}
                    />

                    <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                      <span className="rounded-lg bg-white/92 px-3 py-1 text-[11px] font-semibold text-red-500 shadow-sm backdrop-blur">
                        {item.badges[0]}
                      </span>
                      <span className="rounded-lg bg-[#16A34A] px-3 py-1 text-[11px] font-semibold text-white shadow-sm">
                        {item.badges[1]}
                      </span>
                    </div>


                  </div>

                  <div className={isImageListLayout ? "flex flex-col justify-between gap-5 py-1 sm:pr-2" : "flex flex-col justify-between p-4"}>
                    <div className="space-y-3">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{item.itemNumber}</p>
                      <h3 className="text-xl font-bold text-slate-900">{item.itemName}</h3>
                      <div className="grid grid-cols-3 gap-3 text-sm text-slate-700">
                        <p className="text-slate-600">{t("inventory")}: {item.inventory}</p>
                        <p className="text-slate-600">{t("stock")}: {item.stock}</p>
                        <p className="text-right font-medium text-slate-900">{item.statusLabel}</p>
                      </div>
                      {item.packetSections && item.packetSections.length > 0 && (
                        <PacketSlider packetSections={item.packetSections} />
                      )}
                    </div>

                    <div className="mt-6 flex items-end justify-between gap-4">
                      <div className="text-sm text-slate-600">
                        <p className="text-slate-550 text-xs">{item.promoPrice ? t("promoPrice") : t("price")}</p>
                        <p className="font-bold text-slate-900 text-lg">Rp{(item.promoPrice || item.price).toLocaleString("en-US")}</p>
                      </div>

                      {isSelected && (
                        <div 
                          className="flex items-center gap-2.5 bg-white border border-slate-150 rounded-xl p-1 shadow-sm shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => handleDecrement(item)}
                            className="size-7 rounded-lg bg-slate-100 flex items-center justify-center hover:bg-slate-200 text-slate-650 transition-colors cursor-pointer"
                          >
                            <Minus size={13} />
                          </button>
                          <span className="text-sm font-bold text-slate-800 w-4 text-center select-none">
                            {totalQty}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleIncrement(item)}
                            className="size-7 rounded-lg bg-blue-600 flex items-center justify-center hover:bg-blue-700 text-white transition-colors cursor-pointer"
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default CustomerMenuCards;
