"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

interface SaveButtonProps {
  itemType: "company" | "recruitment";
  itemId: string;
  className?: string;
}

export default function SaveButton({ itemType, itemId, className = "" }: SaveButtonProps) {
  const { t } = useLanguage();
  const { data: session } = useSession();
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  // Only show for students
  const isStudent = session?.user?.role === "student";

  useEffect(() => {
    if (isStudent && itemId) {
      checkSavedStatus();
    } else {
      setChecking(false);
    }
  }, [isStudent, itemId]);

  const checkSavedStatus = async () => {
    try {
      const response = await fetch("/api/saved-items");
      if (response.ok) {
        const data = await response.json();
        const saved = (data.savedItems || []).some(
          (item: any) => item.item_type === itemType && item.item_id === itemId
        );
        setIsSaved(saved);
      }
    } catch (error) {
      console.error("Error checking saved status:", error);
    } finally {
      setChecking(false);
    }
  };

  const handleToggleSave = async () => {
    if (!isStudent || loading) return;

    setLoading(true);
    try {
      if (isSaved) {
        // Unsave
        const response = await fetch(
          `/api/saved-items?itemType=${itemType}&itemId=${itemId}`,
          { method: "DELETE" }
        );

        if (response.ok) {
          setIsSaved(false);
        } else {
          console.error("Failed to unsave item");
        }
      } else {
        // Save
        const response = await fetch("/api/saved-items", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ itemType, itemId }),
        });

        if (response.ok) {
          setIsSaved(true);
        } else {
          console.error("Failed to save item");
        }
      }
    } catch (error) {
      console.error("Error toggling save:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isStudent || checking) {
    return null;
  }

  return (
    <button
      onClick={handleToggleSave}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 ${className}`}
      style={{
        backgroundColor: isSaved ? "#FEE2E2" : "#F3F4F6",
        color: isSaved ? "#DC2626" : "#374151",
      }}
    >
      {loading ? (
        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        <svg
          className="w-5 h-5"
          fill={isSaved ? "currentColor" : "none"}
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      )}
      <span>{isSaved ? t("saved.unsave") : t("saved.save")}</span>
    </button>
  );
}
