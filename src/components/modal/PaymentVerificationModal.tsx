import Image from "next/image";
import { AlertTriangle, X } from "lucide-react";
import { PaymentVerificationItem } from "@/app/(app)/payment-verification/PaymentVerificationCard";

interface PaymentVerificationModalProps {
  item: PaymentVerificationItem | null;
  onClose: () => void;
}

const formatCurrency = (value: number) => `Rp ${value.toLocaleString("en-US")}`;

const PaymentVerificationModal = ({ item, onClose }: PaymentVerificationModalProps) => {
  if (!item) return null;

  const difference = item.amountReceived - item.amount;
  const hasMismatch = difference !== 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/35 px-4 py-6 backdrop-blur-[2px]">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-4 shadow-xl sm:p-5">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          aria-label="Close modal"
        >
          <X size={16} />
        </button>

        <div className="mb-2 flex items-center gap-2 pr-8">
          <h2 className="text-[26px] font-bold leading-none text-slate-900">Order #{item.orderNumber}</h2>
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
              item.status === "mismatch" ? "bg-red-500 text-white" : "bg-emerald-500 text-white"
            }`}
          >
            {item.status === "mismatch" ? "Mismatch" : "Match"}
          </span>
        </div>
        <p className="mb-3 text-sm text-slate-500">Payment verification details for order {item.orderNumber}</p>

        <div className="relative mb-4 overflow-hidden rounded-xl">
          <Image
            src={item.image}
            alt={`Payment proof for order ${item.orderNumber}`}
            className="h-52 w-full object-cover sm:h-60"
            priority
          />
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Amount</p>
            <p className="text-[30px] font-semibold leading-tight text-slate-900">{formatCurrency(item.amount)}</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Amount Received</p>
            <p className="text-[30px] font-semibold leading-tight text-slate-900">{formatCurrency(item.amountReceived)}</p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Change Given</p>
            <p className="text-[30px] font-semibold leading-tight text-slate-900">
              {formatCurrency(Math.max(0, difference))}
            </p>
          </div>
          <div className="rounded-lg bg-slate-50 p-3">
            <p className="text-xs text-slate-500">Payment Method</p>
            <p className="text-[30px] font-semibold leading-tight text-slate-900">{item.paymentMethod}</p>
          </div>
        </div>

        <div className="mt-3 flex flex-col gap-2 rounded-lg border border-slate-100 px-3 py-2 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
          <p>
            {item.personLabel}: <span className="font-medium text-slate-800">{item.personName}</span>
          </p>
          <p>
            Date &amp; Time: <span className="font-medium text-slate-800">{item.dateTime}</span>
          </p>
        </div>

        {hasMismatch && (
          <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3">
            <div className="mb-1 flex items-center gap-1 text-sm font-semibold text-red-600">
              <AlertTriangle size={14} />
              <span>Mismatch Detected</span>
            </div>
            <p className="text-xs text-red-500">
              Expected: {formatCurrency(item.amount)} | Received: {formatCurrency(item.amountReceived)} |
              Difference: {formatCurrency(Math.abs(difference))}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentVerificationModal;
