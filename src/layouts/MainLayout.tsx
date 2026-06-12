"use client";

import React, { useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Spotlight } from "@/components/Spotlight";
import type { Lang } from "@/i18n/translations";
import { usePathname } from "next/navigation";

interface MainLayoutProps {
  lang?: Lang;
  trData?: any;
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  lang = "tr",
  trData,
  children,
}) => {
  const pathname = usePathname();

  useEffect(() => {
    const logView = async () => {
      try {
        await fetch("/api/views", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ pagePath: pathname }),
        });
      } catch (error) {
        console.error("Failed to track view:", error);
      }
    };

    logView();
  }, [pathname]);

  return (
    <div className="min-h-screen bg-dark text-light font-primary relative flex flex-col justify-between overflow-x-hidden">
      <Header lang={lang} trData={trData} />
      <main className="relative flex-grow">
        <Spotlight />
        {children}
      </main>
      <Footer lang={lang} trData={trData} />
    </div>
  );
};
