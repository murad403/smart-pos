"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Power, CheckCircle2, AlertCircle, Upload, Check, Clock, X, Loader2, Image as ImageIcon } from "lucide-react";
import { getUserData } from "@/utils/auth";
import { useSearchParams } from "next/navigation";
import { useGetCurrentShiftQuery, useCloseShiftMutation, useGetShiftQuery, useUploadCashProofMutation, useVerifyCashProofMutation } from "@/redux/features/workflow/workflow.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "@/i18n/routing";



const ActiveShiftSkeleton = () => {
    return (
        <div className="space-y-6">
            {/* Active Status Header Banner Skeleton */}
            <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                    <Skeleton className="size-12 rounded-xl bg-slate-200" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-20 bg-slate-200" />
                        <Skeleton className="h-5 w-40 bg-slate-200" />
                    </div>
                </div>
                <div className="flex gap-6">
                    <div className="space-y-2">
                        <Skeleton className="h-3 w-16 bg-slate-200" />
                        <Skeleton className="h-4 w-32 bg-slate-200" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="h-3 w-20 bg-slate-200" />
                        <Skeleton className="h-4 w-24 bg-slate-200" />
                    </div>
                </div>
            </div>

            {/* Main Core Controls Dashboard Skeleton */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="space-y-6">
                    {/* Checklists Card Skeleton */}
                    <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm space-y-6">
                        <div className="space-y-2 border-b border-slate-100 pb-4">
                            <Skeleton className="h-6 w-40 bg-slate-200" />
                            <Skeleton className="h-4 w-64 bg-slate-200" />
                        </div>
                        <div className="space-y-4">
                            <Skeleton className="h-16 w-full rounded-2xl bg-slate-200" />
                            <Skeleton className="h-16 w-full rounded-2xl bg-slate-200" />
                            <Skeleton className="h-16 w-full rounded-2xl bg-slate-200" />
                        </div>
                    </div>

                    {/* Cash Drawer Reconciliation Skeleton */}
                    <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                        <div className="space-y-2 border-b border-slate-100 pb-4">
                            <Skeleton className="h-6 w-36 bg-slate-200" />
                            <Skeleton className="h-4 w-56 bg-slate-200" />
                        </div>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <Skeleton className="h-12 w-full rounded-xl bg-slate-200" />
                            <Skeleton className="h-12 w-full rounded-xl bg-slate-200" />
                        </div>
                    </div>

                    {/* Close button skeleton */}
                    <Skeleton className="h-14 w-full rounded-2xl bg-slate-200" />
                </div>

                {/* Right Column: Upload Skeleton */}
                <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm space-y-6">
                    <div className="space-y-2 border-b border-slate-100 pb-4">
                        <Skeleton className="h-6 w-28 bg-slate-200" />
                        <Skeleton className="h-4 w-60 bg-slate-200" />
                    </div>
                    <Skeleton className="h-44 w-full rounded-2xl bg-slate-200" />
                    <div className="space-y-3">
                        <Skeleton className="h-20 w-full rounded-2xl bg-slate-200" />
                        <Skeleton className="h-20 w-full rounded-2xl bg-slate-200" />
                    </div>
                </div>
            </div>
        </div>
    );
};

const OpenShiftInner = () => {
    const t = useTranslations("ShiftWorkflow");
    const router = useRouter();
    const searchParams = useSearchParams();

    // Current logged in user from cookie
    const [currentUser, setCurrentUser] = useState<any>(null);
    const [targetUserId, setTargetUserId] = useState<number>(0);

    useEffect(() => {
        const userData = getUserData();
        setCurrentUser(userData);

        const queryUserId = searchParams.get("userId");
        if (queryUserId) {
            setTargetUserId(Number(queryUserId));
        } else if (userData) {
            setTargetUserId(userData.id);
        }
    }, [searchParams]);

    // Fetch current shift session for selected user
    const {
        data: currentShiftRes,
        isLoading: isShiftLoading,
        isFetching: isShiftFetching
    } = useGetCurrentShiftQuery(targetUserId, { skip: !targetUserId });
    const currentShift = currentShiftRes?.data;

    // Redirect back if shift load completes and there is no active session
    useEffect(() => {
        if (isShiftLoading || isShiftFetching) return;
        if (currentShiftRes && !currentShift) {
            toast.error("No active shift session found for this user");
            router.push("/shift-workflow");
        }
    }, [currentShift, currentShiftRes, isShiftLoading, isShiftFetching, router]);

    // Mutations
    const [closeShift, { isLoading: isCloseShiftLoading }] = useCloseShiftMutation();
    const [uploadCashProof, { isLoading: isUploadingProof }] = useUploadCashProofMutation();
    const [verifyCashProof, { isLoading: isVerifyingProof }] = useVerifyCashProofMutation();

    // Close shift state form
    const [openingCashAmount, setOpeningCashAmount] = useState<string>("");
    const [closingCashAmount, setClosingCashAmount] = useState<string>("");

    // Checklist confirmation toggles (unselected is false, or skipped)
    const [inventoryAccurate, setInventoryAccurate] = useState<boolean>(false);
    const [skippedInventory, setSkippedInventory] = useState<boolean>(false);

    const [promotionConfirmed, setPromotionConfirmed] = useState<boolean>(false);
    const [skippedPromotion, setSkippedPromotion] = useState<boolean>(false);

    const [salesConfirmed, setSalesConfirmed] = useState<boolean>(false);
    const [skippedCash, setSkippedCash] = useState<boolean>(false);

    // Closed shift lookup for summary modal
    const [closedShiftId, setClosedShiftId] = useState<string | null>(null);
    const [isSummaryOpen, setIsSummaryOpen] = useState<boolean>(false);

    const { data: closedShiftRes, isLoading: isClosedShiftLoading } = useGetShiftQuery(
        closedShiftId as string,
        { skip: !closedShiftId }
    );
    const closedShiftDetails = closedShiftRes?.data;

    // Live timer for active shift duration
    const [duration, setDuration] = useState<string>("");

    useEffect(() => {
        if (!currentShift?.createdAt) {
            setDuration("");
            return;
        }

        const updateTimer = () => {
            const start = new Date(currentShift.createdAt).getTime();
            const now = new Date().getTime();
            const diff = now - start;
            if (diff < 0) {
                setDuration("00:00:00");
                return;
            }
            const hrs = Math.floor(diff / 3600000);
            const mins = Math.floor((diff % 3600000) / 60000);
            const secs = Math.floor((diff % 60000) / 1000);
            setDuration(
                `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
            );
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [currentShift?.createdAt]);

    const handleCloseShift = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentShift) return;

        if (!openingCashAmount || !closingCashAmount) {
            toast.error("Please fill in both opening and closing cash amounts");
            return;
        }

        // Require checklists to be either confirmed or skipped
        if (!inventoryAccurate && !skippedInventory) {
            toast.error("Please confirm or skip the inventory checklist");
            return;
        }
        if (!promotionConfirmed && !skippedPromotion) {
            toast.error("Please confirm or skip the promotion checklist");
            return;
        }
        if (!salesConfirmed && !skippedCash) {
            toast.error("Please confirm or skip the sales & cash checklist");
            return;
        }

        try {
            const payload = {
                openingCashAmount: Number(openingCashAmount),
                closingCashAmount: Number(closingCashAmount),
                inventoryAccurate,
                promotionConfirmed,
                salesConfirmed,
                skippedInventory,
                skippedPromotion,
                skippedCash
            };

            const res = await closeShift({ shiftId: currentShift.id, data: payload }).unwrap();
            toast.success(t("shiftClosedSuccessfully"));

            // Open the summary modal using the closed shift id
            if (res.data?.id) {
                setClosedShiftId(res.data.id);
                setIsSummaryOpen(true);
            }

            // Reset form states
            setOpeningCashAmount("");
            setClosingCashAmount("");
            setInventoryAccurate(false);
            setSkippedInventory(false);
            setPromotionConfirmed(false);
            setSkippedPromotion(false);
            setSalesConfirmed(false);
            setSkippedCash(false);
        } catch (err: any) {
            toast.error(err?.data?.message || err?.message || "Failed to close shift");
        }
    };

    const handleUploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !currentShift) return;

        const formData = new FormData();
        formData.append("cashProof", file);

        try {
            await uploadCashProof({
                shiftId: currentShift.id,
                currentUserId: currentUser?.id || targetUserId,
                data: formData
            }).unwrap();
            toast.success(t("cashProofUploaded"));
        } catch (err: any) {
            toast.error(err?.data?.message || err?.message || "Failed to upload proof");
        }
    };

    const handleVerifyProof = async (proofId: string) => {
        if (!currentShift || !currentUser) return;
        try {
            await verifyCashProof({
                shiftId: currentShift.id,
                proofId,
                data: { verifiedById: currentUser.id }
            }).unwrap();
            toast.success(t("cashProofVerified"));
        } catch (err: any) {
            toast.error(err?.data?.message || err?.message || "Failed to verify proof");
        }
    };

    const formatDateTime = (dateStr?: string) => {
        if (!dateStr) return "";
        try {
            const date = new Date(dateStr);
            return date.toLocaleString(undefined, {
                dateStyle: "medium",
                timeStyle: "short"
            });
        } catch {
            return dateStr;
        }
    };

    if (isShiftLoading || isShiftFetching || !currentShift) {
        return <ActiveShiftSkeleton />;
    }

    return (
        <div className="space-y-6">
            {/* Header Title */}
            <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">{t("title")}</h1>
                    <p className="text-sm text-slate-400 mt-1">{t("subtitle")}</p>
                </div>
            </div>

            {/* Active Status Header Banner */}
            <div className="flex flex-col gap-4 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between animate-fade-in">
                <div className="flex items-center gap-4">
                    <div className="relative flex size-12 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-sm">
                        <Clock className="size-6" />
                        <span className="absolute -right-0.5 -top-0.5 flex h-3 w-3">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500"></span>
                        </span>
                    </div>
                    <div>
                        <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                            {t("activeShift")}
                        </span>
                        <h3 className="mt-1 text-base font-bold text-slate-900">
                            Opened by <span className="font-semibold text-emerald-700">{currentShift.user?.name || currentShift.user?.email}</span>
                        </h3>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-6 text-sm text-slate-600">
                    <div className="space-y-0.5">
                        <p className="text-xs text-slate-400 font-medium">Started At</p>
                        <p className="font-bold text-slate-800">{formatDateTime(currentShift.createdAt)}</p>
                    </div>
                    <div className="h-8 w-px bg-slate-200 hidden sm:block" />
                    <div className="space-y-0.5">
                        <p className="text-xs text-slate-400 font-medium">Running Time</p>
                        <p className="font-extrabold font-mono text-emerald-600 text-lg leading-tight tracking-wider">
                            {duration || "00:00:00"}
                        </p>
                    </div>
                </div>
            </div>

            {/* Core Controls Dashboard */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

                {/* Reconciliation & Closing Form */}
                <form onSubmit={handleCloseShift} className="space-y-6">

                    {/* Checklists Card */}
                    <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm space-y-5">
                        <div className="space-y-1 border-b border-slate-100 pb-4">
                            <h3 className="text-lg font-bold text-slate-900">Workflow Checklist</h3>
                            <p className="text-xs text-slate-400">Complete task verification before closing session</p>
                        </div>

                        <div className="space-y-4">
                            {/* Checklist 1: Inventory */}
                            <div className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50/50 p-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="space-y-0.5">
                                    <p className="text-sm font-bold text-slate-800">{t("inventoryCheck")}</p>
                                    <p className="text-xs text-slate-500">Confirm physical stock matches values in POS logs</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setInventoryAccurate(true);
                                            setSkippedInventory(false);
                                        }}
                                        className={`rounded-xl px-4 py-2 text-xs font-bold transition-all shadow-sm ${inventoryAccurate && !skippedInventory
                                            ? "bg-emerald-500 text-white shadow-emerald-500/10"
                                            : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                                            }`}
                                    >
                                        Confirm
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setInventoryAccurate(false);
                                            setSkippedInventory(true);
                                        }}
                                        className={`rounded-xl px-4 py-2 text-xs font-bold transition-all shadow-sm ${!inventoryAccurate && skippedInventory
                                            ? "bg-slate-500 text-white shadow-slate-500/10"
                                            : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                                            }`}
                                    >
                                        {t("skip")}
                                    </button>
                                </div>
                            </div>

                            {/* Checklist 2: Promotions */}
                            <div className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50/50 p-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="space-y-0.5">
                                    <p className="text-sm font-bold text-slate-800">{t("promoCheck")}</p>
                                    <p className="text-xs text-slate-500">Verify actively running discount campaigns and rules</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setPromotionConfirmed(true);
                                            setSkippedPromotion(false);
                                        }}
                                        className={`rounded-xl px-4 py-2 text-xs font-bold transition-all shadow-sm ${promotionConfirmed && !skippedPromotion
                                            ? "bg-emerald-500 text-white shadow-emerald-500/10"
                                            : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                                            }`}
                                    >
                                        Confirm
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setPromotionConfirmed(false);
                                            setSkippedPromotion(true);
                                        }}
                                        className={`rounded-xl px-4 py-2 text-xs font-bold transition-all shadow-sm ${!promotionConfirmed && skippedPromotion
                                            ? "bg-slate-500 text-white shadow-slate-500/10"
                                            : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                                            }`}
                                    >
                                        {t("skip")}
                                    </button>
                                </div>
                            </div>

                            {/* Checklist 3: Sales Verification */}
                            <div className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50/50 p-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="space-y-0.5">
                                    <p className="text-sm font-bold text-slate-800">{t("salesCheck")}</p>
                                    <p className="text-xs text-slate-500">Reconcile transaction tallies against receipts</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSalesConfirmed(true);
                                            setSkippedCash(false);
                                        }}
                                        className={`rounded-xl px-4 py-2 text-xs font-bold transition-all shadow-sm ${salesConfirmed && !skippedCash
                                            ? "bg-emerald-500 text-white shadow-emerald-500/10"
                                            : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                                            }`}
                                    >
                                        Confirm
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSalesConfirmed(false);
                                            setSkippedCash(true);
                                        }}
                                        className={`rounded-xl px-4 py-2 text-xs font-bold transition-all shadow-sm ${!salesConfirmed && skippedCash
                                            ? "bg-slate-500 text-white shadow-slate-500/10"
                                            : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                                            }`}
                                    >
                                        {t("skip")}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Cash Drawer Reconciliation */}
                    <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm space-y-4">
                        <div className="space-y-1 border-b border-slate-100 pb-4">
                            <h3 className="text-lg font-bold text-slate-900">Cash Drawer Tally</h3>
                            <p className="text-xs text-slate-400">Reconcile opening and closing cash floats</p>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    {t("openingCash")}
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                                        Rp
                                    </span>
                                    <Input
                                        type="number"
                                        placeholder="0.00"
                                        value={openingCashAmount}
                                        onChange={(e) => setOpeningCashAmount(e.target.value)}
                                        required
                                        className="h-12 pl-11 rounded-xl border-slate-200 bg-slate-50 focus:bg-white text-sm font-semibold focus:ring-1 focus:ring-[#1A56DB] focus:border-[#1A56DB]"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    {t("closingCash")}
                                </label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                                        Rp
                                    </span>
                                    <Input
                                        type="number"
                                        placeholder="0.00"
                                        value={closingCashAmount}
                                        onChange={(e) => setClosingCashAmount(e.target.value)}
                                        required
                                        className="h-12 pl-11 rounded-xl border-slate-200 bg-slate-50 focus:bg-white text-sm font-semibold focus:ring-1 focus:ring-[#1A56DB] focus:border-[#1A56DB]"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Submit */}
                    <Button
                        type="submit"
                        disabled={isCloseShiftLoading}
                        className="w-full h-14 rounded-2xl bg-red-600 text-[15px] font-bold text-white shadow-lg shadow-red-500/10 hover:bg-red-700 disabled:opacity-50 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
                    >
                        {isCloseShiftLoading ? (
                            <Loader2 className="size-5 animate-spin" />
                        ) : (
                            <Power className="size-5" />
                        )}
                        {t("closeShift")}
                    </Button>
                </form>

                {/* Right Column: Cash Proofs & Uploads */}
                <div className="space-y-6">

                    {/* Dropzone Container */}
                    <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm space-y-6">
                        <div className="space-y-1 border-b border-slate-100 pb-4">
                            <h3 className="text-lg font-bold text-slate-900">{t("cashProof")}</h3>
                            <p className="text-xs text-slate-400">Upload drawer snapshots or bank deposit slips</p>
                        </div>

                        {/* Upload Trigger Area */}
                        <div className="relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 py-10 text-center hover:bg-slate-50 hover:border-[#1A56DB] transition cursor-pointer">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleUploadFile}
                                disabled={isUploadingProof}
                                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                            />
                            <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-blue-50 text-[#1A56DB] shadow-sm">
                                {isUploadingProof ? (
                                    <Loader2 className="size-6 animate-spin" />
                                ) : (
                                    <Upload className="size-6" />
                                )}
                            </div>
                            <p className="text-sm font-extrabold text-slate-800">
                                {isUploadingProof ? "Uploading..." : t("uploadProof")}
                            </p>
                            <p className="mt-1 text-xs text-slate-400">PNG, JPG or JPEG (max 5MB)</p>
                        </div>

                        {/* Uploaded List */}
                        <div className="space-y-4">
                            {(!currentShift.cashProofs || currentShift.cashProofs.length === 0) ? (
                                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/30 p-8 text-center text-sm text-slate-400">
                                    <ImageIcon className="mx-auto mb-2 size-8 text-slate-300" />
                                    No cash proofs uploaded yet.
                                </div>
                            ) : (
                                <div className="grid gap-3">
                                    {currentShift.cashProofs.map((proof) => (
                                        <div
                                            key={proof.id}
                                            className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-3 shadow-sm hover:bg-slate-50 transition"
                                        >
                                            {/* Image Thumbnail */}
                                            <a
                                                href={proof.imageUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="relative size-16 overflow-hidden rounded-xl bg-slate-200 hover:ring-2 hover:ring-[#1A56DB] transition-all shrink-0 shadow-inner"
                                            >
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={proof.imageUrl}
                                                    alt="Cash Proof"
                                                    className="h-full w-full object-cover"
                                                />
                                            </a>

                                            {/* Detail fields */}
                                            <div className="flex-1 min-w-0 space-y-1">
                                                <p className="text-xs font-medium text-slate-400">
                                                    Uploaded by <span className="font-bold text-slate-700">{proof.uploadedBy?.name || proof.uploadedBy?.email}</span>
                                                </p>
                                                <p className="text-[10px] text-slate-400 font-semibold font-mono">
                                                    {formatDateTime(proof.createdAt)}
                                                </p>

                                                {/* Verification badge */}
                                                <div className="pt-1">
                                                    {proof.verifiedBy ? (
                                                        <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                                                            <Check className="size-3" />
                                                            {t("verifiedBy", { name: proof.verifiedBy.name || proof.verifiedBy.email })}
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 rounded-lg bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                                                            <AlertCircle className="size-3" />
                                                            {t("notVerified")}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Verify Action Button */}
                                            {!proof.verifiedBy && (
                                                <Button
                                                    type="button"
                                                    onClick={() => handleVerifyProof(proof.id)}
                                                    disabled={isVerifyingProof}
                                                    className="h-9 rounded-xl bg-[#1A56DB] px-3 text-xs font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 transition cursor-pointer"
                                                >
                                                    {isVerifyingProof ? (
                                                        <Loader2 className="size-3 animate-spin" />
                                                    ) : (
                                                        t("verify")
                                                    )}
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ================= SHIFT CLOSED SUMMARY MODAL ================= */}
            {isSummaryOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-[2px] animate-fade-in">
                    <div className="relative w-full max-w-lg rounded-[28px] bg-white p-6 shadow-2xl animate-zoom-in border border-slate-100 max-h-[90vh] overflow-y-auto">

                        {/* Close Modal trigger */}
                        <button
                            type="button"
                            onClick={() => {
                                setIsSummaryOpen(false);
                                setClosedShiftId(null);
                                router.push("/shift-workflow");
                            }}
                            className="absolute right-5 top-5 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
                        >
                            <X className="size-5" />
                        </button>

                        {isClosedShiftLoading ? (
                            <div className="py-12 space-y-4 flex flex-col items-center">
                                <Loader2 className="size-10 animate-spin text-blue-500" />
                                <p className="text-sm font-semibold text-slate-500">Retrieving shift details...</p>
                            </div>
                        ) : closedShiftDetails ? (
                            <div className="space-y-6">

                                {/* Header status */}
                                <div className="flex flex-col items-center text-center pb-4 border-b border-slate-100">
                                    <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-500 shadow-md">
                                        <CheckCircle2 size={32} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900">
                                        {t("shiftClosedSummary")}
                                    </h3>
                                    <p className="text-xs text-slate-400 font-semibold font-mono mt-1">
                                        ID: {closedShiftDetails.id}
                                    </p>
                                </div>

                                {/* Metadata details */}
                                <div className="grid grid-cols-2 gap-4 rounded-2xl bg-slate-50 p-4 border border-slate-100 text-sm">
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">User</p>
                                        <p className="font-bold text-slate-800">
                                            {closedShiftDetails.user?.name || closedShiftDetails.user?.email}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Date Closed</p>
                                        <p className="font-bold text-slate-800">
                                            {formatDateTime(closedShiftDetails.createdAt)}
                                        </p>
                                    </div>
                                </div>

                                {/* Financial tallies */}
                                <div className="space-y-3">
                                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Reconciliation details</h4>
                                    <div className="rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden">
                                        <div className="flex items-center justify-between p-4 bg-white text-sm font-medium">
                                            <span className="text-slate-500">Opening Cash Amount</span>
                                            <span className="font-bold text-slate-800">
                                                Rp {Number(closedShiftDetails.openingCashAmount || 0).toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between p-4 bg-white text-sm font-medium">
                                            <span className="text-slate-500">Closing Cash Amount</span>
                                            <span className="font-bold text-slate-800">
                                                Rp {Number(closedShiftDetails.closingCashAmount || 0).toLocaleString()}
                                            </span>
                                        </div>

                                        {/* Discrepancy block */}
                                        <div className="flex items-center justify-between p-4 bg-slate-50/50 text-sm font-bold">
                                            <span className="text-slate-600">{t("discrepancy")}</span>
                                            <span className={`inline-flex items-center gap-1 rounded-xl px-3 py-1 font-bold ${Number(closedShiftDetails.closingDiscrepancy || 0) < 0
                                                ? "bg-red-100 text-red-700"
                                                : "bg-emerald-100 text-emerald-700"
                                                }`}>
                                                Rp {Number(closedShiftDetails.closingDiscrepancy || 0).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Checklist Summary details */}
                                <div className="space-y-2">
                                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Checklist status</h4>
                                    <div className="grid grid-cols-3 gap-2">
                                        {/* Inventory */}
                                        <div className={`rounded-xl border p-3 text-center ${closedShiftDetails.inventoryAccurate
                                            ? "border-emerald-100 bg-emerald-50/30 text-emerald-700"
                                            : "border-slate-100 bg-slate-50 text-slate-500"
                                            }`}>
                                            <p className="text-[10px] font-bold uppercase tracking-wider">Inventory</p>
                                            <p className="mt-1 text-xs font-extrabold">
                                                {closedShiftDetails.inventoryAccurate ? "Accurate" : "Skipped"}
                                            </p>
                                        </div>

                                        {/* Promotions */}
                                        <div className={`rounded-xl border p-3 text-center ${closedShiftDetails.promotionConfirmed
                                            ? "border-emerald-100 bg-emerald-50/30 text-emerald-700"
                                            : "border-slate-100 bg-slate-50 text-slate-500"
                                            }`}>
                                            <p className="text-[10px] font-bold uppercase tracking-wider">Promotions</p>
                                            <p className="mt-1 text-xs font-extrabold">
                                                {closedShiftDetails.promotionConfirmed ? "Verified" : "Skipped"}
                                            </p>
                                        </div>

                                        {/* Sales */}
                                        <div className={`rounded-xl border p-3 text-center ${closedShiftDetails.salesConfirmed
                                            ? "border-emerald-100 bg-emerald-50/30 text-emerald-700"
                                            : "border-slate-100 bg-slate-50 text-slate-500"
                                            }`}>
                                            <p className="text-[10px] font-bold uppercase tracking-wider">Sales/Cash</p>
                                            <p className="mt-1 text-xs font-extrabold">
                                                {closedShiftDetails.salesConfirmed ? "Verified" : "Skipped"}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Cash Proof count */}
                                <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm border border-slate-100">
                                    <span className="font-semibold text-slate-500">Cash Proofs Count</span>
                                    <span className="font-bold text-slate-800">{closedShiftDetails.cashProofs?.length || 0} files</span>
                                </div>

                                {/* Close Button */}
                                <Button
                                    type="button"
                                    onClick={() => {
                                        setIsSummaryOpen(false);
                                        setClosedShiftId(null);
                                        router.push("/shift-workflow");
                                    }}
                                    className="w-full h-12 rounded-xl bg-slate-900 text-sm font-bold text-white hover:bg-slate-800 transition cursor-pointer"
                                >
                                    {t("close")}
                                </Button>
                            </div>
                        ) : (
                            <div className="py-8 text-center text-slate-400">Failed to load closed shift details.</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default function OpenShiftPage() {
    return (
        <Suspense fallback={<ActiveShiftSkeleton />}>
            <OpenShiftInner />
        </Suspense>
    );
}