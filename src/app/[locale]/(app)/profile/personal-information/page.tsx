"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useGetUserByIdQuery, useUpdateUserMutation } from "@/redux/features/dashboard/dashboard.api";
import { getUserData, saveUserData } from "@/utils/auth";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetAllPriceAdjustmentsQuery, useCreatePriceAdjustmentMutation, useUpdatePriceAdjustmentMutation, useDeletePriceAdjustmentMutation } from "@/redux/features/price/price.api";
import CustomPagination from "@/components/shared/CustomPagination";
import { Plus, Edit, Trash2, Loader2, X, AlertTriangle } from "lucide-react";
import BusinessInfo from "./BusinessInfo";

const profileSchema = (t: any) => z.object({
  businessName: z.string().min(1, t("nameRequired")),
  address: z.string().min(1, t("addressRequired")),
  contactNumber: z.string().min(1, t("contactRequired")),
  email: z.string().email(t("invalidEmail")),
  facebook: z.string().optional(),
  instagram: z.string().optional(),
  enableInventoryReport: z.boolean(),
  adminOnlyPaymentProof: z.boolean(),
});

type ProfileFormValues = z.infer<ReturnType<typeof profileSchema>>;



const ProfileInformationPage = ({ params }: { params?: Promise<{ locale: string }> }) => {
  if (params) React.use(params);
  const t = useTranslations("Profile");
  const tv = useTranslations("Validation");

  const [userId, setUserId] = React.useState<number | null>(null);

  React.useEffect(() => {
    const userData = getUserData();
    if (userData?.id) {
      setUserId(userData.id);
    }
  }, []);

  const { data: userRes, isLoading: isUserLoading } = useGetUserByIdQuery(userId as number, {
    skip: !userId,
  });
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const user = userRes?.data;

  // Pricing translations
  const tp = useTranslations("Pricing");

  // Pricing Adjustments pagination state
  const [pricePage, setPricePage] = useState(1);
  const priceLimit = 5;

  // Pricing Adjustments API queries & mutations
  const { data: priceAdjRes, refetch: refetchPriceAdj, isLoading: isPriceAdjLoading } = useGetAllPriceAdjustmentsQuery({
    page: pricePage,
    limit: priceLimit,
  });

  const [createPriceAdj, { isLoading: isCreatingPrice }] = useCreatePriceAdjustmentMutation();
  const [updatePriceAdj, { isLoading: isUpdatingPrice }] = useUpdatePriceAdjustmentMutation();
  const [deletePriceAdj, { isLoading: isDeletingPrice }] = useDeletePriceAdjustmentMutation();

  const pricingData = priceAdjRes?.data ?? [];
  const pricingPagination = priceAdjRes?.pagination;
  const pricingTotalPages = pricingPagination?.totalPages ?? 1;

  // Modal States
  const [isAdjModalOpen, setIsAdjModalOpen] = useState(false);
  const [editingAdj, setEditingAdj] = useState<any>(null); // if null, we are adding
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingAdjId, setDeletingAdjId] = useState<number | null>(null);

  // Form states for Add/Edit Modal
  const [adjLevel, setAdjLevel] = useState("");
  const [adjType, setAdjType] = useState<"PERCENTAGE" | "FIXED_AMOUNT">("PERCENTAGE");
  const [adjValue, setAdjValue] = useState("");

  const handleOpenEditModal = (item: any) => {
    setEditingAdj(item);
    setAdjLevel(item.level);
    setAdjType(item.type);
    setAdjValue(item.type === "PERCENTAGE" ? String(item.percentage) : String(item.fixedAmount));
    setIsAdjModalOpen(true);
  };

  const handleOpenAddModal = () => {
    setEditingAdj(null);
    setAdjLevel("");
    setAdjType("PERCENTAGE");
    setAdjValue("");
    setIsAdjModalOpen(true);
  };

  const handleOpenDeleteModal = (id: number) => {
    setDeletingAdjId(id);
    setIsDeleteModalOpen(true);
  };

  const handleSaveAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!adjValue.trim() || Number(adjValue) === 0) {
      toast.error(tp("valueMin") || "Value must not be 0");
      return;
    }

    const payload: any = {
      level: adjLevel,
      type: adjType,
    };

    if (adjType === "PERCENTAGE") {
      payload.percentage = Number(adjValue);
      payload.fixedAmount = null;
    } else {
      payload.fixedAmount = Number(adjValue);
      payload.percentage = null;
    }

    try {
      if (editingAdj) {
        await updatePriceAdj({ id: editingAdj.id, data: payload }).unwrap();
        toast.success(tp("successUpdate") || "Pricing adjustment updated successfully");
      } else {
        await createPriceAdj(payload).unwrap();
        toast.success(tp("successCreate") || "Pricing adjustment created successfully");
      }
      setIsAdjModalOpen(false);
      refetchPriceAdj();
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Operation failed");
    }
  };

  const handleDeleteAdjustment = async () => {
    if (!deletingAdjId) return;

    try {
      await deletePriceAdj({ id: deletingAdjId }).unwrap();
      toast.success(tp("successDelete") || "Pricing adjustment deleted successfully");
      setIsDeleteModalOpen(false);
      setDeletingAdjId(null);
      refetchPriceAdj();
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Delete failed");
    }
  };

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema(tv)),
    defaultValues: {
      businessName: "",
      address: "",
      contactNumber: "",
      email: "",
      facebook: "",
      instagram: "",
      enableInventoryReport: true,
      adminOnlyPaymentProof: false,
    },
  });

  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const [photoFile, setPhotoFile] = React.useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (user) {
      setValue("businessName", user.name || "");
      setValue("address", user.address || "");
      setValue("contactNumber", user.phone || "");
      setValue("email", user.email || "");
      setValue("facebook", user.facebookUrl || "");
      setValue("instagram", user.instagramUrl || "");
      if (user.photoUrl) {
        setImagePreview(user.photoUrl);
      }
    }
  }, [user, setValue]);

  const onSubmit = async (data: ProfileFormValues) => {
    if (!userId) return;

    try {
      const payload: any = {
        name: data.businessName,
        phone: data.contactNumber,
        address: data.address,
        facebookUrl: data.facebook || undefined,
        instagramUrl: data.instagram || undefined,
      };

      if (!imagePreview) {
        payload.photoUrl = "";
      }

      const formData = new FormData();
      formData.append("data", JSON.stringify(payload));
      if (photoFile) {
        formData.append("photo", photoFile);
      }

      toast.loading("Updating profile...", { id: "profile-update-toast" });

      const result = await updateUser({ userId, data: formData }).unwrap();

      toast.success(result.message || "Profile updated successfully", { id: "profile-update-toast" });

      // Update cookie
      const currentCookie = getUserData();
      // console.log(currentCookie);
      if (currentCookie && result.data) {
        saveUserData({
          ...currentCookie,
          name: result.data.name,
          phone: result.data.phone,
          address: result.data.address,
          facebookUrl: result.data.facebookUrl,
          instagramUrl: result.data.instagramUrl,
          photoUrl: result.data.photoUrl,
        });
      }
    } catch (error: any) {
      const message = error?.data?.message || error?.message || "Failed to update profile";
      toast.error(message, { id: "profile-update-toast" });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setPhotoFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (isUserLoading || !userId) {
    return (
      <div className="space-y-6 pb-10">
        {/* Header Skeleton */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-72" />
          </div>
          <Skeleton className="h-8 w-28 rounded-lg" />
        </div>

        {/* Form Skeletons */}
        <div className="rounded-[24px] border border-slate-100 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] sm:p-8">
          <div className="flex flex-col gap-8 lg:flex-row">
            <Skeleton className="size-36 rounded-[28px]" />
            <div className="flex-1 space-y-6 pt-4">
              <Skeleton className="h-4 w-32" />
              <div className="space-y-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-12 w-full rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-12 w-full rounded-xl" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{t("ownerProfile")}</h1>
          <p className="mt-1 text-slate-600 text-sm">{t("subtitle")}</p>
        </div>
        <div className="inline-flex items-center rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold tracking-wide text-blue-600">
          {t("verified")}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Profile Details */}
        <div className="rounded-[24px] border border-slate-100 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] sm:p-8">
          <div className="flex flex-col gap-8 lg:flex-row">
            <div className="flex shrink-0 flex-col items-center gap-4">
              <div
                onClick={triggerFileInput}
                className="group relative flex size-36 cursor-pointer items-center justify-center overflow-hidden rounded-[28px] bg-[#F1F5F9] transition-all hover:bg-slate-200"
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Logo" className="h-full w-full object-cover" />
                ) : (
                  <div className="text-center">
                    <div className="mx-auto mb-2 flex size-10 items-center justify-center rounded-full bg-white text-blue-600 shadow-sm">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{t("uploadLogo")}</span>
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">{t("change")}</span>
                </div>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
              />
              {imagePreview && (
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="text-xs font-bold uppercase tracking-wider text-red-500 hover:text-red-600"
                >
                  {t("remove")}
                </button>
              )}
            </div>

            <div className="flex-1 space-y-6">
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{t("userDetails") || "Profile Details"}</p>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">{t("name")}</label>
                  <input
                    {...register("businessName")}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-[15px] outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  />
                  {errors.businessName && <p className="text-xs text-red-500">{errors.businessName.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">{t("address")}</label>
                  <input
                    {...register("address")}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-[15px] outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  />
                  {errors.address && <p className="text-xs text-red-500">{errors.address.message}</p>}
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">{t("contactNumber")}</label>
                    <input
                      {...register("contactNumber")}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-[15px] outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    />
                    {errors.contactNumber && <p className="text-xs text-red-500">{errors.contactNumber.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700">{t("email")}</label>
                    <input
                      {...register("email")}
                      readOnly
                      className="w-full rounded-xl border border-transparent bg-[#F1F5F9] px-4 py-3 text-[15px] text-slate-500 outline-none cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Social Media Section */}
        <div className="rounded-[24px] border border-slate-100 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] sm:p-8">
          <p className="mb-6 text-[11px] font-bold uppercase tracking-widest text-slate-400">{t("socialMedia")}</p>
          <div className="space-y-6">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">{t("facebook")}</label>
              <input
                {...register("facebook")}
                className="w-full rounded-xl border-transparent bg-[#F8FAFC] px-4 py-3 text-[15px] outline-none transition-all focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">{t("instagram")}</label>
              <input
                {...register("instagram")}
                className="w-full rounded-xl border-transparent bg-[#F8FAFC] px-4 py-3 text-[15px] outline-none transition-all focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isUpdating}
            className="h-12 max-w-50 rounded-xl bg-[#3B82F6] text-lg font-semibold text-white shadow-xl shadow-blue-500/20 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUpdating ? t("saving") || "Saving..." : t("saveChanges")}
          </Button>
        </div>
      </form>

      <BusinessInfo />

      {/* Pricing Adjustments Section */}
      <div className="rounded-[24px] border border-slate-100 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] sm:p-8 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{tp("pricingAdjustments") || "Pricing Adjustments"}</h2>
            <p className="text-sm text-slate-500 mt-1">{tp("pricingAdjustmentsSubtitle") || "Manage taxes and service charges applied to orders."}</p>
          </div>
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-600 transition duration-150 cursor-pointer self-start sm:self-center"
          >
            <Plus size={16} />
            <span>{tp("addAdjustment") || "Add Pricing Adjustment"}</span>
          </button>
        </div>

        {isPriceAdjLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="overflow-hidden rounded-2xl border border-slate-100">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-500">
                  <thead className="bg-slate-50/75 text-xs uppercase tracking-wider text-slate-700 border-b border-slate-100">
                    <tr>
                      <th scope="col" className="px-6 py-4 font-semibold">{tp("level") || "Level"}</th>
                      <th scope="col" className="px-6 py-4 font-semibold">{tp("type") || "Type"}</th>
                      <th scope="col" className="px-6 py-4 font-semibold">{tp("value") || "Value"}</th>
                      <th scope="col" className="px-6 py-4 font-semibold text-right">{tp("action") || "Action"}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {pricingData.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-slate-400 font-medium">
                          No pricing adjustments found.
                        </td>
                      </tr>
                    ) : (
                      pricingData.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/50 transition">
                          <td className="px-6 py-4 font-semibold text-slate-800">
                            {item.level}
                          </td>
                          <td className="px-6 py-4 text-slate-600 font-medium">
                            {item.type === "PERCENTAGE" ? (tp("typePercentage") || "Percentage (%)") : (tp("typeFixedAmount") || "Fixed Amount (Rp)")}
                          </td>
                          <td className="px-6 py-4 font-bold text-slate-900">
                            {item.type === "PERCENTAGE"
                              ? `${item.percentage}%`
                              : `Rp ${Number(item.fixedAmount).toLocaleString("en-US")}`
                            }
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => handleOpenEditModal(item)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenDeleteModal(item.id)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination Controls */}
            {pricingTotalPages > 1 && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <CustomPagination
                  currentPage={pricePage}
                  totalPages={pricingTotalPages}
                  onPageChange={(page) => {
                    if (page >= 1 && page <= pricingTotalPages) {
                      setPricePage(page);
                    }
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add / Edit Modal Dialog */}
      {isAdjModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-[2px]">
          <div className="relative w-full max-w-120 rounded-[24px] bg-white p-8 shadow-2xl animate-in fade-in-50 zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setIsAdjModalOpen(false)}
              className="absolute right-6 top-6 rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            >
              <X size={20} />
            </button>

            <div className="mb-6">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                {editingAdj ? tp("editAdjustment") || "Edit Pricing Adjustment" : tp("addAdjustment") || "Add Pricing Adjustment"}
              </h2>
            </div>

            <form onSubmit={handleSaveAdjustment} className="space-y-6">
              {/* Level Input */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  {tp("level") || "Level"} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={adjLevel}
                  onChange={(e) => setAdjLevel(e.target.value)}
                  placeholder="e.g., TAX, SERVICE_CHARGE, VAT"
                  className="w-full rounded-[14px] bg-[#F1F5F9] px-4 py-3 text-[16px] text-slate-900 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 font-medium"
                  required
                />
              </div>

              {/* Type Input */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  {tp("type") || "Type"} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={adjType}
                    onChange={(e) => setAdjType(e.target.value as any)}
                    className="w-full appearance-none rounded-[14px] bg-[#F1F5F9] px-4 py-3 text-[16px] text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="PERCENTAGE">{tp("typePercentage") || "Percentage (%)"}</option>
                    <option value="FIXED_AMOUNT">{tp("typeFixedAmount") || "Fixed Amount (Rp)"}</option>
                  </select>
                  <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Value Input */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">
                  {tp("value") || "Value"}{adjType === "PERCENTAGE" ? " (%)" : " (Rp)"} <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={adjValue}
                  onChange={(e) => setAdjValue(e.target.value)}
                  placeholder={adjType === "PERCENTAGE" ? "e.g., 10" : "e.g., 50"}
                  className="w-full rounded-[14px] bg-[#F1F5F9] px-4 py-3 text-[16px] text-slate-900 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/20 font-medium"
                  required
                  step="any"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAdjModalOpen(false)}
                  disabled={isCreatingPrice || isUpdatingPrice}
                  className="rounded-xl border border-slate-200 px-6 py-2.5 text-[15px] font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  {tp("cancel") || "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={isCreatingPrice || isUpdatingPrice}
                  className="rounded-xl bg-blue-500 px-6 py-2.5 text-[15px] font-semibold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-600 transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {(isCreatingPrice || isUpdatingPrice) && <Loader2 className="size-4 animate-spin" />}
                  {tp("save") || "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-[2px]">
          <div className="relative w-full max-w-md rounded-[24px] bg-white p-8 shadow-2xl animate-in fade-in-50 zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              className="absolute right-6 top-6 rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              disabled={isDeletingPrice}
            >
              <X size={20} />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="mb-5 flex size-14 items-center justify-center rounded-full bg-red-50 text-red-500">
                <AlertTriangle size={28} />
              </div>

              <h3 className="mb-2 text-xl font-bold text-slate-900">{tp("deleteAdjustment") || "Delete Pricing Adjustment"}</h3>
              <p className="mb-8 text-sm text-slate-500 leading-relaxed">
                {tp("deleteConfirm") || "Are you sure you want to delete this pricing adjustment?"}
              </p>

              <div className="flex w-full items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 rounded-xl border border-slate-200 py-3 text-[15px] font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
                  disabled={isDeletingPrice}
                >
                  {tp("cancel") || "Cancel"}
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAdjustment}
                  className="flex-1 rounded-xl bg-red-600 py-3 text-[15px] font-semibold text-white shadow-lg shadow-red-500/25 transition hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
                  disabled={isDeletingPrice}
                >
                  {isDeletingPrice && <Loader2 className="size-4 animate-spin" />}
                  {tp("delete") || "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileInformationPage;
