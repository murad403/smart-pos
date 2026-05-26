"use client";

import React, { useState } from "react";
import Image from "next/image";
import item1 from "@/assets/images/menu1.jpg";
import item2 from "@/assets/images/menu2.png";
import { SquarePen, Trash2, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionLayoutType } from "@/redux/features/menu/menu.type";
import { useTranslations } from "next-intl";

import { useGetAllSectionDetailsByMenuIdQuery, useRemoveItemToSectionMutation } from "@/redux/features/menu/menu.api";
import { toast } from "sonner";

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
  originalItem?: any;
};

type Props = {
  sectionId: number;
  sectionNumber: number;
  sectionName: string;
  layout: SectionLayoutType;
  onAddItem: () => void;
  onEditSection: () => void;
  onDeleteSection: () => void;
  onEditItem?: (item: any) => void;
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
              className={`h-1 rounded-full transition-all duration-200 ${index === currentIndex ? "w-2.5 bg-blue-500" : "w-1 bg-[#E2E8F0]"
                }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const MenuCards = ({ sectionId, sectionNumber, sectionName, layout, onAddItem, onEditSection, onDeleteSection, onEditItem }: Props) => {
  const t = useTranslations("Menu");

  const { data: sectionDetailsRes, isLoading } = useGetAllSectionDetailsByMenuIdQuery(sectionId);
  const sectionDetails = sectionDetailsRes?.data;
  const sectionItems = sectionDetails?.sectionItems || [];

  const [removeItemToSection] = useRemoveItemToSectionMutation();

  const handleRemoveItem = async (itemId?: number) => {
    if (!itemId) return;
    try {
      toast.loading("Removing item from section...", { id: "remove-item-section" });
      await removeItemToSection({ sectionId, itemId }).unwrap();
      toast.success("Item removed from section successfully", { id: "remove-item-section" });
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Failed to remove item", { id: "remove-item-section" });
    }
  };

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
      badges: item?.labels || [],
      packetSections: item.packetSections || [],
      originalItem: item,
    };
  });
  // console.log(items[0]?.badges)

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
    SINGLE: "grid grid-cols-1 gap-4 lg:grid-cols-1",
    DOUBLE: "grid grid-cols-2 gap-4 lg:grid-cols-2",
    TRIPLE: "grid grid-cols-2 gap-4 lg:grid-cols-3",
    QUADRUPLE: "grid grid-cols-2 gap-4 lg:grid-cols-4",
    LIST_WITH_IMAGE: "space-y-4",
    LIST_NO_IMAGE: "space-y-4",
  }[layout] || "grid grid-cols-2 gap-4 lg:grid-cols-3";

  return (
    <section className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
      <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-start sm:justify-between sm:px-6">
        <div>
          <h2 className="text-[1.75rem] font-bold tracking-tight text-slate-950">
            {sectionName || t("untitledSection")} | {t("layoutType")}: {layoutLabel[layout]}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onEditSection}
            className="h-10 rounded-xl border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-700"
          >
            <SquarePen className="mr-2 size-4" />
            {t("editLayout")}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onDeleteSection}
            className="h-10 rounded-xl border-red-200 bg-red-50 px-4 text-sm font-semibold text-red-500 hover:bg-red-100 hover:text-red-600"
          >
            <Trash2 className="mr-2 size-4" />
            Delete Section
          </Button>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        {isLoading ? (
          layout === "LIST_NO_IMAGE" ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between rounded-xl border border-slate-150 bg-[#E2E8F0] p-4 animate-pulse">
                  <div className="h-5 bg-[#E2E8F0] rounded w-12" />
                  <div className="h-6 bg-[#E2E8F0] rounded w-1/3" />
                  <div className="h-5 bg-[#E2E8F0] rounded w-16" />
                  <div className="h-5 bg-[#E2E8F0] rounded w-20" />
                </div>
              ))}
            </div>
          ) : layout === "LIST_WITH_IMAGE" ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-3 sm:grid-cols-[280px_1fr] items-center animate-pulse">
                  <div className="h-40 w-full rounded-2xl bg-[#E2E8F0]" />
                  <div className="space-y-3 w-full py-1">
                    <div className="h-4 bg-[#E2E8F0] rounded w-1/5" />
                    <div className="h-6 bg-[#E2E8F0] rounded w-1/3" />
                    <div className="h-4 bg-[#E2E8F0] rounded w-2/3" />
                    <div className="mt-6 flex justify-between items-center">
                      <div className="h-5 bg-[#E2E8F0] rounded w-1/6" />
                      <div className="h-9 bg-[#E2E8F0] rounded w-1/6" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={gridColsClass}>
              {Array.from({ length: (layout === "SINGLE" ? 1 : layout === "DOUBLE" ? 2 : layout === "TRIPLE" ? 3 : layout === "QUADRUPLE" ? 4 : 1) }).map((_, i) => (
                <div key={i} className="flex flex-col h-full overflow-hidden rounded-2xl border border-slate-200 bg-[#E2E8F0] shadow-sm animate-pulse">
                  <div className={`relative bg-[#E2E8F0] w-full ${
                    layout === "SINGLE"
                      ? "h-64 md:h-96 lg:h-120"
                      : layout === "DOUBLE"
                        ? "h-44 sm:h-64 lg:h-96"
                        : layout === "TRIPLE"
                          ? "h-44 sm:h-52 lg:h-72"
                          : "h-44 sm:h-48 lg:h-60"
                  }`} />
                  <div className="flex-1 p-4 space-y-3">
                    <div className="h-4 bg-[#E2E8F0] rounded w-1/4" />
                    <div className="h-6 bg-[#E2E8F0] rounded w-1/2" />
                    <div className="h-4 bg-[#E2E8F0] rounded w-full" />
                    <div className="mt-6 flex justify-between items-center">
                      <div className="h-6 bg-[#E2E8F0] rounded w-1/4" />
                      <div className="h-9 bg-[#E2E8F0] rounded w-1/4" />
                    </div>
                  </div>
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
                  <th className="pb-4 pr-2 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item, idx) => (
                  <tr key={`${item.itemNumber}-${idx}`} className="group transition-colors hover:bg-slate-50/50">
                    <td className="py-4 pl-2 text-[15px] text-slate-600">
                      {item.itemNumber.split("-").pop()}
                    </td>
                    <td className="py-4 text-[15px] font-medium text-slate-900">
                      {item.itemName}
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
                    <td className="py-4 pr-2 text-right">
                      <div className="inline-flex gap-2 justify-end items-center">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => onEditItem?.(item.originalItem)}
                          className="h-8 w-8 p-0 rounded-lg border-blue-100 bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700 transition-colors"
                        >
                          <SquarePen className="size-3.5" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleRemoveItem(item.id)}
                          className="h-8 w-8 p-0 rounded-lg border-red-100 bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {/* Clickable placeholder row to add item in LIST_NO_IMAGE */}
                <tr className="group transition-colors hover:bg-slate-50/50 cursor-pointer font-medium" onClick={onAddItem}>
                  <td colSpan={6} className="py-4 text-center bg-[#E2E8F0]">
                    <div className="inline-flex items-center gap-2 text-[15px] font-semibold text-blue-500 group-hover:text-blue-600 transition-colors">
                      <Plus size={16} />
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <div className={isImageListLayout ? "space-y-3" : gridColsClass}>
            {items.map((item, index) => (
              <article
                key={`${item.itemNumber}-${index}`}
                className={
                  isImageListLayout
                    ? "grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-3 sm:grid-cols-[280px_1fr]"
                    : "flex flex-col h-full overflow-hidden rounded-2xl border border-slate-200 bg-white hover:shadow-sm transition-all duration-200"
                }
              >
                <div className={
                  isImageListLayout
                    ? "relative h-40 overflow-hidden rounded-2xl sm:h-full w-full"
                    : layout === "SINGLE"
                      ? "relative h-64 md:h-96 lg:h-120 overflow-hidden w-full"
                      : layout === "DOUBLE"
                        ? "relative h-44 sm:h-64 lg:h-96 w-full"
                        : layout === "TRIPLE"
                          ? "relative h-44 sm:h-52 lg:h-72 w-full"
                          : "relative h-44 sm:h-48 lg:h-60 w-full"
                }>
                  <Image
                    src={item.imageUrl || imageMap[item.imageType]}
                    alt={item.itemName}
                    fill
                    className="h-full w-full object-cover"
                    priority={index === 0}
                  />

                  <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                    {item.badges && item.badges.map((badge, badgeIndex) => (
                      <span key={badgeIndex} className="rounded-lg bg-white/92 px-3 py-1 text-[11px] font-semibold text-red-500 shadow-sm backdrop-blur">
                        {badge}
                      </span>
                    ))}
                  </div>

                  {item.promoPrice > 0 && (
                    <div className="absolute right-3 bottom-3 sm:top-3 sm:bottom-auto">
                      <span className="rounded-lg bg-green-600 px-3 py-1 text-[11px] font-bold text-white shadow-sm">
                        Promo: Rp{item.promoPrice.toLocaleString("en-US")}
                      </span>
                    </div>
                  )}
                </div>

                <div className={isImageListLayout ? "flex flex-col justify-between gap-5 py-1 sm:pr-2" : "flex-1 flex flex-col justify-between p-4"}>
                  <div className="space-y-3">
                    <p className="text-lg font-bold tracking-tight text-red-500">{item.itemNumber}</p>
                    <h3 className="text-[1.35rem] font-bold tracking-tight text-red-500">{item.itemName}</h3>
                    <div className="flex flex-col gap-0.5 text-xs text-slate-700 sm:grid sm:grid-cols-3 sm:gap-3 sm:text-sm">
                      <p className="text-slate-600">{t("inventory")}: {item.inventory}</p>
                      <p className="text-slate-600">{t("stock")}: {item.stock}</p>
                      <p className="font-medium text-slate-900 sm:text-right">{item.statusLabel}</p>
                    </div>
                    {item.packetSections && item.packetSections.length > 0 && (
                      <PacketSlider packetSections={item.packetSections} />
                    )}
                  </div>

                  <div className="mt-6 flex items-end justify-between gap-4">
                    <div className="text-sm text-slate-600">
                      <p className="text-slate-500">{t("price")}</p>
                      <p className="font-semibold text-slate-900">Rp{item.price.toLocaleString("en-US")}</p>
                    </div>
                    <div className="flex gap-2 items-center">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => onEditItem?.(item.originalItem)}
                        className="h-9 w-9 p-0 rounded-xl border-blue-100 bg-blue-50 hover:bg-blue-100 text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        <SquarePen className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleRemoveItem(item.id)}
                        className="h-9 w-9 p-0 rounded-xl border-red-100 bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </article>
            ))}

            {/* Clickable placeholders for empty slots in grid layouts (SINGLE, DOUBLE, TRIPLE, QUADRUPLE) */}
            {["SINGLE", "DOUBLE", "TRIPLE", "QUADRUPLE"].includes(layout) &&
              Array.from({
                length: Math.max(0, (layout === "SINGLE" ? 1 : layout === "DOUBLE" ? 2 : layout === "TRIPLE" ? 3 : layout === "QUADRUPLE" ? 4 : 0) - items.length),
              }).map((_, i) => (
                <div
                  key={`placeholder-${i}`}
                  className={`flex flex-col rounded-[22px] border border-blue-500 bg-white p-4 shadow-sm w-full h-full ${
                    layout === "SINGLE" ? "min-h-105 md:min-h-140 lg:min-h-170" :
                    layout === "DOUBLE" ? "min-h-85 sm:min-h-110 lg:min-h-142.5" :
                    layout === "TRIPLE" ? "min-h-85 sm:min-h-97.5 lg:min-h-117.5" :
                    "min-h-85 sm:min-h-92.5 lg:min-h-110"
                  }`}
                >
                  <button
                    type="button"
                    onClick={onAddItem}
                    className={`group relative w-full overflow-hidden rounded-[18px] bg-[#E2E8F0] hover:bg-[#D9E2EC] flex items-center justify-center transition-all duration-300 flex-1 ${
                      layout === "SINGLE" ? "min-h-64 md:min-h-96 lg:min-h-120" :
                      layout === "DOUBLE" ? "min-h-44 sm:min-h-64 lg:min-h-96" :
                      layout === "TRIPLE" ? "min-h-44 sm:min-h-52 lg:min-h-72" : "min-h-44 sm:min-h-48 lg:min-h-60"
                    }`}
                  >
                    <Plus size={36} className="text-white opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300" />
                  </button>
                </div>
              ))}

            {/* Clickable list view placeholder for LIST_WITH_IMAGE */}
            {isImageListLayout && (
              <button
                type="button"
                onClick={onAddItem}
                className="group w-full grid gap-4 rounded-2xl border border-dashed border-blue-400 bg-white hover:bg-slate-50 p-3 sm:grid-cols-[280px_1fr] items-center text-left transition-all duration-300"
              >
                <div className="relative h-40 rounded-xl bg-[#E2E8F0] group-hover:bg-[#D9E2EC] flex items-center justify-center transition-all duration-300">
                  <Plus size={36} className="text-white opacity-90 group-hover:scale-110 transition-all duration-300" />
                </div>
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default MenuCards;
