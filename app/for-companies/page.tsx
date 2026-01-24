"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSession } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { fadeIn, slideUp, staggerContainer, staggerItem, cardVariants, buttonVariants } from "@/lib/animations";

export default function ForCompaniesPage() {
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
            {t("companies.hero.title")}
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-700 max-w-2xl mx-auto"
            variants={slideUp}
          >
            {t("companies.hero.subtitle")}
          </motion.p>
        </div>
      </motion.section>

      {/* Benefits for Companies */}
      <motion.section
        className="py-16 bg-white"
        initial="initial"
        animate="animate"
        variants={fadeIn}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2 
            className="text-3xl font-bold text-gray-900 mb-8"
            variants={slideUp}
          >
            {t("companies.why.title")}
          </motion.h2>
          <motion.div
            className="grid md:grid-cols-2 gap-6"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {[
              { icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z", title: t("companies.why.funnel.title"), desc: t("companies.why.funnel.desc") },
              { icon: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z", title: t("companies.why.tryFirst.title"), desc: t("companies.why.tryFirst.desc") },
              { icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z", title: t("companies.why.scout.title"), desc: t("companies.why.scout.desc") },
              { icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z", title: t("companies.why.safe.title"), desc: t("companies.why.safe.desc") },
            ].map((benefit, index) => (
              <motion.div 
                key={index}
                className="card-gradient p-6"
                variants={cardVariants}
                whileHover="hover"
              >
                <motion.div 
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-4 bg-[#0F2A44]"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={benefit.icon} />
                  </svg>
                </motion.div>
                <h3 className="text-xl font-semibold mb-2" style={{ color: '#000000' }}>{benefit.title}</h3>
                <p className="text-gray-700">
                  {benefit.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* How It Works */}
      <motion.section
        className="py-16"
        style={{ background: 'linear-gradient(135deg, rgba(242, 106, 163, 0.03) 0%, rgba(245, 159, 193, 0.03) 35%, rgba(111, 211, 238, 0.03) 70%, rgba(76, 195, 230, 0.03) 100%)' }}
        initial="initial"
        animate="animate"
        variants={fadeIn}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2 
            className="text-3xl font-bold text-gray-900 mb-8"
            variants={slideUp}
          >
            {t("companies.howItWorks.title")}
          </motion.h2>
          <motion.div
            className="space-y-6"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {[1, 2, 3, 4].map((step) => (
              <motion.div 
                key={step}
                className="flex items-start"
                variants={staggerItem}
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                <motion.span 
                  className="flex-shrink-0 w-10 h-10 bg-[#0F2A44] text-white rounded-full flex items-center justify-center font-bold mr-4"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  {step}
                </motion.span>
                <div>
                  <h3 className="text-xl font-semibold mb-2" style={{ color: '#000000' }}>{t(`companies.howItWorks.${step}.title`)}</h3>
                  <p className="text-gray-700">
                    {t(`companies.howItWorks.${step}.desc`)}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Features */}
      <motion.section
        className="py-16 bg-white"
        initial="initial"
        animate="animate"
        variants={fadeIn}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2 
            className="text-3xl font-bold text-gray-900 mb-8"
            variants={slideUp}
          >
            {t("companies.features.title")}
          </motion.h2>
          <motion.div
            className="space-y-4"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {[
              { title: t("companies.features.search.title"), desc: t("companies.features.search.desc") },
              { title: t("companies.features.messaging.title"), desc: t("companies.features.messaging.desc") },
              { title: t("companies.features.credit.title"), desc: t("companies.features.credit.desc") },
              { title: t("companies.features.hours.title"), desc: t("companies.features.hours.desc") },
            ].map((feature, index) => (
              <motion.div 
                key={index}
                className="flex items-start"
                variants={staggerItem}
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                <motion.svg 
                  className="w-6 h-6 gradient-text mr-3 flex-shrink-0 mt-1" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  style={{ color: '#3BB143' }}
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </motion.svg>
                <div>
                  <h3 className="font-semibold mb-1" style={{ color: '#3BB143' }}>{feature.title}</h3>
                  <p className="text-gray-700 text-sm">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* CTA Section */}
      {!isLoggedIn && (
        <motion.section
          className="py-16 bg-[#0F2A44] text-white"
          initial="initial"
          animate="animate"
          variants={fadeIn}
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.h2 
              className="text-3xl font-bold mb-4"
              variants={slideUp}
            >
              {t("companies.cta.title")}
            </motion.h2>
            <motion.p 
              className="text-xl mb-8 opacity-90"
              variants={slideUp}
            >
              {t("companies.cta.subtitle")}
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row gap-5 sm:gap-4 justify-center"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                <Link
                  href="/signup/company"
                  className="btn-secondary px-8 py-3"
                >
                  {t("companies.cta.signUp")}
                </Link>
              </motion.div>
              <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                <a
                  href="mailto:info@senpaicareer.com"
                  className="px-8 py-3 bg-white/20 backdrop-blur-sm border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:gradient-text transition-all"
                >
                  {t("companies.cta.contact")}
                </a>
              </motion.div>
            </motion.div>
          </div>
        </motion.section>
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

