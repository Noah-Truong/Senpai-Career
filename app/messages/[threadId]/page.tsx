"use client";

import { useSession } from "@/contexts/AuthContext";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
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
              setError("Failed to load messages");
            }
          } catch (jsonError) {
            console.error("Failed to parse messages JSON:", jsonError);
            setError("Failed to load messages");
          }
        } else {
          console.warn("Messages API returned non-JSON content type");
          setError("Failed to load messages");
        }
      } else {
        setError("Failed to load messages");
      }
    } catch (err) {
      console.error("Error loading messages:", err);
      setError("Failed to load messages");
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

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated" && threadId) {
      loadMessages();
      loadMeeting();
    }
  }, [status, threadId, router, loadMessages, loadMeeting]);

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
        
        let errorMessage = "Failed to send message";
        
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
      loadMessages(true);
      // Refresh credits display after successful message send (small delay to ensure API processed)
      setTimeout(() => {
        dispatchCreditsRefresh();
      }, 500);
    } catch (err: any) {
      setError(err.message || "Failed to send message");
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p style={{ color: '#6B7280' }}>{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div 
          className="p-6 mb-4 bg-white border rounded"
          style={{ borderColor: '#E5E7EB', borderRadius: '6px' }}
        >
          <div className="flex items-center mb-4">
            <button
              onClick={() => router.push("/messages")}
              className="mr-4 transition-colors"
              style={{ color: '#6B7280' }}
            >
              ← {t("nav.back") || "Back"}
            </button>
            <Avatar
              src={otherUser?.profilePhoto}
              alt={otherUser?.name || "User"}
              size="md"
              fallbackText={otherUser?.name}
              className="mr-4"
            />
            <div className="flex-1">
              <h1 className="text-lg font-semibold" style={{ color: '#111827' }}>
                {otherUser?.name || t("label.unknownUser")}
              </h1>
              {otherUser?.company && (
                <p className="text-sm" style={{ color: '#6B7280' }}>{otherUser.company}</p>
              )}
            </div>
            {otherUser?.id && (
              <div className="ml-auto flex gap-2">
                {session?.user?.role === "student" && otherUser?.role !== "admin" && (
                  <button
                    onClick={() => setShowReviewModal(true)}
                    className="btn-secondary text-sm"
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
            className="mb-4 px-4 py-3 rounded border"
            style={{ backgroundColor: '#FEE2E2', borderColor: '#FCA5A5', color: '#DC2626' }}
          >
            {error}
          </div>
        )}

        {/* Messages */}
        <div 
          className="p-6 mb-4 bg-white border rounded"
          style={{ borderColor: '#E5E7EB', borderRadius: '6px', minHeight: '400px', maxHeight: '600px', overflowY: 'auto' }}
        >
          {messages.length === 0 ? (
            <p className="text-center py-8" style={{ color: '#6B7280' }}>{t("messages.empty")}</p>
          ) : (
            <div className="space-y-4">
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
                const senderName = message.sender?.name || message.sender?.email || "Unknown";
                
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className="max-w-xs lg:max-w-md px-4 py-2 rounded"
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
                            color: isOwn ? 'rgba(255,255,255,0.9)' : '#6B7280',
                            opacity: 0.8
                          }}
                        >
                          {senderName} {message.sender?.role && `(${message.sender.role})`}
                        </p>
                      )}
                      <p className="text-sm whitespace-pre-wrap">{translate(message.content)}</p>
                      <p 
                        className="text-xs mt-1"
                        style={{ color: isOwn ? 'rgba(255,255,255,0.7)' : '#6B7280' }}
                      >
                        {new Date(message.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}
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
          className="p-4 bg-white border rounded"
          style={{ borderColor: '#E5E7EB', borderRadius: '6px' }}
        >
          <div className="flex gap-4">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={t("messages.thread.placeholder")}
              rows={3}
              className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2"
              style={{ borderColor: '#D1D5DB', borderRadius: '6px', color: '#111827' }}
            />
            <button
              type="submit"
              disabled={sending || !newMessage.trim()}
              className="btn-primary self-end disabled:opacity-50 disabled:cursor-not-allowed"
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
