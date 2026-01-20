"use client";

import { useSession } from "@/contexts/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import Header from "@/components/Header";
import Link from "next/link";

export default function NewMessagePage() {
  const { t } = useLanguage();
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const obogId = searchParams.get("obogId");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [obog, setObog] = useState<any>(null);

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

    if (status === "authenticated" && obogId) {
      // TODO: Fetch OB/OG user details from API
      // For now, we'll handle it client-side
      fetch(`/api/users/${obogId}`)
        .then(res => res.json())
        .then(data => {
          if (data.user) {
            setObog(data.user);
          } else {
            setError(t("messages.new.notFound"));
          }
        })
        .catch(err => {
          console.error("Error fetching OB/OG:", err);
          setError(t("messages.new.failed"));
        });
    }
  }, [status, router, obogId, isAlumni, t]);

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
          toUserId: obogId,
          content: message,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send message");
      }

      // Redirect to the message thread
      router.push(`/messages/${data.threadId}`);
    } catch (err: any) {
      setError(err.message || "Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p>{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  // Alumni cannot start new conversations - they can only reply to existing threads
  if (isAlumni) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="card-gradient p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {t("messages.alumniRestriction.title") || "Message Restriction"}
            </h2>
            <p className="text-gray-700 text-lg mb-4">
              {t("messages.alumniRestriction.description") || "As an alumni, you cannot start new conversations. Please wait for students to message you first, then you can reply to their messages."}
            </p>
            <button
              onClick={() => router.push("/messages")}
              className="btn-primary"
            >
              {t("messages.alumniRestriction.viewMessages") || "View My Messages"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!obogId) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="card-gradient p-8 text-center">
            <p className="text-gray-700 text-lg mb-4">{t("messages.new.notFound")}</p>
            <button
              onClick={() => router.push("/ob-visit")}
              className="btn-primary"
            >
              {t("nav.obogList")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card-gradient p-8">
          <h1 className="text-3xl font-bold mb-6">{t("messages.new.title")}</h1>
          
          {obog && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">{t("label.to")}:</p>
              <p className="font-semibold">{obog.nickname || obog.name}</p>
              {obog.company && <p className="text-sm text-gray-600">{obog.company}</p>}
            </div>
          )}

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                {t("messages.new.message")}
              </label>
              <textarea
                id="message"
                name="message"
                rows={6}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder={t("messages.new.placeholder")}
                style={{ color: '#000000' }}
                required
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? t("common.loading") : t("messages.new.submit")}
              </button>
              <Link
                type="button"
                href="/ob-list"
                className="btn-secondary"
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

