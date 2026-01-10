"use client";

import Header from "@/components/Header";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import OBOGListContent from "@/components/OBOGListContent";
import { motion } from "framer-motion";
import { fadeIn, slideUp, staggerContainer, staggerItem, cardVariants, buttonVariants } from "@/lib/animations";

export default function OBVisitPage() {
  const { t } = useLanguage();
  const { data: session } = useSession();
  const isLoggedIn = !!session;
  const [obogUsers, setObogUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch OB/OG users
    fetch("/api/obog")
      .then(res => res.json())
      .then(data => {
        setObogUsers(data.users || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading OB/OG users:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header />
    
    <motion.section 
      className="py-16"
      style={{ background: '#F5F7FA' }}
      initial="initial"
      animate="animate"
      variants={fadeIn}
    >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.h2 
              className="text-3xl font-bold text-gray-900 mb-8"
              variants={slideUp}
            >
              {t("obvisit.whatIs.title")}
            </motion.h2>
            <motion.div 
              className="prose prose-lg max-w-none"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              <motion.p 
                className="text-lg text-gray-700 mb-6"
                variants={staggerItem}
              >
                {t("obvisit.whatIs.p1")}
              </motion.p>
              <motion.p 
                className="text-lg text-gray-700 mb-6"
                variants={staggerItem}
              >
                {t("obvisit.whatIs.p2")}
              </motion.p>
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2 
            className="text-3xl font-bold text-gray-900 mb-8"
            variants={slideUp}
          >
            {t("obvisit.benefits.title")}
          </motion.h2>
          <motion.div
            className="grid md:grid-cols-2 gap-6"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {[
              { icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", title: t("obvisit.benefits.consultation.title"), desc: t("obvisit.benefits.consultation.desc") },
              { icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4", title: t("obvisit.benefits.strategy.title"), desc: t("obvisit.benefits.strategy.desc") },
              { icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z", title: t("obvisit.benefits.culture.title"), desc: t("obvisit.benefits.culture.desc") },
              { icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253", title: t("obvisit.benefits.interview.title"), desc: t("obvisit.benefits.interview.desc") },
            ].map((benefit, index) => (
              <motion.div 
                key={index}
                className="bg-white p-6 rounded-lg shadow-sm"
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

      {/* Profile Types */}
      <motion.section
        className="py-16"
        style={{ background: '#F5F7FA' }}
        initial="initial"
        animate="animate"
        variants={fadeIn}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2 
            className="text-3xl font-bold text-gray-900 mb-8"
            variants={slideUp}
          >
            {t("obvisit.profiles.title")}
          </motion.h2>
          <motion.div
            className="space-y-6"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {[
              { 
                title: t("obvisit.profiles.holders.title"), 
                desc: t("obvisit.profiles.holders.desc"),
                items: [t("obvisit.profiles.holders.1"), t("obvisit.profiles.holders.2"), t("obvisit.profiles.holders.3")]
              },
              { 
                title: t("obvisit.profiles.professionals.title"), 
                desc: t("obvisit.profiles.professionals.desc"),
                items: [t("obvisit.profiles.professionals.1"), t("obvisit.profiles.professionals.2"), t("obvisit.profiles.professionals.3")]
              },
            ].map((profile, index) => (
              <motion.div 
                key={index}
                className="border-l-4 pl-6" 
                style={{ borderColor: '#2563EB' }}
                variants={staggerItem}
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                <h3 className="text-xl font-semibold mb-2 text-gray-900">{profile.title}</h3>
                <p className="text-gray-700 mb-4">
                  {profile.desc}
                </p>
                <motion.ul
                  className="space-y-2 text-gray-700"
                  variants={staggerContainer}
                  initial="initial"
                  animate="animate"
                >
                  {profile.items.map((item, i) => (
                    <motion.li 
                      key={i}
                      className="flex items-start"
                      variants={staggerItem}
                    >
                      <span className="gradient-text mr-2">•</span>
                      <span>{item}</span>
                    </motion.li>
                  ))}
                </motion.ul>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* How It Works */}
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
            {t("obvisit.howItWorks.title")}
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
                className="bg-white p-6 rounded-lg shadow-sm"
                variants={cardVariants}
                whileHover="hover"
              >
                <div className="flex items-start">
                  <motion.div 
                    className="flex-shrink-0 w-10 h-10 bg-[#0F2A44] text-white rounded-full flex items-center justify-center font-bold mr-4"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    {step}
                  </motion.div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2" style={{ color: '#000000' }}>{t(`obvisit.howItWorks.${step}.title`)}</h3>
                    <p className="text-gray-700">
                      {t(`obvisit.howItWorks.${step}.desc`)}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
}

