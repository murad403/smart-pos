"use client";
import React, { useRef, useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Wallet, TrendingUp, ArrowUpRight, Lock, Camera, Upload, X, Loader2, CheckCircle2, Info, Calendar } from "lucide-react";
import { useGetTodayPaymentsSummaryQuery, useTodayPaymentsVerifyMutation } from "@/redux/features/dashboard/dashboard.api";
import { getUserData } from "@/utils/auth";
import { toast } from "sonner";
import { openCameraStream, captureImageFromFile } from "@/lib/openCamera";
import { TodayPaymentVerifySchema, TodayPaymentVerifyFormValues } from "@/validation/payment.validation";

const formatCurrency = (value: number) =>
    `Rp ${Number(value || 0).toLocaleString("en-US")}`;

const formatDate = (date: Date) =>
    date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });

const TodayPaymentVerification = () => {
    const { data: summaryRes, isLoading: isSummaryLoading } = useGetTodayPaymentsSummaryQuery(undefined);
    const summary = summaryRes?.data;
    const [todayPaymentsVerify, { isLoading: isSubmitting }] = useTodayPaymentsVerifyMutation();

    // Cash-Out & Proof File States
    const [cashDepositFile, setCashDepositFile] = useState<File | null>(null);
    const [cashDepositPreview, setCashDepositPreview] = useState<string | null>(null);
    const cashDepositInputRef = useRef<HTMLInputElement | null>(null);

    // Closing State (Proof Images / Closing Cash Photo)
    const [proofFile, setProofFile] = useState<File | null>(null);
    const [proofPreview, setProofPreview] = useState<string | null>(null);
    const proofInputRef = useRef<HTMLInputElement | null>(null);

    // Camera Stream State
    const cameraVideoRef = useRef<HTMLVideoElement | null>(null);
    const cameraStreamRef = useRef<MediaStream | null>(null);
    const cameraCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);

    // React Hook Form
    const { register, handleSubmit, setValue, watch, reset } = useForm<TodayPaymentVerifyFormValues>({
        resolver: zodResolver(TodayPaymentVerifySchema) as any,
        defaultValues: {
            cashIn: undefined,
            actualIncomeCash: undefined,
            actualTransfer: undefined,
            actualSales: undefined,
            expensesCash: undefined,
            expenseRemark: "",
            remark: "",
        },
    });

    const watchedCashIn = watch("cashIn");
    const watchedActualIncomeCash = watch("actualIncomeCash");
    const watchedActualTransfer = watch("actualTransfer");
    const watchedExpensesCash = watch("expensesCash");

    // Auto-update actualSales when actualIncomeCash or actualTransfer changes
    const handleActualIncomeCashChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value ? Number(e.target.value) : undefined;
        setValue("actualIncomeCash", val);
        const cashNum = val || 0;
        const transferNum = Number(watchedActualTransfer) || 0;
        setValue("actualSales", cashNum + transferNum);
    };

    const handleActualTransferChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value ? Number(e.target.value) : undefined;
        setValue("actualTransfer", val);
        const cashNum = Number(watchedActualIncomeCash) || 0;
        const transferNum = val || 0;
        setValue("actualSales", cashNum + transferNum);
    };

    // Calculations
    const openingCash = Number(summary?.openingCash ?? 0);
    const totalOpeningCash = useMemo(() => {
        return openingCash + (Number(watchedCashIn) || 0);
    }, [openingCash, watchedCashIn]);

    const closingCash = useMemo(() => {
        const incomeCashNum = Number(watchedActualIncomeCash) || 0;
        const expensesCashNum = Number(watchedExpensesCash) || 0;
        return totalOpeningCash + incomeCashNum - expensesCashNum;
    }, [totalOpeningCash, watchedActualIncomeCash, watchedExpensesCash]);

    useEffect(() => {
        return () => {
            cameraStreamRef.current?.getTracks().forEach((track) => track.stop());
        };
    }, []);

    useEffect(() => {
        if (!isCameraOpen) {
            cameraStreamRef.current?.getTracks().forEach((track) => track.stop());
            cameraStreamRef.current = null;
            return;
        }

        const startCamera = async () => {
            try {
                setCameraError(null);
                const stream = await openCameraStream();
                cameraStreamRef.current = stream;

                if (cameraVideoRef.current) {
                    cameraVideoRef.current.srcObject = stream;
                    await cameraVideoRef.current.play();
                }
            } catch (error: any) {
                setCameraError(error?.message || "Unable to open the camera.");
                setIsCameraOpen(false);
            }
        };

        void startCamera();
    }, [isCameraOpen]);

    const closeCamera = () => {
        cameraStreamRef.current?.getTracks().forEach((track) => track.stop());
        cameraStreamRef.current = null;
        setIsCameraOpen(false);
    };

    const openCamera = async () => {
        if (!navigator.mediaDevices?.getUserMedia) {
            setCameraError("Camera is not supported in this browser.");
            return;
        }
        setCameraError(null);
        setIsCameraOpen(true);
    };

    const captureCameraImage = async () => {
        try {
            const file = await captureImageFromFile(
                cameraVideoRef.current,
                cameraCanvasRef.current
            );
            if (!file) {
                setCameraError("Camera is not ready yet.");
                return;
            }

            setProofFile(file);
            setProofPreview(URL.createObjectURL(file));
            closeCamera();
        } catch (error: any) {
            setCameraError(error?.message || "Failed to capture image.");
        }
    };

    const handleProofFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setProofFile(file);
            setProofPreview(URL.createObjectURL(file));
        }
    };

    const handleRemoveProofFile = () => {
        setProofFile(null);
        setProofPreview(null);
        if (proofInputRef.current) proofInputRef.current.value = "";
    };

    const handleCashDepositFileChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = e.target.files?.[0];
        if (file) {
            setCashDepositFile(file);
            setCashDepositPreview(URL.createObjectURL(file));
        }
    };

    const handleRemoveCashDepositFile = () => {
        setCashDepositFile(null);
        setCashDepositPreview(null);
        if (cashDepositInputRef.current) cashDepositInputRef.current.value = "";
    };

    const onSubmit = async (values: TodayPaymentVerifyFormValues) => {
        if (!proofFile) {
            toast.error("Upload Closing Cash Photo is mandatory");
            return;
        }

        const userData = getUserData();
        const verifiedById = userData?.id ?? 9;

        const parsedOpeningCash = openingCash;
        const parsedCashIn = Number(values.cashIn) || 0;
        const parsedTotalOpeningCash = totalOpeningCash;

        const parsedIncomeCash = Number(summary?.incomeCash ?? 0);
        const parsedActualIncomeCash = Number(values.actualIncomeCash) || 0;
        const parsedIncomeTransfer = Number(summary?.incomeTransfer ?? 0);
        const parsedActualTransfer = Number(values.actualTransfer) || 0;
        const parsedTotalSales = Number(
            summary?.totalAmount ?? parsedIncomeCash + parsedIncomeTransfer
        );
        const parsedActualSales =
            Number(values.actualSales) || parsedActualIncomeCash + parsedActualTransfer;

        const parsedExpensesCash = Number(values.expensesCash) || 0;
        const parsedClosingCash = closingCash;

        const payloadData = {
            openingCash: parsedOpeningCash,
            cashIn: parsedCashIn,
            totalOpeningCash: parsedTotalOpeningCash,

            incomeCash: parsedIncomeCash,
            actualIncomeCash: parsedActualIncomeCash,
            incomeTransfer: parsedIncomeTransfer,
            actualTransfer: parsedActualTransfer,
            totalSales: parsedTotalSales,
            actualSales: parsedActualSales,

            expensesCash: parsedExpensesCash,
            expenseRemark: values.expenseRemark?.trim() || undefined,
            cashDeposit: [],

            closingCash: parsedClosingCash,
            proofImages: [],

            remark: values.expenseRemark?.trim() || "Daily cash reconciliation verified",
            verifiedById,
        };

        const formData = new FormData();
        formData.append("data", JSON.stringify(payloadData));

        if (proofFile) {
            formData.append("proofImages", proofFile);
        }

        if (cashDepositFile) {
            formData.append("cashDeposit", cashDepositFile);
        }

        try {
            const res = await todayPaymentsVerify(formData).unwrap();
            if (res.success) {
                toast.success(res.message || "Payment verification created successfully");
                reset();
                handleRemoveProofFile();
                handleRemoveCashDepositFile();

                if (res.data?.whatsappUrl) {
                    // window.location.href = res.data.whatsappUrl;
                    window.open(res.data.whatsappUrl, '_blank', 'noopener,noreferrer');
                }
            } else {
                toast.error(res.message || "Failed to verify payment");
            }
        } catch (err: any) {
            toast.error(
                err?.data?.message || err?.message || "Failed to verify payment"
            );
        }
    };

    return (
        <div className="mt-6 rounded-3xl bg-[#EEF4FF] p-5 sm:p-7 shadow-xs border border-blue-100/80">
            <form onSubmit={handleSubmit(onSubmit)}>
                {/* ── Header Row ── */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-blue-100/60">
                    <div className="flex items-center gap-3.5">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/20 shrink-0">
                            <Wallet size={24} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                                    Cash Reconciliation
                                </h2>
                                {summary?.alreadyVerified > 0 && (
                                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                                        <CheckCircle2 size={12} />
                                        Verified
                                    </span>
                                )}
                            </div>
                            <p className="text-xs font-medium text-slate-500 mt-0.5">
                                Daily cash summary and verification
                            </p>
                        </div>
                    </div>

                    {/* Date Badge */}
                    <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl border border-slate-200/80 shadow-xs self-start sm:self-auto">
                        <div className="text-right">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                Date
                            </p>
                            <p className="text-sm font-bold text-slate-900">
                                {formatDate(new Date())}
                            </p>
                        </div>
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                            <Calendar size={18} />
                        </div>
                    </div>
                </div>

                {/* ── 4 Columns Grid ── */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mt-5">
                    {/* Card 1: 1. Opening */}
                    <div className="flex flex-col justify-between rounded-2xl bg-white p-4 border border-blue-100/80 shadow-xs">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs mb-4">
                                <Wallet size={14} />
                                <span>1. Opening</span>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs font-semibold text-slate-600">Opening Cash</p>
                                    {isSummaryLoading ? (
                                        <div className="h-7 w-28 rounded-lg bg-slate-100 animate-pulse mt-1" />
                                    ) : (
                                        <p className="text-xl font-extrabold text-blue-600 mt-0.5">
                                            {formatCurrency(openingCash)}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <div className="flex items-center gap-1 mb-1">
                                        <label htmlFor="cashIn" className="text-xs font-semibold text-slate-600">
                                            Cash In
                                        </label>
                                        <Info size={13} className="text-blue-500 cursor-help" />
                                    </div>
                                    <div className="relative flex items-center rounded-xl border border-slate-200 bg-slate-50/50 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all overflow-hidden">
                                        <span className="bg-slate-100 px-3 py-2 text-xs font-bold text-slate-500 border-r border-slate-200">
                                            Rp
                                        </span>
                                        <input
                                            id="cashIn"
                                            type="number"
                                            step="0.01"
                                            {...register("cashIn")}
                                            placeholder="Enter amount"
                                            className="w-full px-3 py-2 text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400 bg-transparent"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100">
                            <p className="text-xs font-semibold text-slate-600">Total Opening</p>
                            <p className="text-xl font-extrabold text-blue-600 mt-0.5">
                                {formatCurrency(totalOpeningCash)}
                            </p>
                        </div>
                    </div>

                    {/* Card 2: 2. Sales */}
                    <div className="flex flex-col justify-between rounded-2xl bg-white p-4 border border-blue-100/80 shadow-xs">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs mb-4">
                                <TrendingUp size={14} />
                                <span>2. Sales</span>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs font-semibold text-slate-600">Income Cash</p>
                                    <p className="text-lg font-extrabold text-blue-600 mt-0.5">
                                        {formatCurrency(Number(summary?.incomeCash ?? 0))}
                                    </p>
                                </div>

                                <div>
                                    <label htmlFor="actualIncomeCash" className="block text-xs font-semibold text-slate-600 mb-1">
                                        Actual Amount <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative flex items-center rounded-xl border border-slate-200 bg-slate-50/50 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all overflow-hidden">
                                        <span className="bg-slate-100 px-3 py-2 text-xs font-bold text-slate-500 border-r border-slate-200">
                                            Rp
                                        </span>
                                        <input
                                            id="actualIncomeCash"
                                            type="number"
                                            step="0.01"
                                            {...register("actualIncomeCash", {
                                                onChange: handleActualIncomeCashChange,
                                            })}
                                            placeholder="Enter amount"
                                            className="w-full px-3 py-2 text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400 bg-transparent"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <p className="text-xs font-semibold text-slate-600">Income Transfer</p>
                                    <p className="text-lg font-extrabold text-blue-600 mt-0.5">
                                        {formatCurrency(Number(summary?.incomeTransfer ?? 0))}
                                    </p>
                                </div>

                                <div>
                                    <label htmlFor="actualTransfer" className="block text-xs font-semibold text-slate-600 mb-1">
                                        Actual Amount <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative flex items-center rounded-xl border border-slate-200 bg-slate-50/50 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all overflow-hidden">
                                        <span className="bg-slate-100 px-3 py-2 text-xs font-bold text-slate-500 border-r border-slate-200">
                                            Rp
                                        </span>
                                        <input
                                            id="actualTransfer"
                                            type="number"
                                            step="0.01"
                                            {...register("actualTransfer", {
                                                onChange: handleActualTransferChange,
                                            })}
                                            placeholder="Enter amount"
                                            className="w-full px-3 py-2 text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400 bg-transparent"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                            <div>
                                <p className="text-xs font-semibold text-slate-600">Total Sales</p>
                                <p className="text-lg font-extrabold text-blue-600 mt-0.5">
                                    {formatCurrency(Number(summary?.totalAmount ?? 0))}
                                </p>
                            </div>
                            <div>
                                <label htmlFor="actualSales" className="block text-xs font-semibold text-slate-600 mb-1">
                                    Actual Total Income <span className="text-red-500">*</span>
                                </label>
                                <div className="relative flex items-center rounded-xl border border-slate-200 bg-slate-50/50 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all overflow-hidden">
                                    <span className="bg-slate-100 px-3 py-2 text-xs font-bold text-slate-500 border-r border-slate-200">
                                        Rp
                                    </span>
                                    <input
                                        id="actualSales"
                                        type="number"
                                        step="0.01"
                                        {...register("actualSales")}
                                        placeholder="Enter amount"
                                        className="w-full px-3 py-2 text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400 bg-transparent"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card 3: 3. Cash-Out */}
                    <div className="flex flex-col justify-between rounded-2xl bg-white p-4 border border-blue-100/80 shadow-xs">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs mb-4">
                                <ArrowUpRight size={14} />
                                <span>3. Cash-Out</span>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <label htmlFor="expensesCash" className="block text-xs font-semibold text-slate-600 mb-1">
                                        Expenses Cash
                                    </label>
                                    <div className="relative flex items-center rounded-xl border border-slate-200 bg-slate-50/50 focus-within:bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all overflow-hidden">
                                        <span className="bg-slate-100 px-3 py-2 text-xs font-bold text-slate-500 border-r border-slate-200">
                                            Rp
                                        </span>
                                        <input
                                            id="expensesCash"
                                            type="number"
                                            step="0.01"
                                            {...register("expensesCash")}
                                            placeholder="Enter amount"
                                            className="w-full px-3 py-2 text-sm font-medium text-slate-800 outline-none placeholder:text-slate-400 bg-transparent"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="expenseRemark" className="block text-xs font-semibold text-slate-600 mb-1">
                                        Remarks
                                    </label>
                                    <input
                                        id="expenseRemark"
                                        type="text"
                                        {...register("expenseRemark")}
                                        placeholder="Enter remarks"
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm font-medium text-slate-800 outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 placeholder:text-slate-400 transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100">
                            <p className="text-xs font-semibold text-slate-700">Cash Deposit</p>
                            <p className="text-[11px] text-slate-400 font-medium mb-2">
                                Proof of Deposit (Upload Image) Optional
                            </p>

                            <input
                                type="file"
                                accept="image/*"
                                ref={cashDepositInputRef}
                                onChange={handleCashDepositFileChange}
                                className="hidden"
                            />

                            {cashDepositPreview ? (
                                <div className="relative h-20 w-full rounded-xl overflow-hidden border border-slate-200 group">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={cashDepositPreview}
                                        alt="Cash Deposit Proof"
                                        className="w-full h-full object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleRemoveCashDepositFile}
                                        className="absolute top-1.5 right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-md hover:bg-red-600 transition-all"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => cashDepositInputRef.current?.click()}
                                    className="flex w-full h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-all"
                                >
                                    <Upload size={14} />
                                    <span>Upload Image</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Card 4: 4. Closing */}
                    <div className="flex flex-col justify-between rounded-2xl bg-white p-4 border border-blue-100/80 shadow-xs">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs mb-4">
                                <Lock size={14} />
                                <span>4. Closing</span>
                            </div>

                            <div>
                                <p className="text-xs font-semibold text-slate-600">Closing Cash</p>
                                <p className="text-xl font-extrabold text-blue-600 mt-0.5">
                                    {formatCurrency(closingCash)}
                                </p>
                            </div>

                            <div className="mt-4">
                                <p className="text-xs font-semibold text-slate-700">
                                    Upload Closing Cash Photo <span className="text-red-500 font-normal">(Mandatory)</span>
                                </p>

                                <input
                                    type="file"
                                    accept="image/*"
                                    ref={proofInputRef}
                                    onChange={handleProofFileChange}
                                    className="hidden"
                                />

                                {proofPreview ? (
                                    <div className="relative mt-2 h-28 w-full rounded-2xl overflow-hidden border border-slate-200 shadow-xs group">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={proofPreview}
                                            alt="Closing Cash Proof"
                                            className="w-full h-full object-cover"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleRemoveProofFile}
                                            className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white shadow-md hover:bg-red-600 transition-all"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="mt-2 border-2 border-dashed border-slate-200 rounded-2xl p-4 bg-slate-50/50 hover:bg-blue-50/50 hover:border-blue-300 transition-all flex flex-col items-center justify-center gap-2.5 min-h-27.5">
                                        <div className="flex gap-2">
                                            <button
                                                type="button"
                                                onClick={openCamera}
                                                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-xs hover:border-blue-400 hover:text-blue-600 transition-all"
                                            >
                                                <Camera size={14} />
                                                <span>Take Photo</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => proofInputRef.current?.click()}
                                                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-xs hover:border-blue-400 hover:text-blue-600 transition-all"
                                            >
                                                <Upload size={14} />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <p className="text-[11px] font-medium text-slate-400 text-center mt-2">
                                    Upload clear photo of the closing cash.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Bottom Bar ── */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-6">
                    <div className="flex items-center gap-3 rounded-2xl bg-blue-100/70 border border-blue-200/60 px-4 py-3 text-xs font-medium text-blue-950 flex-1 shadow-xs">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white shrink-0">
                            <Info size={14} />
                        </div>
                        <p>
                            <strong className="font-bold">Closing Cash</strong> = Opening Cash + Cash In + Actual Cash Income - Expenses Cash - Cash Deposit
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="h-12 px-9 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-600/25 transition-all disabled:opacity-60 flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                <span>Submitting...</span>
                            </>
                        ) : (
                            <span>Submit</span>
                        )}
                    </button>
                </div>
            </form>

            {/* ── Camera Preview Modal ── */}
            {isCameraOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4 py-6 backdrop-blur-xs">
                    <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-slate-950 shadow-2xl border border-slate-800">
                        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3 text-white bg-slate-900">
                            <div>
                                <p className="text-sm font-semibold">Camera Preview</p>
                                <p className="text-xs text-white/70">
                                    Frame the proof image and capture it in real time.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={closeCamera}
                                className="rounded-full p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <div className="relative aspect-4/3 bg-black">
                            <video
                                ref={cameraVideoRef}
                                autoPlay
                                muted
                                playsInline
                                className="h-full w-full object-cover"
                            />
                            <canvas ref={cameraCanvasRef} className="hidden" />

                            {cameraError ? (
                                <div className="absolute inset-0 flex items-center justify-center bg-slate-950/90 px-4 text-center text-sm text-white">
                                    <div>
                                        <p className="font-semibold">{cameraError}</p>
                                        <p className="mt-1 text-white/70">
                                            Use a secure browser context and allow camera access.
                                        </p>
                                    </div>
                                </div>
                            ) : null}

                            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 bg-black/55 p-3">
                                <button
                                    type="button"
                                    onClick={closeCamera}
                                    className="h-10 rounded-xl border border-white/20 bg-white/10 px-4 text-white hover:bg-white/20 transition-all text-xs font-semibold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={captureCameraImage}
                                    className="h-12 rounded-full bg-blue-600 hover:bg-blue-700 px-5 text-white flex items-center gap-2 text-xs font-semibold transition-all"
                                >
                                    <Camera size={16} />
                                    Capture Photo
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TodayPaymentVerification;