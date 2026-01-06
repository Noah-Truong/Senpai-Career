"use client";

import { SessionProvider } from "next-auth/react";
import { LanguageProvider } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import PageTransition from "@/components/PageTransition";
import ScrollProgress from "@/components/ScrollProgress";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <LanguageProvider>
        <ScrollProgress />
        <PageTransition>
          {children}
        </PageTransition>
        <LanguageSwitcher />
      </LanguageProvider>
    </SessionProvider>
  );
}

