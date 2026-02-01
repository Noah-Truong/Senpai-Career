"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSession } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { fadeIn, slideUp, staggerContainer, staggerItem, cardVariants, buttonVariants } from "@/lib/animations";

export default function RecruitmentProcessPage() {
  const { t } = useLanguage();
  const { data: session } = useSession();
  const isLoggedIn = !!session;

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <motion.section 
        className="py-16" 
        style={{ background: '#D7FFEF' }}
        initial="initial"
        animate="animate"
        variants={fadeIn}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
            variants={slideUp}
          >
            {t("recruitmentProcess.title")}
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-700 max-w-2xl mx-auto"
            variants={slideUp}
          >
            {t("recruitmentProcess.subtitle")}
          </motion.p>
        </div>
      </motion.section>

      {/* Introduction */}
      <motion.section
        className="py-16 bg-white"
        initial="initial"
        animate="animate"
        variants={fadeIn}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-12"
            variants={slideUp}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t("recruitmentProcess.intro.title")}
            </h2>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto">
              {t("recruitmentProcess.intro.desc")}
            </p>
          </motion.div>
        </div>
      </motion.section>

      {/* Process Steps */}
      <motion.section
        className="py-16 bg-gray-50"
        initial="initial"
        animate="animate"
        variants={fadeIn}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="grid md:grid-cols-2 gap-8"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {[1, 2, 3, 4, 5, 6].map((step) => (
              <motion.div 
                key={step}
                className="card-gradient p-6"
                variants={cardVariants}
                whileHover="hover"
              >
                <div className="flex items-center mb-4">
                  <motion.div 
                    className="w-8 h-8 rounded-full flex items-center justify-center bg-[#0F2A44] text-white font-bold mr-3"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    {step}
                  </motion.div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {t(`recruitmentProcess.step${step}.title`)}
                  </h3>
                </div>
                <p className="text-gray-700">
                  {t(`recruitmentProcess.step${step}.desc`)}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Benefits */}
      <motion.section
        className="py-16 bg-white"
        initial="initial"
        animate="animate"
        variants={fadeIn}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-12"
            variants={slideUp}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t("recruitmentProcess.benefits.title")}
            </h2>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {[
              { icon: "M13 10V3L4 14h7v7l9-11h-7z", title: t("recruitmentProcess.benefits.efficiency"), desc: t("recruitmentProcess.benefits.efficiencyDesc") },
              { icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", title: t("recruitmentProcess.benefits.quality"), desc: t("recruitmentProcess.benefits.qualityDesc") },
              { icon: "M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0z", title: t("recruitmentProcess.benefits.support"), desc: t("recruitmentProcess.benefits.supportDesc") },
            ].map((benefit, index) => (
              <motion.div 
                key={index}
                className="text-center"
                variants={cardVariants}
                whileHover="hover"
              >
                <motion.div 
                  className="w-16 h-16 rounded-full flex items-center justify-center bg-[#0F2A44] mx-auto mb-4"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={benefit.icon} />
                  </svg>
                </motion.div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {benefit.title}
                </h3>
                <p className="text-gray-700">
                  {benefit.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Call to Action */}
      <motion.section
        className="py-16 bg-gray-50"
        initial="initial"
        animate="animate"
        variants={fadeIn}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2 
            className="text-3xl font-bold text-gray-900 mb-4"
            variants={slideUp}
          >
            {t("recruitmentProcess.cta.title")}
          </motion.h2>
          <motion.p 
            className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto"
            variants={slideUp}
          >
            {t("recruitmentProcess.cta.desc")}
          </motion.p>
          <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
            <Link href={isLoggedIn ? "/company/profile" : "/register"} className="btn-primary text-base sm:text-lg px-4 sm:px-6 md:px-8 py-3 sm:py-4">
              {t("recruitmentProcess.cta.button")}
            </Link>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
}
