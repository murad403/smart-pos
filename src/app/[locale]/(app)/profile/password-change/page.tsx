"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { useTranslations } from "next-intl";

const passwordSchema = (t: any) => z.object({
    currentPassword: z.string().min(1, t("passwordRequired")),
    newPassword: z.string().min(6, t("passwordMin")),
    confirmPassword: z.string().min(1, t("confirmRequired")),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: t("passwordsMatch"),
    path: ["confirmPassword"],
});

type PasswordFormValues = z.infer<ReturnType<typeof passwordSchema>>;

const PasswordChangePage = ({ params }: { params?: Promise<{ locale: string }> }) => {
    if (params) React.use(params);
    const t = useTranslations("Profile");
    const tv = useTranslations("Validation");
    const [showCurrent, setShowCurrent] = React.useState(false);
    const [showNew, setShowNew] = React.useState(false);
    const [showConfirm, setShowConfirm] = React.useState(false);

    const { register, handleSubmit, formState: { errors }, reset } = useForm<PasswordFormValues>({
        resolver: zodResolver(passwordSchema(tv)),
    });

    const onSubmit = (data: PasswordFormValues) => {
        console.log("Password change data:", data);
        reset();
    };

    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">{t("security")}</h1>
                    <p className="mt-1 text-slate-500">{t("securitySettings")}</p>
                </div>
                <div className="inline-flex items-center rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold tracking-wide text-blue-600">
                    {t("verified")}
                </div>
            </div>

            <div className="rounded-[24px] border border-slate-100 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] sm:p-8">
                <h2 className="mb-6 text-[17px] font-bold text-slate-900">{t("security")}</h2>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700">{t("currentPassword")}</label>
                        <div className="relative">
                            <input
                                type={showCurrent ? "text" : "password"}
                                {...register("currentPassword")}
                                placeholder={t("enterCurrentPassword")}
                                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-[15px] outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowCurrent(!showCurrent)}
                                className="absolute right-4 top-1/2 size-5 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {errors.currentPassword && <p className="text-xs text-red-500">{errors.currentPassword.message}</p>}
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700">{t("newPassword")}</label>
                        <div className="relative">
                            <input
                                type={showNew ? "text" : "password"}
                                {...register("newPassword")}
                                placeholder={t("enterNewPassword")}
                                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-[15px] outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowNew(!showNew)}
                                className="absolute right-4 top-1/2 size-5 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {errors.newPassword && <p className="text-xs text-red-500">{errors.newPassword.message}</p>}
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-slate-700">{t("confirmNewPassword")}</label>
                        <div className="relative">
                            <input
                                type={showConfirm ? "text" : "password"}
                                {...register("confirmPassword")}
                                placeholder={t("confirmNewPasswordPlaceholder")}
                                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-[15px] outline-none transition-all focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirm(!showConfirm)}
                                className="absolute right-4 top-1/2 size-5 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>}
                    </div>

                    <div className="flex items-center gap-4 pt-2">
                        <Button
                            type="submit"
                            className="h-11 cursor-pointer rounded-lg bg-[#1A56DB] px-6 text-sm font-semibold text-white transition-all hover:bg-blue-700"
                        >
                            {t("updatePassword")}
                        </Button>
                        <button
                            type="button"
                            onClick={() => reset()}
                            className="cursor-pointer text-sm font-medium text-slate-500 hover:text-slate-700"
                        >
                            {t("cancel")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PasswordChangePage;