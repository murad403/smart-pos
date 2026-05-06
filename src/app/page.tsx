"use client";
import { useEffect, useState } from "react";
import SignIn from "./(auth)/auth/sign-in/page";
import Splash from "@/components/shared/Splash";



const Page = () => {
  const [showSplash, setShowSplash] = useState(() => true);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      setShowSplash(false);
    }, 2000);

    return () => {
      window.clearTimeout(timerId);
    };
  }, []);

  return showSplash ? <Splash /> : <SignIn />;
};

export default Page;
