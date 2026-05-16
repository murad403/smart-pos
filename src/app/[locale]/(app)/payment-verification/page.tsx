"use client";
import React, { useMemo, useState } from "react";
import { Search } from "lucide-react";
import payment1 from "@/assets/images/payment1.jpg";
import payment2 from "@/assets/images/payment2.jpg";
import PaymentVerificationStats from "./PaymentVerificationStats";
import PaymentVerificationCard, { PaymentVerificationItem } from "./PaymentVerificationCard";
import PaymentVerificationModal from "@/components/modal/PaymentVerificationModal";
import CustomPagination from "@/components/shared/CustomPagination";
import { useTranslations } from "next-intl";

const TOTAL_PAGES = 68;
const ITEMS_PER_PAGE = 6;

const getBaseRows = (t: any): Omit<PaymentVerificationItem, "id" | "orderNumber">[] => [
  {
    amount: 125000,
    amountReceived: 130000,
    paymentMethod: t("cash"),
    personLabel: t("cashier"),
    personName: "Md Ahad",
    dateTime: "2026-04-25 12:45",
    status: "mismatch",
    image: payment1,
  },
  {
    amount: 85000,
    amountReceived: 85000,
    paymentMethod: t("transfer"),
    personLabel: t("staff"),
    personName: "Jane Smith",
    dateTime: "2026-04-25 12:30",
    status: "match",
    image: payment2,
  },
  {
    amount: 125000,
    amountReceived: 125000,
    paymentMethod: t("cash"),
    personLabel: t("customer"),
    personName: "Jone Deo",
    dateTime: "2026-04-25 12:45",
    status: "match",
    image: payment1,
  },
  {
    amount: 95000,
    amountReceived: 95000,
    paymentMethod: t("cash"),
    personLabel: t("admin"),
    personName: "Mike Jonson",
    dateTime: "2026-04-25 11:50",
    status: "match",
    image: payment1,
  },
  {
    amount: 150000,
    amountReceived: 150000,
    paymentMethod: t("cash"),
    personLabel: t("staff"),
    personName: "Jane Smith",
    dateTime: "2026-04-25 11:30",
    status: "match",
    image: payment1,
  },
  {
    amount: 45000,
    amountReceived: 45000,
    paymentMethod: t("transfer"),
    personLabel: t("staff"),
    personName: "John Deo",
    dateTime: "2026-04-25 11:15",
    status: "match",
    image: payment2,
  },
];

const getPageTransactions = (page: number, t: any): PaymentVerificationItem[] => {
  const baseOrder = 1245 - (page - 1) * ITEMS_PER_PAGE;
  const rows = getBaseRows(t);

  return rows.map((row, index) => {
    const orderNumber = String(baseOrder - index);
    return {
      ...row,
      orderNumber,
      id: `${page}-${orderNumber}-${index}`,
    };
  });
};

const PaymentVerificationPage = ({ params }: { params?: Promise<{ locale: string }> }) => {
  if (params) React.use(params);
  const t = useTranslations("Payment");
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<PaymentVerificationItem | null>(null);

  const pageRows = useMemo(() => getPageTransactions(currentPage, t), [currentPage, t]);

  const filteredRows = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();
    if (!keyword) return pageRows;

    return pageRows.filter((item) => {
      return (
        item.orderNumber.toLowerCase().includes(keyword) ||
        item.personName.toLowerCase().includes(keyword) ||
        item.paymentMethod.toLowerCase().includes(keyword)
      );
    });
  }, [pageRows, searchQuery]);

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div className="">
          <h1 className="text-2xl font-bold text-slate-900">{t("proof")}</h1>
          <p className="mt-1 text-sm text-slate-500">{t("subtitle")}</p>
        </div>
        <div className="relative">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder={t("searchPlaceholder")}
            className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>


      <PaymentVerificationStats/>


      <div className="grid grid-cols-1 gap-4 md:gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filteredRows.map((item) => (
          <PaymentVerificationCard key={item.id} item={item} onViewDetails={setSelectedItem} />
        ))}
      </div>

      {filteredRows.length === 0 && (
        <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm text-slate-500">
          {t("noTransactions")}
        </div>
      )}

      <div className="mt-4">
        <CustomPagination
          currentPage={currentPage}
          totalPages={TOTAL_PAGES}
          onPageChange={(page) => {
            if (page >= 1 && page <= TOTAL_PAGES) {
              setCurrentPage(page);
              setSelectedItem(null);
            }
          }}
        />
      </div>

      <PaymentVerificationModal item={selectedItem} onClose={() => setSelectedItem(null)} />
    </div>
  );
};

export default PaymentVerificationPage;
