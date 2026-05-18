"use client";
import React, { use } from "react";
import Image from "next/image";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ArrowRight, Mail } from "lucide-react";
import forgotIllustration from "@/assets/auth/forgotpassword.png";
import { ForgotPasswordFormValues, forgotPasswordSchema } from "@/validation/auth.validation";
import AuthPageWrapper from "@/components/wrapper/AuthWrapper";
import { useRouter } from "next/navigation";
import { useForgotPasswordMutation } from "@/redux/features/auth.api";
import { toast } from "sonner";


const Illustration = () => (
    <Image
        src={forgotIllustration}
        alt="Forgot password illustration"
        priority
        className="h-auto w-full drop-shadow-[0_24px_50px_rgba(37,99,235,0.16)]"
        sizes="(max-width: 1024px) 90vw, 50vw"
    />
);

/* ── Page ── */
export default function ForgotPasswordPage({ params }: { params?: Promise<{ locale: string }> }) {
    if (params) use(params);
    const router = useRouter();
    const [forgotPassword, { isLoading }] = useForgotPasswordMutation();
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ForgotPasswordFormValues>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: { email: "" },
    });

    const onSubmit = async (values: ForgotPasswordFormValues) => {
        try {
            const result = await forgotPassword({ email: values.email }).unwrap();
            if (result.success) {
                toast.success(result.message || "OTP has been sent to your email!");
                if (typeof window !== "undefined") {
                    sessionStorage.setItem("reset_email", values.email);
                }
                router.push(`/auth/verify-otp?email=${encodeURIComponent(values.email)}`);
            } else {
                toast.error(result.message || "Failed to submit request.");
            }
        } catch (err: any) {
            console.error("Forgot password error:", err);
            toast.error(err?.data?.message || err?.message || "Something went wrong. Please try again.");
        }
    };

    return (
        <AuthPageWrapper illustration={<Illustration />}>
            <div className="space-y-6">
                {/* Heading */}
                <div className="space-y-2">
                    <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-[30px]">
                        Forgot password?
                    </h1>
                    <p className="text-sm leading-6 text-slate-500 sm:text-[15px]">
                        If you forgot your password, well, then we&apos;ll email you
                        instructions to reset your password.
                    </p>
                </div>

                <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
                    {/* Email */}
                    <label className="block">
                        <span className="mb-2 block text-sm font-medium text-slate-700">
                            Email Address <span className="text-[#ef4444]">*</span>
                        </span>
                        <div className="relative">
                            <Mail className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                            <input
                                type="email"
                                autoComplete="email"
                                placeholder="name@example.com"
                                className={`h-11 w-full rounded-lg border bg-white px-4 pr-11 text-sm text-slate-900 outline-none transition focus:border-[#2f6de3] focus:ring-4 focus:ring-[#2f6de3]/10 ${errors.email ? "border-rose-400" : "border-slate-200"
                                    }`}
                                aria-invalid={Boolean(errors.email)}
                                {...register("email")}
                            />
                        </div>
                        <p className="mt-1.5 min-h-5 text-xs text-rose-500">
                            {errors.email?.message}
                        </p>
                    </label>

                    <button
                        type="submit"
                        disabled={isSubmitting || isLoading}
                        className="inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#3f82f6] px-4 text-sm font-semibold text-white shadow-[0_16px_28px_-18px_rgba(63,130,246,0.9)] transition hover:-translate-y-0.5 hover:bg-[#3277ef] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {isSubmitting || isLoading ? "Submitting..." : "Submit"}
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