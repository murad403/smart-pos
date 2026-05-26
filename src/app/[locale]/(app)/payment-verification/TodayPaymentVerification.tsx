"use client";

import React, { useRef, useState } from "react";
import { Upload, X, Loader2, CheckCircle2 } from "lucide-react";
import {
    useGetTodayPaymentsSummaryQuery,
    useTodayPaymentsVerifyMutation,
} from "@/redux/features/dashboard/dashboard.api";
import { getUserData } from "@/utils/auth";
import { toast } from "sonner";

const formatCurrency = (value: number) =>
    `Rp ${value.toLocaleString("en-US")}`;

const formatDate = (date: Date) =>
    date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });

const TodayPaymentVerification = () => {
    const { data: summaryRes, isLoading: isSummaryLoading } =
        useGetTodayPaymentsSummaryQuery(undefined);
    const summary = summaryRes?.data;

    const [todayPaymentsVerify, { isLoading: isSubmitting }] =
        useTodayPaymentsVerifyMutation();

    const [actualAmount, setActualAmount] = useState("");
    const [remark, setRemark] = useState("");
    const [proofFile, setProofFile] = useState<File | null>(null);
    const [proofPreview, setProofPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setProofFile(file);
        setProofPreview(URL.createObjectURL(file));
    };

    const handleRemoveFile = () => {
        setProofFile(null);
        setProofPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!actualAmount.trim()) {
            toast.error("Actual amount is required");
            return;
        }
        if (!proofFile) {
            toast.error("Proof of deposit image is required");
            return;
        }

        const userData = getUserData();
        const verifiedById = userData?.id ?? 9;

        const formData = new FormData();
        formData.append(
            "data",
            JSON.stringify({
                totalAmount: Number(summary?.totalAmount ?? 0),
                actualAmount: Number(actualAmount),
                remark: remark.trim() || undefined,
                verifiedById,
            })
        );
        formData.append("proofImages", proofFile);

        try {
            const res = await todayPaymentsVerify(formData).unwrap();
            if (res.success) {
                toast.success("Today's payment verified successfully");
                setActualAmount("");
                setRemark("");
                handleRemoveFile();
            } else {
                toast.error(res.message || "Failed to verify payment");
            }
        } catch (err: any) {
            toast.error(err?.data?.message || err?.message || "Failed to verify payment");
        }
    };

    return (
        <div className="mt-6 rounded-2xl bg-[#E3EBFB] p-5 sm:p-6">
            <form onSubmit={handleSubmit}>

                {/* ── Row 1: Date | divider | Total Sales | divider | Actual Amount ── */}
                <div className="flex flex-wrap items-center gap-0">

                    {/* Date */}
                    <div className="pr-6">
                        <p className="text-xs font-medium text-slate-500 mb-1">Date</p>
                        <p className="text-2xl font-bold text-slate-900 whitespace-nowrap">
                            {formatDate(new Date())}
                        </p>
                    </div>

                    {/* Vertical divider */}
                    <div className="hidden sm:block h-12 w-px bg-slate-300 mr-6" />

                    {/* Total Sales */}
                    <div className="pr-6">
                        <p className="text-xs font-medium text-slate-500 mb-1">Total Sales</p>
                        {isSummaryLoading ? (
                            <div className="h-8 w-32 rounded-lg bg-slate-200 animate-pulse" />
                        ) : (
                            <>
                                <p className="text-2xl font-bold text-blue-600 whitespace-nowrap">
                                    {formatCurrency(Number(summary?.totalAmount ?? 0))}
                                </p>
                                {summary?.alreadyVerified > 0 && (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 mt-0.5">
                                        <CheckCircle2 size={11} />
                                        Already verified today
                                    </span>
                                )}
                            </>
                        )}
                    </div>

                    {/* Actual Amount — pushed right on larger screens */}
                    <div className="ml-auto w-full sm:w-56 mt-3 sm:mt-0">
                        <label
                            htmlFor="actualAmount"
                            className="block text-xs font-medium text-slate-500 mb-1"
                        >
                            Actual Amount
                        </label>
                        <input
                            id="actualAmount"
                            type="number"
                            min="0"
                            step="0.01"
                            value={actualAmount}
                            onChange={(e) => setActualAmount(e.target.value)}
                            placeholder="Enter amount"
                            className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition-all focus:border-blue-400 focus:ring-2 focus:ring-blue-100 placeholder:text-slate-400"
                        />
                    </div>
                </div>

                {/* ── Row 2: Remarks | Proof of Deposit | Submit ── */}
                <div className="mt-5 flex flex-wrap items-end gap-3">

                    {/* Remarks */}
                    <div className="flex-1 min-w-45">
                        <label
                            htmlFor="remark"
                            className="block text-xs font-medium text-slate-500 mb-1"
                        >
                            Remarks
                        </label>
                        <textarea
                            id="remark"
                            rows={2}
                            value={remark}
                            onChange={(e) => setRemark(e.target.value)}
                            placeholder="Enter remarks"
                            className="w-full rounded-lg min-h-20 border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none resize-none transition-all focus:border-blue-400 focus:ring-2 focus:ring-blue-100 placeholder:text-slate-400"
                        />
                    </div>

                    {/* Proof of Deposit */}
                    <div className="flex flex-col gap-1 mb-2">
                        <p className="text-xs font-medium text-slate-500">Proof of Deposit</p>

                        {proofPreview ? (
                            <div className="relative h-15.5 w-36.25 rounded-lg overflow-hidden border border-slate-200">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={proofPreview}
                                    alt="Proof"
                                    className="w-full h-full object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={handleRemoveFile}
                                    className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow"
                                >
                                    <X size={11} />
                                </button>
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="flex h-13 w-36.25 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white text-sm font-semibold text-slate-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                            >
                                <Upload size={16} />
                                Upload Image
                            </button>
                        )}

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="h-13 min-w-25 rounded-lg bg-blue-600 px-6 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-60 transition-all flex items-center justify-center gap-2 mb-2"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 size={15} className="animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            "Submit"
                        )}
                    </button>
                </div>

            </form>
        </div>
    );
};

export default TodayPaymentVerification;