"use client";

import { useSession } from "@/contexts/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslated } from "@/lib/translation-helpers";
import Avatar from "@/components/Avatar";
import { createClient } from "@/lib/supabase/client";

export default function MessagesPage() {
  const { t } = useLanguage();
  const { translate } = useTranslated();
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const obogId = searchParams.get("obogId");
  const [threads, setThreads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorShown, setErrorShown] = useState(false);
  const supabase = createClient();
  
  const role = (session?.user as any)?.role;

  const loadThreads = useCallback(async () => {
    try {
      const response = await fetch("/api/messages");
      if (response.ok) {
        const contentType = response.headers.get("content-type");
        const isJson = contentType && contentType.includes("application/json");
        if (isJson) {
          try {
            const text = await response.text();
            const t = text.trim();
            if (t.startsWith("{") || t.startsWith("[")) {
              const data = JSON.parse(text);
              setThreads(data.threads || []);
            } else {
              setThreads([]);
            }
          } catch {
            setThreads([]);
          }
        } else {
          setThreads([]);
        }
      } else {
        setThreads([]);
      }
    } catch (error) {
      console.error("Error loading threads:", error);
      setThreads([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      loadThreads();

      // Only redirect to new message page if not an alumni (alumni cannot start conversations)
      // Support obogId, userId, or studentId parameters
      if (obogId && role !== "obog") {
        router.push(`/messages/new?obogId=${obogId}`);
      } else {
        const userId = searchParams.get("userId");
        const studentId = searchParams.get("studentId");
        if ((userId || studentId) && role !== "obog") {
          router.push(`/messages/new?${userId ? `userId=${userId}` : `studentId=${studentId}`}`);
        }
      }

      // Subscribe to real-time updates for messages and threads
      const messagesChannel = supabase
        .channel("messages-updates")
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
          },
          () => {
            // New message received - reload threads to update last message
            loadThreads();
          }
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "threads",
          },
          () => {
            // Thread updated (e.g., last_message_at changed) - reload threads
            loadThreads();
          }
        )
        .subscribe();

      // Cleanup subscription on unmount
      return () => {
        supabase.removeChannel(messagesChannel);
      };
    }
  }, [status, router, obogId, role, loadThreads, supabase, searchParams]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
          <p className="text-sm sm:text-base" style={{ color: '#6B7280' }}>{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  const isAlumni = role === "obog";

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6" style={{ color: '#111827' }}>{t("messages.title")}</h1>
        
        {/* Explicit notice for alumni users */}
        {isAlumni && (
          <div 
            className="mb-4 sm:mb-6 p-3 sm:p-4 border-l-4 rounded"
            style={{ 
              backgroundColor: '#FEF3C7', 
              borderLeftColor: '#F59E0B',
              borderRadius: '6px'
            }}
          >
            <div className="flex items-start gap-2 sm:gap-3">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0" style={{ color: '#92400E' }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm sm:text-base font-semibold mb-1" style={{ color: '#92400E' }}>
                  {t("messages.alumniRestriction.noticeTitle") || "Alumni Message Policy"}
                </h3>
                <p className="text-xs sm:text-sm break-words" style={{ color: '#78350F' }}>
                  {t("messages.alumniRestriction.noticeDescription") || "As an alumni (OB/OG), you cannot initiate new conversations. You can only reply to messages that students send to you first. This policy ensures students can reach out when they need career advice."}
                </p>
              </div>
            </div>
          </div>
        )}
        
        {threads.length === 0 ? (
          <div 
            className="p-6 sm:p-8 text-center border rounded"
            style={{ backgroundColor: '#D7FFEF', borderColor: '#E5E7EB', borderRadius: '6px' }}
          >
            <p className="text-base sm:text-lg mb-4" style={{ color: '#374151' }}>{t("messages.empty")}</p>
            {isAlumni ? (
              <div className="mt-4">
                <p className="text-xs sm:text-sm mb-4 px-2" style={{ color: '#6B7280' }}>
                  {t("messages.alumniRestriction.emptyNotice") || "As an alumni, you can only reply to messages that students send to you. You cannot initiate new conversations."}
                </p>
              </div>
            ) : role === "student" ? (
              <Link href="/ob-list" className="btn-primary inline-block min-h-[44px] px-4 sm:px-6 py-2 text-sm sm:text-base">
                {t("button.browseObog")}
              </Link>
            ) : role === "company" ? (
              <Link href="/company/students" className="btn-primary inline-block min-h-[44px] px-4 sm:px-6 py-2 text-sm sm:text-base">
                {t("button.browseStudents") || "Browse Students"}
              </Link>
            ) : role === "admin" ?(
              <Link href="/company/students" className="btn-primary inline-block min-h-[44px] px-4 sm:px-6 py-2 text-sm sm:text-base">
                {t("button.browseStudents") || "Browse Chats"}
              </Link>
          ) : role === "corporate_ob" ? (
            <Link href="/company/students" className="btn-primary inline-block min-h-[44px] px-4 sm:px-6 py-2 text-sm sm:text-base">
              {t("button.browseStudents") || "Browse Students"}
            </Link>
          ) : (
              <Link href="/student-list" className="btn-primary inline-block min-h-[44px] px-4 sm:px-6 py-2 text-sm sm:text-base">
                {t("button.browseStudents")}
              </Link>
            ) }
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {threads.map((thread) => (
              <Link
                key={thread.id}
                href={`/messages/${thread.id}`}
                className="p-3 sm:p-4 bg-white border rounded hover:shadow-md transition-shadow block"
                style={{ borderColor: '#E5E7EB', borderRadius: '6px' }}
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <Avatar
                    src={thread.otherUser?.profilePhoto}
                    alt={thread.otherUser?.name || t("label.unknownUser")}
                    size="md"
                    fallbackText={thread.otherUser?.name}
                    className="shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm sm:text-base font-semibold truncate" style={{ color: '#111827' }}>{thread.otherUser?.name || t("label.unknownUser")}</h3>
                    <p className="text-xs sm:text-sm truncate" style={{ color: '#6B7280' }}>
                      {thread.lastMessage?.content ? translate(thread.lastMessage.content) : t("label.noMessagesYet")}
                    </p>
                  </div>
                  <div className="text-xs sm:text-sm shrink-0" style={{ color: '#9CA3AF' }}>
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
