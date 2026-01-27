"use client";

import { useSession } from "@/contexts/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import Header from "@/components/Header";
import Link from "next/link";
import { dispatchCreditsRefresh } from "@/components/AppLayout";

export default function NewMessagePage() {
  const { t } = useLanguage();
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const obogId = searchParams.get("obogId");
  const userId = searchParams.get("userId");
  const studentId = searchParams.get("studentId");
  const targetUserId = obogId || userId || studentId;
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [targetUser, setTargetUser] = useState<any>(null);

  const userRole = session?.user?.role as string | undefined;
  const isAlumni = userRole === "obog";

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    // Alumni cannot start new conversations
    if (status === "authenticated" && isAlumni) {
      return;
    }

    if (status === "authenticated" && targetUserId) {
      // Fetch user details from API
      fetch(`/api/users/${targetUserId}`)
        .then(res => res.json())
        .then(data => {
          if (data.user) {
            setTargetUser(data.user);
            // Check if student is trying to message Corporate OB
            if (userRole === "student" && data.user.role === "corporate_ob") {
              setError(t("messages.corporateObRestriction.description"));
            }
          } else {
            setError(t("messages.new.notFound"));
          }
        })
        .catch(err => {
          console.error("Error fetching user:", err);
          setError(t("messages.new.failed"));
        });
    }
  }, [status, router, targetUserId, isAlumni, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!message.trim()) {
      setError(t("messages.new.error"));
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          toUserId: targetUserId,
          content: message,
        }),
      });

      // Check response content type before parsing
      const contentType = response.headers.get("content-type");
      const isJson = contentType && contentType.includes("application/json");
      
      if (!response.ok) {
        let errorMessage = t("messages.error.sendFailed");
        
        if (isJson) {
          try {
            const text = await response.text();
            const trimmedText = text.trim();
            
            if (trimmedText.startsWith("{") || trimmedText.startsWith("[")) {
              const errorData = JSON.parse(text);
              errorMessage = errorData.error || errorMessage;
              
              // Special handling for alumni restriction
              if (errorData.code === "ALUMNI_CANNOT_INITIATE" || errorMessage.includes("Alumni cannot start")) {
                errorMessage = t("messages.alumniRestriction.apiError") || "Alumni accounts cannot initiate new conversations. Please wait for students to message you first, then you can reply to their messages.";
              }
              // Special handling for student to Corporate OB restriction
              if (errorData.code === "STUDENT_CANNOT_INITIATE_CORP_OB" || errorMessage.includes("Students cannot initiate")) {
                errorMessage = t("messages.corporateObRestriction.apiError") || "Students cannot initiate conversations with Corporate OB. Please wait for them to message you first.";
              }
            }
          } catch (jsonError) {
            // If parsing fails, use default error
          }
        }
        
        throw new Error(errorMessage);
      }
      
      // Parse successful response
      let data;
      if (isJson) {
        try {
          const text = await response.text();
          const trimmedText = text.trim();
          if (trimmedText.startsWith("{") || trimmedText.startsWith("[")) {
            data = JSON.parse(text);
          } else {
            throw new Error("Invalid response format");
          }
        } catch (parseError) {
          throw new Error(t("messages.error.parseFailed"));
        }
      } else {
        throw new Error("Invalid response format");
      }

      // Refresh credits display after successful message send (small delay to ensure API processed)
      setTimeout(() => {
        dispatchCreditsRefresh();
      }, 500);
      
      // Redirect to the message thread
      router.push(`/messages/${data.threadId}`);
    } catch (err: any) {
      setError(err.message || t("messages.error.sendFailedRetry"));
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
          <p className="text-sm sm:text-base">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  // Alumni cannot start new conversations - they can only reply to existing threads
  if (isAlumni) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
          <div className="card-gradient p-4 sm:p-8">
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
            <div className="text-center">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
                {t("messages.alumniRestriction.title") || "Message Restriction"}
              </h2>
              <p className="text-sm sm:text-base text-gray-700 mb-4 sm:mb-6 px-2">
                {t("messages.alumniRestriction.description") || "As an alumni, you cannot start new conversations. Please wait for students to message you first, then you can reply to their messages."}
              </p>
              <button
                onClick={() => router.push("/messages")}
                className="btn-primary min-h-[44px] px-4 sm:px-6 py-2 text-sm sm:text-base"
              >
                {t("messages.alumniRestriction.viewMessages") || "View My Messages"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!targetUserId) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
          <div className="card-gradient p-4 sm:p-8 text-center">
            <p className="text-sm sm:text-base text-gray-700 mb-4">{t("messages.new.notFound")}</p>
            {userRole === "company" ? (
              <button
                onClick={() => router.push("/company/students")}
                className="btn-primary min-h-[44px] px-4 sm:px-6 py-2 text-sm sm:text-base"
              >
                {t("button.browseStudents") || "Browse Students"}
              </button>
            ) : (
              <button
                onClick={() => router.push("/ob-list")}
                className="btn-primary min-h-[44px] px-4 sm:px-6 py-2 text-sm sm:text-base"
              >
                {t("nav.obogList")}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">

      <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        <div className="card-gradient p-4 sm:p-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-4 sm:mb-6">{t("messages.new.title")}</h1>
          
          {targetUser && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 rounded-lg">
              <p className="text-xs sm:text-sm text-gray-600 mb-1">{t("label.to")}:</p>
              <p className="text-sm sm:text-base font-semibold truncate">{targetUser.nickname || targetUser.name}</p>
              {targetUser.company && <p className="text-xs sm:text-sm text-gray-600 truncate">{targetUser.company}</p>}
              {targetUser.role && (
                <p className="text-xs text-gray-500 mt-1">
                  {targetUser.role === "student" ? t("label.student") || "Student" :
                   targetUser.role === "obog" ? t("label.obog") || "OB/OG" :
                   targetUser.role === "corporate_ob" ? t("role.corporateOb") || "Corporate OB" :
                   targetUser.role === "company" ? t("label.company") || "Company" : ""}
                </p>
              )}
            </div>
          )}

          {/* Corporate OB Restriction Notice for Students */}
          {targetUser && userRole === "student" && targetUser.role === "corporate_ob" && (
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
                    {t("messages.corporateObRestriction.title") || "Message Restriction"}
                  </h3>
                  <p className="text-xs sm:text-sm break-words" style={{ color: '#78350F' }}>
                    {t("messages.corporateObRestriction.description") || "Students cannot start new conversations with Corporate OB. Please wait for them to message you first, then you can reply."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded text-sm sm:text-base">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Disable form if student trying to message Corporate OB */}
            {targetUser && userRole === "student" && targetUser.role === "corporate_ob" && (
              <div className="mb-4 p-3 bg-gray-100 rounded text-sm text-gray-600 text-center">
                {t("messages.corporateObRestriction.description")}
              </div>
            )}
            <div>
              <label htmlFor="message" className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                {t("messages.new.message")}
              </label>
              <textarea
                id="message"
                name="message"
                rows={6}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full min-h-[44px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base"
                placeholder={t("messages.new.placeholder")}
                style={{ color: '#000000' }}
                required
              />
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4">
              <button
                type="submit"
                disabled={loading || (targetUser && userRole === "student" && targetUser.role === "corporate_ob")}
                className="w-full sm:w-auto min-h-[44px] btn-primary disabled:opacity-50 disabled:cursor-not-allowed px-4 sm:px-6 py-2 text-sm sm:text-base"
              >
                {loading ? t("common.loading") : t("messages.new.submit")}
              </button>
              <Link
                type="button"
                href={userRole === "company" ? "/company/students" : "/ob-list"}
                className="w-full sm:w-auto min-h-[44px] btn-secondary text-center px-4 sm:px-6 py-2 text-sm sm:text-base"
              >
                {t("button.cancel")}
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

