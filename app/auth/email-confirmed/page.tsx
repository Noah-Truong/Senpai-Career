"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import Link from "next/link";
import { motion } from "framer-motion";

export default function EmailConfirmedPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-full max-w-md mx-4">
        <motion.div
          className="bg-white rounded-2xl shadow-lg p-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Success Checkmark */}
          <motion.div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: '#D7FFEF' }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <motion.svg
              className="w-10 h-10"
              fill="none"
              stroke="#059669"
              viewBox="0 0 24 24"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </motion.svg>
          </motion.div>

          {/* Title */}
          <motion.h1
            className="text-2xl font-bold mb-3"
            style={{ color: '#111827' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          >
            {t("auth.emailConfirmed.title") || "Email verified!"}
          </motion.h1>

          {/* Description */}
          <motion.p
            className="mb-8"
            style={{ color: '#6B7280' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.6 }}
          >
            {t("auth.emailConfirmed.description") || "Your email has been successfully verified. You can now access all features of your account."}
          </motion.p>

          {/* Success message */}
          <motion.div
            className="text-sm mb-8 p-4 rounded-lg flex items-center justify-center gap-2"
            style={{ backgroundColor: '#D7FFEF', color: '#065F46' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.7 }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{t("auth.emailConfirmed.ready") || "Your account is ready to use"}</span>
          </motion.div>

          {/* Continue button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.8 }}
          >
            <Link
              href="/login"
              className="block w-full py-3 px-6 rounded-lg font-medium text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#2563EB' }}
            >
              {t("auth.emailConfirmed.continue") || "Continue to login"}
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
