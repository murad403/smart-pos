"use client";
import React, { useState, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import resetIllustration from "@/assets/auth/resetpassword.png";
import AuthPageWrapper from "@/components/wrapper/AuthWrapper";
import { ResetPasswordFormValues, resetPasswordSchema } from "@/validation/auth.validation";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useEffect } from "react";
import { useResetPasswordMutation } from "@/redux/features/auth/auth.api";



const Illustration = () => (
    <Image
        src={resetIllustration}
        alt="Reset password illustration"
        priority
        className="h-auto w-full drop-shadow-[0_24px_50px_rgba(37,99,235,0.16)]"
        sizes="(max-width: 1024px) 90vw, 50vw"
    />
);



export default function ResetPasswordPage({ params }: { params?: Promise<{ locale: string }> }) {
    if (params) use(params);
    const router = useRouter();
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [token, setToken] = useState("");
    const [resetPassword, { isLoading }] = useResetPasswordMutation();

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ResetPasswordFormValues>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: { newPassword: "", confirmPassword: "" },
    });

    useEffect(() => {
        if (typeof window !== "undefined") {
            const searchParams = new URLSearchParams(window.location.search);
            const tokenParam = searchParams.get("token") || sessionStorage.getItem("reset_token") || "";
            setToken(tokenParam);
        }
    }, []);

    const onSubmit = async (values: ResetPasswordFormValues) => {
        if (!token) {
            toast.error("Reset token is missing or has expired. Please verify your OTP again.");
            return;
        }
        try {
            const result = await resetPassword({
                resetToken: token,
                newPassword: values.newPassword,
            }).unwrap();

            if (result.success) {
                toast.success(result.message || "Password reset successfully!");
                if (typeof window !== "undefined") {
                    sessionStorage.removeItem("reset_token");
                    sessionStorage.removeItem("reset_email");
                }
                router.push("/auth/verify-success");
            } else {
                toast.error(result.message || "Failed to reset password.");
            }
        } catch (err: any) {
            console.error("Reset password error:", err);
            toast.error(err?.data?.message || err?.message || "Failed to reset password. Please try again.");
        }
    };

    return (
        <AuthPageWrapper illustration={<Illustration />}>
            <div className="space-y-6">
                {/* Heading */}
                <div className="space-y-2">
                    <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-[30px]">
                        Reset password?
                    </h1>
                    <p className="text-sm leading-6 text-slate-500 sm:text-[15px]">
                        Enter New Password &amp; Confirm Password to get inside
                    </p>
                </div>

                <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
                    {/* New Password */}
                    <label className="block">
                        <span className="mb-2 block text-sm font-medium text-slate-700">
                            New Password <span className="text-[#ef4444]">*</span>
                        </span>
                        <div className="relative">
                            <input
                                type={showNew ? "text" : "password"}
                                autoComplete="new-password"
                                placeholder="New password"
                                className={`h-11 w-full rounded-lg border bg-white px-4 pr-11 text-sm text-slate-900 outline-none transition focus:border-[#2f6de3] focus:ring-4 focus:ring-[#2f6de3]/10 ${errors.newPassword ? "border-rose-400" : "border-slate-200"
                                    }`}
                                aria-invalid={Boolean(errors.newPassword)}
                                {...register("newPassword")}
                            />
                            <button
                                type="button"
                                onClick={() => setShowNew((v) => !v)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                                aria-label={showNew ? "Hide" : "Show"}
                            >
                                {showNew ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                            </button>
                        </div>
                        <p className="mt-1.5 min-h-5 text-xs text-rose-500">
                            {errors.newPassword?.message}
                        </p>
                    </label>

                    {/* Confirm Password */}
                    <label className="block">
                        <span className="mb-2 block text-sm font-medium text-slate-700">
                            Confirm Password <span className="text-[#ef4444]">*</span>
                        </span>
                        <div className="relative">
                            <input
                                type={showConfirm ? "text" : "password"}
                                autoComplete="new-password"
                                placeholder="Confirm password"
                                className={`h-11 w-full rounded-lg border bg-white px-4 pr-11 text-sm text-slate-900 outline-none transition focus:border-[#2f6de3] focus:ring-4 focus:ring-[#2f6de3]/10 ${errors.confirmPassword ? "border-rose-400" : "border-slate-200"
                                    }`}
                                aria-invalid={Boolean(errors.confirmPassword)}
                                {...register("confirmPassword")}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirm((v) => !v)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                                aria-label={showConfirm ? "Hide" : "Show"}
                            >
                                {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                            </button>
                        </div>
                        <p className="mt-1.5 min-h-5 text-xs text-rose-500">
                            {errors.confirmPassword?.message}
                        </p>
                    </label>

                    <button
                        type="submit"
                        disabled={isSubmitting || isLoading}
                        className="inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#3f82f6] px-4 text-sm font-semibold text-white shadow-[0_16px_28px_-18px_rgba(63,130,246,0.9)] transition hover:-translate-y-0.5 hover:bg-[#3277ef] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {isSubmitting || isLoading ? "Saving Password..." : "Change Password"}
                        <ArrowRight className="size-4" />
                    </button>
                </form>

                <p className="text-center text-sm text-slate-500">
                    Return to{" "}
                    <Link href="/auth/sign-in" className="font-semibold text-[#3f82f6] hover:underline">
                        Login
                    </Link>
                </p>
            </div>
        </AuthPageWrapper>
    );
}