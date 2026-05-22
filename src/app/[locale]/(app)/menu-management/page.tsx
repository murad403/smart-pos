/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React from "react";
import { Plus, SquarePen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import AddMenuModal from "@/components/modal/AddMenuModal";
import AddSectionModal, { SectionDraft } from "@/components/modal/AddSectionModal";
import EditSectionModal from "@/components/modal/EditSectionModal";
import AddCategoryModal from "@/components/modal/AddCategoryModal";
import DeleteSectionModal from "@/components/modal/DeleteSectionModal";
import MenuCards from "../../../../components/shared/MenuCards";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useGetAllMenuQuery, useAddSectionMutation, useDeleteSectionMutation, useGetAllSectionByMenuIdQuery, useUpdateSectionMutation} from "@/redux/features/menu/menu.api";

const Page = ({ params }: { params?: Promise<{ locale: string }> }) => {
  if (params) React.use(params);
  const t = useTranslations("Menu");

  // Fetch dynamic menus
  const { data: menuRes, isLoading: isMenusLoading } = useGetAllMenuQuery();
  const menus = menuRes?.data ?? [];

  const [selectedCategory, setSelectedCategory] = React.useState("");
  const [isAddSectionOpen, setIsAddSectionOpen] = React.useState(false);
  const [isAddMenuOpen, setIsAddMenuOpen] = React.useState(false);
  const [isEditSectionOpen, setIsEditSectionOpen] = React.useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = React.useState(false);
  const [isDeleteSectionOpen, setIsDeleteSectionOpen] = React.useState(false);
  const [deletingSection, setDeletingSection] = React.useState<{ id: number; name: string } | null>(null);
  const [activeSectionId, setActiveSectionId] = React.useState<number | null>(null);
  const [editingSectionId, setEditingSectionId] = React.useState<number | null>(null);

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

  // Mutation for adding a section
  const [addSection] = useAddSectionMutation();
  const [deleteSection, { isLoading: isDeleting }] = useDeleteSectionMutation();
  const [updateSection] = useUpdateSectionMutation();

  const handleConfirmDeleteSection = async () => {
    if (!deletingSection) return;
    try {
      await deleteSection(deletingSection.id).unwrap();
      toast.success("Section deleted successfully");
      setIsDeleteSectionOpen(false);
      setDeletingSection(null);
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Failed to delete section");
    }
  };

  const handleUpdateSection = async (sectionId: number, draft: SectionDraft) => {
    const targetMenu = menus.find((m) => m.name === draft.menuTab);
    const targetMenuId = targetMenu?.id;

    if (!targetMenuId) {
      toast.error("Invalid menu selected");
      return;
    }
    try {
      await updateSection({
        sectionId,
        data: {
          name: draft.sectionName,
          layout: draft.layout,
          menuId: targetMenuId,
        },
      }).unwrap();
      toast.success("Section updated successfully");
      setIsEditSectionOpen(false);
      setSelectedCategory(draft.menuTab);
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Failed to update section");
    }
  };

  // Set default category name when menus load
  React.useEffect(() => {
    if (menus.length > 0 && !selectedCategory) {
      setSelectedCategory(menus[0].name);
    }
  }, [menus, selectedCategory]);

  const handleSaveSection = async (draft: SectionDraft) => {
    const targetMenu = menus.find((m) => m.name === draft.menuTab);
    const targetMenuId = targetMenu?.id;

    if (!targetMenuId) {
      toast.error("Invalid menu selected");
      return;
    }
    try {
      await addSection({
        name: draft.sectionName,
        layout: draft.layout,
        menuId: targetMenuId,
      }).unwrap();
      toast.success("Section added successfully");
      setSelectedCategory(draft.menuTab);
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Failed to add section");
    }
  };

  const handleOpenAddItem = (sectionId: number) => {
    setActiveSectionId(sectionId);
    setIsAddMenuOpen(true);
  };

  const handleSaveItem = () => {
    refetchSections();
    setIsAddMenuOpen(false);
  };

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
                className={`rounded-[14px] px-6 py-2.5 text-[15px] font-medium transition-all ${
                  selectedCategory === menu.name
                    ? "border-2 border-blue-500 bg-white text-blue-600 shadow-sm"
                    : "bg-[#F1F5F9] text-slate-500 hover:bg-slate-200"
                }`}
              >
                {menu.name}
              </button>
            ))
          )}
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
        </div>
      </div>

      {isLoadingSectionsData ? (
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <div key={i} className="overflow-hidden rounded-[26px] border border-slate-200 bg-white p-6 shadow-sm space-y-6">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div className="space-y-2">
                  <Skeleton className="h-7 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-10 w-28 rounded-xl" />
                  <Skeleton className="h-10 w-28 rounded-xl" />
                  <Skeleton className="h-10 w-28 rounded-xl" />
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
            <MenuCards
              key={section.id}
              sectionId={section.id}
              sectionNumber={index + 1}
              sectionName={section.name}
              layout={section.layout}
              onAddItem={() => handleOpenAddItem(section.id)}
              onEditSection={() => {
                setEditingSectionId(section.id);
                setIsEditSectionOpen(true);
              }}
              onDeleteSection={() => {
                setDeletingSection({ id: section.id, name: section.name });
                setIsDeleteSectionOpen(true);
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
        sectionId={activeSectionId}
      />

      <EditSectionModal
        open={isEditSectionOpen}
        onClose={() => setIsEditSectionOpen(false)}
        onSave={handleUpdateSection}
        sectionId={editingSectionId}
      />

      <AddCategoryModal
        open={isAddCategoryOpen}
        onClose={() => setIsAddCategoryOpen(false)}
        onSave={() => {
          setIsAddCategoryOpen(false);
        }}
      />

      <DeleteSectionModal
        open={isDeleteSectionOpen}
        onClose={() => {
          setIsDeleteSectionOpen(false);
          setDeletingSection(null);
        }}
        onConfirm={handleConfirmDeleteSection}
        sectionName={deletingSection?.name || ""}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default Page;
