"use client";

import Image from "next/image";
import item1 from "@/assets/images/menu1.jpg";
import item2 from "@/assets/images/menu2.png";
import { SquarePen, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionLayoutType } from "@/redux/features/menu/menu.type";
import { useTranslations } from "next-intl";

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
};

type Props = {
  sectionId: number;
  sectionNumber: number;
  sectionName: string;
  layout: SectionLayoutType;
  onAddItem: () => void;
  onEditSection: () => void;
  onDeleteSection: () => void;
};

const imageMap = {
  menu1: item1,
  menu2: item2,
};

const MenuCards = ({ sectionId, sectionNumber, sectionName, layout, onAddItem, onEditSection, onDeleteSection }: Props) => {
  const t = useTranslations("Menu");

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
            {sectionName || t("untitledSection")} | {t("layoutType")}: {layoutLabel[layout]}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <Button type="button" onClick={onAddItem} className="h-10 rounded-xl bg-[#3B82F6] px-5 text-sm font-semibold text-white hover:bg-blue-600">
            <span className="mr-1 text-lg leading-none">+</span>
            {t("addItem")}
          </Button>
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
                <div key={i} className="grid gap-4 rounded-[18px] border border-blue-500 bg-white p-3 grid-cols-[160px_1fr] items-center">
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
                  <th className="pb-4 pr-2 font-medium">{t("promoPrice")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => (
                  <tr key={item.itemNumber} className="group transition-colors hover:bg-slate-50/50">
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
                    <td className="py-4 pr-2 text-[15px] text-slate-600">
                      {item.promoPrice ? `Rp${item.promoPrice.toLocaleString("en-US")}` : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className={isImageListLayout ? "space-y-3" : gridColsClass}>
            {items.map((item, index) => (
              <article
                key={item.itemNumber}
                className={
                  isImageListLayout
                    ? "grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-3 sm:grid-cols-[160px_1fr]"
                    : "overflow-hidden rounded-2xl border border-slate-200 bg-white"
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
                    <p className="text-lg font-bold tracking-tight text-red-500">{item.itemNumber}</p>
                    <h3 className="text-[1.35rem] font-bold tracking-tight text-red-500">{item.itemName}</h3>
                    <div className="grid grid-cols-3 gap-3 text-sm text-slate-700">
                      <p className="text-slate-600">{t("inventory")}: {item.inventory}</p>
                      <p className="text-slate-600">{t("stock")}: {item.stock}</p>
                      <p className="text-right font-medium text-slate-900">{item.statusLabel}</p>
                    </div>
                  </div>

                  <div className="mt-6 flex items-end justify-between gap-4">
                    <div className="text-sm text-slate-600">
                      <p className="text-slate-500">{t("promoPrice")}</p>
                      <p className="font-semibold text-slate-900">Rp{item.promoPrice.toLocaleString("en-US")}</p>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default MenuCards;
