import Image, { StaticImageData } from "next/image";

export interface PaymentVerificationItem {
  id: string;
  orderNumber: string;
  amount: number;
  amountReceived: number;
  paymentMethod: string;
  personLabel: string;
  personName: string;
  dateTime: string;
  status: "match" | "mismatch";
  image: StaticImageData;
}

interface PaymentVerificationCardProps {
  item: PaymentVerificationItem;
  onViewDetails: (item: PaymentVerificationItem) => void;
}

const formatCurrency = (value: number) => `Rp ${value.toLocaleString("en-US")}`;

const PaymentVerificationCard = ({ item, onViewDetails }: PaymentVerificationCardProps) => {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="relative mb-3 overflow-hidden rounded-lg">
        <Image
          src={item.image}
          alt={`Payment proof for order ${item.orderNumber}`}
          className="h-60 w-full object-cover"
        />
        <span
          className={`absolute right-2 top-2 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
            item.status === "mismatch" ? "bg-red-500 text-white" : "bg-emerald-500 text-white"
          }`}
        >
          {item.status === "mismatch" ? "Mismatch" : "Match"}
        </span>
      </div>

      <div className="space-y-1.5 border-b border-slate-100 pb-3 text-sm">
        <div className="flex items-center justify-between gap-2 text-slate-500">
          <span>Order #</span>
          <span className="font-semibold text-slate-800">#{item.orderNumber}</span>
        </div>
        <div className="flex items-center justify-between gap-2 text-slate-500">
          <span>Amount</span>
          <span className="font-semibold text-blue-700">{formatCurrency(item.amount)}</span>
        </div>
        <div className="flex items-center justify-between gap-2 text-slate-500">
          <span>Payment Method</span>
          <span className="font-medium text-slate-700 border border-gray-300 px-1 rounded-xl">{item.paymentMethod}</span>
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
          className="w-full rounded-md border border-slate-200 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          View Details
        </button>
      </div>
    </article>
  );
};

export default PaymentVerificationCard;
