import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import AuthPageWrapper from "@/components/wrapper/AuthWrapper";
import Image from "next/image";
import success from "@/assets/auth/success.png";


const Illustration = () => (
    <Image
        src={success}
        alt="Reset password illustration"
        priority
        className="h-auto w-full drop-shadow-[0_24px_50px_rgba(37,99,235,0.16)]"
        sizes="(max-width: 1024px) 90vw, 50vw"
    />
);


export default async function VerifySuccessPage({ params }: { params?: Promise<{ locale: string }> }) {
    if (params) await params;
    return (
        <AuthPageWrapper illustration={<Illustration />}>
            <div className="flex flex-col items-center space-y-5 text-center">
                <CheckCircle2
                    className="size-16 text-emerald-500"
                    strokeWidth={1.8}
                />

                <div className="space-y-2">
                    <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-[28px]">
                        Success
                    </h1>
                    <p className="text-sm leading-6 text-slate-500 sm:text-[15px]">
                        Your new password has been successfully saved
                    </p>
                </div>

                <Link
                    href="/auth/sign-in"
                    className="inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#3f82f6] px-4 text-sm font-semibold text-white shadow-[0_16px_28px_-18px_rgba(63,130,246,0.9)] transition hover:-translate-y-0.5 hover:bg-[#3277ef]"
                >
                    Back to Sign In
                </Link>
            </div>
        </AuthPageWrapper>
    );
}