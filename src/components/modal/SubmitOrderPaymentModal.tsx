/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useRef, useState } from "react";
import { Camera, Loader2, Plus, Trash2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useSubmitOrderPaymentMutation } from "@/redux/features/order/order.api";
import { Order, PaymentMethod } from "@/redux/features/order/order.type";
import { Button } from "@/components/ui/button";
import { getUserData } from "@/utils/auth";

interface SelectedProofImage {
  file: File;
  previewUrl: string;
}

interface SubmitOrderPaymentModalProps {
  order: Order | null;
  onClose: () => void;
}

const paymentMethods: PaymentMethod[] = ["CASH", "TRANSFER", "OTHER"];

const formatCurrency = (value: string | number) => {
  const numericValue = typeof value === "string" ? Number(value) : value;

  if (Number.isNaN(numericValue)) return "Rp 0";

  return `${numericValue.toLocaleString("en-US")}`;
};

const SubmitOrderPaymentModal = ({ order, onClose }: SubmitOrderPaymentModalProps) => {
  const tPending = useTranslations("PendingPayments");
  const tPayment = useTranslations("Payment");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraVideoRef = useRef<HTMLVideoElement | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const cameraCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const selectedProofImagesRef = useRef<SelectedProofImage[]>([]);

  const [method, setMethod] = useState<PaymentMethod>("CASH");
  const [cashReceived, setCashReceived] = useState<number | null>(null);
  const [changeAmount, setChangeAmount] = useState<number | null>(null);
  const [selectedProofImages, setSelectedProofImages] = useState<SelectedProofImage[]>([]);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const [submitOrderPayment, { isLoading }] = useSubmitOrderPaymentMutation();

  useEffect(() => {
    if (cashReceived !== null) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setChangeAmount(cashReceived - Number(order?.totalAmount || 0));
    } else {
      setChangeAmount(null);
    }
  }, [cashReceived, order?.totalAmount]);

  useEffect(() => {
    selectedProofImagesRef.current = selectedProofImages;
  }, [selectedProofImages]);

  useEffect(() => {
    return () => {
      cameraStreamRef.current?.getTracks().forEach((track) => track.stop());
      selectedProofImagesRef.current.forEach(({ previewUrl }) => URL.revokeObjectURL(previewUrl));
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

        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            facingMode: { ideal: "environment" },
          },
        });

        cameraStreamRef.current = stream;

        if (cameraVideoRef.current) {
          cameraVideoRef.current.srcObject = stream;
          await cameraVideoRef.current.play();
        }
      } catch (error: any) {
        setCameraError(error?.message || tPending("cameraOpenFailed") || "Unable to open the camera.");
        setIsCameraOpen(false);
      }
    };

    void startCamera();
  }, [isCameraOpen, tPending]);

  useEffect(() => {
    if (!isCameraOpen && cameraVideoRef.current) {
      cameraVideoRef.current.srcObject = null;
    }
  }, [isCameraOpen]);

  if (!order) return null;

  const handleFilesSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);

    if (files.length === 0) {
      return;
    }

    setSelectedProofImages((currentImages) => {
      const nextImages = [...currentImages];

      files.forEach((file) => {
        nextImages.push({
          file,
          previewUrl: URL.createObjectURL(file),
        });
      });

      return nextImages;
    });

    event.target.value = "";
  };

  const closeCamera = () => {
    cameraStreamRef.current?.getTracks().forEach((track) => track.stop());
    cameraStreamRef.current = null;
    setIsCameraOpen(false);
  };

  const openCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError(tPending("cameraNotSupported") || "Camera is not supported in this browser.");
      return;
    }

    setCameraError(null);
    setIsCameraOpen(true);
  };

  const captureCameraImage = async () => {
    const video = cameraVideoRef.current;
    const canvas = cameraCanvasRef.current;

    if (!video || !canvas) {
      return;
    }

    const width = video.videoWidth;
    const height = video.videoHeight;

    if (!width || !height) {
      setCameraError(tPending("cameraNotReady") || "Camera is not ready yet.");
      return;
    }

    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");

    if (!context) {
      setCameraError(tPending("cameraNotReady") || "Camera is not ready yet.");
      return;
    }

    context.drawImage(video, 0, 0, width, height);

    canvas.toBlob((blob) => {
      if (!blob) {
        setCameraError(tPending("cameraCaptureFailed") || "Failed to capture image.");
        return;
      }

      const file = new File([blob], `proof-${Date.now()}.jpg`, { type: "image/jpeg" });

      setSelectedProofImages((currentImages) => [
        ...currentImages,
        {
          file,
          previewUrl: URL.createObjectURL(file),
        },
      ]);

      closeCamera();
    }, "image/jpeg", 0.95);
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setSelectedProofImages((currentImages) => {
      const imageToRemove = currentImages[indexToRemove];

      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.previewUrl);
      }

      return currentImages.filter((_, index) => index !== indexToRemove);
    });
  };

  const handleSubmit = async () => {
    if (cashReceived === null || Number.isNaN(cashReceived)) {
      toast.error("Cash received is required.");
      return;
    }

    const userData = getUserData();
    const cashierId = userData?.id;

    if (!cashierId) {
      toast.error("Unable to determine cashier account.");
      return;
    }

    if (selectedProofImages.length === 0) {
      toast.error(tPending("proofRequired") || "Please add at least one proof image.");
      return;
    }

    try {
      await submitOrderPayment({
        orderId: order.id,
        method,
        cashierId,
        cashReceived: cashReceived,
        changeAmount: changeAmount !== null ? changeAmount : 0,
        proofImages: selectedProofImages.map((image) => image.file),
      }).unwrap();

      toast.success(tPending("paymentSubmitted") || "Payment submitted successfully.");
      onClose();
    } catch (error: any) {
      toast.error(error?.data?.message || error?.message || tPending("paymentFailed") || "Failed to submit payment.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-6 backdrop-blur-[2px]" onClick={onClose}>
      <div
        className="relative w-full max-w-2xl rounded-3xl bg-white p-5 shadow-2xl max-h-[92vh] overflow-y-auto sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          aria-label={tPending("close") || "Close modal"}
        >
          <X size={18} />
        </button>

        <div className="pr-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            <Upload size={13} />
            <span>{tPending("paymentModalEyebrow") || "Submit payment proof"}</span>
          </div>
          <h2 className="mt-3 text-2xl font-bold text-slate-900">
            {tPending("paymentModalTitle") || "Payment for order"} {order.slug}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {tPending("paymentModalSubtitle") || "Select a payment method and upload one or more proof images."}
          </p>
        </div>

        <div className="mt-5 grid gap-4 rounded-2xl border border-slate-100 bg-slate-50/50 p-4 sm:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{tPending("orderNumber") || "Order #"}</p>
            <p className="mt-1 text-sm font-bold text-slate-900">{order.slug}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{tPending("customer") || "Customer"}</p>
            <p className="mt-1 text-sm font-semibold text-slate-700">{order.customerName || "-"}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{tPending("totalAmount") || "Total Amount"}</p>
            <p className="mt-1 text-sm font-bold text-slate-900">{formatCurrency(order.totalAmount)}</p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">{tPending("paymentMethod") || tPayment("paymentMethod")}</span>
            <select
              value={method}
              onChange={(event) => setMethod(event.target.value as PaymentMethod)}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
            >
              {paymentMethods.map((paymentMethod) => (
                <option key={paymentMethod} value={paymentMethod}>
                  {paymentMethod === "CASH"
                    ? tPayment("cash")
                    : paymentMethod === "TRANSFER"
                      ? tPayment("transfer")
                      : tPayment("other") || paymentMethod}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">Cash Received</span>
            <input
              type="number"
              min="0"
              value={cashReceived ?? ""}
              onChange={(event) => {
                const v = event.target.value;
                setCashReceived(v === "" ? null : Number(v));
              }}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
              placeholder="e.g. 50000"
            />
          </label>

          {cashReceived !== null && (
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-700">
                {tPending("changeAmount") || "Change Amount"}
              </span>
              <input
                type="number"
                value={changeAmount ?? ""}
                onChange={(event) => {
                  const v = event.target.value;
                  setChangeAmount(v === "" ? null : Number(v));
                }}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                placeholder="e.g. 0"
              />
            </label>
          )}

          <div className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">{tPending("proofImages") || "Proof Images"}</span>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-xl border-slate-200 bg-white px-4"
                onClick={openCamera}
              >
                <Camera size={16} />
                <span>{tPending("takePhoto") || "Take photo"}</span>
              </Button>
              {/* <Button
                type="button"
                variant="outline"
                className="h-11 rounded-xl border-slate-200 bg-white px-4"
                onClick={() => fileInputRef.current?.click()}
              >
                <Plus size={16} />
                <span>{tPending("addImages") || "Add images"}</span>
              </Button> */}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              className="hidden"
              onChange={handleFilesSelected}
            />
            <p className="text-xs text-slate-500">
              {tPending("proofHint") || "On supported mobile browsers this opens the camera; you can add multiple images."}
            </p>
          </div>
        </div>

        {isCameraOpen && (
          <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-950">
            <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3 text-white">
              <div>
                <p className="text-sm font-semibold">{tPending("cameraTitle") || "Camera preview"}</p>
                <p className="text-xs text-white/70">{tPending("cameraSubtitle") || "Frame the proof image and capture it in real time."}</p>
              </div>
              <button
                type="button"
                onClick={closeCamera}
                className="rounded-full p-2 text-white/70 transition hover:bg-white/10 hover:text-white"
                aria-label={tPending("closeCamera") || "Close camera"}
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
                    <p className="mt-1 text-white/70">{tPending("cameraPermissionHint") || "Use a secure browser context and allow camera access."}</p>
                  </div>
                </div>
              ) : null}

              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 bg-black/55 p-3">
                <Button type="button" variant="outline" className="h-10 rounded-xl border-white/20 bg-white/10 px-4 text-white hover:bg-white/20 hover:text-white" onClick={closeCamera}>
                  {tPending("cancel") || "Cancel"}
                </Button>
                <Button type="button" className="h-12 rounded-full px-5" onClick={captureCameraImage}>
                  <Camera size={16} />
                  <span>{tPending("capturePhoto") || "Capture photo"}</span>
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-slate-700">{tPending("selectedProofImages") || "Selected proof images"}</p>
            <span className="text-xs font-medium text-slate-400">{selectedProofImages.length}</span>
          </div>

          {selectedProofImages.length > 0 ? (
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {selectedProofImages.map((image, index) => (
                <div key={`${image.file.name}-${image.file.lastModified}-${index}`} className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                  <Image src={image.previewUrl} alt={image.file.name} width={600} height={400} unoptimized className="h-28 w-full object-cover" />
                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-slate-950/70 p-2 text-[10px] text-white">
                    <span className="truncate pr-2">{image.file.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="rounded-full bg-white/15 p-1.5 transition hover:bg-white/25"
                      aria-label={tPending("removeImage") || "Remove image"}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-3 flex min-h-28 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 text-center text-sm text-slate-400">
              {tPending("noProofImages") || "No proof images selected yet."}
            </div>
          )}
        </div>

        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
          <Button type="button" variant="outline" className="h-11 rounded-xl border-slate-200 bg-white px-5" onClick={onClose} disabled={isLoading}>
            {tPending("cancel") || "Cancel"}
          </Button>
          <Button
            type="button"
            className="h-11 rounded-xl px-5"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            <span>{isLoading ? (tPending("submittingPayment") || "Submitting...") : (tPending("submitPayment") || "Submit Payment")}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SubmitOrderPaymentModal;