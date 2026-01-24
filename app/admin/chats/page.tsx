"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AdminLayout from "@/components/AdminLayout";
import { useLanguage } from "@/contexts/LanguageContext";

export default function AdminChatsPage() {
  const { t } = useLanguage();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [threads, setThreads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated" && session?.user?.role !== "admin") {
      router.push("/");
      return;
    }

    if (status === "authenticated" && session?.user?.role === "admin") {
      loadThreads();
    }
  }, [status, session, router]);

  const loadThreads = async () => {
    try {
      const response = await fetch("/api/messages");
      if (!response.ok) {
        throw new Error("Failed to load chat threads");
      }
      const data = await response.json();
      setThreads(data.threads || []);
    } catch (error) {
      console.error("Error loading chat threads:", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <p style={{ color: "#6B7280" }}>{t("common.loading")}</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1" style={{ color: "#111827" }}>
          {t("admin.chats.title")}
        </h1>
        <p style={{ color: "#6B7280" }}>
          {t("admin.chats.subtitle")}
        </p>
      </div>

      {threads.length === 0 ? (
        <div
          className="bg-white border rounded p-8 text-center"
          style={{ borderColor: "#E5E7EB", borderRadius: "6px" }}
        >
          <p style={{ color: "#6B7280" }}>{t("admin.chats.noThreads")}</p>
        </div>
      ) : (
        <div
          className="bg-white border rounded divide-y"
          style={{ borderColor: "#E5E7EB", borderRadius: "6px" }}
        >
          {threads.map((thread) => {
            const participants = thread.participants || [];
            const names = participants
              .map((p: any) => p?.name || p?.email || t("admin.chats.unknown"))
              .filter(Boolean);
            const last = thread.lastMessage;
            return (
              <Link
                key={thread.id}
                href={`/messages/${thread.id}`}
                className="block p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium" style={{ color: "#111827" }}>
                      {names.length >= 2
                        ? `${names[0]} ⇄ ${names[1]}`
                        : names[0] || "—"}
                    </p>
                    {last && (
                      <p
                        className="text-sm mt-1 line-clamp-1"
                        style={{ color: "#6B7280" }}
                      >
                        {typeof last.content === "object"
                          ? last.content?.en || last.content?.ja || "—"
                          : last.content}
                      </p>
                    )}
                  </div>
                  <span className="text-xs" style={{ color: "#9CA3AF" }}>
                    {last?.createdAt
                      ? new Date(last.createdAt).toLocaleString()
                      : ""}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
}
