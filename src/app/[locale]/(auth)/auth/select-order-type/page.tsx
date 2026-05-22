"use client";
import Image from "next/image";
import { useRouter } from "@/i18n/routing";
import { UtensilsCrossed, ShoppingCart } from "lucide-react";
import banner from "@/assets/logo/banner.jpg";
import { useTranslations } from "next-intl";



const SelectOrderType = () => {
  const router = useRouter();
  const t = useTranslations("customerWelcome");

  const handleSelect = (type: "dine-in" | "takeaway") => {
    router.push(`/menu?type=${type}`);
  };

  return (
    <div className="relative w-full min-h-screen flex justify-center items-center overflow-hidden">
      <Image
        src={banner}
        alt="Restaurant banner"
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-black/55" />

      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-8">
          {t("selectOrderType")}
        </h2>
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Dine In */}
          <button
            onClick={() => handleSelect("dine-in")}
            className="flex flex-col items-center gap-2 bg-white rounded-2xl px-12 py-8 shadow-xl hover:scale-105 transition-transform cursor-pointer w-48 sm:w-52"
          >
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center">
              <UtensilsCrossed size={28} className="text-white" />
            </div>
            <span className="font-semibold text-gray-900 text-base">{t("dineIn")}</span>
          </button>

          {/* Takeaway */}
          <button
            onClick={() => handleSelect("takeaway")}
            className="flex flex-col items-center gap-2 bg-white rounded-2xl px-12 py-8 shadow-xl hover:scale-105 transition-transform cursor-pointer w-48 sm:w-52"
          >
            <div className="w-14 h-14 bg-yellow-400 rounded-2xl flex items-center justify-center">
              <ShoppingCart size={28} className="text-white" />
            </div>
            <span className="font-semibold text-gray-900 text-base">{t("takeaway")}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectOrderType;