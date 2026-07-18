import { useTranslations } from "next-intl";
import { ImageOff, Loader2 } from "lucide-react";
import { useChangeVerificationStatusMutation } from "@/redux/features/dashboard/dashboard.api";
import { getUserData } from "@/utils/auth";
import { toast } from "sonner";

export interface PaymentVerificationItem {
  id: string;
  orderNumber: string;
  amount: number;
  amountReceived: number;
  paymentMethod: string;
  personLabel: string;
  personName: string;
  dateTime: string;
  status: string;
  image?: string;
  cashierName?: string;
  markAsMissMatch?: boolean;
  isVerified?: boolean;
  verificationStatus?: "PENDING" | "MATCH" | "MISMATCH";
}

interface PaymentVerificationCardProps {
  item: PaymentVerificationItem;
  onViewDetails: (item: PaymentVerificationItem) => void;
  onVerify: (item: PaymentVerificationItem) => void;
}

const formatCurrency = (value: number) => `Rp ${value.toLocaleString("en-US")}`;

const PaymentVerificationCard = ({ item, onViewDetails, onVerify }: PaymentVerificationCardProps) => {
  const t = useTranslations("Payment");
  const [changeVerificationStatus, { isLoading: isUpdating }] = useChangeVerificationStatusMutation();

  const handleStatusChange = async (status: "MATCH" | "MISMATCH") => {
    const userData = getUserData();
    const verifiedById = userData?.id ?? 9;

    try {
      const response = await changeVerificationStatus({
        paymentId: Number(item.id),
        data: {
          status,
          verifiedById,
        },
      }).unwrap();

      if (response.success) {
        toast.success(response.message || `Payment marked as ${status} successfully`);
      } else {
        toast.error(response.message || "Failed to update verification status");
      }
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Failed to update verification status");
    }
  };
  const imgSrc = item.image;

  return (
    <article className={`rounded-xl border bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${
      item.verificationStatus === "MATCH"
        ? "border-green-500"
        : item.verificationStatus === "MISMATCH" || item.markAsMissMatch
        ? "border-red-500"
        : "border-blue-500"
    }`}>
      <div className="relative mb-3 overflow-hidden rounded-lg">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={`Payment proof for order ${item.orderNumber}`}
            className="h-60 w-full object-cover"
          />
        ) : (
          <div className="h-60 w-full bg-slate-50 flex flex-col items-center justify-center text-slate-400 gap-2 border border-slate-100 rounded-lg">
            <ImageOff size={32} className="text-slate-300" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">No Image Proof</span>
          </div>
        )}
        {(item.verificationStatus === "MISMATCH" || item.markAsMissMatch) && (
          <span className="absolute left-2 top-2 rounded-full bg-red-600 px-2 py-0.5 text-[11px] font-semibold text-white uppercase tracking-wider">
            {t("mismatch")}
          </span>
        )}
        {item.verificationStatus === "MATCH" && (
          <span className="absolute left-2 top-2 rounded-full bg-green-600 px-2 py-0.5 text-[11px] font-semibold text-white uppercase tracking-wider">
            {t("match") || "Match"}
          </span>
        )}
        <span
          className={`absolute right-2 top-2 rounded-full px-2 py-0.5 text-[11px] font-semibold ${item.status === "paid" ? "bg-red-500 text-white" : "bg-emerald-500 text-white"
            }`}
        >
          {item.status}
        </span>
      </div>

      <div className="space-y-1.5 border-b border-slate-100 pb-3 text-sm">
        <div className="flex items-center justify-between gap-2 text-slate-500">
          <span>{t("orderNumber")}</span>
          <span className="font-semibold text-slate-800">#{item.orderNumber}</span>
        </div>
        <div className="flex items-center justify-between gap-2 text-slate-500">
          <span>{t("amount")}</span>
          <span className="font-semibold text-blue-700">{formatCurrency(item.amount)}</span>
        </div>
        <div className="flex items-center justify-between gap-2 text-slate-500">
          <span>{t("paymentMethod")}</span>
          <span className="font-medium text-slate-700 border border-gray-300 px-1.5 py-0.5 rounded-xl">{item.paymentMethod}</span>
        </div>
        {/* <div className="flex items-center justify-between gap-2 text-slate-500">
          <span>{item.personLabel}</span>
          <span className="font-medium text-slate-700">{item.personName}</span>
        </div> */}
        <div className="flex items-center justify-between gap-2 text-slate-500">
          <span>{t("cashier")}</span>
          <span className="font-medium text-slate-700">{item.cashierName || "-"}</span>
        </div>
      </div>



      <div className="mt-2 space-y-2">
        <button
          type="button"
          onClick={() => handleStatusChange("MATCH")}
          disabled={isUpdating}
          className="w-full rounded-md border border-slate-200 bg-green-500 cursor-pointer py-2 text-xs font-semibold text-white transition hover:bg-green-600 disabled:opacity-50 flex items-center justify-center gap-1.5"
        >
          {isUpdating && <Loader2 size={12} className="animate-spin" />}
          {t("match")}
        </button>
        <button
          type="button"
          onClick={() => handleStatusChange("MISMATCH")}
          disabled={isUpdating}
          className="w-full rounded-md border border-slate-200 bg-red-500 cursor-pointer py-2 text-xs font-semibold text-white transition hover:bg-red-600 disabled:opacity-50 flex items-center justify-center gap-1.5"
        >
          {isUpdating && <Loader2 size={12} className="animate-spin" />}
          {t("mismatch")}
        </button>
      </div>




      {/* details and verify button */}
      {/* <div className="mt-2 space-y-2">
        <p className="text-[11px] text-slate-400">{item.dateTime}</p>
        <button
          type="button"
          onClick={() => onViewDetails(item)}
          className="w-full rounded-md border border-slate-200 cursor-pointer py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          {t("viewDetails")}
        </button>
        <button
          type="button"
          onClick={() => onVerify(item)}
          className="w-full rounded-md border border-slate-200 bg-blue-500 cursor-pointer py-2 text-xs font-semibold text-white transition hover:bg-blue-600"
        >
          {t("verify")}
        </button>

      </div> */}
    </article>
  );
};

export default PaymentVerificationCard;
