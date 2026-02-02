"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSession } from "@/contexts/AuthContext";
import Footer from "@/components/Footer";

export default function ForOBOGPage() {
  const { t } = useLanguage();
  const { data: session } = useSession();
  const isLoggedIn = !!session;
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-16" style={{
        background: 'linear-gradient(135deg, #F26AA314 0%, #F59FC114 35%, #6FD3EE14 70%, #4CC3E614 100%)'
      }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {t("obog.hero.title")}
          </h1>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto">
            {t("obog.hero.subtitle")}
          </p>
        </div>
      </section>

      {/* Why Become an OB/OG */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">{t("obog.why.title")}</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="card-gradient p-6">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4 bg-[#0F2A44]">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: '#000000' }}>{t("obog.why.giveBack.title")}</h3>
              <p className="text-gray-700">
                {t("obog.why.giveBack.desc")}
              </p>
            </div>
            <div className="card-gradient p-6">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4 bg-[#0F2A44]">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: '#000000' }}>{t("obog.why.expertise.title")}</h3>
              <p className="text-gray-700">
                {t("obog.why.expertise.desc")}
              </p>
            </div>
            <div className="card-gradient p-6">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4 bg-[#0F2A44]">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: '#000000' }}>{t("obog.why.network.title")}</h3>
              <p className="text-gray-700">
                {t("obog.why.network.desc")}
              </p>
            </div>
            <div className="card-gradient p-6">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4 bg-[#0F2A44]">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: '#000000' }}>{t("obog.why.flexible.title")}</h3>
              <p className="text-gray-700">
                {t("obog.why.flexible.desc")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Who Can Be an OB/OG */}
      <section className="py-16" style={{
        background: 'linear-gradient(135deg, #F26AA30D 0%, #F59FC10D 35%, #6FD3EE0D 70%, #4CC3E60D 100%)'
      }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">{t("obog.who.title")}</h2>
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-3 text-gray-900">{t("obog.who.professionals.title")}</h3>
              <p className="text-gray-700 mb-4">
                {t("obog.who.professionals.desc")}
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="gradient-text mr-2">•</span>
                  <span>{t("obog.who.professionals.1")}</span>
                </li>
                <li className="flex items-start">
                  <span className="gradient-text mr-2">•</span>
                  <span>{t("obog.who.professionals.2")}</span>
                </li>
                <li className="flex items-start">
                  <span className="gradient-text mr-2">•</span>
                  <span>{t("obog.who.professionals.3")}</span>
                </li>
                <li className="flex items-start">
                  <span className="gradient-text mr-2">•</span>
                  <span>{t("obog.who.professionals.4")}</span>
                </li>
              </ul>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-3 text-gray-900">{t("obog.who.holders.title")}</h3>
              <p className="text-gray-700 mb-4">
                {t("obog.who.holders.desc")}
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="gradient-text mr-2">•</span>
                  <span>{t("obog.who.holders.1")}</span>
                </li>
                <li className="flex items-start">
                  <span className="gradient-text mr-2">•</span>
                  <span>{t("obog.who.holders.2")}</span>
                </li>
                <li className="flex items-start">
                  <span className="gradient-text mr-2">•</span>
                  <span>{t("obog.who.holders.3")}</span>
                </li>
                <li className="flex items-start">
                  <span className="gradient-text mr-2">•</span>
                  <span>{t("obog.who.holders.4")}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">{t("obog.howItWorks.title")}</h2>
          <div className="space-y-6">
            <div className="flex items-start">
              <span className="flex-shrink-0 w-10 h-10 bg-[#0F2A44] text-white rounded-full flex items-center justify-center font-bold mr-4">1</span>
              <div>
                <h3 className="text-xl font-semibold mb-2" style={{ color: '#000000' }}>{t("obog.howItWorks.1.title")}</h3>
                <p className="text-gray-700">
                  {t("obog.howItWorks.1.desc")}
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="flex-shrink-0 w-10 h-10 bg-[#0F2A44] text-white rounded-full flex items-center justify-center font-bold mr-4">2</span>
              <div>
                <h3 className="text-xl font-semibold mb-2" style={{ color: '#000000' }}>{t("obog.howItWorks.2.title")}</h3>
                <p className="text-gray-700">
                  {t("obog.howItWorks.2.desc")}
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="flex-shrink-0 w-10 h-10 bg-[#0F2A44] text-white rounded-full flex items-center justify-center font-bold mr-4">3</span>
              <div>
                <h3 className="text-xl font-semibold mb-2" style={{ color: '#000000' }}>{t("obog.howItWorks.3.title")}</h3>
                <p className="text-gray-700">
                  {t("obog.howItWorks.3.desc")}
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="flex-shrink-0 w-10 h-10 bg-[#0F2A44] text-white rounded-full flex items-center justify-center font-bold mr-4">4</span>
              <div>
                <h3 className="text-xl font-semibold mb-2" style={{ color: '#000000' }}>{t("obog.howItWorks.4.title")}</h3>
                <p className="text-gray-700">
                  {t("obog.howItWorks.4.desc")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Rules & Guidelines */}
      <section className="py-16" style={{
        background: 'linear-gradient(135deg, #F26AA30D 0%, #F59FC10D 35%, #6FD3EE0D 70%, #4CC3E60D 100%)'
      }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">{t("obog.rules.title")}</h2>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <p className="text-gray-700 mb-4">
              {t("obog.rules.desc")}
            </p>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="gradient-text mr-2">•</span>
                <span>{t("obog.rules.1")}</span>
              </li>
              <li className="flex items-start">
                <span className="gradient-text mr-2">•</span>
                <span>{t("obog.rules.2")}</span>
              </li>
              <li className="flex items-start">
                <span className="gradient-text mr-2">•</span>
                <span>{t("obog.rules.3")}</span>
              </li>
              <li className="flex items-start">
                <span className="gradient-text mr-2">•</span>
                <span>{t("obog.rules.4")}</span>
              </li>
              <li className="flex items-start">
                <span className="gradient-text mr-2">•</span>
                <span>{t("obog.rules.5")}</span>
              </li>
              <li className="flex items-start">
                <span className="gradient-text mr-2">•</span>
                <span>{t("obog.rules.6")}</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isLoggedIn && (
        <section className="py-16 bg-[#0F2A44] text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">
              {t("obog.cta.title")}
            </h2>
            <p className="text-xl mb-8 opacity-90">
              {t("obog.cta.subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-4 justify-center">
              <Link
                href="/signup/obog"
                className="btn-secondary px-4 sm:px-6 md:px-8 py-3 text-sm sm:text-base"
              >
                {t("obog.cta.signUp")}
              </Link>
              <a
                href="mailto:info@senpaicareer.com"
                className="px-4 sm:px-6 md:px-8 py-3 bg-white/20 backdrop-blur-sm border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:gradient-text transition-all text-sm sm:text-base"
              >
                {t("obog.cta.learnMore")}
              </a>
            </div>
          </div>
        </section>
      )}

      <Footer variant="full" />
    </div>
  );
}

