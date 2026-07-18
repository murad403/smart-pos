"use client";
import React, { useEffect, useState, use } from "react";
import Splash from "@/components/shared/Splash";
import { useRouter, useSearchParams } from "next/navigation";
import { getUserData } from "@/utils/auth";

const Page = ({ params }: { params?: Promise<{ locale: string }> }) => {
  const p = params ? use(params) : { locale: "en" };
  const [showSplash, setShowSplash] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const tableParam = searchParams.get("table");

  useEffect(() => {
    if (tableParam) {
      localStorage.setItem("table", tableParam);
    }
  }, [tableParam]);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      setShowSplash(false);
    }, 3000);

    return () => {
      window.clearTimeout(timerId);
    };
  }, []);

  useEffect(() => {
    if (!showSplash) {
      const userData = getUserData();
      let route = "";
      if (userData?.role === "ADMIN") {
        const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
        route = isMobile ? "/mobile-admin-layout" : "/menu";
      }
      else if (userData?.role === "OWNER") {
        const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
        route = isMobile ? "/mobile-owner-layout" : "/menu-management";
      }
      else if(userData?.role === "SERVICE"){
        route = "/collection";
      }
      else {
        route = "/menu";
      }


      if (route && userData) {
        router.push(`/${p.locale}${route}`);
      } else {
        router.push(`/${p.locale}/auth/welcome`);
      }
    }
  }, [showSplash, router, p.locale]);

  return showSplash ? <Splash /> : null;
};

export default Page;
