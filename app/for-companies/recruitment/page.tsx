"use client";

import Header from "@/components/Header";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSession } from "next-auth/react";

export default function RecruitmentProcessPage() {
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
            {t("recruitmentProcess.title")}
          </h1>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto">
            {t("recruitmentProcess.subtitle")}
          </p>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t("recruitmentProcess.intro.title")}
            </h2>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto">
              {t("recruitmentProcess.intro.desc")}
            </p>
          </div>
        </div>
      </section>

      {/* Process Steps */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Step 1 */}
            <div className="card-gradient p-6">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#0F2A44] text-white font-bold mr-3">
                  1
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {t("recruitmentProcess.step1.title")}
                </h3>
              </div>
              <p className="text-gray-700">
                {t("recruitmentProcess.step1.desc")}
              </p>
            </div>

            {/* Step 2 */}
            <div className="card-gradient p-6">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#0F2A44] text-white font-bold mr-3">
                  2
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {t("recruitmentProcess.step2.title")}
                </h3>
              </div>
              <p className="text-gray-700">
                {t("recruitmentProcess.step2.desc")}
              </p>
            </div>

            {/* Step 3 */}
            <div className="card-gradient p-6">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#0F2A44] text-white font-bold mr-3">
                  3
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {t("recruitmentProcess.step3.title")}
                </h3>
              </div>
              <p className="text-gray-700">
                {t("recruitmentProcess.step3.desc")}
              </p>
            </div>

            {/* Step 4 */}
            <div className="card-gradient p-6">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#0F2A44] text-white font-bold mr-3">
                  4
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {t("recruitmentProcess.step4.title")}
                </h3>
              </div>
              <p className="text-gray-700">
                {t("recruitmentProcess.step4.desc")}
              </p>
            </div>

            {/* Step 5 */}
            <div className="card-gradient p-6">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#0F2A44] text-white font-bold mr-3">
                  5
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {t("recruitmentProcess.step5.title")}
                </h3>
              </div>
              <p className="text-gray-700">
                {t("recruitmentProcess.step5.desc")}
              </p>
            </div>

            {/* Step 6 */}
            <div className="card-gradient p-6">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[#0F2A44] text-white font-bold mr-3">
                  6
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {t("recruitmentProcess.step6.title")}
                </h3>
              </div>
              <p className="text-gray-700">
                {t("recruitmentProcess.step6.desc")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t("recruitmentProcess.benefits.title")}
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center bg-[#0F2A44] mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {t("recruitmentProcess.benefits.efficiency")}
              </h3>
              <p className="text-gray-700">
                {t("recruitmentProcess.benefits.efficiencyDesc")}
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center bg-[#0F2A44] mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {t("recruitmentProcess.benefits.quality")}
              </h3>
              <p className="text-gray-700">
                {t("recruitmentProcess.benefits.qualityDesc")}
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center bg-[#0F2A44] mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {t("recruitmentProcess.benefits.support")}
              </h3>
              <p className="text-gray-700">
                {t("recruitmentProcess.benefits.supportDesc")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {t("recruitmentProcess.cta.title")}
          </h2>
          <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
            {t("recruitmentProcess.cta.desc")}
          </p>
          <Link href={isLoggedIn ? "/company/profile" : "/register"} className="btn-primary text-lg px-8 py-4">
            {t("recruitmentProcess.cta.button")}
          </Link>
        </div>
      </section>
    </div>
  );
}
