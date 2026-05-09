"use client";

import Image from "next/image";
import item1 from "@/assets/images/menu1.jpg";
import item2 from "@/assets/images/menu2.png";
import { Button } from "@/components/ui/button";
import { SectionLayoutType } from "@/components/modal/AddSectionModal";

export type MenuItemCardData = {
  itemNumber: string;
  itemName: string;
  price: number;
  inventory: number;
  stock: number;
  statusLabel: string;
  promoPrice: number;
  imageType: "menu1" | "menu2";
  badges: [string, string];
};

type Props = {
  sectionNumber: number;
  sectionName: string;
  layout: SectionLayoutType;
  items: MenuItemCardData[];
  onAddItem: () => void;
  onEditItem: (item: MenuItemCardData) => void;
};

const layoutLabel: Record<SectionLayoutType, string> = {
  "3-image-row": "3 Image Row",
  "2-images-side-by-side": "2 Image",
  "1-image": "1 Image",
  "images-list": "Image List",
  "no-image-list": "List View",
};

const imageMap = {
  menu1: item1,
  menu2: item2,
};

const MenuCards = ({ sectionNumber, sectionName, layout, items, onAddItem, onEditItem }: Props) => {
  const isListLayout = layout === "images-list" || layout === "no-image-list";

  return (
    <section className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.06)]">
      <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-start sm:justify-between sm:px-6">
        <div>
          <h2 className="text-[1.75rem] font-bold tracking-tight text-slate-950">
            Section {sectionNumber} | Layout Type: {layoutLabel[layout]}
          </h2>
          <p className="mt-1 text-sm text-slate-500">{sectionName || "Untitled section"}</p>
        </div>

        <div className="flex items-center gap-2">
          <Button type="button" onClick={onAddItem} className="h-9 rounded-2xl bg-[#3366CC] px-4 text-sm font-semibold text-white hover:bg-[#2d5bb5]">
            <span className="text-base leading-none">+</span>
            Add Item
          </Button>
          <Button type="button" variant="outline" className="h-9 rounded-2xl border-red-200 bg-red-50 px-4 text-sm font-semibold text-red-500 hover:bg-red-100 hover:text-red-600">
            Edit Layout
          </Button>
        </div>
      </div>

      <div className={isListLayout ? "space-y-3 px-5 py-5 sm:px-6" : "grid gap-3 px-5 py-5 sm:px-6 lg:grid-cols-3"}>
        {items.map((item, index) => (
          <article
            key={item.itemNumber}
            className={
              isListLayout
                ? "grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-3 sm:grid-cols-[160px_1fr]"
                : "overflow-hidden rounded-2xl border border-slate-200 bg-white"
            }
          >
            <div className={isListLayout ? "relative h-40 overflow-hidden rounded-2xl sm:h-full" : "relative h-72 overflow-hidden"}>
              <Image
                src={imageMap[item.imageType]}
                alt={item.itemName}
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

            <div className={isListLayout ? "flex flex-col justify-between gap-5 py-1 sm:pr-2" : "flex flex-col justify-between p-4"}>
              <div className="space-y-3">
                <p className="text-lg font-bold tracking-tight text-red-500">{item.itemNumber}</p>
                <h3 className="text-[1.35rem] font-bold tracking-tight text-red-500">{item.itemName}</h3>
                <div className="grid grid-cols-3 gap-3 text-sm text-slate-700">
                  <p className="text-slate-600">Inventory: {item.inventory}</p>
                  <p className="text-slate-600">Stock: {item.stock}</p>
                  <p className="text-right font-medium text-slate-900">{item.statusLabel}</p>
                </div>
              </div>

              <div className="mt-6 flex items-end justify-between gap-4">
                <div className="text-sm text-slate-600">
                  <p className="text-slate-500">Promo Price</p>
                  <p className="font-semibold text-slate-900">Rp{item.promoPrice.toLocaleString("en-US")}</p>
                </div>
                <Button type="button" onClick={() => onEditItem(item)} className="h-10 rounded-2xl bg-[#3B82F6] px-4 text-sm font-semibold text-white hover:bg-[#2f6fd3]">
                  + Edit
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default MenuCards;
