"use client";

import Header from "@/components/Header";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSession } from "next-auth/react";
import HeroLogo from "@/components/HeroLogo";
import { motion } from "framer-motion";
import { fadeIn, slideUp, staggerContainer, staggerItem, cardVariants, buttonVariants, swoopIn } from "@/lib/animations";
import AnimatedText from "@/components/AnimatedText";

export default function Home() {
  const { t } = useLanguage();
  const { data: session } = useSession();
  const isLoggedIn = !!session;
  
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <motion.section 
        className="relative py-20" 
        style={{
          background: 'linear-gradient(135deg, rgba(242, 106, 163, 0.08) 0%, rgba(245, 159, 193, 0.08) 35%, rgba(111, 211, 238, 0.08) 70%, rgba(76, 195, 230, 0.08) 100%)'
        }}
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
            <motion.div className="mb-8" variants={staggerItem}>
              <HeroLogo />
            </motion.div>
            <motion.p 
              className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto"
              variants={staggerItem}
            >
              <AnimatedText key={t("home.hero.subtitle")}>
                {t("home.hero.subtitle")}
              </AnimatedText>
            </motion.p>
            {!isLoggedIn && (
              <motion.div 
                className="flex flex-col sm:flex-row gap-4 justify-center"
                variants={staggerItem}
              >
                <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                  <Link
                    href="/signup/student"
                    className="btn-primary px-8 py-3"
                  >
                    {t("home.hero.getStarted")}
                  </Link>
                </motion.div>
                <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                  <Link
                    href="/signup/company"
                    className="btn-secondary px-8 py-3"
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
      <motion.section 
        className="py-16 bg-white" 
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 1) 0%, rgba(247, 252, 254, 1) 100%)'
        }}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeIn}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2 
            className="text-3xl font-bold text-center text-gray-900 mb-12"
            variants={slideUp}
          >
            <AnimatedText key={t("home.whatIs.title")}>
              {t("home.whatIs.title")}
            </AnimatedText>
          </motion.h2>
          <motion.div 
            className="grid md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <motion.div 
              className="text-center p-6"
              variants={cardVariants}
              whileHover="hover"
            >
              <motion.div 
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 gradient-bg"
                whileHover={{ scale: 1.1, rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </motion.div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: '#000000' }}>
                <AnimatedText key={t("home.whatIs.obog")}>{t("home.whatIs.obog")}</AnimatedText>
              </h3>
              <p className="text-gray-600">
                <AnimatedText key={t("home.whatIs.obogDesc")}>{t("home.whatIs.obogDesc")}</AnimatedText>
              </p>
            </motion.div>
            <motion.div 
              className="text-center p-6"
              variants={cardVariants}
              whileHover="hover"
            >
              <motion.div 
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 gradient-bg"
                whileHover={{ scale: 1.1, rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </motion.div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: '#000000' }}>
                <AnimatedText key={t("home.whatIs.internship")}>{t("home.whatIs.internship")}</AnimatedText>
              </h3>
              <p className="text-gray-600">
                <AnimatedText key={t("home.whatIs.internshipDesc")}>{t("home.whatIs.internshipDesc")}</AnimatedText>
              </p>
            </motion.div>
            <motion.div 
              className="text-center p-6"
              variants={cardVariants}
              whileHover="hover"
            >
              <motion.div 
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 gradient-bg"
                whileHover={{ scale: 1.1, rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </motion.div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: '#000000' }}>
                <AnimatedText key={t("home.whatIs.recruiting")}>{t("home.whatIs.recruiting")}</AnimatedText>
              </h3>
              <p className="text-gray-600">
                <AnimatedText key={t("home.whatIs.recruitingDesc")}>{t("home.whatIs.recruitingDesc")}</AnimatedText>
              </p>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Our Mission */}
      <section className="py-16" style={{
        background: 'linear-gradient(135deg, rgba(242, 106, 163, 0.03) 0%, rgba(245, 159, 193, 0.03) 35%, rgba(111, 211, 238, 0.03) 70%, rgba(76, 195, 230, 0.03) 100%)'
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            {t("home.mission.title")}
          </h2>
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-lg text-gray-700 mb-6">
              {t("home.mission.intro")}
            </p>
            <ul className="text-left space-y-4 max-w-2xl mx-auto">
              <li className="flex items-start">
                <svg className="w-6 h-6 mr-3 flex-shrink-0 mt-1 gradient-text" fill="none" stroke="#1ed01e" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">{t("home.mission.mentors")}</span>
              </li>
              <li className="flex items-start">
                <svg className="w-6 h-6 mr-3 flex-shrink-0 mt-1 gradient-text" fill="none" stroke="#1ed01e" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">{t("home.mission.opportunities")}</span>
              </li>
              <li className="flex items-start">
                <svg className="w-6 h-6 mr-3 flex-shrink-0 mt-1 gradient-text" fill="none" stroke="#1ed01e" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">{t("home.mission.connect")}</span>
              </li>
              <li className="flex items-start">
                <svg className="w-6 h-6 mr-3 flex-shrink-0 mt-1 gradient-text" fill="none" stroke="#1ed01e" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">{t("home.mission.confidence")}</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* What is OB/OG Visit */}
      <section className="py-16 bg-white" style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 1) 0%, rgba(247, 252, 254, 1) 100%)'
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            {t("home.obogVisit.title")}
          </h2>
          <div className="max-w-3xl mx-auto">
            <p className="text-lg text-gray-700 mb-8 text-center">
              {t("home.obogVisit.desc")}
            </p>
            <div className="rounded-lg p-8 card-gradient">
              <h3 className="text-xl font-semibold mb-4" style={{ color: '#000000' }}>{t("home.obogVisit.howItWorks")}</h3>
              <ol className="space-y-4">
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-8 h-8 gradient-bg text-white rounded-full flex items-center justify-center font-semibold mr-4">1</span>
                  <div>
                    <h4 className="font-semibold mb-1" style={{ color: '#000000' }}>{t("home.obogVisit.browse")}</h4>
                    <p className="text-gray-600">{t("home.obogVisit.browseDesc")}</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-8 h-8 gradient-bg text-white rounded-full flex items-center justify-center font-semibold mr-4">2</span>
                  <div>
                    <h4 className="font-semibold mb-1" style={{ color: '#000000' }}>{t("home.obogVisit.message")}</h4>
                    <p className="text-gray-600">{t("home.obogVisit.messageDesc")}</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 w-8 h-8 gradient-bg text-white rounded-full flex items-center justify-center font-semibold mr-4">3</span>
                  <div>
                    <h4 className="font-semibold mb-1" style={{ color: '#000000' }}>{t("home.obogVisit.schedule")}</h4>
                    <p className="text-gray-600">{t("home.obogVisit.scheduleDesc")}</p>
                  </div>
                </li>
              </ol>
            </div>
            <motion.div 
              className="text-center mt-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                <Link
                  href="/about/ob-visit"
                  className="btn-primary px-6 py-3"
                >
                  {t("home.obogVisit.learnMore")}
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* OB → Internship → New Grad → Scout Flow */}
      <motion.section 
        className="py-16" 
        style={{
          background: 'linear-gradient(135deg, rgba(242, 106, 163, 0.03) 0%, rgba(245, 159, 193, 0.03) 35%, rgba(111, 211, 238, 0.03) 70%, rgba(76, 195, 230, 0.03) 100%)'
        }}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.2 }}
        variants={fadeIn}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2 
            className="text-3xl font-bold text-center text-gray-900 mb-12"
            variants={slideUp}
          >
            <AnimatedText key={t("home.journey.title")}>
              {t("home.journey.title")}
            </AnimatedText>
          </motion.h2>
          <div className="max-w-5xl mx-auto">
            <motion.div 
              className="flex flex-col md:flex-row items-center justify-between gap-6"
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              {/* Step 1: OB/OG Visit */}
              <motion.div 
                className="flex-1 text-center"
                variants={staggerItem}
                whileHover={{ 
                  rotateY: 5,
                  rotateX: 5,
                  scale: 1.05,
                  transition: { duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }
                }}
                style={{ transformStyle: "preserve-3d" }}
              >
                <motion.div 
                  className="w-20 h-20 rounded-full gradient-bg flex items-center justify-center mx-auto mb-4"
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </motion.div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: '#000000' }}>
                  <AnimatedText key={t("home.journey.obog")}>{t("home.journey.obog")}</AnimatedText>
                </h3>
                <p className="text-sm text-gray-600">
                  <AnimatedText key={t("home.journey.obogDesc")}>{t("home.journey.obogDesc")}</AnimatedText>
                </p>
              </motion.div>

              {/* Arrow */}
              <motion.div 
                className="hidden md:block"
                variants={staggerItem}
                whileHover={{ scale: 1.2, x: 5 }}
                transition={{ duration: 0.2 }}
              >
                <svg className="w-8 h-8 gradient-text" fill="none" stroke="#3399ff" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </motion.div>

              {/* Step 2: Internship */}
              <motion.div 
                className="flex-1 text-center"
                variants={staggerItem}
                whileHover={{ 
                  rotateY: -5,
                  rotateX: 5,
                  scale: 1.05,
                  transition: { duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }
                }}
                style={{ transformStyle: "preserve-3d" }}
              >
                <motion.div 
                  className="w-20 h-20 rounded-full gradient-bg flex items-center justify-center mx-auto mb-4"
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </motion.div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: '#000000' }}>
                  <AnimatedText key={t("home.journey.internship")}>{t("home.journey.internship")}</AnimatedText>
                </h3>
                <p className="text-sm text-gray-600">
                  <AnimatedText key={t("home.journey.internshipDesc")}>{t("home.journey.internshipDesc")}</AnimatedText>
                </p>
              </motion.div>

              {/* Arrow */}
              <motion.div 
                className="hidden md:block"
                variants={staggerItem}
                whileHover={{ scale: 1.2, x: 5 }}
                transition={{ duration: 0.2 }}
              >
                <svg className="w-8 h-8 gradient-text" fill="none" stroke="#3399ff" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </motion.div>

              {/* Step 3: New Grad */}
              <motion.div 
                className="flex-1 text-center"
                variants={staggerItem}
                whileHover={{ 
                  rotateY: 5,
                  rotateX: -5,
                  scale: 1.05,
                  transition: { duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }
                }}
                style={{ transformStyle: "preserve-3d" }}
              >
                <motion.div 
                  className="w-20 h-20 rounded-full gradient-bg flex items-center justify-center mx-auto mb-4"
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </motion.div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: '#000000' }}>
                  <AnimatedText key={t("home.journey.recruiting")}>{t("home.journey.recruiting")}</AnimatedText>
                </h3>
                <p className="text-sm text-gray-600">
                  <AnimatedText key={t("home.journey.recruitingDesc")}>{t("home.journey.recruitingDesc")}</AnimatedText>
                </p>
              </motion.div>

              {/* Arrow */}
              <motion.div 
                className="hidden md:block"
                variants={staggerItem}
                whileHover={{ scale: 1.2, x: 5 }}
                transition={{ duration: 0.2 }}
              >
                <svg className="w-8 h-8 gradient-text" fill="none" stroke="#3399ff" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </motion.div>

              {/* Step 4: Scout */}
              <motion.div 
                className="flex-1 text-center"
                variants={staggerItem}
                whileHover={{ 
                  rotateY: -5,
                  rotateX: -5,
                  scale: 1.05,
                  transition: { duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }
                }}
                style={{ transformStyle: "preserve-3d" }}
              >
                <motion.div 
                  className="w-20 h-20 rounded-full gradient-bg flex items-center justify-center mx-auto mb-4"
                  whileHover={{ rotate: 360, scale: 1.1 }}
                  transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </motion.div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: '#000000' }}>
                  <AnimatedText key={t("home.journey.scout")}>{t("home.journey.scout")}</AnimatedText>
                </h3>
                <p className="text-sm text-gray-600">
                  <AnimatedText key={t("home.journey.scoutDesc")}>{t("home.journey.scoutDesc")}</AnimatedText>
                </p>
              </motion.div>
            </motion.div>
            <motion.div 
              className="mt-8 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <p className="text-gray-700 mb-4">
                <AnimatedText key={t("home.journey.path")}>{t("home.journey.path")}</AnimatedText>
              </p>
              <motion.div 
                className="flex flex-col sm:flex-row gap-4 justify-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
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
        <section className="py-16 gradient-bg text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">
              {t("home.cta.title")}
            </h2>
            <p className="text-xl mb-8 opacity-90">
              {t("home.cta.subtitle")}{" "}
              <a href="mailto:info@senpaicareer.com" className="underline hover:opacity-80">
                info@senpaicareer.com
              </a>
            </p>
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
                  className="btn-secondary px-8 py-3"
                >
                  {t("home.cta.signUpStudent")}
                </Link>
              </motion.div>
              <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                <Link
                  href="/signup/obog"
                  className="px-8 py-3 bg-white/20 backdrop-blur-sm border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:gradient-text transition-all"
                >
                  {t("home.cta.signUpObog")}
                </Link>
              </motion.div>
            </motion.div>
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
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">Senpai Career</h3>
              <p className="text-white text-sm">
                {t("about.hero.subtitle")}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">{t("home.footer.students")}</h4>
              <ul className="space-y-2 text-sm text-white">
                <li><Link href="/ob-visit" className="hover:gradient-text transition-colors text-white">{t("nav.obVisit")}</Link></li>
                <li><Link href="/internships" className="hover:gradient-text transition-colors text-white">{t("nav.internship")}</Link></li>
                <li><Link href="/recruiting" className="hover:gradient-text transition-colors text-white">{t("nav.recruiting")}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">{t("home.footer.companies")}</h4>
              <ul className="space-y-2 text-sm text-white">
                <li><Link href="/for-companies" className="hover:gradient-text transition-colors text-white">{t("home.footer.companyInfo")}</Link></li>
                <li><Link href="/subsidy" className="hover:gradient-text transition-colors text-white">{t("nav.subsidy")}</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">{t("home.footer.contact")}</h4>
              <p className="text-sm text-white">
                <a href="mailto:info@senpaicareer.com" className="hover:gradient-text transition-colors text-white">
                  info@senpaicareer.com
                </a>
              </p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-white">
            <p>{t("common.copyright")}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

