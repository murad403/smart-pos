"use client";
import React, { useState, useEffect } from "react";
import { X, Plus, Check, Edit3, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useGetAllMenuQuery, useAddMenuMutation, useDeleteMenuMutation, useUpdateMenuMutation } from "@/redux/features/menu/menu.api";

type CategoryAccess = {
  qrTable: boolean;
  screen: boolean;
  service: boolean;
  admin: boolean;
};

type CategoryItem = {
  id: string;
  name: string;
  access: CategoryAccess;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSave?: (categories: CategoryItem[]) => void;
};

const AddCategoryModal: React.FC<Props> = ({ open, onClose, onSave }) => {
  // Menu API Hooks
  const { data: menuRes, isLoading: isMenusLoading } = useGetAllMenuQuery(undefined, { skip: !open });
  const [addMenu, { isLoading: isAdding }] = useAddMenuMutation();
  const [deleteMenu] = useDeleteMenuMutation();
  const [updateMenu] = useUpdateMenuMutation();

  const menus = menuRes?.data ?? [];

  // Form states
  const [newMenuName, setNewMenuName] = useState("");
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);
  const [editingMenuId, setEditingMenuId] = useState<number | null>(null);
  const [editingMenuName, setEditingMenuName] = useState("");

  const [categories, setCategories] = useState<CategoryItem[]>([
    { id: "1", name: "Category 1", access: { qrTable: true, screen: true, service: true, admin: true } },
    { id: "2", name: "Category 2", access: { qrTable: true, screen: true, service: true, admin: true } },
    { id: "3", name: "Category 3", access: { qrTable: true, screen: true, service: true, admin: true } },
    { id: "4", name: "Category 4", access: { qrTable: false, screen: false, service: false, admin: false } },
    { id: "5", name: "Category 5", access: { qrTable: false, screen: false, service: false, admin: false } },
  ]);

  // Set active menu to first item once fetched
  useEffect(() => {
    if (menus.length > 0 && activeMenuId === null) {
      setActiveMenuId(menus[0].id);
    }
  }, [menus, activeMenuId]);

  if (!open) return null;

  const handleAddMenu = async () => {
    if (!newMenuName.trim()) {
      toast.error("Please enter a menu name");
      return;
    }
    try {
      await addMenu({ name: newMenuName.trim() }).unwrap();
      setNewMenuName("");
      toast.success("Menu added successfully");
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Failed to add menu");
    }
  };

  const handleDeleteMenu = async (id: number) => {
    try {
      await deleteMenu(id).unwrap();
      toast.success("Menu deleted successfully");
      if (activeMenuId === id) {
        setActiveMenuId(null);
      }
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Failed to delete menu");
    }
  };

  const handleSaveEditMenu = async (id: number) => {
    if (!editingMenuName.trim()) {
      toast.error("Please enter a menu name");
      return;
    }
    try {
      await updateMenu({ menuId: id, data: { name: editingMenuName.trim() } }).unwrap();
      setEditingMenuId(null);
      toast.success("Menu updated successfully");
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Failed to update menu");
    }
  };

  const handleToggleAccess = (id: string, field: keyof CategoryAccess) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === id ? { ...cat, access: { ...cat.access, [field]: !cat.access[field] } } : cat
      )
    );
  };

  const handleUpdateName = (id: string, name: string) => {
    setCategories((prev) =>
      prev.map((cat) => (cat.id === id ? { ...cat, name } : cat))
    );
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: '1.4fr 0.8fr 1fr 1fr 1fr',
    gap: '12px',
    alignItems: 'center'
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4 backdrop-blur-[2px]">
      <div className="relative w-full max-w-[500px] rounded-[32px] bg-white p-7 shadow-2xl overflow-hidden font-sans">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-6 top-6 text-gray-400 hover:text-gray-600 transition-colors z-10"
        >
          <X size={22} strokeWidth={2.5} />
        </button>

        {/* Header */}
        <div className="mb-7 mt-1">
          <h2 className="text-[28px] font-bold text-gray-900 tracking-tight">Category Management</h2>
        </div>

        {/* Add Menu Section */}
        <div className="mb-6">
          <label className="block text-[16px] font-bold text-gray-900 mb-2.5">Add Menu</label>
          <div className="flex gap-3">
            <input
              type="text"
              value={newMenuName}
              onChange={(e) => setNewMenuName(e.target.value)}
              placeholder="Enter menu name..."
              disabled={isAdding}
              className="flex-1 rounded-[14px] bg-[#F1F5F9] px-4 py-3.5 text-[16px] text-gray-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <button
              type="button"
              onClick={handleAddMenu}
              disabled={isAdding}
              className="flex items-center gap-1.5 rounded-[12px] bg-[#3B82F6] px-6 py-3 text-[15px] font-bold text-white transition hover:bg-blue-600 active:scale-95 shadow-lg shadow-blue-500/20 disabled:opacity-50"
            >
              {isAdding ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} strokeWidth={3} />}
              Add
            </button>
          </div>
        </div>

        {/* Menu Tags */}
        <div className="flex flex-wrap gap-2.5 mb-8 max-h-[160px] overflow-y-auto pr-1">
          {isMenusLoading ? (
            <div className="text-sm text-slate-400 py-2 flex items-center gap-2">
              <Loader2 size={16} className="animate-spin" />
              Loading menus...
            </div>
          ) : menus.length === 0 ? (
            <div className="text-sm text-slate-400 py-2">No menus created yet.</div>
          ) : (
            menus.map((item) => {
              const isActive = activeMenuId === item.id;
              const isEditing = editingMenuId === item.id;

              if (isEditing) {
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-2 rounded-[16px] bg-[#F1F5F9] px-4 py-2.5 text-[16px]"
                  >
                    <input
                      type="text"
                      value={editingMenuName}
                      onChange={(e) => setEditingMenuName(e.target.value)}
                      className="bg-transparent border-b border-blue-500 outline-none w-28 text-slate-800 font-medium"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveEditMenu(item.id);
                        if (e.key === "Escape") setEditingMenuId(null);
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveEditMenu(item.id)}
                      className="text-emerald-600 hover:text-emerald-800 transition"
                    >
                      <Check size={16} strokeWidth={3} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingMenuId(null)}
                      className="text-rose-500 hover:text-rose-700 transition"
                    >
                      <X size={16} strokeWidth={3} />
                    </button>
                  </div>
                );
              }

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveMenuId(item.id)}
                  className={`flex items-center gap-2.5 rounded-[16px] px-5 py-2.5 text-[16px] font-medium transition-all ${isActive
                      ? "bg-[#3B82F6] text-white shadow-lg shadow-blue-500/30"
                      : "bg-[#F1F5F9] text-gray-400 hover:bg-gray-200"
                    }`}
                >
                  <span>{item.name}</span>
                  <div className="flex items-center gap-1.5 ml-1">
                    <Edit3
                      size={14}
                      className={`${isActive ? "text-white/80 hover:text-white" : "text-gray-400 hover:text-gray-600"
                        } cursor-pointer transition`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingMenuId(item.id);
                        setEditingMenuName(item.name);
                      }}
                    />
                    <X
                      size={14}
                      className={`${isActive ? "text-white/80 hover:text-white" : "text-gray-400 hover:text-gray-600"
                        } cursor-pointer transition`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteMenu(item.id);
                      }}
                    />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Settings Table Box */}
        <div className="mb-8 rounded-[28px] border border-gray-100 p-5 bg-white shadow-sm overflow-hidden">
          {/* Table Header */}
          <div style={gridStyle} className="mb-4 px-1">
            <span className="text-[14px] font-bold text-gray-900 leading-tight">Category<br />Naming</span>
            <span className="text-center text-[14px] font-bold text-gray-900 leading-[1.1]">QR<br />Table</span>
            <span className="text-center text-[14px] font-bold text-gray-900">Screen</span>
            <span className="text-center text-[14px] font-bold text-gray-900">Service</span>
            <span className="text-center text-[14px] font-bold text-gray-900">Admin</span>
          </div>

          {/* Table Rows */}
          <div className="space-y-4 max-h-[250px] overflow-y-auto pr-1 custom-scrollbar">
            {categories.map((cat) => (
              <div
                key={cat.id}
                style={gridStyle}
                className={`pt-4 border-t border-gray-50 first:border-0 first:pt-0 px-1`}
              >
                <div className="relative group">
                  <input
                    value={cat.name}
                    onChange={(e) => handleUpdateName(cat.id, e.target.value)}
                    className="w-full rounded-[12px] bg-[#F1F5F9] px-4 py-3 text-[14px] text-gray-700 font-medium outline-none border-2 border-transparent focus:border-blue-200 focus:bg-blue-50/30 transition-all"
                    placeholder="Category Name"
                  />
                </div>
                <div className="flex justify-center items-center">
                  <ImageCheckbox
                    checked={cat.access.qrTable}
                    onChange={() => handleToggleAccess(cat.id, 'qrTable')}
                  />
                </div>
                <div className="flex justify-center items-center">
                  <ImageCheckbox
                    checked={cat.access.screen}
                    onChange={() => handleToggleAccess(cat.id, 'screen')}
                  />
                </div>
                <div className="flex justify-center items-center">
                  <ImageCheckbox
                    checked={cat.access.service}
                    onChange={() => handleToggleAccess(cat.id, 'service')}
                  />
                </div>
                <div className="flex justify-center items-center">
                  <ImageCheckbox
                    checked={cat.access.admin}
                    onChange={() => handleToggleAccess(cat.id, 'admin')}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-[14px] border border-gray-200 px-7 py-3 text-[16px] font-bold text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onSave?.(categories);
              onClose();
            }}
            className="rounded-[14px] bg-[#2563EB] px-8 py-3 text-[16px] font-bold text-white transition hover:bg-blue-700 shadow-lg shadow-blue-500/30 active:scale-95"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

const ImageCheckbox = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
  <button
    type="button"
    onClick={onChange}
    className={`flex h-6 w-6 items-center justify-center rounded-[6px] border-2 transition-all duration-200 shrink-0 ${checked
        ? "border-[#3B82F6] bg-[#3B82F6] text-white"
        : "border-gray-100 bg-[#F1F5F9] hover:border-gray-200"
      }`}
  >
    {checked && <Check size={14} strokeWidth={4} />}
  </button>
);

export default AddCategoryModal;