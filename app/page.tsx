"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSession } from "@/contexts/AuthContext";
import HeroLogo from "@/components/HeroLogo";
import { motion } from "framer-motion";
import { Suspense, lazy, memo } from "react";
import { fadeIn, slideUp, staggerContainer, staggerItem, cardVariants, buttonVariants } from "@/lib/animations";
import Footer from "@/components/Footer";

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
    <div className="min-h-screen">
      {/* Hero Section */}
      <section 
        className="py-20 md:py-28"
        style={{ backgroundColor: '#D7FFEF' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mb-6">
              <HeroLogo />
            </div>
            <p 
              className="text-lg md:text-xl mb-8 max-w-2xl mx-auto"
              style={{ color: '#000000' }}
            >
              {t("home.hero.subtitle")}
            </p>
            {!isLoggedIn && (
              <motion.div 
                className="flex flex-col sm:flex-row gap-5 sm:gap-4 justify-center"
                variants={staggerItem}
              >
                <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                  <Link
                    href="/signup/student"
                    className="btn-primary px-4 sm:px-6 md:px-8 py-3 text-sm sm:text-base"
                  >
                    {t("home.hero.getStarted")}
                  </Link>
                </motion.div>
                <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                  <Link
                    href="/signup/company"
                    className="btn-secondary px-4 sm:px-6 md:px-8 py-3 text-sm sm:text-base"
                  >
                    {t("home.hero.forCompanies")}
                  </Link>
                </motion.div>
              </motion.div>
            )}
          </div>
        </div>
      </section>


      {/* What is Senpai Career */}
      <Suspense fallback={<SectionFallback />}>
        <WhatIsSection />
      </Suspense>

      {/* Our Mission */}
      <section 
        className="py-16 md:py-20" 
        style={{ backgroundColor: '#D7FFEF' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 
            className="text-2xl md:text-3xl font-bold text-center mb-12"
            style={{ color: '#000000' }}
          >
            {t("home.mission.title")}
          </h2>
          <div className="max-w-3xl mx-auto text-center">
            <p 
              className="text-lg mb-8" 
              style={{ color: '#000000' }}
            >
              {t("home.mission.intro")}
            </p>
            <ul className="text-left space-y-4 max-w-2xl mx-auto">
              {[
                t("home.mission.mentors"),
                t("home.mission.opportunities"),
                t("home.mission.connect"),
                t("home.mission.confidence")
              ].map((item, index) => (
                <li 
                  key={index} 
                  className="flex items-start"
                >
                  <svg 
                    className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" 
                    fill="none" 
                    stroke="#059669" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span style={{ color: '#000000' }}>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* What is OB/OG Visit */}
      <section 
        className="py-16 md:py-20 bg-white"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 
            className="text-2xl md:text-3xl font-bold text-center mb-12"
            style={{ color: '#111827' }}
          >
            {t("home.obogVisit.title")}
          </h2>
          <div className="max-w-3xl mx-auto">
            <p 
              className="text-lg mb-8 text-center" 
              style={{ color: '#374151' }}
            >
              {t("home.obogVisit.desc")}
            </p>
            <div className="card-gradient-static p-8">
              <h3 className="text-xl font-semibold mb-6" style={{ color: '#111827' }}>
                {t("home.obogVisit.howItWorks")}
              </h3>
              <ol className="space-y-6">
                {[
                  { title: t("home.obogVisit.browse"), desc: t("home.obogVisit.browseDesc") },
                  { title: t("home.obogVisit.message"), desc: t("home.obogVisit.messageDesc") },
                  { title: t("home.obogVisit.schedule"), desc: t("home.obogVisit.scheduleDesc") }
                ].map((step, index) => (
                  <li 
                    key={index} 
                    className="flex items-start"
                  >
                    <span 
                      className="flex-shrink-0 w-8 h-8 text-white rounded flex items-center justify-center font-semibold mr-4"
                      style={{ backgroundColor: '#0F2A44' }}
                    >
                      {index + 1}
                    </span>
                    <div>
                      <h4 className="font-semibold mb-1" style={{ color: '#111827' }}>{step.title}</h4>
                      <p style={{ color: 'rgb(0, 0, 0)' }}>{step.desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
            <div className="text-center mt-8">
              <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                <Link href="/for-students/ob-visit" className="btn-primary px-6 py-3">
                  {t("home.obogVisit.learnMore")}
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Career Journey Flow */}
      <section 
        className="py-16 md:py-20" 
        style={{ backgroundColor: '#D7FFEF' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 
            className="text-2xl md:text-3xl font-bold text-center mb-12"
            style={{ color: '#000000' }}
          >
            {t("home.journey.title")}
          </h2>
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row items-start justify-between gap-4 md:gap-2">
              {/* Step 1 */}
              <div className="flex-1 text-center p-4 w-full md:w-auto flex flex-col items-center">
                <div className="w-16 h-16 rounded flex items-center justify-center mb-4 flex-shrink-0" style={{ backgroundColor: '#0F2A44' }}>
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold mb-2" style={{ color: '#000000' }}>{t("home.journey.obog")}</h3>
                <p className="text-sm" style={{ color: '#000000' }}>{t("home.journey.obogDesc")}</p>
              </div>

              {/* Arrow - Horizontal on desktop, Vertical on mobile */}
              <div className="flex items-center justify-center self-center">
                <svg className="w-6 h-6 md:rotate-0 rotate-90" fill="none" stroke="#9CA3AF" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>

              {/* Step 2 */}
              <div className="flex-1 text-center p-4 w-full md:w-auto flex flex-col items-center">
                <div className="w-16 h-16 rounded flex items-center justify-center mb-4 flex-shrink-0" style={{ backgroundColor: '#0F2A44' }}>
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="font-semibold mb-2" style={{ color: '#000000' }}>{t("home.journey.internship")}</h3>
                <p className="text-sm" style={{ color: '#000000' }}>{t("home.journey.internshipDesc")}</p>
              </div>

              {/* Arrow - Horizontal on desktop, Vertical on mobile */}
              <div className="flex items-center justify-center self-center">
                <svg className="w-6 h-6 md:rotate-0 rotate-90" fill="none" stroke="#9CA3AF" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>

              {/* Step 3 */}
              <div className="flex-1 text-center p-4 w-full md:w-auto flex flex-col items-center">
                <div className="w-16 h-16 rounded flex items-center justify-center mb-4 flex-shrink-0" style={{ backgroundColor: '#0F2A44' }}>
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <h3 className="font-semibold mb-2" style={{ color: '#000000' }}>{t("home.journey.recruiting")}</h3>
                <p className="text-sm" style={{ color: '#000000' }}>{t("home.journey.recruitingDesc")}</p>
              </div>

              {/* Arrow - Horizontal on desktop, Vertical on mobile */}
              <div className="flex items-center justify-center self-center">
                <svg className="w-6 h-6 md:rotate-0 rotate-90" fill="none" stroke="#9CA3AF" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>

              {/* Step 4 */}
              <div className="flex-1 text-center p-4 w-full md:w-auto flex flex-col items-center">
                <div className="w-16 h-16 rounded flex items-center justify-center mb-4 flex-shrink-0" style={{ backgroundColor: '#0F2A44' }}>
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="font-semibold mb-2" style={{ color: '#000000' }}>{t("home.journey.scout")}</h3>
                <p className="text-sm" style={{ color: '#000000' }}>{t("home.journey.scoutDesc")}</p>
              </div>
            </div>

            <div className="mt-10 text-center">
              <p className="mb-6" style={{ color: '#000000' }}>
                {t("home.journey.path")}
              </p>
              <div className="flex flex-col sm:flex-row gap-5 sm:gap-4 justify-center">
                <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                  <Link href="/ob-list" className="btn-primary px-6 py-3">
                    {t("home.journey.browse")}
                  </Link>
                </motion.div>
                <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                  <Link href="/for-students/internships" className="btn-secondary px-6 py-3">
                    {t("home.journey.viewInternships")}
                  </Link>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isLoggedIn && (
        <section 
          className="py-16 md:py-20 text-white" 
          style={{ backgroundColor: '#0F2A44' }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              {t("home.cta.title")}
            </h2>
            <p className="text-lg mb-8 opacity-90">
              {t("home.cta.subtitle")}{" "}
              <motion.a 
                href="mailto:info@senpaicareer.com" 
                className="underline hover:opacity-80"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                info@senpaicareer.com
              </motion.a>
            </p>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 justify-center">
              <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                <Link
                  href="/signup/student"
                  className="px-4 sm:px-6 md:px-8 py-3 bg-white font-medium rounded transition-colors text-sm sm:text-base"
                  style={{ color: '#0F2A44', borderRadius: '6px' }}
                >
                  {t("home.cta.signUpStudent")}
                </Link>
              </motion.div>
              <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                <Link
                  href="/signup/obog"
                  className="px-4 sm:px-6 md:px-8 py-3 bg-transparent border border-white font-medium rounded transition-colors hover:bg-gray-800 hover:text-navy text-sm sm:text-base"
                  style={{ borderRadius: '6px' }}
                >
                  {t("home.cta.signUpObog")}
                </Link>
              </motion.div>
            </div>
          </div>
        </section>
      )}

      <Footer variant="full" />
    </div>
  );
}
