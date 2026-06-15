"use client";

import React from "react";
import { X, User, Mail, ChevronDown, Eye, EyeOff, Phone, MapPin, Link2, UserRoundPlus } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { AdminFormValues, adminSchema } from "@/validation/auth.validation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useAddUserMutation } from "@/redux/features/dashboard/dashboard.api";
import { useGetAllProductionStationQuery } from "@/redux/features/menu/menu.api";

type Props = {
  open: boolean;
  onClose: () => void;
};

const AddAdminModal: React.FC<Props> = ({ open, onClose }) => {
  const t = useTranslations("Profile");
  const tv = useTranslations("Validation");
  const [addUser, { isLoading: isSubmitting }] = useAddUserMutation();
  const [showPass, setShowPass] = React.useState(false);
  const [photoFile, setPhotoFile] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [photoError, setPhotoError] = React.useState<string | null>(null);

  const { data: stationsRes } = useGetAllProductionStationQuery({ limit: 100 });
  const stations = stationsRes?.data ?? [];

  const defaultValues = React.useMemo<AdminFormValues>(() => ({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "ADMIN",
    address: "",
    productionStationId: "",
    facebookUrl: "",
    instagramUrl: "",
  }), []);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<AdminFormValues>({
    resolver: zodResolver(adminSchema(tv)),
    defaultValues,
  });

  const selectedRole = watch("role");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPhotoFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setPhotoError(null);
    }
  };

  const handleRemoveFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPhotoFile(null);
    setPreviewUrl(null);
    setPhotoError(t("photoRequired") || "Profile photo is required");
  };

  React.useEffect(() => {
    if (!open) {
      reset(defaultValues);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPhotoFile(null);
      setPreviewUrl(null);
      setPhotoError(null);
    }
  }, [open, reset, defaultValues]);

  if (!open) return null;

  const onSubmit = async (data: AdminFormValues) => {
    if (!photoFile) {
      setPhotoError(t("photoRequired") || "Profile photo is required");
      return;
    }
    setPhotoError(null);

    try {
      const payload: any = {
        ...data,
        facebookUrl: data.facebookUrl?.trim() || undefined,
        instagramUrl: data.instagramUrl?.trim() || undefined,
      };
      if (data.role === "SERVICE" && data.productionStationId) {
        payload.productionStationId = parseInt(data.productionStationId, 10);
      } else {
        delete payload.productionStationId;
      }

      const formData = new FormData();
      formData.append("data", JSON.stringify(payload));
      if (photoFile) {
        formData.append("photo", photoFile);
      }

      const response = await addUser(formData).unwrap();
      toast.success(response.message || "User added successfully");
      reset(defaultValues);
      setShowPass(false);
      onClose();
    } catch (error: unknown) {
      const message = error && typeof error === "object" && "data" in error
        ? (error as { data?: { message?: string } }).data?.message
        : undefined;
      const fallbackMessage = error instanceof Error ? error.message : undefined;
      toast.error(message || fallbackMessage || "Failed to add user");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-[2px]">
      <div className="relative w-full max-w-170 rounded-[32px] bg-white p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-6 top-6 rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
        >
          <X size={20} />
        </button>

        <div className="mb-8 flex items-center gap-4">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <UserRoundPlus size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{t("addUser") || "Add User"}</h2>
            <p className="text-[15px] text-slate-500">{t("registerNewProfileFor") || "Create a new account with access details and profile links."}</p>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-[1.35rem] font-bold text-slate-900">{t("userDetails") || "User Details"}</h3>
          <p className="text-[14px] text-slate-500">{t("createNewAccount") || "Fill in the user body fields exactly as the API expects."}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Photo Upload Section */}
          <div className="flex flex-col items-center justify-center pb-4">
            <div className="relative group">
              <div className={`size-24 rounded-full overflow-hidden bg-slate-100 border-2 border-dashed flex items-center justify-center transition-all group-hover:border-blue-400 group-hover:bg-slate-50 shadow-inner ${photoError ? 'border-red-500 bg-red-50/20' : 'border-slate-200'}`}>
                {previewUrl ? (
                  <img src={previewUrl} alt="Avatar Preview" className="h-full w-full object-cover" />
                ) : (
                  <User className={`size-10 ${photoError ? 'text-red-400' : 'text-slate-400'}`} />
                )}
              </div>
              <label className="absolute bottom-0 right-0 size-8 rounded-full bg-blue-600 text-white flex items-center justify-center cursor-pointer shadow-md hover:bg-blue-700 transition active:scale-95">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                </svg>
              </label>
              {previewUrl && (
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="absolute -top-1 -right-1 size-6 rounded-full bg-red-500 text-white flex items-center justify-center shadow-md hover:bg-red-650 transition active:scale-95"
                  title="Remove photo"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-2 font-medium">Upload profile photo <span className="text-red-500">*</span></p>
            {photoError && <p className="text-xs text-red-500 mt-1 font-semibold">{photoError}</p>}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-[13px] font-bold text-slate-700">{t("name") || "Name"} <span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  {...register("name")}
                  className="w-full rounded-xl border border-slate-100 bg-white px-4 py-3 text-[15px] outline-none transition-all focus:border-blue-500/50"
                  placeholder="John Doe"
                />
                <User className="absolute right-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              </div>
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-[13px] font-bold text-slate-700">{t("emailAddress") || "Email Address"} <span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  type="email"
                  {...register("email")}
                  className="w-full rounded-xl border border-slate-100 bg-white px-4 py-3 text-[15px] outline-none transition-all focus:border-blue-500/50"
                  placeholder="john.doe@example.com"
                />
                <Mail className="absolute right-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              </div>
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-[13px] font-bold text-slate-700">{t("phone") || "Phone"} <span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  type="tel"
                  {...register("phone")}
                  className="w-full rounded-xl border border-slate-100 bg-white px-4 py-3 text-[15px] outline-none transition-all focus:border-blue-500/50"
                  placeholder="+1234567890"
                />
                <Phone className="absolute right-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              </div>
              {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-[13px] font-bold text-slate-700">{t("role") || "Role"}</label>
              <div className="relative">
                <select
                  {...register("role")}
                  className="w-full appearance-none rounded-xl border border-slate-100 bg-white px-4 py-3 text-[15px] outline-none transition-all focus:border-blue-500/50"
                >
                  <option value="OWNER">OWNER</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="SERVICE">SERVICE</option>
                  <option value="USER">USER</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            {selectedRole === "SERVICE" && (
              <div className="space-y-1">
                <label className="text-[13px] font-bold text-slate-700">Production Station <span className="text-red-500">*</span></label>
                <div className="relative">
                  <select
                    {...register("productionStationId")}
                    className="w-full appearance-none rounded-xl border border-slate-100 bg-white px-4 py-3 text-[15px] outline-none transition-all focus:border-blue-500/50"
                  >
                    <option value="">Select Production Station</option>
                    {stations.map((station: any) => (
                      <option key={station.id} value={station.id}>
                        {station.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                </div>
                {errors.productionStationId && <p className="text-xs text-red-500">{errors.productionStationId.message}</p>}
              </div>
            )}

            <div className="space-y-1 md:col-span-2">
              <label className="text-[13px] font-bold text-slate-700">{t("password") || "Password"} <span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  {...register("password")}
                  className="w-full rounded-xl border border-slate-100 bg-white px-4 py-3 text-[15px] outline-none transition-all focus:border-blue-500/50"
                  placeholder="StrongP@ssw0rd"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 size-4 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-[13px] font-bold text-slate-700">{t("address") || "Address"} <span className="text-red-500">*</span></label>
              <div className="relative">
                <textarea
                  {...register("address")}
                  rows={3}
                  className="w-full rounded-xl border border-slate-100 bg-white px-4 py-3 text-[15px] outline-none transition-all focus:border-blue-500/50"
                  placeholder="123 Main Street, Anytown, AN 12345"
                />
                <MapPin className="absolute right-4 top-4 size-4 text-slate-400" />
              </div>
              {errors.address && <p className="text-xs text-red-500">{errors.address.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-[13px] font-bold text-slate-700">{t("facebookUrl") || "Facebook URL"} <span className="text-slate-400">(Optional)</span></label>
              <div className="relative">
                <input
                  {...register("facebookUrl")}
                  className="w-full rounded-xl border border-slate-100 bg-white px-4 py-3 pl-4 pr-10 text-[15px] outline-none transition-all focus:border-blue-500/50"
                  placeholder="https://facebook.com/johndoe"
                />
                <Link2 className="absolute right-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              </div>
              {errors.facebookUrl && <p className="text-xs text-red-500">{errors.facebookUrl.message}</p>}
            </div>

            <div className="space-y-1">
              <label className="text-[13px] font-bold text-slate-700">{t("instagramUrl") || "Instagram URL"} <span className="text-slate-400">(Optional)</span></label>
              <div className="relative">
                <input
                  {...register("instagramUrl")}
                  className="w-full rounded-xl border border-slate-100 bg-white px-4 py-3 pl-4 pr-10 text-[15px] outline-none transition-all focus:border-blue-500/50"
                  placeholder="https://instagram.com/johndoe"
                />
                <Link2 className="absolute right-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              </div>
              {errors.instagramUrl && <p className="text-xs text-red-500">{errors.instagramUrl.message}</p>}
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="mt-4 h-12 w-full rounded-xl bg-[#3B82F6] text-[15px] font-bold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? (t("saving") || "Saving...") : (t("addUser") || "Add User")}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AddAdminModal;