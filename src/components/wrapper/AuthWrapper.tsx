import Image from "next/image";
import React from "react";
import brandLogo from "@/assets/logo/logo2.png";

interface AuthPageWrapperProps {
    illustration?: React.ReactNode;
    children: React.ReactNode;
}

const AuthPageWrapper = ({ illustration, children }: AuthPageWrapperProps) => {
    return (
        <section>
            <div className="mx-auto grid min-h-screen overflow-hidden lg:grid-cols-[1.05fr_0.95fr]">
                {/* ── Left white panel ── */}
                <div className="relative flex flex-col overflow-hidden bg-white px-5 py-6 sm:px-8 sm:py-8 lg:px-14 lg:py-10">
                    <div className="flex flex-1 items-center justify-center pt-20 sm:pt-20 lg:pt-14">
                        <div className="w-full max-w-95">
                            {/* Logo */}
                            <div className="mb-12 flex justify-center sm:mb-14 lg:mb-16">
                                <Image
                                    src={brandLogo}
                                    alt="Best Way Special"
                                    priority
                                    className="h-auto w-37.5 sm:w-45"
                                    sizes="180px"
                                />
                            </div>

                            {/* Page content (form, success state, etc.) */}
                            {children}
                        </div>
                    </div>
                </div>



                {/* ── Right blue panel ── */}
                <div className="relative md:flex hidden min-h-90 items-center justify-center overflow-hidden bg-[#BAD3FF] px-6 py-10 sm:min-h-115 lg:min-h-0 lg:px-10 lg:py-12">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.34),transparent_32%),radial-gradient(circle_at_70%_72%,rgba(255,255,255,0.16),transparent_28%)]" />
                    <div className="absolute left-8 top-16 h-20 w-20 rounded-full bg-white/20 blur-2xl" />
                    <div className="absolute bottom-14 right-12 h-28 w-28 rounded-full bg-white/15 blur-3xl" />

                    {illustration && (
                        <div className="relative w-full max-w-140 px-3 sm:px-6 lg:px-4">
                            <div className="mx-auto max-w-130">
                                {illustration}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
};

export default AuthPageWrapper;