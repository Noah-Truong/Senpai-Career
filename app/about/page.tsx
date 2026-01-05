"use client";

import Header from "@/components/Header";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSession } from "next-auth/react";

export default function AboutPage() {
  const { t } = useLanguage();
  const { data: session } = useSession();
  const isLoggedIn = !!session;
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {t("about.hero.title")}
          </h1>
          <p className="text-2xl text-gray-700 mb-8">
            {t("about.hero.subtitle")}
          </p>
          <Link
            href="/about/ob-visit"
            className="btn-primary px-8 py-4 text-lg font-semibold whitespace-nowrap inline-flex items-center"
          >
            {t("nav.obAbout")}
          </Link>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">{t("about.mission.title")}</h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-lg text-gray-700 mb-6">
                {t("about.mission.p1")}
              </p>
              <p className="text-lg text-gray-700 mb-6">
                {t("about.mission.p2")}
              </p>
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">{t("about.problem.title")}</h2>
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-3 text-gray-900">{t("about.problem.students.title")}</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="gradient-text mr-2">•</span>
                  <span>{t("about.problem.students.1")}</span>
                </li>
                <li className="flex items-start">
                  <span className="gradient-text mr-2">•</span>
                  <span>{t("about.problem.students.2")}</span>
                </li>
                <li className="flex items-start">
                  <span className="gradient-text mr-2">•</span>
                  <span>{t("about.problem.students.3")}</span>
                </li>
                <li className="flex items-start">
                  <span className="gradient-text mr-2">•</span>
                  <span>{t("about.problem.students.4")}</span>
                </li>
              </ul>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-3 text-gray-900">{t("about.problem.companies.title")}</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="gradient-text mr-2">•</span>
                  <span>{t("about.problem.companies.1")}</span>
                </li>
                <li className="flex items-start">
                  <span className="gradient-text mr-2">•</span>
                  <span>{t("about.problem.companies.2")}</span>
                </li>
                <li className="flex items-start">
                  <span className="gradient-text mr-2">•</span>
                  <span>{t("about.problem.companies.3")}</span>
                </li>
                <li className="flex items-start">
                  <span className="gradient-text mr-2">•</span>
                  <span>{t("about.problem.companies.4")}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Overview */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">{t("about.howItWorks.title")}</h2>
          <div className="space-y-8">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-12 h-12 gradient-bg text-white rounded-full flex items-center justify-center font-bold text-xl mr-6">
                1
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">{t("about.howItWorks.1.title")}</h3>
                <p className="text-gray-700">
                  {t("about.howItWorks.1.desc")}
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-12 h-12 gradient-bg text-white rounded-full flex items-center justify-center font-bold text-xl mr-6">
                2
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">{t("about.howItWorks.2.title")}</h3>
                <p className="text-gray-700">
                  {t("about.howItWorks.2.desc")}
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 w-12 h-12 gradient-bg text-white rounded-full flex items-center justify-center font-bold text-xl mr-6">
                3
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">{t("about.howItWorks.3.title")}</h3>
                <p className="text-gray-700">
                  {t("about.howItWorks.3.desc")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Market Context */}
      <section className="py-16" style={{
          background: 'linear-gradient(135deg, rgba(242, 106, 163, 0.03) 0%, rgba(245, 159, 193, 0.03) 35%, rgba(111, 211, 238, 0.03) 70%, rgba(76, 195, 230, 0.03) 100%)'
        }}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">{t("about.market.title")}</h2>
            <div className="bg-white p-8 rounded-lg shadow-sm">
              <p className="text-lg text-gray-700 mb-6">
                {t("about.market.p1")}
              </p>
              <p className="text-lg text-gray-700">
                {t("about.market.p2")}
              </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isLoggedIn && (
        <section className="py-16 gradient-bg text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">{t("about.cta.title")}</h2>
            <p className="text-xl mb-8 opacity-90">
              {t("about.cta.subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup/student"
                className="btn-secondary px-8 py-3"
              >
                {t("about.cta.signUpStudent")}
              </Link>
              <Link
                href="/signup/company"
                className="px-8 py-3 bg-white/20 backdrop-blur-sm border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:gradient-text transition-all"
              >
                {t("about.cta.signUpCompany")}
              </Link>
              <Link
                href="/signup/obog"
                className="px-8 py-3 bg-white/20 backdrop-blur-sm border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:gradient-text transition-all"
              >
                {t("about.cta.signUpObog")}
              </Link>
            </div>
            <p className="mt-8 text-lg opacity-90">
              {t("about.cta.questions")}{" "}
              <a href="mailto:info@senpaicareer.com" className="underline hover:opacity-80">
                info@senpaicareer.com
              </a>
            </p>
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

