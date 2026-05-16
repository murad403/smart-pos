"use client";
import React, { useRef, useState, useEffect, KeyboardEvent, ClipboardEvent, use } from "react";
import Image from "next/image";
import { ArrowRight, Clock } from "lucide-react";
import verifyIllustration from "@/assets/auth/verifyotp.png";
import AuthPageWrapper from "@/components/wrapper/AuthWrapper";
import { useRouter } from "next/navigation";

const OTP_LENGTH = 4;
const TIMER_SECONDS = 10 * 60; // 10 minutes

/* ── Illustration ── */
const Illustration = () => (
    <Image
        src={verifyIllustration}
        alt="Email verification illustration"
        priority
        className="h-auto w-full drop-shadow-[0_24px_50px_rgba(37,99,235,0.16)]"
        sizes="(max-width: 1024px) 90vw, 50vw"
    />
);

/* ── Page ── */
export default function VerifyOtpPage({ params }: { params?: Promise<{ locale: string }> }) {
    if (params) use(params);
    const router = useRouter();
    const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
    const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    /* Countdown */
    useEffect(() => {
        if (timeLeft <= 0) return;
        const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, "0");
        const s = (seconds % 60).toString().padStart(2, "0");
        return `${m}:${s} s`;
    };

    const handleChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;
        const digit = value.slice(-1);
        const newOtp = [...otp];
        newOtp[index] = digit;
        setOtp(newOtp);
        if (digit && index < OTP_LENGTH - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace") {
            if (otp[index]) {
                const newOtp = [...otp];
                newOtp[index] = "";
                setOtp(newOtp);
            } else if (index > 0) {
                inputRefs.current[index - 1]?.focus();
            }
        }
        if (e.key === "ArrowLeft" && index > 0) inputRefs.current[index - 1]?.focus();
        if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
    };

    const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
        const newOtp = [...otp];
        pasted.split("").forEach((char, i) => { newOtp[i] = char; });
        setOtp(newOtp);
        inputRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
    };

    const handleResend = () => {
        setTimeLeft(TIMER_SECONDS);
        setOtp(Array(OTP_LENGTH).fill(""));
        inputRefs.current[0]?.focus();
    };

    const handleSubmit = async () => {
        const code = otp.join("");
        if (code.length < OTP_LENGTH) return;
        setIsSubmitting(true);
        console.log("OTP:", code);
        setIsSubmitting(false);
        router.push("/auth/reset-password");
    };

    return (
        <AuthPageWrapper illustration={<Illustration />}>
            <div className="space-y-6">
                {/* Heading */}
                <div className="space-y-2">
                    <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-[30px]">
                        Email OTP Verification
                    </h1>
                    <p className="text-sm leading-6 text-slate-500 sm:text-[15px]">
                        OTP sent to your Email Address ending ******doe@example.com
                    </p>
                </div>

                {/* OTP inputs */}
                <div className="flex gap-3 sm:gap-4">
                    {otp.map((digit, index) => (
                        <input
                            key={index}
                            ref={(el) => { inputRefs.current[index] = el; }}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            onPaste={handlePaste}
                            className={`h-16 w-full max-w-20 rounded-lg border-2 bg-white text-center text-xl font-semibold text-slate-900 outline-none transition focus:border-[#2f6de3] focus:ring-4 focus:ring-[#2f6de3]/10 ${digit ? "border-[#2f6de3]" : "border-slate-200"
                                }`}
                            aria-label={`OTP digit ${index + 1}`}
                        />
                    ))}
                </div>

                {/* Timer */}
                <div className="flex items-center gap-1.5 text-sm text-rose-500">
                    <Clock className="size-4" />
                    <span className="font-medium">{formatTime(timeLeft)}</span>
                </div>

                {/* Resend */}
                <p className="text-sm text-slate-500">
                    Didn&apos;t get the OTP?{" "}
                    <button
                        type="button"
                        onClick={handleResend}
                        className="font-semibold text-slate-800 hover:text-[#3f82f6] hover:underline"
                    >
                        Resend OTP
                    </button>
                </p>

                {/* Submit */}
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting || otp.join("").length < OTP_LENGTH}
                    className="inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#3f82f6] px-4 text-sm font-semibold text-white shadow-[0_16px_28px_-18px_rgba(63,130,246,0.9)] transition hover:-translate-y-0.5 hover:bg-[#3277ef] disabled:cursor-not-allowed disabled:opacity-70"
                >
                    Verify &amp; Proceed
                    <ArrowRight className="size-4" />
                </button>
            </div>
        </AuthPageWrapper>
    );
}