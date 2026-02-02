"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Footer from "@/components/Footer";

function VerifyEmailContent() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 flex items-center justify-center">
        <div
          className="w-full max-w-md mx-4"
          style={{
            background: 'linear-gradient(135deg, rgba(215, 255, 239, 0.5) 0%, rgba(255, 255, 255, 1) 100%)'
          }}
        >
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            {/* Email Icon */}
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ backgroundColor: '#D7FFEF' }}
            >
              <svg
                className="w-10 h-10"
                fill="none"
                stroke="#059669"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>

            {/* Title */}
            <h1
              className="text-2xl font-bold mb-3"
              style={{ color: '#111827' }}
            >
              {t("auth.verifyEmail.title") || "Check your email"}
            </h1>

            {/* Description */}
            <p
              className="mb-6"
              style={{ color: '#6B7280' }}
            >
              {t("auth.verifyEmail.description") || "We've sent a verification link to"}
            </p>

            {/* Email display */}
            {email && (
              <p
                className="font-medium mb-6 px-4 py-2 rounded-lg inline-block"
                style={{ backgroundColor: '#F3F4F6', color: '#111827' }}
              >
                {email}
              </p>
            )}

            {/* Instructions */}
            <div
              className="text-sm mb-8 p-4 rounded-lg"
              style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}
            >
              <p>
                {t("auth.verifyEmail.checkSpam") || "Can't find the email? Check your spam folder."}
              </p>
            </div>

            {/* Resend email button */}
            <button
              className="w-full py-3 px-6 rounded-lg font-medium text-white mb-4 transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#2563EB' }}
            >
              {t("auth.verifyEmail.resend") || "Resend verification email"}
            </button>

            {/* Back to login */}
            <Link
              href="/login"
              className="text-sm font-medium hover:underline"
              style={{ color: '#6B7280' }}
            >
              {t("auth.verifyEmail.backToLogin") || "Back to login"}
            </Link>
          </div>
        </div>
      </div>
      <Footer variant="full" />
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
