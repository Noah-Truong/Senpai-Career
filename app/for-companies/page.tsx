"use client";

import Header from "@/components/Header";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSession } from "next-auth/react";

export default function ForCompaniesPage() {
  const { t } = useLanguage();
  const { data: session } = useSession();
  const isLoggedIn = !!session;
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="py-16" style={{
        background: '#F5F7FA'
      }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {t("companies.hero.title")}
          </h1>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto">
            {t("companies.hero.subtitle")}
          </p>
        </div>
      </section>

      {/* Benefits for Companies */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">{t("companies.why.title")}</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="card-gradient p-6">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4 bg-[#0F2A44]">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: '#000000' }}>{t("companies.why.funnel.title")}</h3>
              <p className="text-gray-700">
                {t("companies.why.funnel.desc")}
              </p>
            </div>
            <div className="card-gradient p-6">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4 bg-[#0F2A44]">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: '#000000' }}>{t("companies.why.tryFirst.title")}</h3>
              <p className="text-gray-700">
                {t("companies.why.tryFirst.desc")}
              </p>
            </div>
            <div className="card-gradient p-6">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4 bg-[#0F2A44]">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: '#000000' }}>{t("companies.why.scout.title")}</h3>
              <p className="text-gray-700">
                {t("companies.why.scout.desc")}
              </p>
            </div>
            <div className="card-gradient p-6">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4 bg-[#0F2A44]">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: '#000000' }}>{t("companies.why.safe.title")}</h3>
              <p className="text-gray-700">
                {t("companies.why.safe.desc")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16" style={{
        background: 'linear-gradient(135deg, rgba(242, 106, 163, 0.03) 0%, rgba(245, 159, 193, 0.03) 35%, rgba(111, 211, 238, 0.03) 70%, rgba(76, 195, 230, 0.03) 100%)'
      }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">{t("companies.howItWorks.title")}</h2>
          <div className="space-y-6">
            <div className="flex items-start">
              <span className="flex-shrink-0 w-10 h-10 bg-[#0F2A44] text-white rounded-full flex items-center justify-center font-bold mr-4">1</span>
              <div>
                <h3 className="text-xl font-semibold mb-2" style={{ color: '#000000' }}>{t("companies.howItWorks.1.title")}</h3>
                <p className="text-gray-700">
                  {t("companies.howItWorks.1.desc")}
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="flex-shrink-0 w-10 h-10 bg-[#0F2A44] text-white rounded-full flex items-center justify-center font-bold mr-4">2</span>
              <div>
                <h3 className="text-xl font-semibold mb-2" style={{ color: '#000000' }}>{t("companies.howItWorks.2.title")}</h3>
                <p className="text-gray-700">
                  {t("companies.howItWorks.2.desc")}
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="flex-shrink-0 w-10 h-10 bg-[#0F2A44] text-white rounded-full flex items-center justify-center font-bold mr-4">3</span>
              <div>
                <h3 className="text-xl font-semibold mb-2" style={{ color: '#000000' }}>{t("companies.howItWorks.3.title")}</h3>
                <p className="text-gray-700">
                  {t("companies.howItWorks.3.desc")}
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="flex-shrink-0 w-10 h-10 bg-[#0F2A44] text-white rounded-full flex items-center justify-center font-bold mr-4">4</span>
              <div>
                <h3 className="text-xl font-semibold mb-2" style={{ color: '#000000' }}>{t("companies.howItWorks.4.title")}</h3>
                <p className="text-gray-700">
                  {t("companies.howItWorks.4.desc")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">{t("companies.features.title")}</h2>
          <div className="space-y-4">
            <div className="flex items-start">
              <svg className="w-6 h-6 gradient-text mr-3 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#3BB143' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <h3 className="font-semibold mb-1" style={{ color: '#3BB143' }}>{t("companies.features.search.title")}</h3>
                <p className="text-gray-700 text-sm">{t("companies.features.search.desc")}</p>
              </div>
            </div>
            <div className="flex items-start">
              <svg className="w-6 h-6 gradient-text mr-3 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#3BB143' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <h3 className="font-semibold mb-1" style={{ color: '#3BB143' }}>{t("companies.features.messaging.title")}</h3>
                <p className="text-gray-700 text-sm">{t("companies.features.messaging.desc")}</p>
              </div>
            </div>
            <div className="flex items-start">
              <svg className="w-6 h-6 gradient-text mr-3 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#3BB143' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <h3 className="font-semibold mb-1" style={{ color: '#3BB143' }}>{t("companies.features.credit.title")}</h3>
                <p className="text-gray-700 text-sm">{t("companies.features.credit.desc")}</p>
              </div>
            </div>
            <div className="flex items-start">
              <svg className="w-6 h-6 gradient-text mr-3 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#3BB143' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <h3 className="font-semibold mb-1" style={{ color: '#3BB143' }}>{t("companies.features.hours.title")}</h3>
                <p className="text-gray-700 text-sm">{t("companies.features.hours.desc")}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isLoggedIn && (
        <section className="py-16 bg-[#0F2A44] text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">
              {t("companies.cta.title")}
            </h2>
            <p className="text-xl mb-8 opacity-90">
              {t("companies.cta.subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup/company"
                className="btn-secondary px-8 py-3"
              >
                {t("companies.cta.signUp")}
              </Link>
              <a
                href="mailto:info@senpaicareer.com"
                className="px-8 py-3 bg-white/20 backdrop-blur-sm border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:gradient-text transition-all"
              >
                {t("companies.cta.contact")}
              </a>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="text-white py-12" style={{
        background: 'linear-gradient(135deg, rgba(17, 24, 39, 1) 0%, rgba(31, 41, 55, 1) 100%)',
        borderTop: '2px solid transparent',
        borderImage: 'linear-gradient(135deg, rgba(242, 106, 163, 0.3) 0%, rgba(245, 159, 193, 0.3) 35%, rgba(111, 211, 238, 0.3) 70%, rgba(76, 195, 230, 0.3) 100%) 1'
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-white">{t("common.copyright")}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

