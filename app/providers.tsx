"use client";

import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import PageTransition from "@/components/PageTransition";


export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <LanguageProvider>
        <PageTransition>
          {children}
        </PageTransition>
        <LanguageSwitcher />
      </LanguageProvider>
    </AuthProvider>
  );
}
