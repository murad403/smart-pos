import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useGetBusinessInformationQuery, useUpdateBusinessInformationMutation } from "@/redux/features/dashboard/dashboard.api";

export const BusinessSchema = z.object({
  businessEmail: z.string().email("Invalid email address").or(z.literal("")).optional(),
  businessName: z.string().max(255).optional(),
  businessAddress: z.string().max(255).optional(),
  businessPhone: z.string().optional(),
  feedbackMsg: z.string().max(500).optional(),
});

type BusinessFormValues = z.infer<typeof BusinessSchema>;

const BusinessInfo = () => {
  const t = useTranslations("Profile");
  const { data: businessRes, isLoading: isBusinessLoading } = useGetBusinessInformationQuery(undefined);
  const [updateBusiness, { isLoading: isUpdatingBusiness }] = useUpdateBusinessInformationMutation();
  const businessData = businessRes?.data;

  const [businessLogoPreview, setBusinessLogoPreview] = useState<string | null>(null);
  const [businessLogoFile, setBusinessLogoFile] = useState<File | null>(null);
  const businessLogoInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<BusinessFormValues>({
    resolver: zodResolver(BusinessSchema),
    defaultValues: {
      businessEmail: "",
      businessName: "",
      businessAddress: "",
      businessPhone: "",
      feedbackMsg: "",
    },
  });

  useEffect(() => {
    if (businessData) {
      setValue("businessName", businessData.name || "");
      setValue("businessAddress", businessData.address || "");
      setValue("businessPhone", businessData.contact || "");
      setValue("businessEmail", businessData.email || "");
      setValue("feedbackMsg", businessData.customNote || businessData.feedbackMsg || "");
      if (businessData.logoUrl) {
        setBusinessLogoPreview(businessData.logoUrl);
      }
    }
  }, [businessData, setValue]);

  const handleBusinessLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBusinessLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setBusinessLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveBusinessLogo = () => {
    setBusinessLogoPreview(null);
    setBusinessLogoFile(null);
    if (businessLogoInputRef.current) {
      businessLogoInputRef.current.value = "";
    }
  };

  const onBusinessSubmit = async (data: BusinessFormValues) => {
    try {
      const payload: any = {
        businessName: data.businessName,
        businessAddress: data.businessAddress,
        businessPhone: data.businessPhone,
        businessEmail: data.businessEmail,
        feedbackMsg: data.feedbackMsg || null,
      };

      const formData = new FormData();
      formData.append("data", JSON.stringify(payload));
      if (businessLogoFile) {
        formData.append("logo", businessLogoFile);
      }

      toast.loading("Updating business information...", { id: "business-update-toast" });

      const result = await updateBusiness(formData).unwrap();

      toast.success(result.message || "Business profile updated successfully", { id: "business-update-toast" });
    } catch (error: any) {
      const message = error?.data?.message || error?.message || "Failed to update business profile";
      toast.error(message, { id: "business-update-toast" });
    }
  };

  if (isBusinessLoading) {
    return (
      <div className="rounded-[24px] border border-slate-100 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] sm:p-8 animate-pulse space-y-6">
        <div className="h-6 w-48 bg-slate-100 rounded" />
        <div className="h-12 w-full bg-slate-100 rounded" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onBusinessSubmit)} className="space-y-6">
      {/* Business Information Card */}
      <div className="rounded-[24px] border border-slate-100 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] sm:p-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          <div className="flex shrink-0 flex-col items-center gap-4">
            <div
              onClick={() => businessLogoInputRef.current?.click()}
              className="group relative flex size-36 cursor-pointer items-center justify-center overflow-hidden rounded-[28px] bg-[#F1F5F9] transition-all hover:bg-slate-200"
            >
              {businessLogoPreview ? (
                <img src={businessLogoPreview} alt="Logo" className="h-full w-full object-cover" />
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
              ref={businessLogoInputRef}
              onChange={handleBusinessLogoChange}
              accept="image/*"
              className="hidden"
            />
            {businessLogoPreview && (
              <button
                type="button"
                onClick={handleRemoveBusinessLogo}
                className="text-xs font-bold uppercase tracking-wider text-red-500 hover:text-red-600"
              >
                {t("remove")}
              </button>
            )}
          </div>

          <div className="flex-1 space-y-6">
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{t("businessInfoTitle") || "Business Information"}</p>

            <div className="space-y-4">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">{t("businessName") || "Business Name"}</label>
                  <input
                    {...register("businessName")}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-[15px] outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  />
                  {errors.businessName && <p className="text-xs text-red-500">{errors.businessName.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">{t("businessEmail") || "Business Email"}</label>
                  <input
                    type="email"
                    {...register("businessEmail")}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-[15px] outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  />
                  {errors.businessEmail && <p className="text-xs text-red-500">{errors.businessEmail.message}</p>}
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">{t("businessContact") || "Business Contact"}</label>
                  <input
                    {...register("businessPhone")}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-[15px] outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  />
                  {errors.businessPhone && <p className="text-xs text-red-500">{errors.businessPhone.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">{t("businessAddress") || "Business Address"}</label>
                  <input
                    {...register("businessAddress")}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-[15px] outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  />
                  {errors.businessAddress && <p className="text-xs text-red-500">{errors.businessAddress.message}</p>}
                </div>
              </div>

              {/* Receipt Message (feedbackMsg) Section */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">
                  {t("feedbackMsg") || "Receipt Message"}
                </label>
                <textarea
                  {...register("feedbackMsg")}
                  rows={3}
                  placeholder="Enter receipt message..."
                  className="w-full rounded-xl border border-slate-200 bg-[#F8FAFC] px-4 py-3 text-[15px] outline-none transition-all focus:bg-white focus:ring-4 focus:ring-blue-500/10"
                />
                {errors.feedbackMsg && <p className="text-xs text-red-500">{errors.feedbackMsg.message}</p>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isUpdatingBusiness}
          className="h-12 max-w-50 rounded-xl bg-[#3B82F6] text-lg font-semibold text-white shadow-xl shadow-blue-500/20 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUpdatingBusiness ? t("saving") || "Saving..." : t("saveChanges")}
        </Button>
      </div>
    </form>
  );
};

export default BusinessInfo;