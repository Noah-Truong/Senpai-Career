"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Suspense } from "react";
import Footer from "@/components/Footer";

type SuccessType = "account-updated" | "password-changed" | "profile-updated" | "settings-saved" | "default";

const successConfig: Record<SuccessType, {
  icon: "check" | "shield" | "user" | "settings";
  titleKey: string;
  descriptionKey: string;
  defaultTitle: string;
  defaultDescription: string;
  redirectPath: string;
  redirectLabel: string;
}> = {
  "account-updated": {
    icon: "check",
    titleKey: "auth.success.accountUpdated.title",
    descriptionKey: "auth.success.accountUpdated.description",
    defaultTitle: "Account updated!",
    defaultDescription: "Your account information has been successfully updated.",
    redirectPath: "/profile",
    redirectLabel: "Go to profile",
  },
  "password-changed": {
    icon: "shield",
    titleKey: "auth.success.passwordChanged.title",
    descriptionKey: "auth.success.passwordChanged.description",
    defaultTitle: "Password changed!",
    defaultDescription: "Your password has been successfully updated. Please use your new password to log in.",
    redirectPath: "/login",
    redirectLabel: "Continue to login",
  },
  "profile-updated": {
    icon: "user",
    titleKey: "auth.success.profileUpdated.title",
    descriptionKey: "auth.success.profileUpdated.description",
    defaultTitle: "Profile updated!",
    defaultDescription: "Your profile information has been saved successfully.",
    redirectPath: "/profile",
    redirectLabel: "View profile",
  },
  "settings-saved": {
    icon: "settings",
    titleKey: "auth.success.settingsSaved.title",
    descriptionKey: "auth.success.settingsSaved.description",
    defaultTitle: "Settings saved!",
    defaultDescription: "Your settings have been updated successfully.",
    redirectPath: "/",
    redirectLabel: "Go to dashboard",
  },
  default: {
    icon: "check",
    titleKey: "auth.success.default.title",
    descriptionKey: "auth.success.default.description",
    defaultTitle: "Success!",
    defaultDescription: "Your request has been completed successfully.",
    redirectPath: "/",
    redirectLabel: "Continue",
  },
};

const icons = {
  check: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 13l4 4L19 7"
    />
  ),
  shield: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
    />
  ),
  user: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />
  ),
  settings: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
    />
  ),
};

function SuccessContent() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();

  const type = (searchParams.get("type") as SuccessType) || "default";
  const customTitle = searchParams.get("title");
  const customDescription = searchParams.get("description");
  const customRedirect = searchParams.get("redirect");

  const config = successConfig[type] || successConfig.default;

  const title = customTitle || t(config.titleKey) || config.defaultTitle;
  const description = customDescription || t(config.descriptionKey) || config.defaultDescription;
  const redirectPath = customRedirect || config.redirectPath;

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
            {/* Success Icon */}
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
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.4 }}
              >
                {icons[config.icon]}
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
              {title}
            </motion.h1>

            {/* Description */}
            <motion.p
              className="mb-8"
              style={{ color: '#6B7280' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.6 }}
            >
              {description}
            </motion.p>

            {/* Continue button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.7 }}
            >
              <Link
                href={redirectPath}
                className="block w-full py-3 px-6 rounded-lg font-medium text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#2563EB' }}
              >
                {t("common.continue") || config.redirectLabel}
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
      <Footer variant="full" />
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
