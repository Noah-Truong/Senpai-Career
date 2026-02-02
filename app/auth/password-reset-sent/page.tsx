"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Suspense } from "react";
import Footer from "@/components/Footer";

function PasswordResetSentContent() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md mx-4">
        <motion.div
          className="bg-white rounded-2xl shadow-lg p-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Email Icon */}
          <motion.div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: '#DBEAFE' }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <svg
              className="w-10 h-10"
              fill="none"
              stroke="#2563EB"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </motion.div>

          {/* Title */}
          <motion.h1
            className="text-2xl font-bold mb-3"
            style={{ color: '#111827' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            {t("auth.passwordResetSent.title") || "Check your email"}
          </motion.h1>

          {/* Description */}
          <motion.p
            className="mb-4"
            style={{ color: '#6B7280' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            {t("auth.passwordResetSent.description") || "We've sent password reset instructions to"}
          </motion.p>

          {/* Email display */}
          {email && (
            <motion.p
              className="font-medium mb-6 px-4 py-2 rounded-lg inline-block"
              style={{ backgroundColor: '#F3F4F6', color: '#111827' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.5 }}
            >
              {email}
            </motion.p>
          )}

          {/* Instructions */}
          <motion.div
            className="text-sm mb-6 p-4 rounded-lg text-left space-y-2"
            style={{ backgroundColor: '#F3F4F6', color: '#4B5563' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.6 }}
          >
            <p className="font-medium" style={{ color: '#111827' }}>
              {t("auth.passwordResetSent.nextSteps") || "Next steps:"}
            </p>
            <ul className="space-y-1 list-disc list-inside">
              <li>{t("auth.passwordResetSent.step1") || "Open the email we sent you"}</li>
              <li>{t("auth.passwordResetSent.step2") || "Click the reset password link"}</li>
              <li>{t("auth.passwordResetSent.step3") || "Create a new password"}</li>
            </ul>
          </motion.div>

          {/* Warning about spam */}
          <motion.div
            className="text-sm mb-8 p-4 rounded-lg flex items-start gap-2"
            style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.7 }}
          >
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>
              {t("auth.passwordResetSent.checkSpam") || "Can't find the email? Check your spam or junk folder."}
            </span>
          </motion.div>

          {/* Resend link */}
          <motion.div
            className="mb-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.8 }}
          >
            <button
              className="text-sm font-medium hover:underline"
              style={{ color: '#2563EB' }}
            >
              {t("auth.passwordResetSent.resend") || "Didn't receive the email? Resend"}
            </button>
          </motion.div>

          {/* Back to login */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.9 }}
          >
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm font-medium hover:underline"
              style={{ color: '#6B7280' }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              {t("auth.passwordResetSent.backToLogin") || "Back to login"}
            </Link>
          </motion.div>
        </motion.div>
        </div>
      </div>
      <Footer variant="full" />
    </div>
  );
}

export default function PasswordResetSentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    }>
      <PasswordResetSentContent />
    </Suspense>
  );
}
