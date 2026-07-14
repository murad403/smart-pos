"use client";
import { Link, useRouter } from "@/i18n/routing";
import { BriefcaseBusiness, Lock, ShieldCheck, ShoppingCart, UserCog } from "lucide-react";
import { useTranslations } from "next-intl";
import logo from "@/assets/logo/logo2.png"
import Image from "next/image";



const Welcome = () => {
    const t = useTranslations("welcome");
    const router = useRouter();

    return (
        <section className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
            <div className="w-full max-w-md">
                <div className="flex justify-center pb-4">
                    <Image
                    src={logo}
                    alt="Logo"
                    width={500}
                    height={500}
                    className="w-50 h-full"
                    />
                </div>

                {/* Card */}
                <div className="rounded-2xl bg-white p-4 shadow-[0_15px_28px_-18px_rgba(15,23,42,0.5)]">
                    <p className="pb-3 text-center text-sm md:text-base font-semibold text-text-color">
                        {t("selectRole")}
                    </p>

                    <div className="flex flex-col gap-4">


                        {/* Customer */}
                        <Link
                            href="/auth/customer-welcome"
                            aria-label={t("customerAria")}
                            className="flex w-full items-center gap-2.5 rounded-xl bg-[#3b6ef6] px-3.5 py-4 text-[13px] font-semibold text-white no-underline transition-all duration-150 hover:-translate-y-0.5 hover:saturate-[1.1] active:scale-[0.98]"
                        >
                            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/20">
                                <ShoppingCart size={17} strokeWidth={2} />
                            </span>
                            {t("customer")}
                        </Link>

                        {/* Staff */}
                        <Link
                            href="/auth/sign-in?role=staff"
                            aria-label={t("staffAria")}
                            className="flex w-full items-center gap-2.5 rounded-xl bg-[#3b6ef6] px-3.5 py-4 text-[13px] font-semibold text-white no-underline transition-all duration-150 hover:-translate-y-0.5 hover:saturate-[1.1] active:scale-[0.98]"
                        >
                            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/20">
                                <UserCog size={17} strokeWidth={2} />
                            </span>
                            {t("staff")}
                        </Link>

                        {/* Admin */}
                        <Link
                            href="/auth/sign-in?role=admin"
                            aria-label={t("adminAria")}
                            className="flex w-full items-center gap-2.5 rounded-xl bg-[#3b6ef6] px-3.5 py-4 text-[13px] font-semibold text-white no-underline transition-all duration-150 hover:-translate-y-0.5 hover:saturate-[1.1] active:scale-[0.98]"
                        >
                            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/20">
                                <ShieldCheck size={17} strokeWidth={2} />
                            </span>
                            {t("admin")}
                        </Link>



                        {/* Customer */}

                        <Link
                            href="/auth/sign-in?role=owner"
                            aria-label={t("ownerAria")}
                            className="flex w-full items-center gap-2.5 rounded-xl bg-[#3b6ef6] px-3.5 py-4 text-[13px] font-semibold text-white no-underline transition-all duration-150 hover:-translate-y-0.5 hover:saturate-[1.1] active:scale-[0.98]"
                        >
                            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/20">
                                <BriefcaseBusiness size={17} strokeWidth={2} />
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