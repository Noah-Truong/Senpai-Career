"use client";

import Header from "@/components/Header";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSession } from "next-auth/react";
import HeroLogo from "@/components/HeroLogo";
import { motion } from "framer-motion";
import { Suspense, lazy, memo } from "react";
import { fadeIn, slideUp, staggerContainer, staggerItem, cardVariants, buttonVariants } from "@/lib/animations";

// Lazy load heavy sections for better performance
const WhatIsSection = lazy(() => import("@/components/sections/WhatIsSection"));
const MissionSection = lazy(() => import("@/components/sections/MissionSection"));
const OBOGVisitSection = lazy(() => import("@/components/sections/OBOGVisitSection"));
const ForStudentsSection = lazy(() => import("@/components/sections/ForStudentsSection"));
const ForCompaniesSection = lazy(() => import("@/components/sections/ForCompaniesSection"));
const TestimonialsSection = lazy(() => import("@/components/sections/TestimonialsSection"));
const CTASection = lazy(() => import("@/components/sections/CTASection"));

// Loading fallback component
const SectionFallback = () => (
  <div className="py-16 md:py-20 animate-pulse">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-8"></div>
      <div className="space-y-4">
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </div>
    </div>
  </div>
);

export default function Home() {
  const { t } = useLanguage();
  const { data: session } = useSession();
  const isLoggedIn = !!session;
  
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <motion.section 
        className="py-20 md:py-28"
        style={{ backgroundColor: '#F5F7FA' }}
        initial="initial"
        animate="animate"
        variants={fadeIn}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <motion.div className="mb-6" variants={staggerItem}>
              <HeroLogo />
            </motion.div>
            <motion.p 
              className="text-lg md:text-xl mb-8 max-w-2xl mx-auto"
              style={{ color: '#374151' }}
              variants={staggerItem}
            >
              {t("home.hero.subtitle")}
            </motion.p>
            {!isLoggedIn && (
              <motion.div 
                className="flex flex-col sm:flex-row gap-4 justify-center"
                variants={staggerItem}
              >
                <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                  <Link
                    href="/signup/student"
                    className="btn-primary px-8 py-3 text-base"
                  >
                    {t("home.hero.getStarted")}
                  </Link>
                </motion.div>
                <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                  <Link
                    href="/signup/company"
                    className="btn-secondary px-8 py-3 text-base"
                  >
                    {t("home.hero.forCompanies")}
                  </Link>
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </motion.section>


      {/* What is Senpai Career */}
      <Suspense fallback={<SectionFallback />}>
        <WhatIsSection />
      </Suspense>

      {/* Our Mission */}
      <motion.section 
        className="py-16 md:py-20" 
        style={{ backgroundColor: '#F5F7FA' }}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeIn}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2 
            className="text-2xl md:text-3xl font-bold text-center mb-12"
            style={{ color: '#111827' }}
            variants={slideUp}
          >
            {t("home.mission.title")}
          </motion.h2>
          <div className="max-w-3xl mx-auto text-center">
            <motion.p 
              className="text-lg mb-8" 
              style={{ color: '#374151' }}
              variants={slideUp}
            >
              {t("home.mission.intro")}
            </motion.p>
            <motion.ul 
              className="text-left space-y-4 max-w-2xl mx-auto"
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              {[
                t("home.mission.mentors"),
                t("home.mission.opportunities"),
                t("home.mission.connect"),
                t("home.mission.confidence")
              ].map((item, index) => (
                <motion.li 
                  key={index} 
                  className="flex items-start"
                  variants={staggerItem}
                  whileHover={{ x: 4 }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.svg 
                    className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" 
                    fill="none" 
                    stroke="#059669" 
                    viewBox="0 0 24 24"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </motion.svg>
                  <span style={{ color: '#374151' }}>{item}</span>
                </motion.li>
              ))}
            </motion.ul>
          </div>
        </div>
      </motion.section>

      {/* What is OB/OG Visit */}
      <motion.section 
        className="py-16 md:py-20 bg-white"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeIn}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2 
            className="text-2xl md:text-3xl font-bold text-center mb-12"
            style={{ color: '#111827' }}
            variants={slideUp}
          >
            {t("home.obogVisit.title")}
          </motion.h2>
          <div className="max-w-3xl mx-auto">
            <motion.p 
              className="text-lg mb-8 text-center" 
              style={{ color: '#374151' }}
              variants={slideUp}
            >
              {t("home.obogVisit.desc")}
            </motion.p>
            <motion.div 
              className="card-gradient p-8"
              variants={cardVariants}
              whileHover="hover"
            >
              <h3 className="text-xl font-semibold mb-6" style={{ color: '#111827' }}>
                {t("home.obogVisit.howItWorks")}
              </h3>
              <motion.ol 
                className="space-y-6"
                variants={staggerContainer}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
              >
                {[
                  { title: t("home.obogVisit.browse"), desc: t("home.obogVisit.browseDesc") },
                  { title: t("home.obogVisit.message"), desc: t("home.obogVisit.messageDesc") },
                  { title: t("home.obogVisit.schedule"), desc: t("home.obogVisit.scheduleDesc") }
                ].map((step, index) => (
                  <motion.li 
                    key={index} 
                    className="flex items-start"
                    variants={staggerItem}
                    whileHover={{ x: 4 }}
                    transition={{ duration: 0.2 }}
                  >
                    <motion.span 
                      className="flex-shrink-0 w-8 h-8 text-white rounded flex items-center justify-center font-semibold mr-4"
                      style={{ backgroundColor: '#0F2A44' }}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      {index + 1}
                    </motion.span>
                    <div>
                      <h4 className="font-semibold mb-1" style={{ color: '#111827' }}>{step.title}</h4>
                      <p style={{ color: '#6B7280' }}>{step.desc}</p>
                    </div>
                  </motion.li>
                ))}
              </motion.ol>
            </motion.div>
            <motion.div 
              className="text-center mt-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.25 }}
            >
              <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                <Link href="/about/ob-visit" className="btn-primary px-6 py-3">
                  {t("home.obogVisit.learnMore")}
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Career Journey Flow */}
      <motion.section 
        className="py-16 md:py-20" 
        style={{ backgroundColor: '#F5F7FA' }}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeIn}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2 
            className="text-2xl md:text-3xl font-bold text-center mb-12"
            style={{ color: '#111827' }}
            variants={slideUp}
          >
            {t("home.journey.title")}
          </motion.h2>
          <div className="max-w-5xl mx-auto">
            <motion.div 
              className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-2"
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              {/* Step 1 */}
              <motion.div 
                className="flex-1 text-center p-4"
                variants={staggerItem}
                whileHover={{ 
                  rotateY: 5,
                  rotateX: 3,
                  scale: 1.05,
                  transition: { duration: 0.2 }
                }}
                style={{ transformStyle: "preserve-3d" }}
              >
                <motion.div 
                  className="w-16 h-16 rounded flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: '#0F2A44' }}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </motion.div>
                <h3 className="font-semibold mb-2" style={{ color: '#111827' }}>{t("home.journey.obog")}</h3>
                <p className="text-sm" style={{ color: '#6B7280' }}>{t("home.journey.obogDesc")}</p>
              </motion.div>

              {/* Arrow */}
              <motion.div 
                className="hidden md:block"
                variants={staggerItem}
                whileHover={{ scale: 1.2, x: 3 }}
                transition={{ duration: 0.2 }}
              >
                <svg className="w-6 h-6" fill="none" stroke="#9CA3AF" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </motion.div>

              {/* Step 2 */}
              <motion.div 
                className="flex-1 text-center p-4"
                variants={staggerItem}
                whileHover={{ 
                  rotateY: -5,
                  rotateX: 3,
                  scale: 1.05,
                  transition: { duration: 0.2 }
                }}
                style={{ transformStyle: "preserve-3d" }}
              >
                <motion.div 
                  className="w-16 h-16 rounded flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: '#0F2A44' }}
                  whileHover={{ scale: 1.1, rotate: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </motion.div>
                <h3 className="font-semibold mb-2" style={{ color: '#111827' }}>{t("home.journey.internship")}</h3>
                <p className="text-sm" style={{ color: '#6B7280' }}>{t("home.journey.internshipDesc")}</p>
              </motion.div>

              {/* Arrow */}
              <motion.div 
                className="hidden md:block"
                variants={staggerItem}
                whileHover={{ scale: 1.2, x: 3 }}
                transition={{ duration: 0.2 }}
              >
                <svg className="w-6 h-6" fill="none" stroke="#9CA3AF" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </motion.div>

              {/* Step 3 */}
              <motion.div 
                className="flex-1 text-center p-4"
                variants={staggerItem}
                whileHover={{ 
                  rotateY: 5,
                  rotateX: -3,
                  scale: 1.05,
                  transition: { duration: 0.2 }
                }}
                style={{ transformStyle: "preserve-3d" }}
              >
                <motion.div 
                  className="w-16 h-16 rounded flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: '#0F2A44' }}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </motion.div>
                <h3 className="font-semibold mb-2" style={{ color: '#111827' }}>{t("home.journey.recruiting")}</h3>
                <p className="text-sm" style={{ color: '#6B7280' }}>{t("home.journey.recruitingDesc")}</p>
              </motion.div>

              {/* Arrow */}
              <motion.div 
                className="hidden md:block"
                variants={staggerItem}
                whileHover={{ scale: 1.2, x: 3 }}
                transition={{ duration: 0.2 }}
              >
                <svg className="w-6 h-6" fill="none" stroke="#9CA3AF" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </motion.div>

              {/* Step 4 */}
              <motion.div 
                className="flex-1 text-center p-4"
                variants={staggerItem}
                whileHover={{ 
                  rotateY: -5,
                  rotateX: -3,
                  scale: 1.05,
                  transition: { duration: 0.2 }
                }}
                style={{ transformStyle: "preserve-3d" }}
              >
                <motion.div 
                  className="w-16 h-16 rounded flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: '#0F2A44' }}
                  whileHover={{ scale: 1.1, rotate: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </motion.div>
                <h3 className="font-semibold mb-2" style={{ color: '#111827' }}>{t("home.journey.scout")}</h3>
                <p className="text-sm" style={{ color: '#6B7280' }}>{t("home.journey.scoutDesc")}</p>
              </motion.div>
            </motion.div>

            <motion.div 
              className="mt-10 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.25 }}
            >
              <motion.p 
                className="mb-6" 
                style={{ color: '#374151' }}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.25, delay: 0.1 }}
              >
                {t("home.journey.path")}
              </motion.p>
              <motion.div 
                className="flex flex-col sm:flex-row gap-4 justify-center"
                variants={staggerContainer}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
              >
                <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                  <Link href="/ob-list" className="btn-primary px-6 py-3">
                    {t("home.journey.browse")}
                  </Link>
                </motion.div>
                <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                  <Link href="/internships" className="btn-secondary px-6 py-3">
                    {t("home.journey.viewInternships")}
                  </Link>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      {!isLoggedIn && (
        <motion.section 
          className="py-16 md:py-20 text-white" 
          style={{ backgroundColor: '#0F2A44' }}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeIn}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.h2 
              className="text-2xl md:text-3xl font-bold mb-4"
              variants={slideUp}
            >
              {t("home.cta.title")}
            </motion.h2>
            <motion.p 
              className="text-lg mb-8 opacity-90"
              variants={slideUp}
            >
              {t("home.cta.subtitle")}{" "}
              <motion.a 
                href="mailto:info@senpaicareer.com" 
                className="underline hover:opacity-80"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                info@senpaicareer.com
              </motion.a>
            </motion.p>
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                <Link
                  href="/signup/student"
                  className="px-8 py-3 bg-white font-medium rounded transition-colors"
                  style={{ color: '#0F2A44', borderRadius: '6px' }}
                >
                  {t("home.cta.signUpStudent")}
                </Link>
              </motion.div>
              <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                <Link
                  href="/signup/obog"
                  className="px-8 py-3 bg-transparent border border-white font-medium rounded transition-colors hover:bg-white hover:text-navy"
                  style={{ borderRadius: '6px' }}
                >
                  {t("home.cta.signUpObog")}
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>
      )}

      {/* Footer */}
      <motion.footer 
        className="py-12 text-white" 
        style={{ backgroundColor: '#0A1E32' }}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeIn}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="grid md:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <motion.div variants={staggerItem}>
              <h3 className="text-lg font-semibold mb-4">Senpai Career</h3>
              <p className="text-sm opacity-80">
                {t("about.hero.subtitle")}
              </p>
            </motion.div>
            <motion.div variants={staggerItem}>
              <h4 className="font-semibold mb-4">{t("home.footer.students")}</h4>
              <ul className="space-y-2 text-sm opacity-80">
                <motion.li 
                  whileHover={{ x: 4 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link href="/about/ob-visit" className="hover:opacity-100 transition-opacity">{t("nav.obVisit") || "OB/OG Visits"}</Link>
                </motion.li>
                <motion.li 
                  whileHover={{ x: 4 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link href="/internships" className="hover:opacity-100 transition-opacity">{t("nav.internship")}</Link>
                </motion.li>
                <motion.li 
                  whileHover={{ x: 4 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link href="/recruiting" className="hover:opacity-100 transition-opacity">{t("nav.recruiting")}</Link>
                </motion.li>
              </ul>
            </motion.div>
            <motion.div variants={staggerItem}>
              <h4 className="font-semibold mb-4">{t("home.footer.companies")}</h4>
              <ul className="space-y-2 text-sm opacity-80">
                <motion.li 
                  whileHover={{ x: 4 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link href="/for-companies" className="hover:opacity-100 transition-opacity">{t("home.footer.companyInfo")}</Link>
                </motion.li>
                <motion.li 
                  whileHover={{ x: 4 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link href="/subsidy" className="hover:opacity-100 transition-opacity">{t("nav.subsidy")}</Link>
                </motion.li>
              </ul>
            </motion.div>
            <motion.div variants={staggerItem}>
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
            </motion.div>
          </motion.div>
          <motion.div 
            className="mt-8 pt-8 text-center text-sm opacity-60"
            style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 0.6 }}
            viewport={{ once: true }}
            transition={{ duration: 0.25 }}
          >
            <p>{t("common.copyright")}</p>
          </motion.div>
        </div>
      </motion.footer>
    </div>
  );
}
