import { AlertTriangle, CheckCircle2 } from "lucide-react";

const stats = [
    {
        id: 1,
        label: "Mismatches Detected",
        value: 1,
        icon: AlertTriangle,
        mismatch: true,
    },
    {
        id: 2,
        label: "Total Transactions",
        value: 6,
        icon: CheckCircle2,
    },
    {
        id: 3,
        label: "Cash Transactions",
        value: 4,
    },
];

const PaymentVerificationStats = () => {
    return (
        <div className="grid md:grid-cols-3 gap-4 mb-6">
            {stats.map((item) => (
                <article
                    key={item.id}
                    className={`flex items-center justify-between rounded-xl border px-4 py-4 shadow-sm ${item.mismatch
                            ? "bg-red-50 border-red-200"
                            : "bg-white border-gray-100"
                        }`}
                >
                    <div>
                        <p
                            className={`text-xs font-medium ${item.mismatch ? "text-red-500" : "text-gray-500"
                                }`}
                        >
                            {item.label}
                        </p>
                        <p
                            className={`mt-1 text-3xl font-bold leading-none ${item.mismatch ? "text-red-600" : "text-gray-800"
                                }`}
                        >
                            {item.value}
                        </p>
                    </div>

                    {item.icon && (
                        <div
                            className={`flex size-10 items-center justify-center rounded-full ${item.mismatch
                                    ? "bg-red-100 text-red-500"
                                    : "bg-gray-100 text-gray-400"
                                }`}
                        >
                            <item.icon size={20} />
                        </div>
                    )}
                </article>
            ))}
        </div>
    );
};

export default PaymentVerificationStats;