"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState } from "react";
import { useSession } from "@/contexts/AuthContext";
import OBOGListContent from "@/components/OBOGListContent";
import SidebarLayout from "@/components/SidebarLayout";
import { motion } from "framer-motion";
import { fadeIn, slideUp, staggerContainer, staggerItem, buttonVariants } from "@/lib/animations";

export default function OBVisitPage() {
  const { t } = useLanguage();
  const { data: session } = useSession();
  const isLoggedIn = !!session;
  const [obogUsers, setObogUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRules, setShowRules] = useState(false);

  useEffect(() => {
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
    setShowRules(true);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <motion.section 
        className="py-16" 
        style={{ backgroundColor: '#D7FFEF' }}
        initial="initial"
        animate="animate"
        variants={fadeIn}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 
            className="text-3xl md:text-4xl font-bold mb-6" 
            style={{ color: '#111827' }}
            variants={slideUp}
          >
            {t("obvisit.hero.title")}
          </motion.h1>
          <motion.p 
            className="text-lg max-w-2xl mx-auto" 
            style={{ color: '#6B7280' }}
            variants={slideUp}
          >
            {t("obvisit.hero.subtitle")}
          </motion.p>
        </div>
      </motion.section>

      
      {/* OB/OG List Section */}
      <motion.section
        className="py-16 bg-white"
        initial="initial"
        animate="animate"
        variants={fadeIn}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <motion.div 
              className="text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25 }}
            >
              <p style={{ color: '#6B7280' }}>{t("common.loading")}</p>
            </motion.div>
          ) : (
            <OBOGListContent obogUsers={obogUsers} />
          )}
        </div>
      </motion.section>

      {/* CTA Section */}
      {!isLoggedIn && (
        <motion.section
          className="py-16 text-white"
          style={{ backgroundColor: '#0F2A44' }}
          initial="initial"
          animate="animate"
          variants={fadeIn}
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.h2 
              className="text-2xl font-bold mb-4"
              variants={slideUp}
            >
              {t("obvisit.cta.title")}
            </motion.h2>
            <motion.p 
              className="text-lg mb-8 opacity-90"
              variants={slideUp}
            >
              {t("obvisit.cta.subtitle")}
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                <Link
                  href="/signup/student"
                  className="btn-primary px-8 py-3"
                >
                  {t("obvisit.cta.signUpStudent")}
                </Link>
              </motion.div>
              <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                <Link
                  href="/signup/obog"
                  className="px-8 py-3 bg-white/20 backdrop-blur-sm border-2 border-white text-white rounded font-semibold hover:bg-white hover:text-gray-900 transition-all"
                  style={{ borderRadius: '6px' }}
                >
                  {t("obvisit.cta.signUpObog")}
                </Link>
              </motion.div>
            </motion.div>
            <motion.p 
              className="mt-8 text-lg opacity-90"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 0.9 }}
              viewport={{ once: true }}
              transition={{ duration: 0.25, delay: 0.2 }}
            >
              {t("obvisit.cta.login")}{" "}
              <motion.span
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <Link href="/login" className="underline hover:opacity-80">
                  {t("obvisit.cta.loginLink")}
                </Link>
              </motion.span>
            </motion.p>
          </div>
        </motion.section>
      )}
      <div className="flex justify-center py-4">
        <button
          onClick={() => setShowRules(true)}
          className="bg-navy text-white px-6 py-3 rounded-lg hover:bg-blue-600 font-medium shadow-md transition-all"
        >
          {t("obvisit.safety.title")}
        </button>
      </div>
      
      {/* Safety and Rules Popup */}
      {showRules && (
        <div className="fixed inset-0 backdrop-blur-md bg-black/30 flex items-center justify-center z-50 scrollbar-visible">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto scrollbar-visible">
            {/* Safety Rules */}
      <motion.section
        className="pt-2 pb-4 bg-white"
        initial="initial"
        animate="animate"
        variants={fadeIn}
      >
        <div className="max-w-4xl mx-auto">
          <motion.h2 
            className="text-2xl font-bold mb-8" 
            style={{ color: '#111827' }}
            variants={slideUp}
          >
            {t("obvisit.safety.title")}
          </motion.h2>
          <motion.div 
            className="p-6 mb-6 border-l-4"
            style={{ backgroundColor: '#FEF3C7', borderLeftColor: '#F59E0B' }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25 }}
          >
            <p className="font-semibold mb-2" style={{ color: '#374151' }}>{t("obvisit.safety.important")}</p>
            <motion.ul
              className="space-y-2 text-sm"
              style={{ color: '#374151' }}
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {[
                t("obvisit.safety.1"),
                t("obvisit.safety.2"),
                t("obvisit.safety.3"),
                t("obvisit.safety.4"),
                t("obvisit.safety.5"),
                t("obvisit.safety.6"),
                t("obvisit.safety.7"),
                t("obvisit.safety.8"),
              ].map((item, index) => (
                <motion.li key={index} variants={staggerItem}>
                  • {item}
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>
          <motion.p 
            style={{ color: '#6B7280' }}
            variants={slideUp}
          >
            {t("obvisit.safety.desc")}
          </motion.p>
        </div>
      </motion.section>

            
            <button
              onClick={() => setShowRules(false)}
              className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600"
            >
              {t("button.close")}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
