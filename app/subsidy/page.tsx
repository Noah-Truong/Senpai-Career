"use client";

import Header from "@/components/Header";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import Footer from "@/components/Footer";

export default function SubsidyPage() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-6" style={{ color: '#000000' }}>{t("subsidy.title")}</h1>
        
        <div className="card-gradient p-8 mb-6">
          <h2 className="text-2xl font-semibold mb-4" style={{ color: '#000000' }}>{t("subsidy.hero.title")}</h2>
          <p className="text-gray-700 mb-6">
            {t("subsidy.hero.desc")}
          </p>
          
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2" style={{ color: '#000000' }}>{t("subsidy.employment.title")}</h3>
              <p className="text-gray-700 text-sm mb-2">
                {t("subsidy.employment.desc")}
              </p>
            </div>
            
            <div className="bg-white p-4 rounded-lg">
              <h3 className="text-lg font-semibold mb-2" style={{ color: '#000000' }}>{t("subsidy.internship.title")}</h3>
              <p className="text-gray-700 text-sm mb-2">
                {t("subsidy.internship.desc")}
              </p>
            </div>
          </div>
        </div>

        <div className="card-gradient p-8">
          <h2 className="text-2xl font-semibold mb-4" style={{ color: '#000000' }}>{t("subsidy.learnMore.title")}</h2>
          <p className="text-gray-700 mb-6">
            {t("subsidy.contact")}
          </p>
          <div className="flex gap-4">
            <a
              href="mailto:info@senpaicareer.com"
              className="btn-primary"
            >
              {t("companies.cta.contact")}
            </a>
            <Link
              href="/for-companies"
              className="btn-secondary"
            >
              {t("nav.forCompanies")}
            </Link>
          </div>
        </div>
      </div>

      <Footer variant="full" />
    </div>
  );
}

