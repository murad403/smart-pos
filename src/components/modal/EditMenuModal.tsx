/* eslint-disable react-hooks/incompatible-library */
"use client";
import React, { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { X, Upload, Minus, Plus } from "lucide-react";
import Image from "next/image";
import { MenuItemFormValues, menuItemSchema } from "@/validation/settings.validation";
import useLocalLanguage from "@/hooks/useLocalLanguage";

type Props = {
  open: boolean;
  onClose: () => void;
  onSave?: (data: MenuItemFormValues & { image?: File | null }) => void;
  initialData?: Partial<MenuItemFormValues> & { imageUrl?: string };
};

const LABEL_OPTIONS = [
  "Best Seller", "Recommended", "Favorite", "Must Try",
  "New", "Vegetarian", "Kids Choice", "Spicy",
];
const PRODUCTION_DESTINATIONS = ["Kitchen", "Bar", "Pastry", "Grill"];

const EditMenuModal: React.FC<Props> = ({ open, onClose, onSave, initialData }) => {
  const { t } = useLocalLanguage();
  const {
    register, handleSubmit, setValue, watch, reset,
    formState: { errors },
  } = useForm<MenuItemFormValues>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      itemName: "", price: 0, productionDestination: "Kitchen",
      inventory: "", promoName: "", promoPrice: 0,
      labels: [], outOfStock: false,
      maxItemsInPacket: undefined, choiceSections: undefined,
      sectionName: "", maxChoices: 0,
    },
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedLabels = watch("labels") || [];
  const outOfStock = watch("outOfStock") || false;
  const maxChoices = watch("maxChoices") || 0;

  useEffect(() => {
    if (initialData && open) {
      reset({
        itemName: initialData.itemName ?? "",
        price: initialData.price ?? 0,
        productionDestination: initialData.productionDestination ?? "Kitchen",
        inventory: initialData.inventory ?? "",
        promoName: initialData.promoName ?? "",
        promoPrice: initialData.promoPrice ?? 0,
        labels: initialData.labels ?? [],
        outOfStock: initialData.outOfStock ?? false,
        maxItemsInPacket: initialData.maxItemsInPacket,
        choiceSections: initialData.choiceSections,
        sectionName: initialData.sectionName ?? "",
        maxChoices: initialData.maxChoices ?? 0,
      });
      if (initialData.imageUrl) setImagePreview(initialData.imageUrl);
    }
  }, [initialData, open, reset]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setImageFile(file);
    if (file) setImagePreview(URL.createObjectURL(file));
    else setImagePreview(null);
  };

  const toggleLabel = (label: string) => {
    const current = selectedLabels;
    if (current.includes(label)) {
      setValue("labels", current.filter((l) => l !== label));
    } else {
      setValue("labels", [...current, label]);
    }
  };

  const onSubmit = (data: MenuItemFormValues) => {
    onSave?.({ ...data, image: imageFile });
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-125 max-h-[92vh] overflow-y-auto">
        <div className="p-6">

          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl font-bold text-gray-900">{t.editMenu}</h2>
            <button type="button" onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors">
              <X size={18} className="text-gray-500" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            {/* Item Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1.5">{t.itemName}</label>
              <input
                {...register("itemName")} placeholder={t.enterItemName}
                className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 placeholder:text-gray-400 ${errors.itemName ? "border-red-400" : "border-gray-200"}`}
              />
              {errors.itemName && <p className="text-red-500 text-xs mt-1">{errors.itemName.message}</p>}
            </div>

            {/* Price & Production Destination */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">{t.price}</label>
                <input type="number" {...register("price", { valueAsNumber: true })} placeholder="0"
                  className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 placeholder:text-gray-400 ${errors.price ? "border-red-400" : "border-gray-200"}`}
                />
                {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">{t.productionDestination}</label>
                <div className="relative">
                  <select {...register("productionDestination")}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-800 appearance-none cursor-pointer pr-8">
                    {PRODUCTION_DESTINATIONS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Inventory */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1.5">{t.inventoryOptional}</label>
              <input {...register("inventory")} placeholder={t.optional}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 placeholder:text-gray-400"
              />
            </div>

            {/* Upload Product Image */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1.5">{t.uploadProductImage}</label>
              <button type="button" onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors">
                <Upload size={16} className="text-gray-600" />
                <span className="text-sm font-medium text-gray-700">{t.upload}</span>
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              {imagePreview && (
                <div className="mt-2 relative w-full h-48 rounded-xl overflow-hidden">
                  <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                </div>
              )}
            </div>

            {/* Promotion */}
            <div className="border border-gray-200 rounded-xl p-4">
              <h3 className="text-base font-black text-gray-900 mb-4 tracking-wide uppercase">{t.promotion}</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1.5">{t.promoName}</label>
                  <input {...register("promoName")} placeholder="e.g., Summer Special"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 placeholder:text-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1.5">{t.promoPrice}</label>
                  <input type="number" {...register("promoPrice", { valueAsNumber: true })} placeholder="0"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 placeholder:text-gray-400"
                  />
                </div>
              </div>
            </div>

            {/* Label Selector */}
            <div>
              <h3 className="text-sm font-bold text-gray-800 mb-0.5">{t.labelSelector}</h3>
              <p className="text-xs text-gray-500 mb-2">{t.pickMultipleTags}</p>
              <input type="text" readOnly value={selectedLabels.join(", ") || ""} placeholder={t.labelName}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 placeholder:text-gray-400 mb-3 cursor-default"
              />
              <div className="flex flex-wrap gap-2">
                {LABEL_OPTIONS.map((label) => (
                  <button key={label} type="button" onClick={() => toggleLabel(label)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${selectedLabels.includes(label)
                      ? "bg-[#3366CC] text-white border-[#3366CC]"
                      : "bg-white text-gray-700 border-gray-300 hover:border-gray-400"
                      }`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Out of Stock Toggle */}
            <div className="flex items-center justify-between py-1">
              <span className="text-sm font-bold text-gray-800">{t.outOfStock}</span>
              <button type="button" onClick={() => setValue("outOfStock", !outOfStock)}
                className={`relative w-12 h-6 rounded-full transition-colors ${outOfStock ? "bg-[#3366CC]" : "bg-gray-300"}`}>
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${outOfStock ? "translate-x-6" : "translate-x-0"}`} />
              </button>
            </div>

            {/* ── Packet Configuration ── */}
            {/* ── Packet Configuration ── */}
            <div className="border border-gray-200 rounded-xl p-4">
              <h3 className="text-sm font-bold text-gray-900 mb-4">{t.packetConfiguration}</h3>

              <div className="grid grid-cols-2 gap-4">

                {/* Left column — labels only, input only at bottom */}
                <div className="flex flex-col justify-between gap-4">
                  <p className="text-xs font-semibold text-gray-700 leading-snug">
                    {t.maxItemsInPacket}
                  </p>
                  <p className="text-xs font-semibold text-gray-700 leading-snug">
                    {t.choiceSection}
                  </p>
                  <div>
                    <p className="text-xs font-semibold text-gray-700 mb-1.5">
                      {t.section1Name}
                    </p>
                    <input
                      {...register("sectionName")}
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                    />
                  </div>
                </div>

                {/* Right column — Section 1 Choices header, input, then Max # row */}
                <div className="flex flex-col gap-3">
                  {/* Gray header */}
                  <div className="bg-gray-100 rounded-lg px-3 py-2 text-center">
                    <span className="text-xs font-semibold text-gray-700">{t.section1Choices}</span>
                  </div>

                  {/* Input below header */}
                  <input
                    type="number"
                    {...register("choiceSections", { valueAsNumber: true })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  />

                  {/* Max # row — pushed to bottom */}
                  <div className="flex items-center gap-1.5 mt-auto">
                    <span className="text-xs font-semibold text-gray-700 whitespace-nowrap">{t.maxHash}</span>
                    <input
                      type="number" readOnly value={maxChoices}
                      className="w-12 border border-gray-200 rounded-lg px-2 py-2 text-sm text-center bg-gray-50"
                    />
                    <button type="button"
                      onClick={() => setValue("maxChoices", Math.max(0, maxChoices - 1))}
                      className="w-8 h-8 shrink-0 rounded-lg border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-100 transition-colors">
                      <Minus size={13} />
                    </button>
                    <button type="button"
                      onClick={() => setValue("maxChoices", maxChoices + 1)}
                      className="w-8 h-8 shrink-0 rounded-lg border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-100 transition-colors">
                      <Plus size={13} />
                    </button>
                  </div>
                </div>

              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button type="button" onClick={onClose}
                className="px-6 py-2.5 rounded-xl text-gray-700 font-semibold text-sm hover:bg-gray-100 transition-all">
                {t.cancel}
              </button>
              <button type="submit"
                className="px-6 py-2.5 rounded-xl bg-[#3366CC] text-white font-semibold text-sm hover:bg-[#2952a3] transition-all">
                {t.saveItem}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default EditMenuModal;