"use client";
import React, { useEffect, useState, use } from "react";
import Splash from "@/components/shared/Splash";
import { useRouter } from "next/navigation";

const Page = ({ params }: { params?: Promise<{ locale: string }> }) => {
  const p = params ? use(params) : { locale: "en" };
  const [showSplash, setShowSplash] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      setShowSplash(false);
    }, 2000);

    return () => {
      window.clearTimeout(timerId);
    };
  }, []);

  useEffect(() => {
    if (!showSplash) {
      router.push(`/${p.locale}/auth/sign-in`);
    }
  }, [showSplash, router, p.locale]);

  return showSplash ? <Splash /> : null;
};

export default Page;
