/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React, { useState, useEffect } from "react";
import { Plus, Search, Edit3, Trash2, CheckCircle2, XCircle, X, Armchair, Copy, Download, Printer, Check, LayoutGrid, List, QrCode, ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetTablesQuery, useAddTableMutation, useUpdateTableMutation, useDeleteTableMutation } from "@/redux/features/table/table.api";
import { TableItem } from "@/redux/features/table/table.type";
import { toast } from "sonner";
import CustomPagination from "@/components/shared/CustomPagination";
import { useTranslations } from "next-intl";
import logo from "@/assets/logo/logo2.png";



const TableManagementPage = () => {
    const t = useTranslations("Table");

    // State controls
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearchValue, setDebouncedSearchValue] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const limit = 12;

    // View Mode: 'grid' (beautiful visual cards) or 'list' (compact table list)
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    // Modal controls
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isQrOpen, setIsQrOpen] = useState(false);

    // Selected table context
    const [selectedTable, setSelectedTable] = useState<TableItem | null>(null);

    // Form states
    const [formTableNumber, setFormTableNumber] = useState("");
    const [formNotes, setFormNotes] = useState("");
    const [formIsActive, setFormIsActive] = useState(true);

    // QR link configuration
    const [customQrUrl, setCustomQrUrl] = useState("");
    const [isCopied, setIsCopied] = useState(false);

    // Debounce search input to avoid API spamming
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchValue(searchQuery);
            setCurrentPage(1);
        }, 450);
        return () => clearTimeout(handler);
    }, [searchQuery]);

    // Fetch Tables
    const { data: tablesRes, isLoading, refetch } = useGetTablesQuery({
        page: currentPage,
        limit,
        search: debouncedSearchValue || undefined,
    });

    const tables = tablesRes?.data ?? [];
    const pagination = tablesRes?.pagination;
    const totalPages = pagination?.totalPages ?? 1;
    const totalTables = pagination?.total ?? tables.length;

    // Mutations
    const [addTable, { isLoading: isAdding }] = useAddTableMutation();
    const [updateTable, { isLoading: isUpdating }] = useUpdateTableMutation();
    const [deleteTable, { isLoading: isDeleting }] = useDeleteTableMutation();

    // Synchronize QR target URL
    useEffect(() => {
        if (selectedTable && typeof window !== "undefined") {
            // const origin = window.location.origin;
            const pathname = window.location.pathname;
            const segments = pathname.split("/").filter(Boolean);
            const locale = segments[0] || "en";
            setCustomQrUrl(`https://blueowlapp.com/${locale}/menu?table=${selectedTable?.id}`);
        }
    }, [selectedTable]);

    const resetForm = () => {
        setFormTableNumber("");
        setFormNotes("");
        setFormIsActive(true);
    };

    const handleOpenAdd = () => {
        resetForm();
        setIsAddOpen(true);
    };

    const handleOpenEdit = (table: TableItem) => {
        setSelectedTable(table);
        setFormTableNumber(table.tableNumber || "");
        setFormNotes(table.notes || "");
        setFormIsActive(table.isActive);
        setIsEditOpen(true);
    };

    const handleOpenDelete = (table: TableItem) => {
        setSelectedTable(table);
        setIsDeleteOpen(true);
    };

    const handleOpenQr = (table: TableItem) => {
        setSelectedTable(table);
        setIsQrOpen(true);
    };

    // CRUD Actions
    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formTableNumber.trim()) {
            toast.error(t("tableNumberRequired"));
            return;
        }
        try {
            toast.loading(t("creatingTable"), { id: "table-crud" });
            await addTable({
                tableNumber: formTableNumber.trim(),
                notes: formNotes.trim() || undefined,
                isActive: formIsActive
            }).unwrap();
            toast.success(t("tableCreated"), { id: "table-crud" });
            setIsAddOpen(false);
            resetForm();
            refetch();
        } catch (error: any) {
            toast.error(error?.data?.message || error?.message || t("tableCreateFailed"), { id: "table-crud" });
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTable) return;
        if (!formTableNumber.trim()) {
            toast.error(t("tableNumberRequired"));
            return;
        }
        try {
            toast.loading(t("updatingTable"), { id: "table-crud" });

            // Note: pass undefined for empty strings to comply with rules
            const body = {
                tableNumber: formTableNumber.trim() || undefined,
                notes: formNotes.trim() || undefined,
                isActive: formIsActive
            };

            await updateTable({
                tableId: selectedTable.id,
                data: body
            }).unwrap();

            toast.success(t("tableUpdated"), { id: "table-crud" });
            setIsEditOpen(false);
            setSelectedTable(null);
            resetForm();
            refetch();
        } catch (error: any) {
            toast.error(error?.data?.message || error?.message || t("tableUpdateFailed"), { id: "table-crud" });
        }
    };

    const handleDelete = async () => {
        if (!selectedTable) return;
        try {
            toast.loading(t("deletingTable"), { id: "table-crud" });
            await deleteTable(selectedTable.id).unwrap();
            toast.success(t("tableDeleted"), { id: "table-crud" });
            setIsDeleteOpen(false);
            setSelectedTable(null);
            refetch();
        } catch (error: any) {
            toast.error(error?.data?.message || error?.message || t("tableDeleteFailed"), { id: "table-crud" });
        }
    };

    // QR functions
    const handleCopyLink = () => {
        navigator.clipboard.writeText(customQrUrl);
        setIsCopied(true);
        toast.success(t("copied"));
        setTimeout(() => setIsCopied(false), 2000);
    };

    const loadImage = (src: string): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            if (src.startsWith("http")) {
                img.crossOrigin = "anonymous";
            }
            img.onload = () => resolve(img);
            img.onerror = (e) => reject(e);
            img.src = src;
        });
    };

    const handleDownloadQR = async () => {
        if (!selectedTable) return;
        try {
            toast.loading(t("preparingDownload"), { id: "qr-download" });
            const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(customQrUrl)}`;

            // Load images in parallel
            const [logoImg, qrImg] = await Promise.all([
                loadImage(logo.src),
                loadImage(qrImageUrl)
            ]);

            // Create canvas
            const canvas = document.createElement("canvas");
            canvas.width = 400;
            canvas.height = 560;
            const ctx = canvas.getContext("2d");
            if (!ctx) throw new Error("Could not get 2d context");

            // Enable smooth scaling
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = "high";

            // 1. Draw white background
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, 400, 560);

            // 2. Draw card border (rounded rectangle)
            const cardX = 15;
            const cardY = 15;
            const cardW = 370;
            const cardH = 530;
            const cardR = 24;

            ctx.strokeStyle = "#e2e8f0";
            ctx.lineWidth = 2;
            ctx.beginPath();
            if (ctx.roundRect) {
                ctx.roundRect(cardX, cardY, cardW, cardH, cardR);
            } else {
                ctx.moveTo(cardX + cardR, cardY);
                ctx.arcTo(cardX + cardW, cardY, cardX + cardW, cardY + cardH, cardR);
                ctx.arcTo(cardX + cardW, cardY + cardH, cardX, cardY + cardH, cardR);
                ctx.arcTo(cardX, cardY + cardH, cardX, cardY, cardR);
                ctx.arcTo(cardX, cardY, cardX + cardW, cardY, cardR);
            }
            ctx.stroke();

            // 3. Draw Logo centered
            // Scale logo to height = 48px
            const logoH = 48;
            const logoW = logoImg.width * (logoH / logoImg.height);
            const logoX = (400 - logoW) / 2;
            const logoY = 45;
            ctx.drawImage(logoImg, logoX, logoY, logoW, logoH);

            // 4. Draw "Scan & Order" text
            ctx.font = "bold 12px 'Roboto', 'Inter', sans-serif";
            ctx.fillStyle = "#64748b";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            if ('letterSpacing' in ctx) {
                (ctx as any).letterSpacing = "0.1em";
            }
            ctx.fillText("SCAN & ORDER", 200, 115);
            if ('letterSpacing' in ctx) {
                (ctx as any).letterSpacing = "normal"; // reset
            }

            // 5. Draw QR Container
            const qrContainerX = 75;
            const qrContainerY = 145;
            const qrContainerW = 250;
            const qrContainerH = 250;
            const qrContainerR = 16;

            ctx.fillStyle = "#f8fafc";
            ctx.beginPath();
            if (ctx.roundRect) {
                ctx.roundRect(qrContainerX, qrContainerY, qrContainerW, qrContainerH, qrContainerR);
            } else {
                ctx.moveTo(qrContainerX + qrContainerR, qrContainerY);
                ctx.arcTo(qrContainerX + qrContainerW, qrContainerY, qrContainerX + qrContainerW, qrContainerY + qrContainerH, qrContainerR);
                ctx.arcTo(qrContainerX + qrContainerW, qrContainerY + qrContainerH, qrContainerX, qrContainerY + qrContainerH, qrContainerR);
                ctx.arcTo(qrContainerX, qrContainerY + qrContainerH, qrContainerX, qrContainerY, qrContainerR);
                ctx.arcTo(qrContainerX, qrContainerY, qrContainerX + qrContainerW, qrContainerY, qrContainerR);
            }
            ctx.fill();
            ctx.strokeStyle = "#f1f5f9";
            ctx.lineWidth = 1;
            ctx.stroke();

            // 6. Draw QR Image inside container (centered)
            const qrSize = 200;
            const qrX = qrContainerX + (qrContainerW - qrSize) / 2;
            const qrY = qrContainerY + (qrContainerH - qrSize) / 2;
            ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);

            // 7. Draw Table Title (e.g. "TABLE 1")
            ctx.font = "900 32px 'Roboto', 'Inter', sans-serif";
            ctx.fillStyle = "#0f172a";
            ctx.fillText(`${t("tableLabel").toUpperCase()} ${selectedTable.tableNumber}`, 200, 435);

            // 8. Draw Instructions
            ctx.font = "14px 'Roboto', 'Inter', sans-serif";
            ctx.fillStyle = "#475569";
            ctx.fillText(t("scanQrCode") || "Scan or scan to order", 200, 480);

            // Export to blob and download
            canvas.toBlob((blob) => {
                if (!blob) throw new Error("Blob generation failed");
                const blobUrl = window.URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = blobUrl;
                link.download = `table-${selectedTable.tableNumber}-qr.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(blobUrl);
                toast.success(t("qrDownloaded"), { id: "qr-download" });
            }, "image/png");

        } catch (error) {
            console.error("QR Download Error:", error);
            toast.error(t("qrDownloadFailed"), { id: "qr-download" });
        }
    };

    const handlePrintQR = () => {
        if (!selectedTable) return;
        const printWindow = window.open("", "_blank");
        if (!printWindow) {
            toast.error(t("popupBlocked"));
            return;
        }

        const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(customQrUrl)}`;

        printWindow.document.write(`
      <html>
        <head>
          <title>Table ${selectedTable.tableNumber} - QR Code</title>
          <style>
            body {
              font-family: 'Roboto', 'Inter', sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              background-color: #fff;
              color: #1e293b;
            }
            .card {
              border: 2px solid #e2e8f0;
              border-radius: 24px;
              padding: 40px;
              text-align: center;
              box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
              max-width: 400px;
              width: 100%;
              box-sizing: border-box;
              display: flex;
              flex-direction: column;
              align-items: center;
            }
            .logo-image {
              height: 48px;
              object-fit: contain;
              margin-bottom: 8px;
            }
            .sub-logo {
              font-size: 12px;
              color: #64748b;
              text-transform: uppercase;
              letter-spacing: 0.1em;
              margin-bottom: 24px;
            }
            .qr-container {
              background-color: #f8fafc;
              border-radius: 16px;
              padding: 24px;
              display: inline-block;
              margin-bottom: 24px;
              border: 1px solid #f1f5f9;
            }
            .qr-image {
              width: 250px;
              height: 250px;
              display: block;
            }
            .table-title {
              font-size: 32px;
              font-weight: 800;
              margin: 0 0 8px 0;
              color: #0f172a;
            }
            .instructions {
              font-size: 14px;
              color: #475569;
              margin: 0;
              line-height: 1.5;
            }
            @media print {
              body {
                background: none;
              }
              .card {
                border: none;
                box-shadow: none;
                padding: 20px;
              }
            }
          </style>
        </head>
        <body>
          <div class="card">
            <img class="logo-image" src="${logo.src}" alt="Logo" />
            <div class="sub-logo">Scan & Order</div>
            <div class="qr-container">
              <img class="qr-image" src="${qrImageUrl}" alt="${t("qrCodeTitle")}" />
            </div>
            <h1 class="table-title">${t("tableLabel").toUpperCase()} ${selectedTable.tableNumber}</h1>
            <p class="instructions">${t("scanQrCode")}</p>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
        printWindow.document.close();
    };

    // Stats calculation
    const activeCount = tables.filter(t => t.isActive).length;
    const inactiveCount = tables.filter(t => !t.isActive).length;

    // Form Modal JSX Template
    const renderTableForm = (
        onSubmit: (e: React.FormEvent) => void,
        isSubmitting: boolean,
        submitLabel: string,
        title: string,
        onClose: () => void
    ) => (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-100 transition-all scale-100 animate-scale-up">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors border border-slate-100"
                        >
                            <X size={18} className="text-slate-500" />
                        </button>
                    </div>

                    <form onSubmit={onSubmit} className="space-y-5">
                        {/* Table Number */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t("tableNumber")} *</label>
                            <input
                                type="text"
                                required
                                value={formTableNumber}
                                onChange={(e) => setFormTableNumber(e.target.value)}
                                placeholder={t("tableNumberPlaceholder")}
                                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 placeholder:text-slate-400 font-bold"
                            />
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">{t("notes")}</label>
                            <textarea
                                value={formNotes}
                                onChange={(e) => setFormNotes(e.target.value)}
                                placeholder={t("notesPlaceholder")}
                                rows={3}
                                className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 placeholder:text-slate-400 resize-none"
                            />
                        </div>

                        {/* Active Status Toggle */}
                        <div className="flex items-center gap-4 pt-1">
                            <button
                                type="button"
                                onClick={() => setFormIsActive(!formIsActive)}
                                className={`relative w-12 h-6 rounded-full transition-colors shrink-0 ${formIsActive ? "bg-blue-600" : "bg-slate-300"
                                    }`}
                            >
                                <span
                                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${formIsActive ? "translate-x-6" : "translate-x-0"
                                        }`}
                                />
                            </button>
                            <div>
                                <span className="text-sm font-semibold text-slate-800 block">{t("isActive")}</span>
                                <span className="text-xs text-slate-500">{t("isActiveDesc")}</span>
                            </div>
                        </div>

                        {/* Footer Buttons */}
                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-2.5 rounded-xl text-slate-700 font-semibold text-sm hover:bg-slate-100 transition-all border border-slate-200"
                            >
                                {t("cancel")}
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-all shadow-md shadow-blue-500/10 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? t("saving") : submitLabel}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Top Hero and Action Section */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                    <Link
                        href="/profile/personal-information"
                        className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 cursor-pointer outline-none"
                    >
                        <ArrowLeft className="size-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{t("title")}</h1>
                        <p className="mt-1 text-slate-600 text-sm">{t("description")}</p>
                    </div>
                </div>
                <div>
                    <Button
                        type="button"
                        onClick={handleOpenAdd}
                        className="h-11 rounded-[14px] bg-blue-600 hover:bg-blue-700 px-6 text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition-all active:scale-[0.98]"
                    >
                        <Plus className="mr-1.5 size-4" />
                        {t("addTable")}
                    </Button>
                </div>
            </div>

            {/* Stats Counter Row */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t("totalTables")}</p>
                        <p className="text-3xl font-bold text-slate-950 mt-1">{totalTables}</p>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                        <Armchair className="size-6" />
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t("activeTables")}</p>
                        <p className="text-3xl font-bold text-emerald-600 mt-1">{activeCount}</p>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                        <CheckCircle2 className="size-6" />
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t("inactiveTables")}</p>
                        <p className="text-3xl font-bold text-slate-400 mt-1">{inactiveCount}</p>
                    </div>
                    <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                        <XCircle className="size-6" />
                    </div>
                </div>
            </div>

            {/* Filters and View Toggles */}
            <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={t("searchPlaceholder")}
                        className="w-full border border-slate-200 rounded-xl pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 placeholder:text-slate-400"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>

                {/* View Mode Toggle Buttons */}
                <div className="flex items-center gap-1.5 self-end sm:self-auto bg-slate-100/80 p-1 rounded-xl border border-slate-200/50">
                    <button
                        onClick={() => setViewMode("grid")}
                        className={`p-2 rounded-lg transition-all flex items-center gap-1 text-xs font-semibold ${viewMode === "grid"
                            ? "bg-white text-blue-600 shadow-sm"
                            : "text-slate-500 hover:text-slate-800"
                            }`}
                        title={t("gridViewTitle")}
                    >
                        <LayoutGrid size={15} />
                        <span className="hidden md:inline">{t("gridView")}</span>
                    </button>
                    <button
                        onClick={() => setViewMode("list")}
                        className={`p-2 rounded-lg transition-all flex items-center gap-1 text-xs font-semibold ${viewMode === "list"
                            ? "bg-white text-blue-600 shadow-sm"
                            : "text-slate-500 hover:text-slate-800"
                            }`}
                        title={t("listViewTitle")}
                    >
                        <List size={15} />
                        <span className="hidden md:inline">{t("listView")}</span>
                    </button>
                </div>
            </div>

            {/* Loading Skeletons */}
            {isLoading ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
                            <div className="flex items-center justify-between">
                                <Skeleton className="h-10 w-10 rounded-xl" />
                                <Skeleton className="h-6 w-16 rounded-full" />
                            </div>
                            <div className="space-y-2 pt-2">
                                <Skeleton className="h-6 w-24" />
                                <Skeleton className="h-4 w-full" />
                            </div>
                            <div className="flex items-center gap-2 pt-4">
                                <Skeleton className="h-9 w-9 rounded-xl" />
                                <Skeleton className="h-9 w-9 rounded-xl" />
                                <Skeleton className="h-9 w-9 rounded-xl" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : tables.length === 0 ? (
                /* Empty State */
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-20 text-center shadow-sm">
                    <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                        <Armchair className="size-8" />
                    </div>
                    <h2 className="mt-5 text-xl font-bold tracking-tight text-slate-900">{t("noTablesFound")}</h2>
                    <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
                        {t("noTablesFoundDesc")}
                    </p>
                    <Button
                        type="button"
                        onClick={handleOpenAdd}
                        className="mt-6 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-sm font-semibold text-white shadow-sm shadow-blue-500/10"
                    >
                        {t("createFirstTable")}
                    </Button>
                </div>
            ) : viewMode === "grid" ? (
                /* Grid Layout */
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                    {tables.map((table: TableItem) => (
                        <div
                            key={table.id}
                            className="group bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md hover:border-blue-100 transition-all duration-300 relative flex flex-col justify-between overflow-hidden"
                        >
                            {/* Subtle top indicator bar */}
                            <div className={`absolute top-0 left-0 right-0 h-1 transition-colors duration-300 ${table.isActive ? "bg-linear-to-r from-blue-500 to-indigo-500" : "bg-slate-200"
                                }`} />

                            <div>
                                <div className="flex items-center justify-between">
                                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${table.isActive ? "bg-blue-50 text-blue-600" : "bg-slate-100 text-slate-400"
                                        }`}>
                                        <Armchair className="size-5" />
                                    </div>
                                    {table.isActive ? (
                                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                                            {t("active")}
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-400 bg-slate-50 px-2.5 py-0.5 rounded-full border border-slate-200">
                                            {t("inactive")}
                                        </span>
                                    )}
                                </div>

                                <div className="mt-4">
                                    <span className="text-xs text-slate-400 font-semibold block">
                                        {t("tableCode", { code: table.slug }).includes("{code}")
                                            ? t("tableCode").replace("{code}", table.slug)
                                            : t("tableCode", { code: table.slug })}
                                    </span>
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                                        {table.tableNumber}
                                    </h3>
                                    {table.notes ? (
                                        <p className="mt-2 text-xs text-slate-500 font-medium line-clamp-2 bg-slate-50 p-2 rounded-lg border border-slate-100/50">
                                            {table.notes}
                                        </p>
                                    ) : (
                                        <p className="mt-2 text-xs text-slate-400 italic">{t("noNotesProvided")}</p>
                                    )}
                                </div>
                            </div>

                            {/* Action buttons inside Card footer */}
                            <div className="flex items-center gap-2 pt-4 mt-4 border-t border-slate-100/50">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => handleOpenQr(table)}
                                    className="flex-1 h-9 gap-1.5 px-0 rounded-xl text-slate-700 bg-slate-50/50 hover:bg-slate-100 hover:text-slate-900 border-slate-200 text-xs font-bold"
                                >
                                    <QrCode size={14} className="text-blue-600" />
                                    {t("qrCode")}
                                </Button>
                                <button
                                    type="button"
                                    onClick={() => handleOpenEdit(table)}
                                    className="h-9 w-9 flex items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 border border-slate-200 transition-all hover:text-slate-900 shrink-0"
                                    title={t("editTable")}
                                >
                                    <Edit3 size={14} />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleOpenDelete(table)}
                                    className="h-9 w-9 flex items-center justify-center rounded-xl text-rose-500 hover:bg-rose-50 border border-slate-200 hover:border-rose-100 transition-all shrink-0"
                                    title={t("deleteTable")}
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                /* List / Table Layout */
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/60">
                                    <th className="py-4 pl-5 pr-3 text-xs font-bold text-slate-500 uppercase tracking-wider">{t("idHeader")}</th>
                                    <th className="py-4 px-3 text-xs font-bold text-slate-500 uppercase tracking-wider">{t("slugHeader")}</th>
                                    <th className="py-4 px-3 text-xs font-bold text-slate-500 uppercase tracking-wider">{t("tableNumber")}</th>
                                    <th className="py-4 px-3 text-xs font-bold text-slate-500 uppercase tracking-wider">{t("notes")}</th>
                                    <th className="py-4 px-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">{t("status")}</th>
                                    <th className="py-4 pl-3 pr-5 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">{t("actions")}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {tables.map((table: TableItem) => (
                                    <tr key={table.id} className="group transition-colors hover:bg-slate-50/30">
                                        <td className="py-4 pl-5 pr-3">
                                            <span className="text-sm font-bold text-slate-400">#{table.id}</span>
                                        </td>
                                        <td className="py-4 px-3">
                                            <span className="text-sm font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">{table.slug}</span>
                                        </td>
                                        <td className="py-4 px-3">
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600 shrink-0">
                                                    <Armchair className="size-4" />
                                                </div>
                                                <span className="text-sm font-extrabold text-slate-900">{t("tableLabel")} {table.tableNumber}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-3 max-w-xs truncate">
                                            <span className="text-sm text-slate-600">{table.notes || <span className="text-slate-300 italic">{t("noNotes")}</span>}</span>
                                        </td>
                                        <td className="py-4 px-3 text-center">
                                            {table.isActive ? (
                                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                                                    <CheckCircle2 size={12} /> {t("active")}
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200">
                                                    <XCircle size={12} /> {t("inactive")}
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-4 pl-3 pr-5">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => handleOpenQr(table)}
                                                    className="h-9 px-3 rounded-xl hover:bg-blue-50 hover:text-blue-600 text-slate-600 border-slate-200 text-xs font-bold gap-1"
                                                >
                                                    <QrCode size={14} />
                                                    {t("qrCode")}
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => handleOpenEdit(table)}
                                                    className="h-9 w-9 p-0 rounded-xl hover:bg-slate-100 text-slate-600 border-slate-200"
                                                >
                                                    <Edit3 size={14} />
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    onClick={() => handleOpenDelete(table)}
                                                    className="h-9 w-9 p-0 rounded-xl hover:bg-rose-50 text-rose-500 hover:text-rose-600 border-slate-200"
                                                >
                                                    <Trash2 size={14} />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Pagination Footer */}
            {totalPages > 1 && (
                <CustomPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            )}

            {/* QR CODE GENERATOR & SCANNER MODAL */}
            {isQrOpen && selectedTable && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md border border-slate-100 animate-scale-up overflow-hidden">
                        {/* Modal Header */}
                        <div className="bg-linear-to-r from-blue-600 to-indigo-600 p-6 text-white relative">
                            <h2 className="text-2xl font-bold tracking-tight">{t("qrCodeTitle")}</h2>
                            <p className="text-blue-100 text-sm mt-1">
                                {t("qrCodeSubtitle", { number: selectedTable.tableNumber }).includes("{number}")
                                    ? t("qrCodeSubtitle").replace("{number}", selectedTable.tableNumber)
                                    : t("qrCodeSubtitle", { number: selectedTable.tableNumber })}
                            </p>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsQrOpen(false);
                                    setSelectedTable(null);
                                }}
                                className="absolute top-6 right-6 w-8 h-8 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors"
                            >
                                <X size={18} className="text-white" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-6">
                            {/* QR Image Display */}
                            <div className="flex flex-col items-center justify-center">
                                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100/80 shadow-inner inline-block relative group">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(customQrUrl)}`}
                                        alt={`${t("tableLabel")} ${selectedTable.tableNumber} ${t("qrCode")}`}
                                        className="w-48 h-48 block transition-transform duration-300 group-hover:scale-105"
                                    />
                                </div>
                                <span className="text-[11px] font-bold text-slate-400 mt-3 uppercase tracking-wider">
                                    {t("scanQrCode")}
                                </span>
                            </div>

                            {/* URL Customization Box */}
                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    {t("customerOrderUrl")}
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={customQrUrl}
                                        onChange={(e) => setCustomQrUrl(e.target.value)}
                                        className="w-full border border-slate-200 rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 font-medium text-slate-700"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleCopyLink}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center bg-white border border-slate-200 shadow-sm hover:bg-slate-50 text-slate-600 transition-all"
                                        title={t("copyLink")}
                                    >
                                        {isCopied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                                    </button>
                                </div>
                            </div>

                            {/* Printing & Action Toolbar */}
                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <Button
                                    type="button"
                                    onClick={handlePrintQR}
                                    className="rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 h-11 text-xs font-bold gap-2 active:scale-[0.98]"
                                >
                                    <Printer size={15} className="text-blue-600" />
                                    {t("printQR")}
                                </Button>
                                <Button
                                    type="button"
                                    onClick={handleDownloadQR}
                                    className="rounded-xl bg-blue-600 text-white hover:bg-blue-700 h-11 text-xs font-bold gap-2 shadow-md shadow-blue-500/10 active:scale-[0.98]"
                                >
                                    <Download size={15} />
                                    {t("downloadQR")}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ADD TABLE MODAL */}
            {isAddOpen &&
                renderTableForm(
                    handleAdd,
                    isAdding,
                    t("createTable"),
                    t("addTable"),
                    () => {
                        setIsAddOpen(false);
                        resetForm();
                    }
                )}

            {/* EDIT TABLE MODAL */}
            {isEditOpen && selectedTable &&
                renderTableForm(
                    handleUpdate,
                    isUpdating,
                    t("saveChanges"),
                    t("editTable"),
                    () => {
                        setIsEditOpen(false);
                        setSelectedTable(null);
                        resetForm();
                    }
                )}

            {/* DELETE CONFIRM MODAL */}
            {isDeleteOpen && selectedTable && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 border border-slate-100 animate-scale-up">
                        <h2 className="text-lg font-bold text-slate-900">{t("confirmDelete")}</h2>
                        <p className="text-sm text-slate-500 mt-2">
                            {t("confirmDeleteDesc")}
                        </p>
                        <div className="flex items-center justify-end gap-3 mt-6">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setIsDeleteOpen(false);
                                    setSelectedTable(null);
                                }}
                                className="rounded-xl text-xs font-bold border-slate-200"
                            >
                                {t("cancel")}
                            </Button>
                            <Button
                                type="button"
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md shadow-red-500/10"
                            >
                                {isDeleting ? t("deleting") : t("delete")}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TableManagementPage;