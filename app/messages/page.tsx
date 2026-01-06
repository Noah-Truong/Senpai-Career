"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslated } from "@/lib/translation-helpers";
import Avatar from "@/components/Avatar";

export default function MessagesPage() {
  const { t } = useLanguage();
  const { translate } = useTranslated();
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const obogId = searchParams.get("obogId");
  const [threads, setThreads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const role = (session?.user as any)?.role;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      loadThreads();
      
      if (obogId) {
        router.push(`/messages/new?obogId=${obogId}`);
      }
    }
  }, [status, router, obogId]);

  const loadThreads = async () => {
    try {
      const response = await fetch("/api/messages");
      if (response.ok) {
        const data = await response.json();
        setThreads(data.threads || []);
      }
    } catch (error) {
      console.error("Error loading threads:", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p style={{ color: '#6B7280' }}>{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold mb-6" style={{ color: '#111827' }}>{t("messages.title")}</h1>
        
        {threads.length === 0 ? (
          <div 
            className="p-8 text-center border rounded"
            style={{ backgroundColor: '#F5F7FA', borderColor: '#E5E7EB', borderRadius: '6px' }}
          >
            <p className="text-lg mb-4" style={{ color: '#374151' }}>{t("messages.empty")}</p>
            {role === "student" && (
              <Link href="/ob-list" className="btn-primary inline-block">
                {t("button.browseObog")}
              </Link>
            )}
            {(role === "obog" || role === "company") && (
              <Link href="/student-list" className="btn-primary inline-block">
                {t("button.browseStudents")}
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {threads.map((thread) => (
              <Link
                key={thread.id}
                href={`/messages/${thread.id}`}
                className="p-4 bg-white border rounded hover:shadow-md transition-shadow block"
                style={{ borderColor: '#E5E7EB', borderRadius: '6px' }}
              >
                <div className="flex items-center">
                  <Avatar
                    src={thread.otherUser?.profilePhoto}
                    alt={thread.otherUser?.name || "User"}
                    size="md"
                    fallbackText={thread.otherUser?.name}
                    className="mr-4"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold" style={{ color: '#111827' }}>{thread.otherUser?.name || t("label.unknownUser")}</h3>
                    <p className="text-sm truncate" style={{ color: '#6B7280' }}>
                      {thread.lastMessage?.content ? translate(thread.lastMessage.content) : t("label.noMessagesYet")}
                    </p>
                  </div>
                  <div className="text-sm" style={{ color: '#9CA3AF' }}>
                    {thread.lastMessage?.createdAt 
                      ? new Date(thread.lastMessage.createdAt).toLocaleDateString()
                      : ""}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
