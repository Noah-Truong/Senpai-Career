"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
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

  const handleMessage = async () => {
    if (!session) {
      router.push("/login");
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

