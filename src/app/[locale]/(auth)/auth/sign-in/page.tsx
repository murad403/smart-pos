"use client";
import React, { useState, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import authIllustration from "@/assets/auth/signin.png";
import { SignInFormValues, signInSchema } from "@/validation/auth.validation";
import AuthPageWrapper from "@/components/wrapper/AuthWrapper";
import { useRouter } from "next/navigation";

const Illustration = () => (
    <Image
        src={authIllustration}
        alt="Sign in illustration"
        priority
        className="h-auto w-full drop-shadow-[0_24px_50px_rgba(37,99,235,0.16)]"
        sizes="(max-width: 1024px) 90vw, 50vw"
    />
);

/* ── Page ── */
export default function SignInPage({ params }: { params?: Promise<{ locale: string }> }) {
    if (params) use(params);
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SignInFormValues>({
        resolver: zodResolver(signInSchema),
        defaultValues: { email: "john.doe4@example.com", password: "12345678", rememberMe: true },
    });

    const onSubmit = async (values: SignInFormValues) => {
        console.log(values);
        router.push("/dashboard");
    };

    return (
        <AuthPageWrapper illustration={<Illustration />}>
            <div className="space-y-6">
                {/* Heading */}
                <div className="space-y-2">
                    <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-[30px]">
                        Sign In
                    </h1>
                    <p className="text-sm leading-6 text-slate-500 sm:text-[15px]">
                        Access the Dreamspos panel using your email and passcode.
                    </p>
                </div>

                <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
                    {/* Email */}
                    <label className="block">
                        <span className="mb-2 block text-sm font-medium text-slate-700">
                            Email <span className="text-[#ef4444]">*</span>
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

                    {/* Password */}
                    <label className="block">
                        <span className="mb-2 block text-sm font-medium text-slate-700">
                            Password <span className="text-[#ef4444]">*</span>
                        </span>
                        <div className="relative">
                            <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                            <input
                                type={showPassword ? "text" : "password"}
                                autoComplete="current-password"
                                placeholder="Password"
                                className={`h-11 w-full rounded-lg border bg-white px-4 pl-11 pr-11 text-sm text-slate-900 outline-none transition focus:border-[#2f6de3] focus:ring-4 focus:ring-[#2f6de3]/10 ${errors.password ? "border-rose-400" : "border-slate-200"
                                    }`}
                                aria-invalid={Boolean(errors.password)}
                                {...register("password")}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((v) => !v)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                            </button>
                        </div>
                        <p className="mt-1.5 min-h-5 text-xs text-rose-500">
                            {errors.password?.message}
                        </p>
                    </label>

                    {/* Remember me + Forgot */}
                    <div className="flex items-center justify-between gap-3 pt-1 text-sm">
                        <label className="inline-flex cursor-pointer items-center gap-2 text-slate-500">
                            <input
                                type="checkbox"
                                className="size-4 rounded border-slate-300 text-[#2f6de3] focus:ring-[#2f6de3]"
                                {...register("rememberMe")}
                            />
                            <span>Remember Me</span>
                        </label>
                        <Link
                            href="/auth/forgot-password"
                            className="font-medium text-[#f97316] hover:underline"
                        >
                            Forgot Password?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#3f82f6] px-4 text-sm font-semibold text-white shadow-[0_16px_28px_-18px_rgba(63,130,246,0.9)] transition hover:-translate-y-0.5 hover:bg-[#3277ef] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        Sign In
                        <ArrowRight className="size-4" />
                    </button>
                </form>
            </div>
        </AuthPageWrapper>
    );
}