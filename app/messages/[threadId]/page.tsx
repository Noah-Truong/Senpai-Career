"use client";

import { useSession } from "@/contexts/AuthContext";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslated } from "@/lib/translation-helpers";
import Avatar from "@/components/Avatar";
import ReportButton from "@/components/ReportButton";
import ReviewModal from "@/components/ReviewModal";
import MeetingStatusBlock from "@/components/MeetingStatusBlock";
import MeetingOperationButtons from "@/components/MeetingOperationButtons";
import TermsAgreementModal from "@/components/TermsAgreementModal";
import EvaluationForm from "@/components/EvaluationForm";
import AdditionalQuestionForm from "@/components/AdditionalQuestionForm";
import { dispatchCreditsRefresh } from "@/components/AppLayout";
import { createClient } from "@/lib/supabase/client";

export default function MessageThreadPage() {
  const { t, language } = useLanguage();
  const { translate } = useTranslated();
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const threadId = params.threadId as string;
  
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [otherUser, setOtherUser] = useState<any>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [meeting, setMeeting] = useState<any>(null);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showEvaluationModal, setShowEvaluationModal] = useState(false);
  const [showAdditionalQuestionModal, setShowAdditionalQuestionModal] = useState(false);
  const [optimisticCredits, setOptimisticCredits] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastMessageCountRef = useRef<number>(0);

  const loadMeeting = useCallback(async () => {
    try {
      const response = await fetch(`/api/meetings/${threadId}`);
      if (response.ok) {
        const data = await response.json();
        setMeeting(data.meeting);
      }
    } catch (error) {
      console.error("Error loading meeting:", error);
    }
  }, [threadId]);

  const loadMessages = useCallback(async (backgroundRefetch = false) => {
    if (!backgroundRefetch) setLoading(true);
    try {
      const response = await fetch(`/api/messages/${threadId}`);
      if (response.ok) {
        const contentType = response.headers.get("content-type");
        const isJson = contentType && contentType.includes("application/json");

        if (isJson) {
          try {
            const text = await response.text();
            const trimmedText = text.trim();

            if (trimmedText.startsWith("{") || trimmedText.startsWith("[")) {
              const data = JSON.parse(text);

              if (data.messages) setMessages(data.messages);
              if (data.otherUser) setOtherUser(data.otherUser);
            } else {
              console.warn("Messages API returned non-JSON response");
              setError(t("messages.error.loadFailed"));
            }
          } catch (jsonError) {
            console.error("Failed to parse messages JSON:", jsonError);
            setError(t("messages.error.loadFailed"));
          }
        } else {
          console.warn("Messages API returned non-JSON content type");
          setError(t("messages.error.loadFailed"));
        }
      } else {
        setError(t("messages.error.loadFailed"));
      }
    } catch (err) {
      console.error("Error loading messages:", err);
      setError(t("messages.error.loadFailed"));
    } finally {
      setLoading(false);
    }
  }, [threadId]);

  const loadHasReviewed = useCallback(
    async (otherUserId: string, currentUserId: string) => {
      try {
        const reviewResponse = await fetch(`/api/reviews?userId=${otherUserId}`);
        if (!reviewResponse.ok) return;
        const reviewContentType = reviewResponse.headers.get("content-type");
        const reviewIsJson = reviewContentType?.includes("application/json");
        if (!reviewIsJson) return;
        const reviewText = await reviewResponse.text();
        const reviewTrimmed = reviewText.trim();
        if (!reviewTrimmed.startsWith("{") && !reviewTrimmed.startsWith("[")) return;
        const reviewData = JSON.parse(reviewText);
        const existing = reviewData.reviews?.find((r: any) => r.reviewerUserId === currentUserId);
        setHasReviewed(!!existing);
      } catch (err) {
        console.error("Error checking reviews:", err);
      }
    },
    []
  );

  const handleMeetingUpdate = useCallback(() => {
    loadMeeting();
  }, [loadMeeting]);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    // Small delay to ensure DOM is updated
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated" && threadId) {
      let isSubscribed = false;
      let subscriptionStartTime = Date.now();
      
      // Initial load
      loadMessages();
      loadMeeting();

      // Subscribe to real-time message updates
      // This will catch new messages from the other user in real-time
      const channel = supabase
        .channel(`messages:${threadId}`, {
          config: {
            broadcast: { self: true }, // Receive our own messages too (for consistency)
          },
        })
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `thread_id=eq.${threadId}`,
          },
          (payload) => {
            console.log("✅ New message received via realtime:", payload.new);
            isSubscribed = true; // Mark as subscribed when we receive an event
            // New message received - reload messages to get the full message data
            // Using background refetch to avoid showing loading state
            loadMessages(true);
          }
        )
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "threads",
            filter: `id=eq.${threadId}`,
          },
          (payload) => {
            console.log("✅ Thread updated via realtime:", payload.new);
            isSubscribed = true;
            // Thread updated (e.g., last_message_at changed) - reload messages
            loadMessages(true);
          }
        )
        .subscribe((status, err) => {
          if (status === "SUBSCRIBED") {
            console.log("✅ Successfully subscribed to realtime updates for thread:", threadId);
            isSubscribed = true;
          } else if (status === "CHANNEL_ERROR") {
            console.error("❌ Error subscribing to realtime updates for thread:", threadId, err);
            isSubscribed = false;
          } else if (status === "TIMED_OUT") {
            console.warn("⏱️ Realtime subscription timed out for thread:", threadId);
            isSubscribed = false;
          } else if (status === "CLOSED") {
            console.warn("🔌 Realtime subscription closed for thread:", threadId);
            isSubscribed = false;
          }
        });

      // Polling fallback: Check for new messages every 3 seconds
      // This ensures messages still update even if Realtime subscription fails
      // Only start polling after 5 seconds to give realtime a chance
      const startPollingTimeout = setTimeout(() => {
        pollingIntervalRef.current = setInterval(() => {
          // Always poll as fallback (realtime might miss events)
          // But log when we're using polling vs realtime
          if (!isSubscribed) {
            console.log("🔄 Polling for new messages (realtime fallback)");
          }
          loadMessages(true);
        }, 3000); // Poll every 3 seconds
      }, 5000); // Start polling after 5 seconds

      // Cleanup subscription and polling on unmount
      return () => {
        console.log("Cleaning up realtime subscription and polling for thread:", threadId);
        clearTimeout(startPollingTimeout);
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
        supabase.removeChannel(channel);
      };
    }
  }, [status, threadId, router, loadMessages, loadMeeting, supabase]);

  useEffect(() => {
    if (!otherUser?.id || !session?.user?.id) return;
    loadHasReviewed(otherUser.id, session.user.id);
  }, [otherUser?.id, session?.user?.id, loadHasReviewed]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!newMessage.trim()) {
      return;
    }

    setSending(true);
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          threadId,
          content: newMessage,
        }),
      });

      if (!response.ok) {
        // Check if response is JSON before parsing
        const contentType = response.headers.get("content-type");
        const isJson = contentType && contentType.includes("application/json");
        
        let errorMessage = t("messages.error.sendFailed");
        
        if (isJson) {
          try {
            const text = await response.text();
            const trimmedText = text.trim();
            
            if (trimmedText.startsWith("{") || trimmedText.startsWith("[")) {
              const data = JSON.parse(text);
              errorMessage = data.error || errorMessage;
            }
          } catch (jsonError) {
            // If parsing fails, use default error message
          }
        }
        
        throw new Error(errorMessage);
      }

      setNewMessage("");
      // Reload messages immediately for instant feedback (realtime subscription handles others' messages)
      loadMessages(true);
      // Refresh credits display after successful message send (small delay to ensure API processed)
      setTimeout(() => {
        dispatchCreditsRefresh();
      }, 500);
    } catch (err: any) {
      setError(err.message || t("messages.error.sendFailedRetry"));
    } finally {
      setSending(false);
    }
  };

  const handleAcceptTerms = async () => {
    try {
      const response = await fetch(`/api/meetings/${threadId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "accept_terms" }),
      });

      if (response.ok) {
        loadMeeting();
        setShowTermsModal(false);
      }
    } catch (error) {
      console.error("Error accepting terms:", error);
    }
  };

  const handleSubmitEvaluation = async (rating: number, comment: string) => {
    try {
      const response = await fetch(`/api/meetings/${threadId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "submit_evaluation",
          rating,
          comment,
        }),
      });

      if (response.ok) {
        loadMeeting();
        setShowEvaluationModal(false);
        
        // If student, show additional question form
        if (session?.user?.role === "student" && meeting && !meeting.student_additional_question_answered) {
          setShowAdditionalQuestionModal(true);
        }
      }
    } catch (error) {
      console.error("Error submitting evaluation:", error);
    }
  };

  const handleSubmitAdditionalQuestion = async (data: any) => {
    try {
      const response = await fetch(`/api/meetings/${threadId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "submit_additional_question",
          additionalQuestionData: data,
        }),
      });

      if (response.ok) {
        loadMeeting();
        setShowAdditionalQuestionModal(false);
      }
    } catch (error) {
      console.error("Error submitting additional question:", error);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
          <p className="text-sm sm:text-base" style={{ color: '#6B7280' }}>{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        <div 
          className="p-3 sm:p-6 mb-4 bg-white border rounded"
          style={{ borderColor: '#E5E7EB', borderRadius: '6px' }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
            <button
              onClick={() => router.push("/messages")}
              className="self-start sm:self-center min-h-[44px] sm:min-h-0 text-sm sm:text-base transition-colors flex items-center"
              style={{ color: '#6B7280' }}
            >
              ← {t("nav.back") || "Back"}
            </button>
            <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
              <Avatar
                src={otherUser?.profilePhoto}
                alt={otherUser?.name || t("label.unknownUser")}
                size="md"
                fallbackText={otherUser?.name}
                className="shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h1 className="text-base sm:text-lg font-semibold truncate" style={{ color: '#111827' }}>
                  {otherUser?.name || t("label.unknownUser")}
                </h1>
                {otherUser?.company && (
                  <p className="text-xs sm:text-sm truncate" style={{ color: '#6B7280' }}>{otherUser.company}</p>
                )}
              </div>
            </div>
            {otherUser?.id && (
              <div className="flex flex-wrap gap-2 sm:ml-auto">
                {session?.user?.role === "student" && otherUser?.role !== "admin" && (
                  <button
                    onClick={() => setShowReviewModal(true)}
                    className="btn-secondary text-xs sm:text-sm min-h-[44px] sm:min-h-0 px-3 sm:px-4 py-2"
                    disabled={hasReviewed}
                  >
                    {hasReviewed ? t("review.error.alreadyReviewed") : t("review.button")}
                  </button>
                )}
                {session?.user?.role === "student" && otherUser?.role !== "admin" && (
                  <ReportButton reportedUserId={otherUser.id} reportedUserName={otherUser.name} />
                )}
              </div>
            )}
          </div>
        </div>

        {error && (
          <div 
            className="mb-4 px-3 sm:px-4 py-2 sm:py-3 rounded border text-sm sm:text-base"
            style={{ backgroundColor: '#FEE2E2', borderColor: '#FCA5A5', color: '#DC2626' }}
          >
            {error}
          </div>
        )}

        {/* Messages */}
        <div 
          className="p-3 sm:p-6 mb-4 bg-white border rounded"
          style={{ borderColor: '#E5E7EB', borderRadius: '6px', minHeight: '300px', maxHeight: '500px', overflowY: 'auto' }}
        >
          {messages.length === 0 ? (
            <p className="text-center py-6 sm:py-8 text-sm sm:text-base" style={{ color: '#6B7280' }}>{t("messages.empty")}</p>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {/* Meeting Status Block - Rendered as system message */}
              {meeting && (
                <MeetingStatusBlock
                  threadId={threadId}
                  otherUser={otherUser}
                  meeting={meeting}
                  onUpdate={handleMeetingUpdate}
                />
              )}
              
              {messages.map((message) => {
                const isOwn = message.fromUserId === session?.user?.id;
                const isAdminView = session?.user?.role === "admin";
                const senderName = message.sender?.name || message.sender?.email || t("label.unknownUser");
                
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className="max-w-[75%] sm:max-w-xs lg:max-w-md px-3 sm:px-4 py-2 rounded break-words"
                      style={{
                        backgroundColor: isOwn ? '#0F2A44' : '#D7FFEF',
                        color: isOwn ? '#FFFFFF' : '#111827',
                        borderRadius: '6px'
                      }}
                    >
                      {isAdminView && (
                        <p 
                          className="text-xs font-medium mb-1"
                          style={{ 
                            color: isOwn ? '#FFFFFFE6' : 'var(--text-muted)',
                            opacity: 0.8
                          }}
                        >
                          {senderName} {message.sender?.role && `(${message.sender.role})`}
                        </p>
                      )}
                      <p className="text-xs sm:text-sm whitespace-pre-wrap break-words">{translate(message.content)}</p>
                      <p 
                        className="text-xs mt-1"
                        style={{ color: isOwn ? '#FFFFFFB3' : 'var(--text-muted)' }}
                      >
                        {new Date(message.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}
              {/* Scroll anchor for auto-scroll */}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Meeting Operation Buttons - Left side of message input */}
        {otherUser && (
          <div className="mb-4">
            <MeetingOperationButtons
              meeting={meeting}
              threadId={threadId}
              isStudent={session?.user?.role === "student"}
              isObog={session?.user?.role === "obog"}
              isStudentInMeeting={meeting?.student_id === session?.user?.id}
              isObogInMeeting={meeting?.obog_id === session?.user?.id}
              onUpdate={handleMeetingUpdate}
              onShowTermsModal={() => setShowTermsModal(true)}
              onShowEvaluationModal={() => setShowEvaluationModal(true)}
              onShowAdditionalQuestionModal={() => setShowAdditionalQuestionModal(true)}
            />
          </div>
        )}

        {/* Message Input */}
        <form 
          onSubmit={handleSend} 
          className="p-3 sm:p-4 bg-white border rounded"
          style={{ borderColor: '#E5E7EB', borderRadius: '6px' }}
        >
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={t("messages.thread.placeholder")}
              rows={3}
              className="flex-1 min-h-[44px] px-3 py-2 border rounded focus:outline-none focus:ring-2 text-base"
              style={{ borderColor: '#D1D5DB', borderRadius: '6px', color: '#111827' }}
            />
            <button
              type="submit"
              disabled={sending || !newMessage.trim()}
              className="w-full sm:w-auto min-h-[44px] btn-primary self-end disabled:opacity-50 disabled:cursor-not-allowed px-4 sm:px-6 py-2 text-sm sm:text-base"
            >
              {sending ? t("common.loading") : t("messages.thread.send")}
            </button>
          </div>
        </form>
      </div>
      
      {showReviewModal && otherUser && (
        <ReviewModal
          reviewedUserId={otherUser.id}
          reviewedUserName={otherUser.name || t("label.unknownUser")}
          onClose={() => setShowReviewModal(false)}
          onSuccess={() => {
            setHasReviewed(true);
            setShowReviewModal(false);
          }}
        />
      )}

      {/* Terms Agreement Modal */}
      {showTermsModal && otherUser && (
        <TermsAgreementModal
          isOpen={showTermsModal}
          onClose={() => setShowTermsModal(false)}
          onAccept={handleAcceptTerms}
          userRole={session?.user?.role as string}
          otherUserRole={otherUser?.role}
        />
      )}

      {/* Evaluation Form Modal */}
      {showEvaluationModal && meeting && (
        <EvaluationForm
          isOpen={showEvaluationModal}
          onClose={() => setShowEvaluationModal(false)}
          onSubmit={handleSubmitEvaluation}
        />
      )}

      {/* Additional Question Form (International Students Only) */}
      {showAdditionalQuestionModal && meeting && session?.user?.role === "student" && (
        <AdditionalQuestionForm
          isOpen={showAdditionalQuestionModal}
          onClose={() => setShowAdditionalQuestionModal(false)}
          onSubmit={handleSubmitAdditionalQuestion}
        />
      )}
    </div>
  );
}
