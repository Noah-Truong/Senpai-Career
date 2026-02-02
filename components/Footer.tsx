"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

interface FooterProps {
  variant?: "full" | "simple";
}

export default function Footer({ variant = "simple" }: FooterProps) {
  const { t } = useLanguage();

  if (variant === "simple") {
    return (
      <footer className="w-full py-8" style={{ backgroundColor: '#0A1E32' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-white opacity-60 text-sm">{t("common.copyright")}</p>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer 
      className="w-full py-12 text-white" 
      style={{ backgroundColor: '#0A1E32' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Senpai Career</h3>
            <p className="text-sm opacity-80">
              {t("about.hero.subtitle")}
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">{t("home.footer.students")}</h4>
            <ul className="space-y-2 text-sm opacity-80">
              <li>
                <Link href="/for-students/ob-visit" className="hover:opacity-100 transition-opacity">{t("nav.obVisit") || "OB/OG Visits"}</Link>
              </li>
              <li>
                <Link href="/for-students/internships" className="hover:opacity-100 transition-opacity">{t("nav.internship")}</Link>
              </li>
              <li>
                <Link href="/for-students/recruiting" className="hover:opacity-100 transition-opacity">{t("nav.recruiting")}</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">{t("home.footer.companies")}</h4>
            <ul className="space-y-2 text-sm opacity-80">
              <li>
                <Link href="/for-companies/corporate-services" className="hover:opacity-100 transition-opacity">{t("home.footer.companyInfo")}</Link>
              </li>
              <li>
                <Link href="/subsidy" className="hover:opacity-100 transition-opacity">{t("nav.subsidy")}</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">{t("home.footer.contact")}</h4>
            <p className="text-sm opacity-80">
              <motion.a 
                href="mailto:info@senpaicareer.com" 
                className="hover:opacity-100 transition-opacity"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                info@senpaicareer.com
              </motion.a>
            </p>
          </div>
        </div>
        <div className="mt-8 pt-8 text-center text-sm opacity-60" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <p>{t("common.copyright")}</p>
        </div>
      </div>
    </footer>
  );
}
