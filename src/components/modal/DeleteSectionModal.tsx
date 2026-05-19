"use client";

import React from "react";
import { X, Trash2, Loader2 } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  sectionName: string;
  isLoading?: boolean;
};

const DeleteSectionModal: React.FC<Props> = ({ open, onClose, onConfirm, sectionName, isLoading }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-[2px]">
      <div className="relative w-full max-w-[420px] rounded-[24px] bg-white p-8 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-6 top-6 rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          disabled={isLoading}
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="mb-5 flex size-14 items-center justify-center rounded-full bg-red-50 text-red-500">
            <Trash2 size={28} />
          </div>

          <h3 className="mb-2 text-xl font-bold text-slate-900">Delete Section</h3>
          <p className="mb-8 text-sm text-slate-500 leading-relaxed">
            Are you sure you want to delete <span className="font-semibold text-slate-800">"{sectionName}"</span>? This action cannot be undone.
          </p>

          <div className="flex w-full items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-200 py-3 text-[15px] font-semibold text-slate-900 transition hover:bg-slate-50 disabled:opacity-50"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="flex-1 rounded-xl bg-red-600 py-3 text-[15px] font-semibold text-white shadow-lg shadow-red-500/25 transition hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-1.5"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="size-4 animate-spin" />}
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteSectionModal;
