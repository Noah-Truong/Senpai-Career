"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { fadeIn, slideUp, staggerContainer, staggerItem } from "@/lib/animations";

const MissionSection = () => {
  const { t } = useLanguage();

  return (
    <motion.section
      className="py-16 md:py-20 bg-gray-50"
      initial="initial"
      animate="animate"
      variants={fadeIn}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <motion.h2
              className="text-2xl md:text-3xl font-bold mb-6"
              style={{ color: '#111827' }}
              variants={slideUp}
            >
              {t("home.mission.title")}
            </motion.h2>
            <motion.p
              className="text-lg mb-8"
              style={{ color: '#374151' }}
              variants={slideUp}
            >
              {t("home.mission.desc")}
            </motion.p>
            <ul className="space-y-4">
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
                  <span style={{ color: '#374151' }}>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative">
            <motion.div
              className="aspect-square rounded-2xl overflow-hidden shadow-2xl"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=600&fit=crop"
                alt={t("home.mission.imageAlt") || "Students and mentors collaborating"}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </motion.div>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

export default MissionSection;