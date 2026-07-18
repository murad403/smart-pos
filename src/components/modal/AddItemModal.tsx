/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useRef } from "react";
import { X, Upload, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useGetAllProductionStationQuery, useAddItemMutation, useAddPacketSectionMutation, useAddPacketSectionChoiceMutation, useAddItemToSectionMutation, useGetAllItemsQuery } from "@/redux/features/menu/menu.api";
import { toast } from "sonner";
import SearchableItemDropdown from "../shared/SearchableItemDropdown";



type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  sectionId?: number | null;
};

interface UISection {
  id: string;
  name: string;
  maxQty: number;
  productionStationId?: string;
  choices: Array<{ id: string; itemId: number | null; maxQty: number }>;
}





const AddItemModal: React.FC<Props> = ({ open, onClose, onSuccess, sectionId }) => {
  const t = useTranslations("Menu");

  // Fetch production stations with limit 100
  const { data: stationsRes, isLoading: isStationsLoading } = useGetAllProductionStationQuery({ limit: 100 });
  const stations = stationsRes?.data ?? [];

  // Fetch items for selection with limit 100
  const { data: itemsRes } = useGetAllItemsQuery({ limit: 100 });
  const itemsList = itemsRes?.data ?? [];

  // Mutations
  const [addItem, { isLoading: isAddingItem }] = useAddItemMutation();
  const [addPacketSection] = useAddPacketSectionMutation();
  const [addPacketSectionChoice] = useAddPacketSectionChoiceMutation();
  const [addItemToSection] = useAddItemToSectionMutation();

  // Basic Form States
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [itemType, setItemType] = useState<"INDIVIDUAL" | "PACKET">("INDIVIDUAL");
  const [price, setPrice] = useState<number | "">("");
  const [productionStationId, setProductionStationId] = useState<string>("");
  const [inventoryQty, setInventoryQty] = useState<number | "">("");
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [isVisible, setIsVisible] = useState(true);
  const [isOutOfStock, setIsOutOfStock] = useState(false);

  // Promotion States
  const [hasPromo, setHasPromo] = useState(false);
  const [promoName, setPromoName] = useState("");
  const [promoPrice, setPromoPrice] = useState<number | "">("");

  // Packet States
  const [sections, setSections] = useState<UISection[]>([]);

  // Image Upload States
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const LABEL_OPTIONS = [
    // { key: "NEW_MENU", label: t("newMenu") || "New Menu" },
    { key: "BEST_SELLER", label: t("bestSeller") || "Best Seller" },
    { key: "MUST_TRY", label: t("mustTry") || "Must Try" },
    { key: "PROMO", label: t("promo") || "Promo" },
    // { key: "CHEF_RECOMMENDATION", label: t("chefRecommendation") || "Chef Recommendation" },
    // { key: "MENU_FAVORITE", label: t("menuFavorite") || "Menu Favorite" },
    { key: "SPICY", label: t("spicy") || "Spicy" },
    { key: "VEGETARIAN", label: t("vegetarian") || "Vegetarian" },
    // { key: "SIGNATURE_MENU", label: t("signatureMenu") || "Signature Menu" },
    // { key: "KIDS_MENU", label: t("kidsMenu") || "Kids Menu" },
    // { key: "FAST_SERVE", label: t("fastServe") || "Fast Serve" }
  ];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setImageFile(file);
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(null);
    }
  };

  const toggleLabel = (labelKey: string) => {
    if (selectedLabels.includes(labelKey)) {
      setSelectedLabels([]);
    } else {
      setSelectedLabels([labelKey]);
    }
  };

  // Packet Builder Handlers
  const handleAddSection = () => {
    const newSection: UISection = {
      id: crypto.randomUUID(),
      name: "",
      maxQty: 1,
      productionStationId: "",
      choices: [{ id: crypto.randomUUID(), itemId: null, maxQty: 1 }],
    };
    setSections([...sections, newSection]);
  };

  const handleRemoveSection = (sectionId: string) => {
    setSections(sections.filter((s) => s.id !== sectionId));
  };

  const handleSectionChange = (sectionId: string, field: "name" | "maxQty" | "productionStationId", value: any) => {
    setSections(
      sections.map((s) => {
        if (s.id === sectionId) {
          return { ...s, [field]: value };
        }
        return s;
      })
    );
  };

  const handleAddChoice = (sectionId: string) => {
    setSections(
      sections.map((s) => {
        if (s.id === sectionId) {
          return {
            ...s,
            choices: [...s.choices, { id: crypto.randomUUID(), itemId: null, maxQty: 1 }],
          };
        }
        return s;
      })
    );
  };

  const handleRemoveChoice = (sectionId: string, choiceId: string) => {
    setSections(
      sections.map((s) => {
        if (s.id === sectionId) {
          return {
            ...s,
            choices: s.choices.filter((c) => c.id !== choiceId),
          };
        }
        return s;
      })
    );
  };

  const handleChoiceChange = (sectionId: string, choiceId: string, field: "itemId" | "maxQty", value: any) => {
    setSections(
      sections.map((s) => {
        if (s.id === sectionId) {
          return {
            ...s,
            choices: s.choices.map((c) => {
              if (c.id === choiceId) {
                return { ...c, [field]: value };
              }
              return c;
            }),
          };
        }
        return s;
      })
    );
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Item Name is required");
      return;
    }

    try {
      const payload: any = {
        name,
        itemType,
        price: price === "" ? 0 : Number(price),
        isVisible,
        isOutOfStock,
        hasPromo,
      };

      if (slug.trim()) {
        payload.slug = slug.trim();
      }
      if (itemType !== "PACKET" && productionStationId) {
        payload.productionStationId = Number(productionStationId);
      }
      if (inventoryQty !== "" && inventoryQty > 0) {
        payload.inventoryQty = Number(inventoryQty);
      }
      if (selectedLabels.length > 0) {
        payload.labels = selectedLabels;
      }
      if (hasPromo) {
        if (promoName.trim()) payload.promoName = promoName;
        if (promoPrice !== "" && promoPrice > 0) payload.promoPrice = Number(promoPrice);
      }


      // Create FormData
      const formData = new FormData();
      formData.append("data", JSON.stringify(payload));
      if (imageFile) {
        formData.append("image", imageFile);
      }

      toast.loading("Creating item...", { id: "add-item-toast" });

      const res = await addItem(formData).unwrap();
      const itemId = res?.data?.id;

      if (!itemId) {
        throw new Error("Item was created but no ID was returned.");
      }

      // If it's a PACKET, add packet sections and choices
      if (itemType === "PACKET" && sections.length > 0) {
        toast.loading("Configuring packet sections and choices...", { id: "add-item-toast" });
        for (const sec of sections) {
          if (!sec.name.trim()) continue;

          // Add packet section
          const sectionRes = await addPacketSection({
            itemId,
            data: {
              name: sec.name,
              maxQty: Number(sec.maxQty),
              ...(sec.productionStationId ? { productionStationId: Number(sec.productionStationId) } : {}),
            },
          }).unwrap();

          const sid = sectionRes?.data?.id;
          if (sid && sec.choices.length > 0) {
            for (const choice of sec.choices) {
              if (!choice.itemId) continue;
              await addPacketSectionChoice({
                sid,
                data: {
                  itemId: Number(choice.itemId),
                  maxQty: Number(choice.maxQty),
                },
              }).unwrap();
            }
          }
        }
      }

      if (sectionId) {
        toast.loading("Adding item to section...", { id: "add-item-toast" });
        await addItemToSection({
          sectionId,
          data: { itemId },
        }).unwrap();
      }

      toast.success("Item created successfully!", { id: "add-item-toast" });
      onSuccess?.();
      onClose();

      // Reset state
      setName("");
      setSlug("");
      setItemType("INDIVIDUAL");
      setPrice("");
      setProductionStationId("");
      setInventoryQty("");
      setSelectedLabels([]);
      setHasPromo(false);
      setPromoName("");
      setPromoPrice("");
      setSections([]);
      setImageFile(null);
      setImagePreview(null);
      setIsVisible(true);
      setIsOutOfStock(false);
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Failed to create item", { id: "add-item-toast" });
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-gray-100 transition-all scale-100">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Add New Product Item</h2>
              <p className="text-sm text-gray-500 mt-1">Configure item properties, pricing, and packaging details.</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors border border-gray-100"
            >
              <X size={18} className="text-gray-500" />
            </button>
          </div>

          <form onSubmit={handleSubmitForm} className="space-y-6">
            {/* General Settings Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-400 tracking-wide uppercase">General Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Item Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Item Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter item name (e.g. Grilled Salmon)"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 placeholder:text-gray-400"
                  />
                </div>

                {/* Item ID */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Item ID</label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="Enter Item ID (optional)"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 placeholder:text-gray-400"
                  />
                </div>

                {/* Item Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Item Type</label>
                  <div className="relative">
                    <select
                      value={itemType}
                      onChange={(e) => setItemType(e.target.value as any)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-800 appearance-none cursor-pointer pr-8"
                    >
                      <option value="INDIVIDUAL">Individual Item</option>
                      <option value="PACKET">Packet / Combo Meal</option>
                    </select>
                    <svg
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                      width="14"
                      height="14"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Price</label>
                  <input
                    type="number"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="0"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 placeholder:text-gray-400"
                  />
                </div>

                {/* Production Station */}
                {itemType !== "PACKET" && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Production Destination</label>
                    <div className="relative">
                      <select
                        value={productionStationId}
                        onChange={(e) => setProductionStationId(e.target.value)}
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-800 appearance-none cursor-pointer pr-8"
                      >
                        <option value="">Select Production Station...</option>
                        {isStationsLoading ? (
                          <option disabled>Loading stations...</option>
                        ) : (
                          stations.map((s: any) => (
                            <option key={s.id} value={s.id}>
                              {s.name}
                            </option>
                          ))
                        )}
                      </select>
                      <svg
                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                        width="14"
                        height="14"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </div>
                  </div>
                )}

                {/* Inventory Qty */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Inventory Quantity</label>
                  <input
                    type="number"
                    min="0"
                    value={inventoryQty}
                    onChange={(e) => setInventoryQty(e.target.value === "" ? "" : Number(e.target.value))}
                    placeholder="0 (leave empty if not tracked)"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 placeholder:text-gray-400"
                  />
                </div>
              </div>
            </div>

            {/* Upload Product Image */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700">Product Image</label>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-center gap-2 border border-gray-200 rounded-xl px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <Upload size={16} className="text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Choose Image File</span>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
                {imagePreview && (
                  <span className="text-xs text-green-600 font-medium">Image Selected</span>
                )}
              </div>
              {imagePreview && (
                <div className="relative w-full h-44 rounded-xl overflow-hidden border border-gray-100 mt-2">
                  <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                </div>
              )}
            </div>

            {/* Promotion Section */}
            <div className="border border-gray-200 rounded-xl p-4 bg-slate-50/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-800 tracking-wide uppercase">Promotion Campaign</h3>
                <button
                  type="button"
                  onClick={() => setHasPromo(!hasPromo)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${hasPromo ? "bg-blue-600" : "bg-gray-300"
                    }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${hasPromo ? "translate-x-6" : "translate-x-0"
                      }`}
                  />
                </button>
              </div>

              {hasPromo && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 transition-all">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Promotion Label / Name</label>
                    <input
                      type="text"
                      value={promoName}
                      onChange={(e) => setPromoName(e.target.value)}
                      placeholder="e.g. Weekend Special"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white placeholder:text-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Promo Special Price</label>
                    <input
                      type="number"
                      min="0"
                      value={promoPrice}
                      onChange={(e) => setPromoPrice(e.target.value === "" ? "" : Number(e.target.value))}
                      placeholder="0"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white placeholder:text-gray-400"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Label Selector */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-gray-800">Tag & Label Selectors</h3>
              <p className="text-xs text-gray-500">Tag this item for visibility badges in ordering apps.</p>
              <div className="flex flex-wrap gap-2 pt-1">
                {LABEL_OPTIONS.map((opt) => {
                  const isSelected = selectedLabels.includes(opt.key);
                  return (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => toggleLabel(opt.key)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${isSelected
                          ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/10 scale-95"
                          : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                        }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Status Toggles */}
            <div className="flex flex-wrap gap-6 pt-2 border-t border-gray-100">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsVisible(!isVisible)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${isVisible ? "bg-blue-600" : "bg-gray-300"
                    }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${isVisible ? "translate-x-6" : "translate-x-0"
                      }`}
                  />
                </button>
                <div>
                  <span className="text-sm font-semibold text-gray-800 block">Visible on Apps</span>
                  <span className="text-xs text-gray-500">Show this item in active menus</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsOutOfStock(!isOutOfStock)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${isOutOfStock ? "bg-red-500" : "bg-gray-300"
                    }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${isOutOfStock ? "translate-x-6" : "translate-x-0"
                      }`}
                  />
                </button>
                <div>
                  <span className="text-sm font-semibold text-gray-800 block">Out of Stock</span>
                  <span className="text-xs text-gray-500">Mark item as unavailable</span>
                </div>
              </div>
            </div>

            {/* Packet Configuration (Shown if Item Type is PACKET) */}
            {itemType === "PACKET" && (
              <div className="border border-blue-100 rounded-2xl p-5 bg-blue-50/20 space-y-6">
                <div className="flex items-center justify-between border-b border-blue-50 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-blue-900">Packet & Combo Configuration</h3>
                    <p className="text-xs text-blue-600 mt-0.5">
                      Define choice sections and customize options for this combo packet.
                    </p>
                  </div>
                </div>

                {/* Packet Sections */}
                <div className="space-y-4">
                  {sections.map((sec, sIdx) => (
                    <div key={sec.id} className="border border-blue-100 rounded-xl p-4 bg-white shadow-sm space-y-4">
                      {/* Section Header */}
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1 grid grid-cols-4 gap-3">
                          <div className="col-span-2">
                            <label className="text-xs font-semibold text-gray-500">Section Name (e.g. Choose Appetizer)</label>
                            <input
                              type="text"
                              value={sec.name}
                              onChange={(e) => handleSectionChange(sec.id, "name", e.target.value)}
                              placeholder="Appetizer, Drink, Side, etc."
                              className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-gray-500">Max Qty</label>
                            <input
                              type="number"
                              min="1"
                              value={sec.maxQty}
                              onChange={(e) => handleSectionChange(sec.id, "maxQty", Number(e.target.value))}
                              className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 text-center font-semibold"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-gray-500">Product Destination</label>
                            <div className="relative">
                              <select
                                value={sec.productionStationId || ""}
                                onChange={(e) => handleSectionChange(sec.id, "productionStationId", e.target.value)}
                                className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer text-gray-800 bg-white appearance-none pr-8"
                              >
                                <option value="">Select Destination...</option>
                                {stations.map((s: any) => (
                                  <option key={s.id} value={s.id}>
                                    {s.name}
                                  </option>
                                ))}
                              </select>
                              <svg
                                className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500"
                                width="12"
                                height="12"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                              >
                                <polyline points="6 9 12 15 18 9" />
                              </svg>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveSection(sec.id)}
                          className="mt-4 p-1.5 rounded-lg border border-red-100 hover:bg-red-50 text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      {/* Choice List */}
                      <div className="pl-6 border-l-2 border-slate-100 space-y-2">
                        <span className="text-xs font-bold text-gray-600 block mb-1">Choice Options</span>
                        {sec.choices.map((choice) => (
                          <div key={choice.id} className="flex items-center gap-2">
                            <SearchableItemDropdown
                              items={itemsList}
                              selectedId={choice.itemId}
                              onChange={(id) => handleChoiceChange(sec.id, choice.id, "itemId", id)}
                            />
                            <input
                              type="number"
                              min="1"
                              value={choice.maxQty}
                              onChange={(e) => handleChoiceChange(sec.id, choice.id, "maxQty", Number(e.target.value))}
                              className="w-16 border border-gray-200 rounded-lg px-2 py-1 text-sm text-center focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveChoice(sec.id, choice.id)}
                              className="p-1 rounded-md text-red-500 hover:bg-red-50"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={() => handleAddChoice(sec.id)}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 pt-1"
                        >
                          <Plus size={12} /> Add Choice Option
                        </button>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={handleAddSection}
                    className="w-full flex items-center justify-center gap-2 border border-dashed border-blue-300 rounded-xl py-3 hover:bg-blue-50/50 text-blue-600 transition-all font-semibold text-sm"
                  >
                    <Plus size={16} /> Add Packet Section
                  </button>
                </div>
              </div>
            )}

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl text-gray-700 font-semibold text-sm hover:bg-gray-100 transition-all border border-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isAddingItem}
                className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-all shadow-md shadow-blue-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAddingItem ? "Saving Item..." : "Save Product Item"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddItemModal;
