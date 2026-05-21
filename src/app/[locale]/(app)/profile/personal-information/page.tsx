"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useGetUserByIdQuery, useUpdateUserMutation } from "@/redux/features/dashboard/dashboard.api";
import { getUserData, saveUserData } from "@/utils/auth";
import { Skeleton } from "@/components/ui/skeleton";

const profileSchema = (t: any) => z.object({
  businessName: z.string().min(1, t("businessNameRequired")),
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
        payload.photoUrl = null;
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
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">{t("ownerProfile")}</h1>
          <p className="mt-1 text-slate-500">{t("subtitle")}</p>
        </div>
        <div className="inline-flex items-center rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold tracking-wide text-blue-600">
          {t("verified")}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Business Name & Address */}
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
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{t("businessNameAddress") || "Business Name & Address"}</p>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">{t("businessName")}</label>
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
              </div>
            </div>
          </div>
        </div>

        {/* Contact Details */}
        <div className="rounded-[24px] border border-slate-100 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] sm:p-8">
          <p className="mb-6 text-[11px] font-bold uppercase tracking-widest text-slate-400">{t("contactDetails")}</p>
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
        <Button
          type="submit"
          disabled={isUpdating}
          className="h-14 w-full rounded-xl bg-[#3B82F6] text-lg font-semibold text-white shadow-xl shadow-blue-500/20 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUpdating ? t("saving") || "Saving..." : t("saveChanges")}
        </Button>
      </form>
    </div>
  );
};

export default ProfileInformationPage;
