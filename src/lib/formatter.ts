import { ProductionOrderStatus } from "@/redux/features/production/production.type";



export const formatDateString = (date: Date | null) => {
    if (!date) return undefined;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};



export const toClock = (dateString: string) => {
    const value = new Date(dateString);
    if (Number.isNaN(value.getTime())) return "-";
    return value.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
    });
};



export const toElapsed = (startDateString: string | null | undefined) => {
    if (!startDateString) return "";
    const start = new Date(startDateString).getTime();
    if (Number.isNaN(start)) return "";
    const diffInSeconds = Math.max(0, Math.floor((Date.now() - start) / 1000));
    const minutes = Math.floor(diffInSeconds / 60);
    const seconds = diffInSeconds % 60;
    return `${minutes}m ${seconds}s`;
};



export const toDuration = (startDateString: string | null | undefined, endDateString: string | null | undefined) => {
    if (!startDateString || !endDateString) return "";
    const start = new Date(startDateString).getTime();
    const end = new Date(endDateString).getTime();
    if (Number.isNaN(start) || Number.isNaN(end)) return "";
    const diffInSeconds = Math.max(0, Math.floor((end - start) / 1000));
    const minutes = Math.floor(diffInSeconds / 60);
    const seconds = diffInSeconds % 60;
    return `${minutes}m ${seconds}s`;
};




export const statusView: Record<ProductionOrderStatus, { cardClass: string; statusClass: string; }> = {
    PENDING_PROCESSING: {
        cardClass: "border-l-red-500 bg-red-50/35",
        statusClass: "text-red-700",
    },
    PROCESSING: {
        cardClass: "border-l-blue-500 bg-blue-50/35",
        statusClass: "text-blue-600",
    },
    READY: {
        cardClass: "border-l-emerald-500 bg-emerald-50/35",
        statusClass: "text-emerald-600",
    },
    PICKED_UP: {
        cardClass: "border-l-slate-400 bg-slate-100/70",
        statusClass: "text-slate-600",
    },
    CANCELLED: {
        cardClass: "border-l-rose-500 bg-rose-50/50",
        statusClass: "text-rose-700",
    }
};