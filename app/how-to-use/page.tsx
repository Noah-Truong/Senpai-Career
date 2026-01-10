"use client";

import Header from "@/components/Header";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";
import { motion } from "framer-motion";
import { fadeIn, slideUp, staggerContainer, staggerItem, cardVariants, buttonVariants } from "@/lib/animations";

type UserType = "student" | "obog" | "company";

export default function HowToUsePage() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<UserType>("student");

  const tabs: { id: UserType; label: string; icon: JSX.Element }[] = [
    {
      id: "student",
      label: t("howto.tab.student"),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
    {
      id: "obog",
      label: t("howto.tab.obog"),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      id: "company",
      label: t("howto.tab.company"),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <motion.section 
        className="py-16" 
        style={{ background: "#F5F7FA" }}
        initial="initial"
        animate="animate"
        variants={fadeIn}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 
            className="text-4xl font-bold mb-4" 
            style={{ color: "#0F2A44" }}
            variants={slideUp}
          >
            {t("howto.title")}
          </motion.h1>
          <motion.p 
            className="text-lg text-gray-600 max-w-2xl mx-auto"
            variants={slideUp}
          >
            {t("howto.subtitle")}
          </motion.p>
        </div>
      </motion.section>

      {/* Tab Navigation */}
      <motion.section
        className="border-b"
        style={{ borderColor: "#E5E7EB" }}
        initial="initial"
        animate="animate"
        variants={fadeIn}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="flex justify-center"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-all border-b-2 ${
                  activeTab === tab.id
                    ? "border-[#0F2A44] text-[#0F2A44]"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
                variants={staggerItem}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
              >
                {tab.icon}
                {tab.label}
              </motion.button>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Content Sections */}
      <motion.div
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
        initial="initial"
        animate="animate"
        variants={fadeIn}
      >
        {/* Student Guide */}
        {activeTab === "student" && (
          <motion.div 
            className="space-y-12"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {/* Getting Started */}
            <motion.div variants={staggerItem}>
              <h2 className="text-2xl font-bold mb-6" style={{ color: "#0F2A44" }}>
                {t("howto.student.gettingStarted.title")}
              </h2>
              <motion.div className="space-y-4" variants={staggerContainer} initial="initial" animate="animate">
                {[1, 2, 3].map((step) => (
                  <motion.div 
                    key={step} 
                    className="flex items-start bg-white p-5 rounded-lg shadow-sm"
                    variants={cardVariants}
                    whileHover="hover"
                  >
                    <div
                      className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold mr-4 text-white"
                      style={{ backgroundColor: "#0F2A44" }}
                    >
                      {step}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {t(`howto.student.gettingStarted.step${step}.title`)}
                      </h3>
                      <p className="text-gray-600">
                        {t(`howto.student.gettingStarted.step${step}.desc`)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Features */}
            <motion.div variants={staggerItem}>
              <h2 className="text-2xl font-bold mb-6" style={{ color: "#0F2A44" }}>
                {t("howto.student.features.title")}
              </h2>
              <motion.div 
                className="grid md:grid-cols-2 gap-4"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
              >
                <motion.div className="bg-white p-5 rounded-lg shadow-sm border-l-4" style={{ borderColor: "#0F2A44" }} variants={cardVariants} whileHover="hover">
                  <h3 className="font-semibold text-gray-900 mb-2">{t("howto.student.features.obog.title")}</h3>
                  <p className="text-gray-600 text-sm">{t("howto.student.features.obog.desc")}</p>
                </motion.div>
                <motion.div className="bg-white p-5 rounded-lg shadow-sm border-l-4" style={{ borderColor: "#0F2A44" }} variants={cardVariants} whileHover="hover">
                  <h3 className="font-semibold text-gray-900 mb-2">{t("howto.student.features.internships.title")}</h3>
                  <p className="text-gray-600 text-sm">{t("howto.student.features.internships.desc")}</p>
                </motion.div>
                <motion.div className="bg-white p-5 rounded-lg shadow-sm border-l-4" style={{ borderColor: "#0F2A44" }} variants={cardVariants} whileHover="hover">
                  <h3 className="font-semibold text-gray-900 mb-2">{t("howto.student.features.recruiting.title")}</h3>
                  <p className="text-gray-600 text-sm">{t("howto.student.features.recruiting.desc")}</p>
                </motion.div>
                <motion.div className="bg-white p-5 rounded-lg shadow-sm border-l-4" style={{ borderColor: "#0F2A44" }} variants={cardVariants} whileHover="hover">
                  <h3 className="font-semibold text-gray-900 mb-2">{t("howto.student.features.messages.title")}</h3>
                  <p className="text-gray-600 text-sm">{t("howto.student.features.messages.desc")}</p>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Tips */}
            <motion.div className="bg-blue-50 p-6 rounded-lg" variants={staggerItem}>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {t("howto.student.tips.title")}
              </h3>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  {t("howto.student.tips.1")}
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  {t("howto.student.tips.2")}
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  {t("howto.student.tips.3")}
                </li>
              </ul>
            </motion.div>

            {/* CTA */}
            <motion.div className="text-center" variants={staggerItem}>
              <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap" className="inline-block">
                <Link href="/signup/student" className="btn-primary px-8 py-3">
                  {t("howto.student.cta")}
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        )}

        {/* OB/OG Guide */}
        {activeTab === "obog" && (
          <motion.div 
            className="space-y-12"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {/* Getting Started */}
            <motion.div variants={staggerItem}>
              <h2 className="text-2xl font-bold mb-6" style={{ color: "#0F2A44" }}>
                {t("howto.obog.gettingStarted.title")}
              </h2>
              <motion.div className="space-y-4" variants={staggerContainer} initial="initial" animate="animate">
                {[1, 2, 3].map((step) => (
                  <motion.div key={step} className="flex items-start bg-white p-5 rounded-lg shadow-sm" variants={cardVariants} whileHover="hover">
                    <div
                      className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold mr-4 text-white"
                      style={{ backgroundColor: "#0F2A44" }}
                    >
                      {step}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {t(`howto.obog.gettingStarted.step${step}.title`)}
                      </h3>
                      <p className="text-gray-600">
                        {t(`howto.obog.gettingStarted.step${step}.desc`)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Profile Types */}
            <motion.div variants={staggerItem}>
              <h2 className="text-2xl font-bold mb-6" style={{ color: "#0F2A44" }}>
                {t("howto.obog.types.title")}
              </h2>
              <motion.div className="grid md:grid-cols-2 gap-6" variants={staggerContainer} initial="initial" animate="animate">
                <motion.div className="bg-white p-6 rounded-lg shadow-sm" variants={cardVariants} whileHover="hover">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: "#0F2A44" }}>
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{t("howto.obog.types.professional.title")}</h3>
                  <p className="text-gray-600 text-sm">{t("howto.obog.types.professional.desc")}</p>
                </motion.div>
                <motion.div className="bg-white p-6 rounded-lg shadow-sm" variants={cardVariants} whileHover="hover">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: "#0F2A44" }}>
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{t("howto.obog.types.jobOffer.title")}</h3>
                  <p className="text-gray-600 text-sm">{t("howto.obog.types.jobOffer.desc")}</p>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Tips */}
            <motion.div className="bg-green-50 p-6 rounded-lg" variants={staggerItem}>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {t("howto.obog.tips.title")}
              </h3>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  {t("howto.obog.tips.1")}
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  {t("howto.obog.tips.2")}
                </li>
                <li className="flex items-start">
                  <span className="text-green-600 mr-2">•</span>
                  {t("howto.obog.tips.3")}
                </li>
              </ul>
            </motion.div>

            {/* CTA */}
            <motion.div className="text-center" variants={staggerItem}>
              <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap" className="inline-block">
                <Link href="/signup/obog" className="btn-primary px-8 py-3">
                  {t("howto.obog.cta")}
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        )}

        {/* Company Guide */}
        {activeTab === "company" && (
          <motion.div 
            className="space-y-12"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {/* Getting Started */}
            <motion.div variants={staggerItem}>
              <h2 className="text-2xl font-bold mb-6" style={{ color: "#0F2A44" }}>
                {t("howto.company.gettingStarted.title")}
              </h2>
              <motion.div className="space-y-4" variants={staggerContainer} initial="initial" animate="animate">
                {[1, 2, 3, 4].map((step) => (
                  <motion.div key={step} className="flex items-start bg-white p-5 rounded-lg shadow-sm" variants={cardVariants} whileHover="hover">
                    <div
                      className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold mr-4 text-white"
                      style={{ backgroundColor: "#0F2A44" }}
                    >
                      {step}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {t(`howto.company.gettingStarted.step${step}.title`)}
                      </h3>
                      <p className="text-gray-600">
                        {t(`howto.company.gettingStarted.step${step}.desc`)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            {/* Features */}
            <motion.div variants={staggerItem}>
              <h2 className="text-2xl font-bold mb-6" style={{ color: "#0F2A44" }}>
                {t("howto.company.features.title")}
              </h2>
              <motion.div className="grid md:grid-cols-2 gap-4" variants={staggerContainer} initial="initial" animate="animate">
                <motion.div className="bg-white p-5 rounded-lg shadow-sm border-l-4" style={{ borderColor: "#0F2A44" }} variants={cardVariants} whileHover="hover">
                  <h3 className="font-semibold text-gray-900 mb-2">{t("howto.company.features.internship.title")}</h3>
                  <p className="text-gray-600 text-sm">{t("howto.company.features.internship.desc")}</p>
                </motion.div>
                <motion.div className="bg-white p-5 rounded-lg shadow-sm border-l-4" style={{ borderColor: "#0F2A44" }} variants={cardVariants} whileHover="hover">
                  <h3 className="font-semibold text-gray-900 mb-2">{t("howto.company.features.recruiting.title")}</h3>
                  <p className="text-gray-600 text-sm">{t("howto.company.features.recruiting.desc")}</p>
                </motion.div>
                <motion.div className="bg-white p-5 rounded-lg shadow-sm border-l-4" style={{ borderColor: "#0F2A44" }} variants={cardVariants} whileHover="hover">
                  <h3 className="font-semibold text-gray-900 mb-2">{t("howto.company.features.applications.title")}</h3>
                  <p className="text-gray-600 text-sm">{t("howto.company.features.applications.desc")}</p>
                </motion.div>
                <motion.div className="bg-white p-5 rounded-lg shadow-sm border-l-4" style={{ borderColor: "#0F2A44" }} variants={cardVariants} whileHover="hover">
                  <h3 className="font-semibold text-gray-900 mb-2">{t("howto.company.features.scout.title")}</h3>
                  <p className="text-gray-600 text-sm">{t("howto.company.features.scout.desc")}</p>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Credits Info */}
            <motion.div className="bg-amber-50 p-6 rounded-lg" variants={staggerItem}>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {t("howto.company.credits.title")}
              </h3>
              <p className="text-gray-600 text-sm mb-3">{t("howto.company.credits.desc")}</p>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li className="flex items-start">
                  <span className="text-amber-600 mr-2">•</span>
                  {t("howto.company.credits.1")}
                </li>
                <li className="flex items-start">
                  <span className="text-amber-600 mr-2">•</span>
                  {t("howto.company.credits.2")}
                </li>
              </ul>
            </motion.div>

            {/* CTA */}
            <motion.div className="text-center" variants={staggerItem}>
              <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap" className="inline-block">
                <Link href="/signup/company" className="btn-primary px-8 py-3">
                  {t("howto.company.cta")}
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </motion.div>

      {/* FAQ Section */}
      <motion.section
        className="py-16"
        style={{ background: "#F5F7FA" }}
        initial="initial"
        animate="animate"
        variants={fadeIn}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2 
            className="text-2xl font-bold mb-8 text-center" 
            style={{ color: "#0F2A44" }}
            variants={slideUp}
          >
            {t("howto.faq.title")}
          </motion.h2>
          <motion.div
            className="space-y-4"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {[1, 2, 3, 4].map((num) => (
              <motion.details key={num} className="bg-white p-5 rounded-lg shadow-sm group" variants={staggerItem}>
                <summary className="font-semibold text-gray-900 cursor-pointer list-none flex items-center justify-between">
                  {t(`howto.faq.q${num}`)}
                  <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="text-gray-600 mt-3">{t(`howto.faq.a${num}`)}</p>
              </motion.details>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Contact Section */}
      <motion.section
        className="py-12 bg-white"
        initial="initial"
        animate="animate"
        variants={fadeIn}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.p 
            className="text-gray-600"
            variants={slideUp}
          >
            {t("howto.contact.text")}{" "}
            <a href="mailto:info@senpaicareer.com" className="text-[#0F2A44] font-medium hover:underline">
              info@senpaicareer.com
            </a>
          </motion.p>
        </div>
      </motion.section>
    </div>
  );
}

