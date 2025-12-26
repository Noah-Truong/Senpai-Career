"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { useLanguage } from "@/contexts/LanguageContext";
import Avatar from "@/components/Avatar";
import ReportButton from "@/components/ReportButton";
import ReviewModal from "@/components/ReviewModal";

export default function MessageThreadPage() {
  const { t } = useLanguage();
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

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated" && threadId) {
      loadMessages();
    }
  }, [status, threadId, router]);

  const loadMessages = async () => {
    try {
      const response = await fetch(`/api/messages/${threadId}`);
      const data = await response.json();
      
      if (data.messages) {
        setMessages(data.messages);
        if (data.otherUser) {
          setOtherUser(data.otherUser);
          // Check if user has already reviewed this person
          if (session?.user?.id && data.otherUser.id) {
            try {
              const reviewResponse = await fetch(`/api/reviews?userId=${data.otherUser.id}`);
              if (reviewResponse.ok) {
                const reviewData = await reviewResponse.json();
                const existingReview = reviewData.reviews?.find(
                  (r: any) => r.reviewerUserId === session.user.id
                );
                setHasReviewed(!!existingReview);
              }
            } catch (err) {
              console.error("Error checking reviews:", err);
            }
          }
        }
      }
    } catch (err) {
      console.error("Error loading messages:", err);
      setError("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

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

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send message");
      }

      setNewMessage("");
      // Reload messages
      loadMessages();
    } catch (err: any) {
      setError(err.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p>{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card-gradient p-6 mb-4">
          <div className="flex items-center mb-4">
            <button
              onClick={() => router.push("/messages")}
              className="mr-4 text-gray-600 hover:text-gray-900"
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
              <h1 className="text-xl font-semibold">
                {otherUser?.name || t("label.unknownUser")}
              </h1>
              {otherUser?.company && (
                <p className="text-sm text-gray-600">{otherUser.company}</p>
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
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Messages */}
        <div className="card-gradient p-6 mb-4" style={{ minHeight: "400px", maxHeight: "600px", overflowY: "auto" }}>
          {messages.length === 0 ? (
            <p className="text-gray-500 text-center py-8">{t("messages.empty")}</p>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => {
                const isOwn = message.fromUserId === session?.user?.id;
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        isOwn
                          ? "gradient-bg text-white"
                          : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        isOwn ? "text-white/70" : "text-gray-500"
                      }`}>
                        {new Date(message.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Message Input */}
        <form onSubmit={handleSend} className="card-gradient p-4">
          <div className="flex gap-4">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={t("messages.thread.placeholder")}
              rows={3}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              style={{ color: '#000000' }}
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
    </div>
  );
}

