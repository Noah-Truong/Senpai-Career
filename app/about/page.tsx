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
      <section className="py-16 md:py-20" style={{ backgroundColor: '#F5F7FA' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 
            className="text-3xl md:text-4xl font-bold mb-6"
            style={{ color: '#111827' }}
          >
            {t("about.hero.title")}
          </h1>
          <p 
            className="text-lg md:text-xl mb-10"
            style={{ color: '#374151' }}
          >
            {t("about.hero.subtitle")}
          </p>
          <Link
            href="/about/ob-visit"
            className="btn-primary px-8 py-3 text-base font-medium inline-flex items-center"
          >
            {t("nav.obAbout")}
          </Link>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 
            className="text-2xl md:text-3xl font-bold mb-8"
            style={{ color: '#111827' }}
          >
            {t("about.mission.title")}
          </h2>
          <div className="space-y-4">
            <p style={{ color: '#374151', fontSize: '16px', lineHeight: '1.7' }}>
              {t("about.mission.p1")}
            </p>
            <p style={{ color: '#374151', fontSize: '16px', lineHeight: '1.7' }}>
              {t("about.mission.p2")}
            </p>
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-16" style={{ backgroundColor: '#F5F7FA' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 
            className="text-2xl md:text-3xl font-bold mb-8"
            style={{ color: '#111827' }}
          >
            {t("about.problem.title")}
          </h2>
          <div className="space-y-6">
            <div 
              className="bg-white p-6 border rounded"
              style={{ borderColor: '#E5E7EB', borderRadius: '6px' }}
            >
              <h3 
                className="text-xl font-semibold mb-4"
                style={{ color: '#111827' }}
              >
                {t("about.problem.students.title")}
              </h3>
              <ul className="space-y-3">
                {[
                  t("about.problem.students.1"),
                  t("about.problem.students.2"),
                  t("about.problem.students.3"),
                  t("about.problem.students.4"),
                ].map((item, i) => (
                  <li key={i} className="flex items-start">
                    <span 
                      className="mr-3 mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: '#0F2A44' }}
                    />
                    <span style={{ color: '#374151' }}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div 
              className="bg-white p-6 border rounded"
              style={{ borderColor: '#E5E7EB', borderRadius: '6px' }}
            >
              <h3 
                className="text-xl font-semibold mb-4"
                style={{ color: '#111827' }}
              >
                {t("about.problem.companies.title")}
              </h3>
              <ul className="space-y-3">
                {[
                  t("about.problem.companies.1"),
                  t("about.problem.companies.2"),
                  t("about.problem.companies.3"),
                  t("about.problem.companies.4"),
                ].map((item, i) => (
                  <li key={i} className="flex items-start">
                    <span 
                      className="mr-3 mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: '#0F2A44' }}
                    />
                    <span style={{ color: '#374151' }}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Overview */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 
            className="text-2xl md:text-3xl font-bold mb-8"
            style={{ color: '#111827' }}
          >
            {t("about.howItWorks.title")}
          </h2>
          <div className="space-y-8">
            {[
              { title: t("about.howItWorks.1.title"), desc: t("about.howItWorks.1.desc") },
              { title: t("about.howItWorks.2.title"), desc: t("about.howItWorks.2.desc") },
              { title: t("about.howItWorks.3.title"), desc: t("about.howItWorks.3.desc") },
            ].map((step, i) => (
              <div key={i} className="flex items-start">
                <div 
                  className="flex-shrink-0 w-10 h-10 text-white rounded flex items-center justify-center font-semibold mr-5"
                  style={{ backgroundColor: '#0F2A44', borderRadius: '6px' }}
                >
                  {i + 1}
                </div>
                <div>
                  <h3 
                    className="text-lg font-semibold mb-2"
                    style={{ color: '#111827' }}
                  >
                    {step.title}
                  </h3>
                  <p style={{ color: '#6B7280' }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Market Context */}
      <section className="py-16" style={{ backgroundColor: '#F5F7FA' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 
            className="text-2xl md:text-3xl font-bold mb-8"
            style={{ color: '#111827' }}
          >
            {t("about.market.title")}
          </h2>
          <div 
            className="bg-white p-8 border rounded"
            style={{ borderColor: '#E5E7EB', borderRadius: '6px' }}
          >
            <p className="mb-4" style={{ color: '#374151', lineHeight: '1.7' }}>
              {t("about.market.p1")}
            </p>
            <p style={{ color: '#374151', lineHeight: '1.7' }}>
              {t("about.market.p2")}
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isLoggedIn && (
        <section className="py-16 text-white" style={{ backgroundColor: '#0F2A44' }}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">{t("about.cta.title")}</h2>
            <p className="text-lg mb-8 opacity-90">
              {t("about.cta.subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup/student"
                className="px-8 py-3 bg-white font-medium rounded transition-colors hover:bg-gray-100"
                style={{ color: '#0F2A44', borderRadius: '6px' }}
              >
                {t("about.cta.signUpStudent")}
              </Link>
              <Link
                href="/signup/company"
                className="px-8 py-3 bg-transparent border border-white font-medium rounded transition-colors hover:bg-white/10"
                style={{ borderRadius: '6px' }}
              >
                {t("about.cta.signUpCompany")}
              </Link>
              <Link
                href="/signup/obog"
                className="px-8 py-3 bg-transparent border border-white font-medium rounded transition-colors hover:bg-white/10"
                style={{ borderRadius: '6px' }}
              >
                {t("about.cta.signUpObog")}
              </Link>
            </div>
            <p className="mt-8 opacity-80">
              {t("about.cta.questions")}{" "}
              <a href="mailto:info@senpaicareer.com" className="underline hover:opacity-80">
                info@senpaicareer.com
              </a>
            </p>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-8" style={{ backgroundColor: '#0A1E32' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-white opacity-60 text-sm">{t("common.copyright")}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
