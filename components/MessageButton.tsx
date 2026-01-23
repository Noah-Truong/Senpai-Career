"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

interface MessageButtonProps {
  obogId: string;
  obogName: string;
}

export default function MessageButton({ obogId, obogName }: MessageButtonProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);

  const userRole = session?.user?.role as string | undefined;
  const isAlumni = userRole === "obog";

  const handleMessage = async () => {
    if (!session) {
      router.push("/login");
      return;
    }

    // Explicit check: Alumni cannot start new conversations
    if (isAlumni) {
      router.push("/messages");
      return;
    }

    setLoading(true);
    try {
      // Check if a thread already exists, or create a new one
      // For now, navigate to messages page with the OB/OG ID
      router.push(`/messages?obogId=${obogId}`);
    } catch (error) {
      console.error("Error navigating to messages:", error);
    } finally {
      setLoading(false);
    }
  };

  // Don't show message button for alumni viewing other alumni profiles
  if (isAlumni) {
    return (
      <div className="w-full p-3 border rounded text-center" style={{ 
        backgroundColor: '#FEF3C7', 
        borderColor: '#F59E0B',
        borderRadius: '6px'
      }}>
        <p className="text-sm font-medium" style={{ color: '#92400E' }}>
          {t("messages.alumniRestriction.buttonNotice") || "Alumni cannot initiate conversations"}
        </p>
        <p className="text-xs mt-1" style={{ color: '#78350F' }}>
          {t("messages.alumniRestriction.buttonDescription") || "Wait for students to message you first"}
        </p>
      </div>
    );
  }

  return (
    <button
      onClick={handleMessage}
      disabled={loading}
      className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? t("common.loading") : `${t("button.sendMessageTo")} ${obogName}`}
    </button>
  );
}

