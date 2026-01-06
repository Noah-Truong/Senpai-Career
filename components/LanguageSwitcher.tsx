"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import AnimatedText from "./AnimatedText";

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "ja" : "en");
  };

  return (
    <motion.button
      onClick={toggleLanguage}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg hover:shadow-xl gradient-bg text-white font-semibold"
      aria-label="Switch language"
      style={{
        background: 'linear-gradient(135deg, #f26aa3 0%, #f59fc1 35%, #6fd3ee 70%, #4cc3e6 100%)',
      }}
      initial={{ opacity: 0, scale: 0, rotate: -180 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ 
        duration: 0.3,
        ease: [0.25, 0.1, 0.25, 1],
        delay: 0.5
      }}
      whileHover={{ 
        scale: 1.1, 
        rotate: [0, -5, 5, 0],
        transition: { duration: 0.25 }
      }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        animate={{ rotate: language === "ja" ? 180 : 0 }}
        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
        />
      </motion.svg>
      <span className="text-sm font-bold">
        <AnimatedText key={language}>
          {language === "en" ? "日本語" : "English"}
        </AnimatedText>
      </span>
    </motion.button>
  );
}

