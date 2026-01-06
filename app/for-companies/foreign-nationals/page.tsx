"use client";

import Header from "@/components/Header";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSession } from "next-auth/react";

export default function ForeignRecruitmentPage() {
  const { t } = useLanguage();
  const { data: session } = useSession();
  const isLoggedIn = !!session;

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="py-20" style={{
        background: '#F5F7FA'
      }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {t("foreignRecruitment.title")}
          </h1>
          <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
            {t("foreignRecruitment.subtitle")}
          </p>
          <div className="bg-white bg-opacity-80 backdrop-blur-sm rounded-lg p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {t("foreignRecruitment.hero.title")}
            </h2>
            <p className="text-lg text-gray-700">
              {t("foreignRecruitment.hero.desc")}
            </p>
          </div>
        </div>
      </section>

      {/* Challenges Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t("foreignRecruitment.challenges.title")}
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card-gradient p-6 text-center">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#0F2A44] mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t("foreignRecruitment.challenges.visa")}
              </h3>
              <p className="text-gray-700 text-sm">
                {t("foreignRecruitment.challenges.visaDesc")}
              </p>
            </div>

            <div className="card-gradient p-6 text-center">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#0F2A44] mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t("foreignRecruitment.challenges.culture")}
              </h3>
              <p className="text-gray-700 text-sm">
                {t("foreignRecruitment.challenges.cultureDesc")}
              </p>
            </div>

            <div className="card-gradient p-6 text-center">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#0F2A44] mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t("foreignRecruitment.challenges.language")}
              </h3>
              <p className="text-gray-700 text-sm">
                {t("foreignRecruitment.challenges.languageDesc")}
              </p>
            </div>

            <div className="card-gradient p-6 text-center">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#0F2A44] mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {t("foreignRecruitment.challenges.compliance")}
              </h3>
              <p className="text-gray-700 text-sm">
                {t("foreignRecruitment.challenges.complianceDesc")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t("foreignRecruitment.solutions.title")}
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="card-gradient p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#0F2A44] text-white font-bold mr-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {t("foreignRecruitment.solutions.screening")}
                </h3>
              </div>
              <p className="text-gray-700">
                {t("foreignRecruitment.solutions.screeningDesc")}
              </p>
            </div>

            <div className="card-gradient p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#0F2A44] text-white font-bold mr-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {t("foreignRecruitment.solutions.visa")}
                </h3>
              </div>
              <p className="text-gray-700">
                {t("foreignRecruitment.solutions.visaDesc")}
              </p>
            </div>

            <div className="card-gradient p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#0F2A44] text-white font-bold mr-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {t("foreignRecruitment.solutions.onboarding")}
                </h3>
              </div>
              <p className="text-gray-700">
                {t("foreignRecruitment.solutions.onboardingDesc")}
              </p>
            </div>

            <div className="card-gradient p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[#0F2A44] text-white font-bold mr-3">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {t("foreignRecruitment.solutions.legal")}
                </h3>
              </div>
              <p className="text-gray-700">
                {t("foreignRecruitment.solutions.legalDesc")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Legal Requirements */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t("foreignRecruitment.requirements.title")}
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="card-gradient p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {t("foreignRecruitment.requirements.visa")}
                </h3>
                <p className="text-gray-700">
                  {t("foreignRecruitment.requirements.visaDesc")}
                </p>
              </div>

              <div className="card-gradient p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {t("foreignRecruitment.requirements.contracts")}
                </h3>
                <p className="text-gray-700">
                  {t("foreignRecruitment.requirements.contractsDesc")}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="card-gradient p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {t("foreignRecruitment.requirements.insurance")}
                </h3>
                <p className="text-gray-700">
                  {t("foreignRecruitment.requirements.insuranceDesc")}
                </p>
              </div>

              <div className="card-gradient p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {t("foreignRecruitment.requirements.language")}
                </h3>
                <p className="text-gray-700">
                  {t("foreignRecruitment.requirements.languageDesc")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Call to Action */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {t("foreignRecruitment.cta.title")}
          </h2>
          <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
            {t("foreignRecruitment.cta.desc")}
          </p>
          <Link href={isLoggedIn ? "/company/students" : "/register"} className="btn-primary text-lg px-8 py-4">
            {t("foreignRecruitment.cta.button")}
          </Link>
        </div>
      </section>
    </div>
  );
}
