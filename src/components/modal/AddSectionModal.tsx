/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React from "react";
import { X } from "lucide-react";

export type SectionLayoutType =
  | "3-image-row"
  | "2-images-side-by-side"
  | "1-image"
  | "images-list"
  | "no-image-list";

export type SectionDraft = {
  sectionName: string;
  layout: SectionLayoutType;
  menuTab: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (section: SectionDraft) => void;
};

const layouts: Array<{
  id: SectionLayoutType;
  title: string;
  previewContent: React.ReactNode;
}> = [
  {
    id: "1-image",
    title: "1 Image",
    previewContent: <div className="h-20 rounded-lg bg-slate-200" />,
  },
  {
    id: "2-images-side-by-side",
    title: "2 Images Side-by-Side",
    previewContent: (
      <div className="grid grid-cols-2 gap-2">
        <div className="h-20 rounded-lg bg-slate-200" />
        <div className="h-20 rounded-lg bg-slate-200" />
      </div>
    ),
  },
  {
    id: "3-image-row",
    title: "3-Image Row",
    previewContent: (
      <div className="grid grid-cols-3 gap-2">
        <div className="h-20 rounded-lg bg-slate-200" />
        <div className="h-20 rounded-lg bg-slate-200" />
        <div className="h-20 rounded-lg bg-slate-200" />
      </div>
    ),
  },
  {
    id: "images-list",
    title: "Images List View",
    previewContent: (
      <div className="grid gap-2">
        <div className="h-8 rounded-md bg-slate-200" />
        <div className="h-8 rounded-md bg-slate-200" />
      </div>
    ),
  },
  {
    id: "no-image-list",
    title: "No-Image List View",
    previewContent: (
      <div className="space-y-2">
        <div className="h-2.5 rounded-full bg-slate-200" />
        <div className="h-2.5 rounded-full bg-slate-200" />
        <div className="h-2.5 rounded-full bg-slate-200" />
      </div>
    ),
  },
];

const AddSectionModal: React.FC<Props> = ({ open, onClose, onSave }) => {
  const [sectionName, setSectionName] = React.useState("");
  const [menuTab, setMenuTab] = React.useState("Main");
  const [layout, setLayout] = React.useState<SectionLayoutType>("3-image-row");

  React.useEffect(() => {
    if (!open) return;
    setSectionName("");
    setMenuTab("Main");
    setLayout("3-image-row");
  }, [open]);

  if (!open) return null;

  const handleSubmit = () => {
    onSave({
      sectionName: sectionName.trim() || "Untitled Section",
      layout,
      menuTab,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4 py-6 backdrop-blur-[2px]">
      <div className="relative w-full max-w-2xl rounded-[28px] bg-white p-6 shadow-[0_28px_90px_rgba(15,23,42,0.25)]">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        <div className="space-y-5">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-950">Add Section</h2>
            <p className="mt-1 text-sm text-slate-500">Choose a layout first, then define where the section should appear.</p>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-800">Section Name</label>
            <input
              value={sectionName}
              onChange={(event) => setSectionName(event.target.value)}
              placeholder="e.g. Special Combo, Noodles..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#3366CC] focus:ring-4 focus:ring-[#3366CC]/10"
            />
          </div>

          <div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">Category Layout</h3>
              <p className="text-xs text-slate-500">Max Sections per Category (up to 50)</p>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {layouts.map((item) => {
                const selected = layout === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setLayout(item.id)}
                    className={`rounded-2xl border p-2 text-left transition-all ${selected ? "border-[#3366CC] ring-4 ring-[#3366CC]/10" : "border-slate-200 hover:border-slate-300"}`}
                  >
                    <div className="min-h-32 rounded-xl bg-slate-50 p-2">
                      {item.previewContent}
                    </div>
                    <div className="mt-2 px-1 pb-1 text-center text-xs font-semibold text-slate-700">
                      {item.title}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-semibold text-slate-800">Menu tab</label>
            <div className="relative">
              <select
                value={menuTab}
                onChange={(event) => setMenuTab(event.target.value)}
                className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-[#3366CC] focus:ring-4 focus:ring-[#3366CC]/10"
              >
                <option>Main</option>
                <option>Starter</option>
                <option>Dessert</option>
                <option>Drinks</option>
              </select>
              <svg className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="rounded-xl bg-[#3366CC] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#3366CC]/20 transition hover:bg-[#2d5bb5]"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddSectionModal;
