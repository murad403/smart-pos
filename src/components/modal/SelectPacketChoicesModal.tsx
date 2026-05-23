"use client";
import React, { useState, useEffect } from "react";
import { X, ShoppingBag, Minus, Plus, Check } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";

type Choice = {
  id: number;
  name: string;
  maxQty: number;
};

type PacketSection = {
  id: number;
  name: string;
  maxQty: number;
  choices: Choice[];
};

type Props = {
  open: boolean;
  onClose: () => void;
  item: {
    id: number;
    itemName: string;
    price: number;
    imageUrl?: string | null;
    packetSections?: PacketSection[];
  } | null;
  onConfirm: (choices: Array<{ section: string; choice: string; quantity: number }>) => void;
};

const SelectPacketChoicesModal: React.FC<Props> = ({ open, onClose, item, onConfirm }) => {
  const t = useTranslations("Menu");
  // Format: { [sectionName]: { [choiceName]: quantity } }
  const [selections, setSelections] = useState<Record<string, Record<string, number>>>({});

  useEffect(() => {
    if (open) {
      setSelections({});
    }
  }, [open]);

  if (!open) return null;

  if (!item) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-[2px]">
        <div className="relative w-full max-w-lg rounded-[28px] bg-white p-6 shadow-2xl border border-slate-100 flex flex-col max-h-[85vh]">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
            <div className="flex items-center gap-3 w-full">
              <div className="size-12 rounded-xl bg-slate-200 animate-pulse shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-5 bg-slate-200 rounded-md w-1/3 animate-pulse" />
                <div className="h-3 bg-slate-200 rounded-md w-1/2 animate-pulse" />
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-slate-100 border border-slate-100 text-slate-400"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body Skeleton */}
          <div className="flex-1 overflow-y-auto py-4 space-y-6">
            {[1, 2].map((i) => (
              <div key={i} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="h-4 bg-slate-200 rounded-md w-1/4 animate-pulse" />
                  <div className="h-3 bg-slate-200 rounded-md w-1/6 animate-pulse" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[1, 2, 3, 4].map((j) => (
                    <div
                      key={j}
                      className="h-14 rounded-xl border border-slate-100 bg-slate-50/50 animate-pulse"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer Skeleton */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between shrink-0">
            <div className="space-y-1.5">
              <div className="h-3 bg-slate-200 rounded-md w-16 animate-pulse" />
              <div className="h-6 bg-slate-200 rounded-md w-24 animate-pulse" />
            </div>
            <div className="flex gap-2">
              <div className="h-10 bg-slate-200 rounded-xl w-20 animate-pulse" />
              <div className="h-10 bg-slate-200 rounded-xl w-32 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const sections = item.packetSections || [];

  const getSectionDistinctSelectedCount = (sectionName: string) => {
    const sectionSelections = selections[sectionName] || {};
    return Object.values(sectionSelections).filter((qty) => qty > 0).length;
  };

  const getSectionTotalQty = (sectionName: string) => {
    const sectionSelections = selections[sectionName] || {};
    return Object.values(sectionSelections).reduce((sum, qty) => sum + qty, 0);
  };

  const handleSelectChoiceSingle = (sectionName: string, choiceName: string) => {
    setSelections((prev) => {
      const sectionSelections = prev[sectionName] || {};
      const currentQty = sectionSelections[choiceName] || 0;
      // Toggle selection for maxQty === 1
      return {
        ...prev,
        [sectionName]: {
          [choiceName]: currentQty === 1 ? 0 : 1,
        },
      };
    });
  };

  const handleAdjustQuantity = (
    sectionName: string,
    choice: Choice,
    delta: number,
    sectionMaxQty: number
  ) => {
    setSelections((prev) => {
      const sectionSelections = prev[sectionName] || {};
      const currentQty = sectionSelections[choice.name] || 0;
      const nextQty = Math.max(0, currentQty + delta);

      // Enforce choice-level maxQty limit
      const choiceMaxQty = Number(choice.maxQty || 0);
      if (nextQty > choiceMaxQty) {
        return prev;
      }

      // Enforce section distinct count limit when adding a new choice
      if (currentQty === 0 && nextQty > 0) {
        const distinctCount = Object.values(sectionSelections).filter((q) => q > 0).length;
        if (distinctCount >= Number(sectionMaxQty || 0)) {
          return prev;
        }
      }

      return {
        ...prev,
        [sectionName]: {
          ...sectionSelections,
          [choice.name]: nextQty,
        },
      };
    });
  };

  const isSectionValid = (section: PacketSection) => {
    const distinctCount = getSectionDistinctSelectedCount(section.name);
    return distinctCount >= 1 && distinctCount <= Number(section.maxQty || 0);
  };

  const isAllValid = sections.every(isSectionValid);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAllValid) return;

    const formattedChoices: Array<{ section: string; choice: string; quantity: number }> = [];

    Object.entries(selections).forEach(([sectionName, sectionChoices]) => {
      Object.entries(sectionChoices).forEach(([choiceName, qty]) => {
        if (qty > 0) {
          formattedChoices.push({
            section: sectionName,
            choice: choiceName,
            quantity: qty,
          });
        }
      });
    });

    onConfirm(formattedChoices);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-[2px]">
      <div className="relative w-full max-w-lg rounded-[28px] bg-white p-6 shadow-2xl border border-slate-100 flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative size-12 overflow-hidden rounded-xl border border-slate-100 bg-slate-100 shrink-0 flex items-center justify-center">
              {item.imageUrl ? (
                <Image
                  src={item.imageUrl}
                  alt={item.itemName}
                  fill
                  className="object-cover"
                />
              ) : (
                <ShoppingBag className="size-6 text-slate-300" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 leading-tight">{t("customizePacket")}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{item.itemName}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors border border-slate-100 text-slate-400 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form and Content */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto py-4 space-y-5 pr-1">
            {sections.map((section) => {
              const distinctSelected = getSectionDistinctSelectedCount(section.name);
              const isValid = isSectionValid(section);

              return (
                <div key={section.id} className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h4 className="text-[14px] font-bold text-slate-800 tracking-wide uppercase">
                        {section.name}
                      </h4>
                      <span className="text-[11px] font-medium text-slate-400">
                        ({t("chooseRange", { max: section.maxQty })})
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-semibold text-slate-500">
                        {t("selected")}: {distinctSelected}/{section.maxQty}
                      </span>
                      {isValid ? (
                        <div className="flex size-4.5 items-center justify-center rounded-full bg-green-100 text-green-600">
                          <Check size={10} strokeWidth={3} />
                        </div>
                      ) : (
                        <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                          {t("required")}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(section.choices || []).map((choice) => {
                      const qty = selections[section.name]?.[choice.name] || 0;
                      const isSelected = qty > 0;

                      // For single choice sections (maxQty === 1)
                      if (section.maxQty === 1) {
                        return (
                          <button
                            key={choice.id}
                            type="button"
                            onClick={() => handleSelectChoiceSingle(section.name, choice.name)}
                            className={`flex items-center justify-between p-3.5 rounded-xl border-2 text-left transition-all ${
                              isSelected
                                ? "border-blue-600 bg-blue-50/40 text-blue-900 shadow-sm"
                                : "border-slate-150 bg-white hover:border-slate-300 hover:bg-slate-50/55 text-slate-700"
                            }`}
                          >
                            <span className="text-sm font-semibold truncate pr-2">
                              {choice.name}
                            </span>
                            <div
                              className={`size-4.5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                                isSelected ? "border-blue-600 bg-blue-600" : "border-slate-350 bg-white"
                              }`}
                            >
                              {isSelected && <div className="size-2 rounded-full bg-white" />}
                            </div>
                          </button>
                        );
                      }

                      // For multi-choice sections (maxQty > 1)
                      const sectionMaxQty = Number(section.maxQty || 0);
                      const choiceMaxQty = Number(choice.maxQty || 0);
                      const distinctCount = getSectionDistinctSelectedCount(section.name);
                      const isDistinctLimitReached = distinctCount >= sectionMaxQty;
                      const isChoiceLimit = qty >= choiceMaxQty;

                      const handleCardClick = () => {
                        if (!isSelected && !isDistinctLimitReached && !isChoiceLimit) {
                          handleAdjustQuantity(section.name, choice, 1, sectionMaxQty);
                        }
                      };

                      return (
                        <div
                          key={choice.id}
                          onClick={handleCardClick}
                          className={`flex items-center justify-between p-3.5 rounded-xl border-2 transition-all ${
                            isSelected
                              ? "border-blue-600 bg-blue-50/40 text-blue-900 shadow-sm"
                              : isDistinctLimitReached
                              ? "border-slate-100 bg-slate-50/50 text-slate-400 cursor-not-allowed"
                              : "border-slate-150 bg-white hover:border-slate-300 hover:bg-slate-50/55 text-slate-700 cursor-pointer"
                          }`}
                        >
                          <span className="text-sm font-semibold truncate pr-2">{choice.name}</span>

                          {/* Controls / checkbox circle */}
                          {isSelected ? (
                            <div
                              className="flex items-center gap-2 bg-white rounded-lg p-0.5 border border-slate-105 shadow-sm"
                              onClick={(e) => e.stopPropagation()} // Prevent card toggle trigger
                            >
                              <button
                                type="button"
                                onClick={() =>
                                  handleAdjustQuantity(section.name, choice, -1, sectionMaxQty)
                                }
                                className="size-6 rounded-md bg-slate-100 flex items-center justify-center hover:bg-slate-200 text-slate-650 transition-colors disabled:opacity-40"
                                disabled={qty === 0}
                              >
                                <Minus size={12} />
                              </button>
                              <span className="text-xs font-bold text-slate-800 w-4 text-center">
                                {qty}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  handleAdjustQuantity(section.name, choice, 1, sectionMaxQty)
                                }
                                className="size-6 rounded-md bg-blue-600 flex items-center justify-center hover:bg-blue-700 text-white transition-colors disabled:opacity-40"
                                disabled={isChoiceLimit}
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                          ) : (
                            <div
                              className={`size-4.5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                                isDistinctLimitReached
                                  ? "border-slate-200 bg-slate-100"
                                  : "border-slate-305 bg-white hover:border-slate-400"
                              }`}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between shrink-0">
            <div className="leading-tight">
              <span className="text-xs text-slate-400 font-medium">{t("itemBasePrice")}</span>
              <p className="text-lg font-extrabold text-blue-600">
                Rp{item.price.toLocaleString("en-US")}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors"
              >
                {t("cancel")}
              </button>
              <button
                type="submit"
                disabled={!isAllValid}
                className="px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-md shadow-blue-500/10"
              >
                <ShoppingBag size={15} />
                {t("addToOrder")}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SelectPacketChoicesModal;
