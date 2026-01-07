"use client";

import Header from "@/components/Header";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { fadeIn, slideUp, staggerContainer, staggerItem, cardVariants, buttonVariants } from "@/lib/animations";
import { AnimatedSection, AnimatedHeading, AnimatedSubheading, AnimatedCard, AnimatedList, AnimatedListItem } from "@/components/PageWrapper";

export default function AboutPage() {
  const { t } = useLanguage();
  const { data: session } = useSession();
  const isLoggedIn = !!session;
  
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <AnimatedSection bgColor="light" className="text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedHeading size="lg">
            {t("about.hero.title")}
          </AnimatedHeading>
          <motion.p 
            className="text-lg md:text-xl mb-10"
            style={{ color: '#374151' }}
            variants={slideUp}
          >
            {t("about.hero.subtitle")}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.2 }}
          >
            <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
              <Link
                href="/about/ob-visit"
                className="btn-primary px-8 py-3 text-base font-medium inline-flex items-center"
              >
                {t("nav.obAbout")}
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </AnimatedSection>

      {/* Mission Statement */}
      <AnimatedSection>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSubheading>
            {t("about.mission.title")}
          </AnimatedSubheading>
          <motion.div 
            className="space-y-4"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <motion.p 
              style={{ color: '#374151', fontSize: '16px', lineHeight: '1.7' }}
              variants={staggerItem}
            >
              {t("about.mission.p1")}
            </motion.p>
            <motion.p 
              style={{ color: '#374151', fontSize: '16px', lineHeight: '1.7' }}
              variants={staggerItem}
            >
              {t("about.mission.p2")}
            </motion.p>
          </motion.div>
        </div>
      </AnimatedSection>

      {/* Problem Statement */}
      <AnimatedSection bgColor="light">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSubheading>
            {t("about.problem.title")}
          </AnimatedSubheading>
          <motion.div 
            className="space-y-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <AnimatedCard variants={cardVariants} whileHover="hover">
              <h3 
                className="text-xl font-semibold mb-4"
                style={{ color: '#111827' }}
              >
                {t("about.problem.students.title")}
              </h3>
              <AnimatedList className="space-y-3">
                {[
                  t("about.problem.students.1"),
                  t("about.problem.students.2"),
                  t("about.problem.students.3"),
                  t("about.problem.students.4"),
                ].map((item, i) => (
                  <AnimatedListItem key={i} className="flex items-start">
                    <motion.span 
                      className="mr-3 mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: '#0F2A44' }}
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.2, delay: i * 0.05 }}
                    />
                    <span style={{ color: '#374151' }}>{item}</span>
                  </AnimatedListItem>
                ))}
              </AnimatedList>
            </AnimatedCard>
            <AnimatedCard variants={cardVariants} whileHover="hover">
              <h3 
                className="text-xl font-semibold mb-4"
                style={{ color: '#111827' }}
              >
                {t("about.problem.companies.title")}
              </h3>
              <AnimatedList className="space-y-3">
                {[
                  t("about.problem.companies.1"),
                  t("about.problem.companies.2"),
                  t("about.problem.companies.3"),
                  t("about.problem.companies.4"),
                ].map((item, i) => (
                  <AnimatedListItem key={i} className="flex items-start">
                    <motion.span 
                      className="mr-3 mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: '#0F2A44' }}
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.2, delay: i * 0.05 }}
                    />
                    <span style={{ color: '#374151' }}>{item}</span>
                  </AnimatedListItem>
                ))}
              </AnimatedList>
            </AnimatedCard>
          </motion.div>
        </div>
      </AnimatedSection>

      {/* Platform Overview */}
      <AnimatedSection>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSubheading>
            {t("about.howItWorks.title")}
          </AnimatedSubheading>
          <motion.div 
            className="space-y-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {[
              { title: t("about.howItWorks.1.title"), desc: t("about.howItWorks.1.desc") },
              { title: t("about.howItWorks.2.title"), desc: t("about.howItWorks.2.desc") },
              { title: t("about.howItWorks.3.title"), desc: t("about.howItWorks.3.desc") },
            ].map((step, i) => (
              <motion.div 
                key={i} 
                className="flex items-start"
                variants={staggerItem}
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                <motion.div 
                  className="flex-shrink-0 w-10 h-10 text-white rounded flex items-center justify-center font-semibold mr-5"
                  style={{ backgroundColor: '#0F2A44', borderRadius: '6px' }}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  {i + 1}
                </motion.div>
                <div>
                  <h3 
                    className="text-lg font-semibold mb-2"
                    style={{ color: '#111827' }}
                  >
                    {step.title}
                  </h3>
                  <p style={{ color: '#6B7280' }}>{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </AnimatedSection>

      {/* Market Context */}
      <AnimatedSection bgColor="light">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSubheading>
            {t("about.market.title")}
          </AnimatedSubheading>
          <AnimatedCard variants={cardVariants} whileHover="hover">
            <motion.p 
              className="mb-4" 
              style={{ color: '#374151', lineHeight: '1.7' }}
              variants={staggerItem}
            >
              {t("about.market.p1")}
            </motion.p>
            <motion.p 
              style={{ color: '#374151', lineHeight: '1.7' }}
              variants={staggerItem}
            >
              {t("about.market.p2")}
            </motion.p>
          </AnimatedCard>
        </div>
      </AnimatedSection>

      {/* CTA Section */}
      {!isLoggedIn && (
        <motion.section 
          className="py-16 text-white" 
          style={{ backgroundColor: '#0F2A44' }}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeIn}
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.h2 
              className="text-2xl md:text-3xl font-bold mb-4"
              variants={slideUp}
            >
              {t("about.cta.title")}
            </motion.h2>
            <motion.p 
              className="text-lg mb-8 opacity-90"
              variants={slideUp}
            >
              {t("about.cta.subtitle")}
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
                  className="px-8 py-3 bg-white font-medium rounded transition-colors hover:bg-gray-100"
                  style={{ color: '#0F2A44', borderRadius: '6px' }}
                >
                  {t("about.cta.signUpStudent")}
                </Link>
              </motion.div>
              <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                <Link
                  href="/signup/company"
                  className="px-8 py-3 bg-transparent border border-white font-medium rounded transition-colors hover:bg-white/10"
                  style={{ borderRadius: '6px' }}
                >
                  {t("about.cta.signUpCompany")}
                </Link>
              </motion.div>
              <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                <Link
                  href="/signup/obog"
                  className="px-8 py-3 bg-transparent border border-white font-medium rounded transition-colors hover:bg-white/10"
                  style={{ borderRadius: '6px' }}
                >
                  {t("about.cta.signUpObog")}
                </Link>
              </motion.div>
            </motion.div>
            <motion.p 
              className="mt-8 opacity-80"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 0.8 }}
              viewport={{ once: true }}
              transition={{ duration: 0.25, delay: 0.2 }}
            >
              {t("about.cta.questions")}{" "}
              <motion.a 
                href="mailto:info@senpaicareer.com" 
                className="underline hover:opacity-80"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                info@senpaicareer.com
              </motion.a>
            </motion.p>
          </div>
        </motion.section>
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
