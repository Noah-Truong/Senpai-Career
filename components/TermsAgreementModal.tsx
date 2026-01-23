"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { modalVariants, modalContentVariants } from "@/lib/animations";

interface TermsAgreementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  userRole: string;
  otherUserRole?: string;
}

export default function TermsAgreementModal({
  isOpen,
  onClose,
  onAccept,
  userRole,
  otherUserRole,
}: TermsAgreementModalProps) {
  const { t } = useLanguage();
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isStudent = userRole === "student";
  const isObog = userRole === "obog";
  const isInternationalStudent = isStudent; // Could check nationality from user profile

  const handleSubmit = async () => {
    if (!agreed) return;
    
    setSubmitting(true);
    try {
      await onAccept();
      setAgreed(false);
    } catch (error) {
      console.error("Error accepting terms:", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 backdrop-blur-md bg-black/30 flex items-center justify-center z-50 p-4"
      variants={modalVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        variants={modalContentVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-bold" style={{ color: '#111827' }}>
              {t("meeting.terms.title") || "Meeting Terms Agreement"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="space-y-4 mb-6">
            {/* Common Terms */}
            <div>
              <h3 className="font-semibold mb-2" style={{ color: '#374151' }}>
                {t("meeting.terms.commonTitle") || "Common Terms (Both Parties)"}
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm" style={{ color: '#6B7280' }}>
                <li>{t("meeting.terms.prohibitNonCareer") || "Prohibit non-career/job-hunting usage"}</li>
                <li>{t("meeting.terms.prohibitContactInfo") || "Prohibit exchange of contact information (default)"}</li>
                <li>{t("meeting.terms.prohibitAfter10pm") || "Prohibit meetings after 10 PM"}</li>
                <li>{t("meeting.terms.prohibitAlcohol") || "Prohibit meetings involving alcohol"}</li>
                <li>{t("meeting.terms.prohibitPrivateRooms") || "Prohibit private rooms outside offices"}</li>
                <li>{t("meeting.terms.recommendPublic") || "Recommend open cafes / office meeting rooms"}</li>
                <li>{t("meeting.terms.prohibitRecording") || "Prohibit recording / screenshots / SNS posting"}</li>
                <li>{t("meeting.terms.prohibitSolicitation") || "Prohibit religious / business solicitation"}</li>
              </ul>
            </div>

            {/* Additional Terms for International Students */}
            {isInternationalStudent && (
              <div className="p-4 bg-yellow-50 border rounded" style={{ borderColor: '#FCD34D' }}>
                <h3 className="font-semibold mb-2" style={{ color: '#92400E' }}>
                  {t("meeting.terms.studentAdditional") || "Additional Terms - International Students"}
                </h3>
                <ul className="list-disc list-inside space-y-1 text-sm" style={{ color: '#78350F' }}>
                  <li>{t("meeting.terms.warnBusy") || "Warn that professionals are busy"}</li>
                  <li>{t("meeting.terms.prohibitNoShow") || "Explicitly prohibit no-shows without notice"}</li>
                </ul>
              </div>
            )}

            {/* Additional Terms for OB/OG */}
            {isObog && (
              <div className="p-4 bg-red-50 border rounded" style={{ borderColor: '#FCA5A5' }}>
                <h3 className="font-semibold mb-2" style={{ color: '#991B1B' }}>
                  {t("meeting.terms.obogAdditional") || "Additional Terms - OB/OG"}
                </h3>
                <ul className="list-disc list-inside space-y-1 text-sm" style={{ color: '#7F1D1D' }}>
                  <li>{t("meeting.terms.prohibitPoaching") || "Prohibit poaching"}</li>
                  <li>{t("meeting.terms.prohibitOffPlatform") || "Prohibit off-platform recruitment"}</li>
                  <li>
                    <strong>{t("meeting.terms.penalty") || "Penalty"}:</strong>{" "}
                    {t("meeting.terms.penaltyAmount") || "¥400,000 billed to company + HR if violation is discovered"}
                  </li>
                  <li>{t("meeting.terms.contactPlatform") || "Instruct to contact platform company for hiring interest"}</li>
                </ul>
              </div>
            )}
          </div>

          <div className="mb-6">
            <label className="flex items-start cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 h-5 w-5 border-gray-300 rounded"
                style={{ accentColor: '#2563EB' }}
              />
              <span className="ml-3 text-sm" style={{ color: '#374151' }}>
                {t("meeting.terms.agree") || "I agree to the terms and conditions stated above"}
              </span>
            </label>
          </div>

          <div className="flex gap-4 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              {t("button.cancel") || "Cancel"}
            </button>
            <button
              onClick={handleSubmit}
              disabled={!agreed || submitting}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? t("common.loading") : t("button.submit") || "Submit"}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
