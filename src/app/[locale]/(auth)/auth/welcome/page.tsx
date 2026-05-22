"use client";

import { Link } from "@/i18n/routing";
import { Lock, User, Users } from "lucide-react";
import { useTranslations } from "next-intl";

const Welcome = () => {
    const t = useTranslations("welcome");

    return (
        <section className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
            <div className="w-full max-w-md">

                {/* Header */}
                <div className="mb-6 flex flex-col items-center text-center">
                    <div className="mb-3.5 flex h-13 w-13 items-center justify-center rounded-2xl bg-[#3b6ef6]">
                        <Lock size={26} color="#fff" strokeWidth={2} />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold leading-none tracking-tight text-text-color">
                        {t("title")}
                    </h1>
                    <p className="mt-1.5 text-xs font-medium tracking-widest text-text-color uppercase">
                        {t("subtitle")}
                    </p>
                </div>

                {/* Card */}
                <div className="rounded-2xl bg-white p-4 shadow-[0_15px_28px_-18px_rgba(15,23,42,0.5)]">
                    <p className="pb-3 text-center text-sm md:text-base font-semibold text-text-color">
                        {t("selectRole")}
                    </p>

                    <div className="flex flex-col gap-4">

                        <Link
                            href="/auth/customer-welcome"
                            aria-label={t("customerAria")}
                            className="flex w-full items-center gap-2.5 rounded-xl bg-[#f5a623] px-3.5 py-4 text-[13px] font-semibold text-white transition-all duration-150 hover:-translate-y-0.5 hover:saturate-[1.1] active:scale-[0.98]"
                        >
                            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/20">
                                <Users size={13} strokeWidth={2.2} />
                            </span>
                            {t("customer")}
                        </Link>

                        {/* Staff */}
                        <Link
                            href="/auth/sign-in"
                            aria-label={t("staffAria")}
                            className="flex w-full items-center gap-2.5 rounded-xl bg-[#1db974] px-3.5 py-4 text-[13px] font-semibold text-white no-underline transition-all duration-150 hover:-translate-y-0.5 hover:saturate-[1.1] active:scale-[0.98]"
                        >
                            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/20">
                                <User size={13} strokeWidth={2.2} />
                            </span>
                            {t("staff")}
                        </Link>

                        {/* Admin */}
                        <Link
                            href="/auth/sign-in"
                            aria-label={t("adminAria")}
                            className="flex w-full items-center gap-2.5 rounded-xl bg-[#3b6ef6] px-3.5 py-4 text-[13px] font-semibold text-white no-underline transition-all duration-150 hover:-translate-y-0.5 hover:saturate-[1.1] active:scale-[0.98]"
                        >
                            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/20">
                                <Lock size={13} strokeWidth={2.2} />
                            </span>
                            {t("admin")}
                        </Link>



                        {/* Customer */}

                        <Link
                            href="/auth/sign-in"
                            aria-label={t("ownerAria")}
                            className="flex w-full items-center gap-2.5 rounded-xl bg-orange-500 px-3.5 py-4 text-[13px] font-semibold text-white transition-all duration-150 hover:-translate-y-0.5 hover:saturate-[1.1] active:scale-[0.98]"
                        >
                            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/20">
                                <Users size={13} strokeWidth={2.2} />
                            </span>
                            {t("owner")}
                        </Link>

                    </div>
                </div>

            </div>
        </section>
    );
};

export default Welcome;