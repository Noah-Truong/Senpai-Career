"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { modalVariants, modalContentVariants } from "@/lib/animations";
import Link from "next/link";

interface EvaluationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => Promise<void>;
}

export default function EvaluationForm({
  isOpen,
  onClose,
  onSubmit,
}: EvaluationFormProps) {
  const { t } = useLanguage();
  const [rating, setRating] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      alert(t("meeting.evaluation.ratingRequired") || "Please select a rating");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(rating, comment);
      setRating(0);
      setComment("");
    } catch (error) {
      console.error("Error submitting evaluation:", error);
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
        className="bg-white rounded-lg max-w-lg w-full"
        variants={modalContentVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-bold" style={{ color: '#111827' }}>
              {t("meeting.evaluation.title") || "Meeting Evaluation"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Rating */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                {t("meeting.evaluation.ratingLabel") || "Rating (1-5) *"}
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setRating(num)}
                    className={`w-12 h-12 rounded-full text-lg font-semibold transition-colors ${
                      rating === num
                        ? "bg-yellow-400 text-white"
                        : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                {t("meeting.evaluation.commentLabel") || "Comment (Optional)"}
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2"
                style={{ borderColor: '#D1D5DB', borderRadius: '6px' }}
                placeholder={t("meeting.evaluation.commentPlaceholder") || "Share your experience..."}
              />
            </div>

            {/* Report Link */}
            <div className="text-sm" style={{ color: '#6B7280' }}>
              {t("meeting.evaluation.reportLink") || "Need to report an issue?"}{" "}
              <Link href="/report" className="text-blue-600 hover:text-blue-800 underline">
                {t("meeting.evaluation.report") || "Report here"}
              </Link>
            </div>

            <div className="flex gap-4 justify-end pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                {t("button.cancel") || "Cancel"}
              </button>
              <button
                type="submit"
                disabled={rating === 0 || submitting}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? t("common.loading") : t("button.submit") || "Submit"}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}
