"use client";

import React from "react";
import { Plus, SquarePen } from "lucide-react";
import { Button } from "@/components/ui/button";
import AddMenuModal from "@/components/modal/AddMenuModal";
import EditMenuModal from "@/components/modal/EditMenuModal";
import AddSectionModal, { SectionDraft, SectionLayoutType } from "@/components/modal/AddSectionModal";
import EditSectionModal from "@/components/modal/EditSectionModal";
import AddCategoryModal from "@/components/modal/AddCategoryModal";
import MenuCards, { MenuItemCardData } from "./MenuCards";
import { useTranslations } from "next-intl";

type SectionState = SectionDraft & {
  id: string;
  items: MenuItemCardData[];
};

const createItem = (sectionNumber: number, itemNumber: number, imageType: MenuItemCardData["imageType"], t: any): MenuItemCardData => ({
  itemNumber: `Item # ${String(sectionNumber).padStart(2, "0")}-${String(itemNumber).padStart(2, "0")}`,
  itemName: "Spicy Chicken Noodles",
  price: 15000,
  inventory: 15,
  stock: 0,
  statusLabel: t("onTheMenu"),
  promoPrice: 13500,
  imageType,
  badges: ["Promo 10% OFF", "MUST TRY"],
});

const getSeedItems = (layout: SectionLayoutType, sectionNumber: number, t: any) => {
  if (layout === "1-image") {
    return [createItem(sectionNumber, 1, "menu1", t)];
  }

  if (layout === "2-images-side-by-side") {
    return [createItem(sectionNumber, 1, "menu1", t), createItem(sectionNumber, 2, "menu2", t)];
  }

  if (layout === "images-list") {
    return [createItem(sectionNumber, 1, "menu2", t), createItem(sectionNumber, 2, "menu2", t)];
  }

  if (layout === "no-image-list") {
    return [
      createItem(sectionNumber, 1, "menu1", t),
      createItem(sectionNumber, 2, "menu2", t),
      createItem(sectionNumber, 3, "menu1", t),
    ];
  }

  return [
    createItem(sectionNumber, 1, "menu1", t),
    createItem(sectionNumber, 2, "menu1", t),
    createItem(sectionNumber, 3, "menu1", t),
  ];
};

const Page = ({ params }: { params?: Promise<{ locale: string }> }) => {
  if (params) React.use(params);
  const t = useTranslations("Menu");
  const [selectedCategory, setSelectedCategory] = React.useState("Starter");
  const [sections, setSections] = React.useState<SectionState[]>([]);
  const [isAddSectionOpen, setIsAddSectionOpen] = React.useState(false);
  const [isAddMenuOpen, setIsAddMenuOpen] = React.useState(false);
  const [isEditMenuOpen, setIsEditMenuOpen] = React.useState(false);
  const [isEditSectionOpen, setIsEditSectionOpen] = React.useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = React.useState(false);
  const [activeSectionId, setActiveSectionId] = React.useState<string | null>(null);
  const [editingSectionId, setEditingSectionId] = React.useState<string | null>(null);
  const [editingItem, setEditingItem] = React.useState<MenuItemCardData | null>(null);

  const activeSection = React.useMemo(
    () => sections.find((section) => section.id === activeSectionId) ?? null,
    [sections, activeSectionId],
  );

  const filteredSections = React.useMemo(
    () => sections.filter((section) => section.menuTab === selectedCategory),
    [sections, selectedCategory],
  );

  const editingSection = React.useMemo(
    () => sections.find((s) => s.id === editingSectionId) ?? null,
    [sections, editingSectionId],
  );

  const handleSaveSection = (draft: SectionDraft) => {
    const sectionNumber = sections.length + 1;
    setSections((current) => [
      ...current,
      {
        ...draft,
        id: `section-${sectionNumber}`,
        items: getSeedItems(draft.layout, sectionNumber, t),
      },
    ]);
    setSelectedCategory(draft.menuTab);
  };

  const handleUpdateSection = (draft: SectionDraft) => {
    setSections((current) => current.map((s) => (s.id === editingSectionId ? { ...s, ...draft } : s)));
    setSelectedCategory(draft.menuTab);
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
            createItem(sections.indexOf(section) + 1, nextIndex, nextIndex % 2 === 0 ? "menu2" : "menu1", t),
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

  const categories = [
    { id: "Starter", label: t("starter") },
    { id: "Main", label: t("main") },
    { id: "Dessert", label: t("dessert") },
    { id: "Drinks", label: t("drinks") },
  ];

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">{t("menuTab")}</h1>
        <p className="mt-1 text-slate-500">Track stock levels and identify shortages</p>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`rounded-[14px] px-6 py-2.5 text-[15px] font-medium transition-all ${
                selectedCategory === cat.id
                  ? "border-2 border-blue-500 bg-white text-blue-600 shadow-sm"
                  : "bg-[#F1F5F9] text-slate-500 hover:bg-slate-200"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="flex items-center flex-wrap gap-3">
          <Button
            type="button"
            onClick={() => setIsAddCategoryOpen(true)}
            className="h-11 rounded-[14px] border-2 border-blue-500 bg-[#F3F7FF] px-5 text-[15px] font-semibold text-blue-600 shadow-none hover:bg-blue-100"
          >
            <Plus className="mr-1.5 size-4" />
            {t("addCategory")}
          </Button>
          <Button
            type="button"
            onClick={() => setIsAddSectionOpen(true)}
            className="h-11 rounded-[14px] border-2 border-blue-500 bg-[#F3F7FF] px-5 text-[15px] font-semibold text-blue-600 shadow-none hover:bg-blue-100"
          >
            <Plus className="mr-1.5 size-4" />
            {t("addNewSection")}
          </Button>
          <Button
            type="button"
            className="h-11 rounded-[14px] bg-[#FF3B30] px-8 text-[15px] font-semibold text-white shadow-lg shadow-red-500/25 hover:bg-red-600"
          >
            {t("save")}
          </Button>
        </div>
      </div>

      {filteredSections.length === 0 ? (
        <div className="rounded-[28px] border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-[0_20px_60px_rgba(15,23,42,0.04)]">
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-[#F3F7FF] text-[#1A56DB]">
            <SquarePen className="size-8" />
          </div>
          <h2 className="mt-5 text-2xl font-semibold tracking-tight text-slate-950">
            {t("noSectionsIn", { category: categories.find((c: any) => c.id === selectedCategory)?.label || selectedCategory })}
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-slate-500">
            {t("clickAddSection", { category: categories.find((c: any) => c.id === selectedCategory)?.label || selectedCategory })}
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredSections.map((section) => (
            <MenuCards
              key={section.id}
              sectionNumber={sections.indexOf(section) + 1}
              sectionName={section.sectionName}
              layout={section.layout}
              items={section.items}
              onAddItem={() => handleOpenAddItem(section.id)}
              onEditItem={handleEditItem}
              onEditSection={() => {
                setEditingSectionId(section.id);
                setIsEditSectionOpen(true);
              }}
            />
          ))}
        </div>
      )}

      <AddSectionModal
        open={isAddSectionOpen}
        onClose={() => setIsAddSectionOpen(false)}
        onSave={handleSaveSection}
        defaultCategory={selectedCategory}
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

      <EditSectionModal
        open={isEditSectionOpen}
        onClose={() => setIsEditSectionOpen(false)}
        onSave={handleUpdateSection}
        initialData={editingSection ? {
          sectionName: editingSection.sectionName,
          layout: editingSection.layout,
          menuTab: editingSection.menuTab
        } : undefined}
      />

      <AddCategoryModal
        open={isAddCategoryOpen}
        onClose={() => setIsAddCategoryOpen(false)}
        onSave={(categories) => {
          console.log("Saving categories:", categories);
          setIsAddCategoryOpen(false);
        }}
      />
    </div>
  );
};

export default Page;
