"use client";

import React from "react";
import { X, Loader2 } from "lucide-react";
import { SectionDraft } from "./AddSectionModal";
import { useGetAllMenuQuery, useGetAllSectionDetailsByMenuIdQuery } from "@/redux/features/menu/menu.api";
import { SectionLayoutType } from "@/redux/features/menu/menu.type";
import { Skeleton } from "@/components/ui/skeleton";

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (sectionId: number, section: SectionDraft) => void;
  sectionId?: number | null;
};

const layouts: Array<{
  id: SectionLayoutType;
  title: string;
  previewContent: React.ReactNode;
}> = [
  {
    id: "SINGLE",
    title: "1 Large Image",
    previewContent: (
      <div className="flex aspect-square w-20 items-center justify-center rounded-lg bg-[#E2E8F0]" />
    ),
  },
  {
    id: "DOUBLE",
    title: "2 Images Side-by-Side",
    previewContent: (
      <div className="flex h-16 w-full items-center justify-center gap-1.5 px-2">
        <div className="h-full flex-1 rounded bg-[#E2E8F0]" />
        <div className="h-full flex-1 rounded bg-[#E2E8F0]" />
      </div>
    ),
  },
  {
    id: "TRIPLE",
    title: "3-Image Row",
    previewContent: (
      <div className="flex h-12 w-full items-center justify-center gap-1 px-1.5">
        <div className="h-full flex-1 rounded-sm bg-[#E2E8F0]" />
        <div className="h-full flex-1 rounded-sm bg-[#E2E8F0]" />
        <div className="h-full flex-1 rounded-sm bg-[#E2E8F0]" />
      </div>
    ),
  },
  {
    id: "LIST_WITH_IMAGE",
    title: "Images List View",
    previewContent: (
      <div className="flex w-full flex-col gap-2 px-2">
        {[1, 2].map((i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className="h-8 w-8 rounded bg-[#E2E8F0]" />
            <div className="flex-1 space-y-1">
              <div className="h-1.5 w-full rounded-full bg-[#E2E8F0]" />
              <div className="h-1.5 w-2/3 rounded-full bg-[#E2E8F0]" />
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: "LIST_NO_IMAGE",
    title: "No-Image List View",
    previewContent: (
      <div className="flex w-full flex-col gap-2 px-2">
        <div className="h-2 w-full rounded-full bg-[#E2E8F0]" />
        <div className="h-2 w-full rounded-full bg-[#E2E8F0]" />
        <div className="h-2 w-full rounded-full bg-[#E2E8F0]" />
      </div>
    ),
  },
];

const EditSectionModal: React.FC<Props> = ({ open, onClose, onSave, sectionId }) => {
  const [sectionName, setSectionName] = React.useState("");
  const [menuTab, setMenuTab] = React.useState("");
  const [layout, setLayout] = React.useState<SectionLayoutType>("SINGLE");

  const { data: menuRes, isLoading: isMenusLoading } = useGetAllMenuQuery(undefined, { skip: !open });
  const menus = menuRes?.data ?? [];

  const { data: sectionDetailsRes, isLoading: isDetailsLoading } = useGetAllSectionDetailsByMenuIdQuery(
    sectionId as number,
    { skip: !sectionId || !open }
  );

  React.useEffect(() => {
    if (!open) return;
    if (sectionDetailsRes?.data) {
      const details = sectionDetailsRes.data;
      setSectionName(details.name || "");
      setMenuTab(details.menu?.name || (menus[0]?.name ?? ""));
      setLayout(details.layout || "SINGLE");
    }
  }, [open, sectionDetailsRes, menus]);

  if (!open) return null;

  const handleSubmit = () => {
    if (!sectionId) return;
    onSave(sectionId, {
      sectionName: sectionName.trim() || "Untitled Section",
      layout,
      menuTab: menuTab || (menus[0]?.name ?? ""),
    });
    onClose();
  };

  const isLoading = isDetailsLoading || isMenusLoading;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-[2px]">
      <div className="relative w-full max-w-120 rounded-[24px] bg-white p-8 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-6 top-6 rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          disabled={isLoading}
        >
          <X size={20} />
        </button>

        <div className="mb-8">
          <h2 className="text-[28px] font-bold tracking-tight text-slate-900">Edit Section</h2>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            {/* Section Name Skeleton */}
            <div className="space-y-2.5">
              <Skeleton className="h-5 w-28 rounded bg-slate-200" />
              <Skeleton className="h-12 w-full rounded-[14px] bg-slate-100" />
            </div>

            {/* Layout Skeleton */}
            <div className="space-y-2.5">
              <Skeleton className="h-5 w-32 rounded bg-slate-200" />
              <Skeleton className="h-4 w-48 rounded bg-slate-200" />
              <div className="mt-5 grid grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-28 w-full rounded-2xl bg-slate-100" />
                ))}
              </div>
            </div>

            {/* Menu Tab Skeleton */}
            <div className="space-y-2.5">
              <Skeleton className="h-5 w-24 rounded bg-slate-200" />
              <Skeleton className="h-12 w-full rounded-[14px] bg-slate-100" />
            </div>

            {/* Buttons Skeleton */}
            <div className="flex items-center justify-end gap-3 pt-4">
              <Skeleton className="h-12 w-28 rounded-xl bg-slate-100" />
              <Skeleton className="h-12 w-36 rounded-xl bg-slate-100" />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-2.5">
              <label className="text-[17px] font-semibold text-slate-900">Section Name</label>
              <input
                value={sectionName}
                onChange={(e) => setSectionName(e.target.value)}
                placeholder="e.g, Special Combo, Noodles..."
                className="w-full rounded-[14px] bg-[#F1F5F9] px-4 py-3 text-[16px] text-slate-900 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            <div>
              <h3 className="text-[17px] font-semibold text-slate-900">Category Layout</h3>
              <p className="mt-1 text-[14px] text-slate-500">Max Sections per Category (up to 50)</p>

              <div className="mt-5 grid grid-cols-3 gap-3">
                {layouts.map((item) => {
                  const isSelected = layout === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setLayout(item.id)}
                      className={`group relative flex flex-col items-center rounded-2xl border-2 p-2 transition-all ${
                        isSelected ? "border-[#2563EB] bg-white shadow-sm" : "border-[#E2E8F0] bg-white hover:border-slate-300"
                      }`}
                    >
                      <div className="mb-3 flex aspect-4/5 w-full items-center justify-center rounded-xl bg-white">
                        {item.previewContent}
                      </div>
                      <span className="mb-1 text-center text-[12px] font-medium leading-tight text-slate-900">
                        {item.title}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2.5">
              <label className="text-[17px] font-semibold text-slate-900">Menu tab</label>
              <div className="relative">
                <select
                  value={menuTab}
                  onChange={(e) => setMenuTab(e.target.value)}
                  className="w-full appearance-none rounded-[14px] bg-[#F1F5F9] px-4 py-3 text-[16px] text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  {menus.map((m) => (
                    <option key={m.id} value={m.name}>
                      {m.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-200 px-7 py-3 text-[16px] font-semibold text-slate-900 transition hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="rounded-xl bg-[#2563EB] px-7 py-3 text-[16px] font-semibold text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-700"
              >
                Update Section
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditSectionModal;