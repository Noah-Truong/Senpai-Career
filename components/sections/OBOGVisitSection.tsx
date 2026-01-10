"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { fadeIn, slideUp, staggerContainer, staggerItem, cardVariants } from "@/lib/animations";

const OBOGVisitSection = () => {
  const { t } = useLanguage();

  return (
    <motion.section
      className="py-16 md:py-20 bg-white"
      initial="initial"
      animate="animate"
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
            animate="animate"
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
                >
                  <motion.span
                    className="flex-shrink-0 w-8 h-8 text-white rounded flex items-center justify-center font-semibold mr-4"
                    style={{ backgroundColor: '#0F2A44' }}
                    whileHover={{ scale: 1.05 }}
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
        </div>
      </div>
    </motion.section>
  );
};

export default OBOGVisitSection;