import { useTranslations } from "next-intl";
import { ImageOff } from "lucide-react";

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
}

interface PaymentVerificationCardProps {
  item: PaymentVerificationItem;
  onViewDetails: (item: PaymentVerificationItem) => void;
}

const formatCurrency = (value: number) => `Rp ${value.toLocaleString("en-US")}`;

const PaymentVerificationCard = ({ item, onViewDetails }: PaymentVerificationCardProps) => {
  const t = useTranslations("Payment");
  
  const imgSrc = item.image;
  // console.log(item?.status)

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
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
        <span
          className={`absolute right-2 top-2 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
            item.status ==="paid" ? "bg-red-500 text-white" : "bg-emerald-500 text-white"
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
        <div className="flex items-center justify-between gap-2 text-slate-500">
          <span>{item.personLabel}</span>
          <span className="font-medium text-slate-700">{item.personName}</span>
        </div>
      </div>

      <div className="mt-2 space-y-2">
        <p className="text-[11px] text-slate-400">{item.dateTime}</p>
        <button
          type="button"
          onClick={() => onViewDetails(item)}
          className="w-full rounded-md border border-slate-200 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          {t("viewDetails")}
        </button>
      </div>
    </article>
  );
};

export default PaymentVerificationCard;
