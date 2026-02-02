"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSession } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/AdminLayout";
import { useLanguage } from "@/contexts/LanguageContext";

interface ComplianceSubmission {
  userId: string;
  userName: string;
  userEmail: string;
  nationality: string;
  complianceAgreed: boolean;
  complianceAgreedAt: string;
  complianceStatus: "pending" | "submitted" | "approved" | "rejected";
  complianceSubmittedAt: string;
  complianceDocuments: string[];
}

export default function AdminCompliancePage() {
  const { t } = useLanguage();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [submissions, setSubmissions] = useState<ComplianceSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "submitted" | "approved" | "rejected">("all");
  const [selectedSubmission, setSelectedSubmission] = useState<ComplianceSubmission | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const loadingRef = useRef(false);

  const loadSubmissions = useCallback(async () => {
    // Prevent duplicate concurrent calls
    if (loadingRef.current) {
      return;
    }
    loadingRef.current = true;
    setLoading(true);
    try {
      const response = await fetch("/api/users");
      if (!response.ok) {
        throw new Error("Failed to load users");
      }
      
      const contentType = response.headers.get("content-type");
      const isJson = contentType && contentType.includes("application/json");
      
      if (isJson) {
        const text = await response.text();
        const trimmedText = text.trim();
        
        if (trimmedText.startsWith("{") || trimmedText.startsWith("[")) {
          const data = JSON.parse(text);
          const students = (data.users || []).filter((u: any) => u.role === "student");
          
          // Extract compliance data from student profiles (already merged in readUsers)
          const submissionsWithCompliance = students
            .map((student: any) => ({
              userId: student.id,
              userName: student.name,
              userEmail: student.email,
              nationality: student.nationality || "",
              complianceAgreed: student.complianceAgreed || false,
              complianceAgreedAt: student.complianceAgreedAt,
              complianceStatus: student.complianceStatus || "pending",
              complianceSubmittedAt: student.complianceSubmittedAt,
              complianceDocuments: student.complianceDocuments || [],
            }))
            .filter((s: ComplianceSubmission) => s.complianceAgreed || s.complianceStatus !== "pending");
          
          setSubmissions(submissionsWithCompliance.filter((s: ComplianceSubmission | null): s is ComplianceSubmission => s !== null));
        }
      }
    } catch (error) {
      console.error("Error loading compliance submissions:", error);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated" && session?.user?.role !== "admin") {
      router.push("/dashboard");
      return;
    }

    if (status === "authenticated" && session?.user?.role === "admin") {
      loadSubmissions();
    }
  }, [status, session?.user?.role, router, loadSubmissions]);

  const handleUpdateStatus = async (userId: string, newStatus: "approved" | "rejected") => {
    setUpdatingStatus(true);
    try {
      const response = await fetch("/api/admin/compliance", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          status: newStatus,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update compliance status");
      }

      await loadSubmissions();
      setSelectedSubmission(null);
    } catch (error) {
      console.error("Error updating compliance status:", error);
      alert(t("admin.compliance.error.update") || "Failed to update compliance status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <p style={{ color: '#6B7280' }}>{t("common.loading")}</p>
        </div>
      </AdminLayout>
    );
  }

  const filteredSubmissions = statusFilter === "all" 
    ? submissions 
    : submissions.filter(s => s.complianceStatus === statusFilter);

  const pendingCount = submissions.filter(s => s.complianceStatus === "pending" || s.complianceStatus === "submitted").length;
  const approvedCount = submissions.filter(s => s.complianceStatus === "approved").length;
  const rejectedCount = submissions.filter(s => s.complianceStatus === "rejected").length;

  return (
    <AdminLayout>
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold mb-1" style={{ color: '#111827' }}>
          {t("admin.compliance.title")}
        </h1>
        <p className="text-sm sm:text-base" style={{ color: '#6B7280' }}>
          {t("admin.compliance.subtitle")}
        </p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="bg-white border rounded p-3 sm:p-4" style={{ borderColor: '#E5E7EB', borderRadius: '6px' }}>
          <p className="text-xs sm:text-sm" style={{ color: '#6B7280' }}>{t("admin.compliance.totalSubmissions")}</p>
          <p className="text-xl sm:text-2xl font-bold" style={{ color: '#111827' }}>{submissions.length}</p>
        </div>
        <div className="bg-yellow-50 border rounded p-3 sm:p-4" style={{ borderColor: '#FCD34D', borderRadius: '6px' }}>
          <p className="text-xs sm:text-sm" style={{ color: '#6B7280' }}>{t("admin.compliance.pendingReview")}</p>
          <p className="text-xl sm:text-2xl font-bold" style={{ color: '#92400E' }}>{pendingCount}</p>
        </div>
        <div className="bg-green-50 border rounded p-3 sm:p-4" style={{ borderColor: '#86EFAC', borderRadius: '6px' }}>
          <p className="text-xs sm:text-sm" style={{ color: '#6B7280' }}>{t("admin.compliance.approved")}</p>
          <p className="text-xl sm:text-2xl font-bold" style={{ color: '#166534' }}>{approvedCount}</p>
        </div>
        <div className="bg-red-50 border rounded p-3 sm:p-4" style={{ borderColor: '#FCA5A5', borderRadius: '6px' }}>
          <p className="text-xs sm:text-sm" style={{ color: '#6B7280' }}>{t("admin.compliance.rejected")}</p>
          <p className="text-xl sm:text-2xl font-bold" style={{ color: '#991B1B' }}>{rejectedCount}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="w-full sm:w-auto min-h-[44px] px-4 py-2 border rounded text-base"
          style={{ borderColor: '#E5E7EB', borderRadius: '6px' }}
        >
          <option value="all">{t("admin.compliance.allStatuses")}</option>
          <option value="pending">{t("admin.compliance.pending")}</option>
          <option value="submitted">{t("admin.compliance.submitted")}</option>
          <option value="approved">{t("admin.compliance.approved")}</option>
          <option value="rejected">{t("admin.compliance.rejected")}</option>
        </select>
      </div>

      {/* Submissions List */}
      {filteredSubmissions.length === 0 ? (
        <div className="bg-white border rounded p-8 text-center" style={{ borderColor: '#E5E7EB', borderRadius: '6px' }}>
          <p style={{ color: '#6B7280' }}>{t("admin.compliance.noSubmissions")}</p>
        </div>
      ) : (
        <div className="bg-white border rounded divide-y" style={{ borderColor: '#E5E7EB', borderRadius: '6px' }}>
          {filteredSubmissions.map((submission) => {
            const isInternational = submission.nationality && 
              submission.nationality.toLowerCase() !== "japan" && 
              submission.nationality.toLowerCase() !== "japanese";
            
            return (
              <div
                key={submission.userId}
                className="p-3 sm:p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => setSelectedSubmission(submission)}
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm sm:text-base truncate" style={{ color: '#111827' }}>
                      {submission.userName}
                    </p>
                    <p className="text-xs sm:text-sm truncate" style={{ color: '#6B7280' }}>
                      {submission.userEmail}
                    </p>
                    {isInternational && (
                      <p className="text-xs mt-1" style={{ color: '#6B7280' }}>
                        {t("admin.compliance.internationalStudent")} ({submission.nationality})
                      </p>
                    )}
                    <p className="text-xs mt-1" style={{ color: '#6B7280' }}>
                      {t("admin.compliance.submittedDate")}: {submission.complianceSubmittedAt 
                        ? new Date(submission.complianceSubmittedAt).toLocaleDateString()
                        : t("admin.compliance.notSubmitted")}
                    </p>
                  </div>
                  <span className={`px-2 sm:px-3 py-1 rounded text-xs font-medium shrink-0 ${
                    submission.complianceStatus === "approved"
                      ? "bg-green-100 text-green-800"
                      : submission.complianceStatus === "rejected"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}>
                    {submission.complianceStatus || "pending"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 backdrop-blur-md bg-black/30 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-lg p-4 sm:p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto pb-[env(safe-area-inset-bottom)]">
            <div className="flex justify-between items-start mb-4 gap-4">
              <div className="flex-1 min-w-0">
                <h2 className="text-lg sm:text-xl font-bold truncate" style={{ color: '#111827' }}>
                  {selectedSubmission.userName}
                </h2>
                <p className="text-xs sm:text-sm truncate" style={{ color: '#6B7280' }}>
                  {selectedSubmission.userEmail}
                </p>
                {selectedSubmission.nationality && (
                  <p className="text-xs sm:text-sm mt-1" style={{ color: '#6B7280' }}>
                    {t("admin.compliance.nationality")}: {selectedSubmission.nationality}
                  </p>
                )}
              </div>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="text-gray-400 hover:text-gray-600 shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center text-xl sm:text-2xl"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2" style={{ color: '#374151' }}>
                  {t("admin.compliance.complianceStatus")}
                </p>
                <span className={`px-3 py-1 rounded text-sm font-medium inline-block ${
                  selectedSubmission.complianceStatus === "approved"
                    ? "bg-green-100 text-green-800"
                    : selectedSubmission.complianceStatus === "rejected"
                    ? "bg-red-100 text-red-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}>
                  {selectedSubmission.complianceStatus === "approved" ? t("admin.compliance.status.approved") :
                   selectedSubmission.complianceStatus === "rejected" ? t("admin.compliance.status.rejected") :
                   selectedSubmission.complianceStatus === "submitted" ? t("admin.compliance.status.submitted") :
                   t("admin.compliance.status.pending")}
                </span>
              </div>

              {selectedSubmission.complianceDocuments && selectedSubmission.complianceDocuments.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-2" style={{ color: '#374151' }}>
                    {t("admin.compliance.submittedDocuments")}
                  </p>
                  <div className="space-y-2">
                    {selectedSubmission.complianceDocuments.map((docUrl, index) => {
                      // Parse document URL - format is "prefix:url" where url is the full Supabase Storage public URL
                      let cleanUrl = docUrl;
                      let docName = t("admin.compliance.document");
                      
                      // Check if URL has prefix (permission: or japanese_cert:)
                      if (docUrl.startsWith("permission:")) {
                        cleanUrl = docUrl.substring("permission:".length);
                        docName = t("admin.compliance.permissionDocument");
                      } else if (docUrl.startsWith("japanese_cert:")) {
                        cleanUrl = docUrl.substring("japanese_cert:".length);
                        docName = t("admin.compliance.japaneseCert");
                      } else if (docUrl.includes("permission") || docUrl.includes("activity")) {
                        // Fallback: check if URL contains keywords
                        docName = t("admin.compliance.permissionDocument");
                      } else if (docUrl.includes("japanese") || docUrl.includes("jlpt") || docUrl.includes("cert")) {
                        docName = t("admin.compliance.japaneseCert");
                      }
                      
                      // If the URL is not a full HTTP(S) URL, construct the Supabase Storage public URL
                      // This handles cases where only the storage path was stored
                      let finalUrl = cleanUrl;
                      if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
                        // It's a storage path like "userId/filename" - construct full public URL
                        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
                        if (supabaseUrl) {
                          // Construct the public URL for the compliance-documents bucket
                          finalUrl = `${supabaseUrl}/storage/v1/object/public/compliance-documents/${cleanUrl}`;
                        } else {
                          console.error("NEXT_PUBLIC_SUPABASE_URL not configured");
                        }
                      }
                      
                      return (
                        <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 border rounded" style={{ borderColor: '#E5E7EB' }}>
                          <span className="text-sm" style={{ color: '#374151' }}>
                            {docName}
                          </span>
                          <a
                            href={finalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm underline min-h-[44px] flex items-center"
                          >
                            {t("admin.compliance.viewDocument")}
                          </a>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {selectedSubmission.complianceStatus === "submitted" || selectedSubmission.complianceStatus === "pending" ? (
                <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 pt-4">
                  <button
                    onClick={() => handleUpdateStatus(selectedSubmission.userId, "approved")}
                    disabled={updatingStatus}
                    className="w-full sm:w-auto min-h-[44px] px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    {updatingStatus ? t("admin.compliance.updating") : t("admin.compliance.approve")}
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedSubmission.userId, "rejected")}
                    disabled={updatingStatus}
                    className="w-full sm:w-auto min-h-[44px] px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    {updatingStatus ? t("admin.compliance.updating") : t("admin.compliance.reject")}
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
