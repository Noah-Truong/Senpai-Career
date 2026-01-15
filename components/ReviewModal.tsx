"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

interface ReviewModalProps {
  reviewedUserId: string;
  reviewedUserName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function ReviewModal({ reviewedUserId, reviewedUserName, onClose, onSuccess }: ReviewModalProps) {
  const { t } = useLanguage();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (rating === 0) {
      setError(t("review.error.ratingRequired") || "Please select a rating");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reviewedUserId,
          rating,
          comment: comment.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t("review.error.submit") || "Failed to submit review");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || t("review.error.submit") || "Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 shadow-xl max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">
          {t("review.modal.title") || "Leave a Review"}
        </h2>
        <p className="text-gray-700 mb-4">
          {t("review.modal.subtitle").replace("{name}", reviewedUserName) || `Review ${reviewedUserName}`}
        </p>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("review.modal.rating") || "Rating"}
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`text-3xl ${
                    star <= rating
                      ? "text-yellow-400"
                      : "text-gray-300"
                  } hover:text-yellow-400 transition-colors`}
                >
                  ★
                </button>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm text-gray-600 mt-1">
                {rating === 1 && (t("review.rating.1") || "Poor")}
                {rating === 2 && (t("review.rating.2") || "Fair")}
                {rating === 3 && (t("review.rating.3") || "Good")}
                {rating === 4 && (t("review.rating.4") || "Very Good")}
                {rating === 5 && (t("review.rating.5") || "Excellent")}
              </p>
            )}
          </div>

          <div className="mb-6">
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
              {t("review.modal.comment") || "Comment (optional)"}
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder={t("review.modal.commentPlaceholder") || "Share your experience..."}
              style={{ color: '#000000' }}
            ></textarea>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={loading}
            >
              {t("review.modal.cancel") || "Cancel"}
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading || rating === 0}
            >
              {loading ? t("common.loading") : t("review.modal.submit") || "Submit Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

