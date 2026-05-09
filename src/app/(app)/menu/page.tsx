"use client";

import React from "react";
import { Plus, SquarePen } from "lucide-react";
import { Button } from "@/components/ui/button";
import AddMenuModal from "@/components/modal/AddMenuModal";
import EditMenuModal from "@/components/modal/EditMenuModal";
import AddSectionModal, { SectionDraft, SectionLayoutType } from "@/components/modal/AddSectionModal";
import MenuCards, { MenuItemCardData } from "./MenuCards";

type SectionState = SectionDraft & {
  id: string;
  items: MenuItemCardData[];
};

const createItem = (sectionNumber: number, itemNumber: number, imageType: MenuItemCardData["imageType"]): MenuItemCardData => ({
  itemNumber: `Item # ${String(sectionNumber).padStart(2, "0")}-${String(itemNumber).padStart(2, "0")}`,
  itemName: "Spicy Chicken Noodles",
  price: 15000,
  inventory: 15,
  stock: 0,
  statusLabel: "On the menu",
  promoPrice: 13500,
  imageType,
  badges: ["Promo 10% OFF", "MUST TRY"],
});

const getSeedItems = (layout: SectionLayoutType, sectionNumber: number) => {
  if (layout === "1-image") {
    return [createItem(sectionNumber, 1, "menu1")];
  }

  if (layout === "2-images-side-by-side") {
    return [createItem(sectionNumber, 1, "menu1"), createItem(sectionNumber, 2, "menu2")];
  }

  if (layout === "images-list") {
    return [createItem(sectionNumber, 1, "menu2"), createItem(sectionNumber, 2, "menu2")];
  }

  if (layout === "no-image-list") {
    return [
      createItem(sectionNumber, 1, "menu1"),
      createItem(sectionNumber, 2, "menu2"),
      createItem(sectionNumber, 3, "menu1"),
    ];
  }

  return [
    createItem(sectionNumber, 1, "menu1"),
    createItem(sectionNumber, 2, "menu1"),
    createItem(sectionNumber, 3, "menu1"),
  ];
};

const Page = () => {
  const [sections, setSections] = React.useState<SectionState[]>([]);
  const [isAddSectionOpen, setIsAddSectionOpen] = React.useState(false);
  const [isAddMenuOpen, setIsAddMenuOpen] = React.useState(false);
  const [isEditMenuOpen, setIsEditMenuOpen] = React.useState(false);
  const [activeSectionId, setActiveSectionId] = React.useState<string | null>(null);
  const [editingItem, setEditingItem] = React.useState<MenuItemCardData | null>(null);

  const activeSection = React.useMemo(
    () => sections.find((section) => section.id === activeSectionId) ?? null,
    [sections, activeSectionId],
  );

  const handleSaveSection = (draft: SectionDraft) => {
    const sectionNumber = sections.length + 1;
    setSections((current) => [
      ...current,
      {
        ...draft,
        id: `section-${sectionNumber}`,
        items: getSeedItems(draft.layout, sectionNumber),
      },
    ]);
  };

  const handleOpenAddItem = (sectionId: string) => {
    setActiveSectionId(sectionId);
    setIsAddMenuOpen(true);
  };

  const handleSaveItem = () => {
    if (!activeSection) {
      setIsAddMenuOpen(false);
      return;
    }

    setSections((current) =>
      current.map((section) => {
        if (section.id !== activeSection.id) {
          return section;
        }

        const nextIndex = section.items.length + 1;
        return {
          ...section,
          items: [
            ...section.items,
            createItem(sections.indexOf(section) + 1, nextIndex, nextIndex % 2 === 0 ? "menu2" : "menu1"),
          ],
        };
      }),
    );

    setIsAddMenuOpen(false);
  };

  const handleEditItem = (item: MenuItemCardData) => {
    setEditingItem(item);
    setIsEditMenuOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-slate-200 bg-white px-5 py-5 shadow-[0_20px_60px_rgba(15,23,42,0.06)] sm:px-6 sm:py-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.22em] text-slate-400">Menu</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              onClick={() => setIsAddSectionOpen(true)}
              className="h-10 rounded-2xl bg-[#F3F7FF] px-4 text-sm font-semibold text-[#1A56DB] shadow-none hover:bg-[#e7efff]"
            >
              <Plus className="size-4" />
              Add Section
            </Button>
            <Button
              type="button"
              disabled={!activeSection}
              onClick={() => activeSection && handleOpenAddItem(activeSection.id)}
              className="h-10 rounded-2xl bg-[#3366CC] px-4 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(51,102,204,0.24)] hover:bg-[#2e5cb8] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="size-4" />
              Add Item
            </Button>
          </div>
        </div>
      </div>

      {sections.length === 0 ? (
        <div className="rounded-[28px] border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-[0_20px_60px_rgba(15,23,42,0.04)]">
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-[#F3F7FF] text-[#1A56DB]">
            <SquarePen className="size-8" />
          </div>
          <h2 className="mt-5 text-2xl font-semibold tracking-tight text-slate-950">No sections yet</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500">
            Click Add Section to choose a layout. After that, section cards will appear here and each section can receive its own items.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {sections.map((section, index) => (
            <MenuCards
              key={section.id}
              sectionNumber={index + 1}
              sectionName={section.sectionName}
              layout={section.layout}
              items={section.items}
              onAddItem={() => handleOpenAddItem(section.id)}
              onEditItem={handleEditItem}
            />
          ))}
        </div>
      )}

      <AddSectionModal
        open={isAddSectionOpen}
        onClose={() => setIsAddSectionOpen(false)}
        onSave={handleSaveSection}
      />

      <AddMenuModal
        open={isAddMenuOpen}
        onClose={() => setIsAddMenuOpen(false)}
        onSave={handleSaveItem}
      />

      <EditMenuModal
        open={isEditMenuOpen}
        onClose={() => setIsEditMenuOpen(false)}
        onSave={() => setIsEditMenuOpen(false)}
        initialData={editingItem ? { itemName: editingItem.itemName, price: editingItem.price } : undefined}
      />
    </div>
  );
};

export default Page;
