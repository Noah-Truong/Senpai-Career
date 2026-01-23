"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import AdminLayout from "@/components/AdminLayout";
import { useLanguage } from "@/contexts/LanguageContext";

export default function AdminReportsPage() {
  const { t } = useLanguage();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "reviewed" | "resolved" | "dismissed">("all");
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated" && session?.user?.role !== "admin") {
      router.push("/dashboard");
      return;
    }

    if (status === "authenticated") {
      loadReports();
    }
  }, [status, session, router]);

  const loadReports = async () => {
    try {
      const response = await fetch("/api/reports");
      if (!response.ok) {
        throw new Error("Failed to load reports");
      }
      const data = await response.json();
      setReports(data.reports || []);
    } catch (error) {
      console.error("Error loading reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (reportId: string, newStatus: string) => {
    setUpdatingStatus(true);
    try {
      const response = await fetch("/api/reports", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: reportId,
          status: newStatus,
          adminNotes: adminNotes || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update report status");
      }

      await loadReports();
      setSelectedReport(null);
      setAdminNotes("");
    } catch (error) {
      console.error("Error updating report:", error);
      alert("Failed to update report status");
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

  const filteredReports = statusFilter === "all" 
    ? reports 
    : reports.filter(r => r.status === statusFilter);

  const pendingCount = reports.filter(r => r.status === "pending").length;
  const reviewedCount = reports.filter(r => r.status === "reviewed").length;
  const resolvedCount = reports.filter(r => r.status === "resolved").length;
  const dismissedCount = reports.filter(r => r.status === "dismissed").length;

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1" style={{ color: '#111827' }}>
          Reports Management
        </h1>
        <p style={{ color: '#6B7280' }}>Review and manage user reports</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div 
          className="bg-white p-4 border rounded"
          style={{ borderColor: '#E5E7EB', borderRadius: '6px' }}
        >
          <p className="text-sm mb-1" style={{ color: '#6B7280' }}>Total Reports</p>
          <p className="text-2xl font-bold" style={{ color: '#111827' }}>{reports.length}</p>
        </div>
        <div 
          className="bg-white p-4 border rounded border-l-4"
          style={{ borderColor: '#E5E7EB', borderRadius: '6px', borderLeftColor: '#F59E0B' }}
        >
          <p className="text-sm mb-1" style={{ color: '#6B7280' }}>Pending</p>
          <p className="text-2xl font-bold" style={{ color: '#D97706' }}>{pendingCount}</p>
        </div>
        <div 
          className="bg-white p-4 border rounded border-l-4"
          style={{ borderColor: '#E5E7EB', borderRadius: '6px', borderLeftColor: '#2563EB' }}
        >
          <p className="text-sm mb-1" style={{ color: '#6B7280' }}>Reviewed</p>
          <p className="text-2xl font-bold" style={{ color: '#2563EB' }}>{reviewedCount}</p>
        </div>
        <div 
          className="bg-white p-4 border rounded border-l-4"
          style={{ borderColor: '#E5E7EB', borderRadius: '6px', borderLeftColor: '#059669' }}
        >
          <p className="text-sm mb-1" style={{ color: '#6B7280' }}>Resolved</p>
          <p className="text-2xl font-bold" style={{ color: '#059669' }}>{resolvedCount}</p>
        </div>
        <div 
          className="bg-white p-4 border rounded border-l-4"
          style={{ borderColor: '#E5E7EB', borderRadius: '6px', borderLeftColor: '#6B7280' }}
        >
          <p className="text-sm mb-1" style={{ color: '#6B7280' }}>Dismissed</p>
          <p className="text-2xl font-bold" style={{ color: '#6B7280' }}>{dismissedCount}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
          Filter by Status
        </label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="px-4 py-2 border rounded"
          style={{ borderColor: '#D1D5DB', borderRadius: '6px', color: '#111827' }}
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="reviewed">Reviewed</option>
          <option value="resolved">Resolved</option>
          <option value="dismissed">Dismissed</option>
        </select>
      </div>

      {/* Reports List */}
      <div 
        className="bg-white border rounded"
        style={{ borderColor: '#E5E7EB', borderRadius: '6px' }}
      >
        <div className="p-4 border-b" style={{ borderColor: '#E5E7EB' }}>
          <h3 className="font-semibold" style={{ color: '#111827' }}>Reports</h3>
        </div>
        {filteredReports.length === 0 ? (
          <p className="text-center py-8" style={{ color: '#6B7280' }}>No reports found</p>
        ) : (
          <div className="divide-y" style={{ borderColor: '#E5E7EB' }}>
            {filteredReports.map((report) => (
              <div
                key={report.id}
                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => setSelectedReport(report)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        report.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                        report.status === "reviewed" ? "bg-blue-100 text-blue-800" :
                        report.status === "resolved" ? "bg-green-100 text-green-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {report.status}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        report.reportType === "user" ? "bg-red-100 text-red-800" :
                        report.reportType === "safety" ? "bg-orange-100 text-orange-800" :
                        report.reportType === "platform" ? "bg-blue-100 text-blue-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {report.reportType || "other"}
                      </span>
                      <span className="text-xs" style={{ color: '#6B7280' }}>
                        {new Date(report.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div className="mb-2 text-sm">
                      <p style={{ color: '#374151' }}>
                        <strong>Reporter:</strong> {report.reporter?.name || "Unknown"} ({report.reporter?.email || "N/A"})
                      </p>
                      {report.reportedUserId !== "PLATFORM" ? (
                        <p style={{ color: '#374151' }}>
                          <strong>Reported:</strong> {report.reported?.name || "Unknown"} ({report.reported?.email || "N/A"})
                        </p>
                      ) : (
                        <p style={{ color: '#374151' }}>
                          <strong>Target:</strong> Platform Issue
                        </p>
                      )}
                    </div>
                    <p className="text-sm font-medium mb-1" style={{ color: '#111827' }}>
                      Reason: {report.reason}
                    </p>
                    <p className="text-sm line-clamp-2" style={{ color: '#6B7280' }}>
                      {report.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Report Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div 
            className="bg-white rounded p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            style={{ borderRadius: '6px' }}
          >
            <h2 className="text-xl font-bold mb-4" style={{ color: '#111827' }}>
              Report Details
            </h2>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#6B7280' }}>Status</label>
                <span className={`px-2 py-1 rounded text-xs font-medium inline-block ${
                  selectedReport.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                  selectedReport.status === "reviewed" ? "bg-blue-100 text-blue-800" :
                  selectedReport.status === "resolved" ? "bg-green-100 text-green-800" :
                  "bg-gray-100 text-gray-800"
                }`}>
                  {selectedReport.status}
                </span>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#6B7280' }}>Report Type</label>
                <span className={`px-2 py-1 rounded text-xs font-medium inline-block ${
                  selectedReport.reportType === "user" ? "bg-red-100 text-red-800" :
                  selectedReport.reportType === "safety" ? "bg-orange-100 text-orange-800" :
                  selectedReport.reportType === "platform" ? "bg-blue-100 text-blue-800" :
                  "bg-gray-100 text-gray-800"
                }`}>
                  {selectedReport.reportType === "user" ? "User Report" :
                   selectedReport.reportType === "safety" ? "Safety Concern" :
                   selectedReport.reportType === "platform" ? "Platform Issue" : "Other"}
                </span>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#6B7280' }}>Created</label>
                <p className="text-sm" style={{ color: '#374151' }}>
                  {new Date(selectedReport.createdAt).toLocaleString()}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#6B7280' }}>Reporter</label>
                <p className="text-sm" style={{ color: '#374151' }}>
                  {selectedReport.reporter?.name || "Unknown"} ({selectedReport.reporter?.email || "N/A"}) - {selectedReport.reporter?.role || "N/A"}
                </p>
              </div>

              {selectedReport.reportedUserId !== "PLATFORM" ? (
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#6B7280' }}>Reported User</label>
                  <p className="text-sm" style={{ color: '#374151' }}>
                    {selectedReport.reported?.name || "Unknown"} ({selectedReport.reported?.email || "N/A"}) - {selectedReport.reported?.role || "N/A"}
                  </p>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#6B7280' }}>Target</label>
                  <p className="text-sm" style={{ color: '#374151' }}>Platform / System</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#6B7280' }}>Reason</label>
                <p className="text-sm" style={{ color: '#374151' }}>{selectedReport.reason}</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1" style={{ color: '#6B7280' }}>Description</label>
                <p className="text-sm whitespace-pre-wrap" style={{ color: '#374151' }}>
                  {selectedReport.description}
                </p>
              </div>

              {selectedReport.adminNotes && (
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: '#6B7280' }}>Admin Notes</label>
                  <p className="text-sm whitespace-pre-wrap" style={{ color: '#374151' }}>
                    {selectedReport.adminNotes}
                  </p>
                </div>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                Admin Notes
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border rounded"
                style={{ borderColor: '#D1D5DB', borderRadius: '6px', color: '#111827' }}
                placeholder="Add admin notes..."
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setSelectedReport(null);
                  setAdminNotes("");
                }}
                className="px-4 py-2 border rounded font-medium transition-colors hover:bg-gray-50"
                style={{ borderColor: '#D1D5DB', color: '#374151', borderRadius: '6px' }}
                disabled={updatingStatus}
              >
                Cancel
              </button>
              {selectedReport.status !== "pending" && (
                <button
                  onClick={() => handleUpdateStatus(selectedReport.id, "pending")}
                  className="px-4 py-2 text-white rounded font-medium transition-colors hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: '#F59E0B', borderRadius: '6px' }}
                  disabled={updatingStatus}
                >
                  Mark Pending
                </button>
              )}
              {selectedReport.status !== "reviewed" && (
                <button
                  onClick={() => handleUpdateStatus(selectedReport.id, "reviewed")}
                  className="px-4 py-2 text-white rounded font-medium transition-colors hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: '#2563EB', borderRadius: '6px' }}
                  disabled={updatingStatus}
                >
                  Mark Reviewed
                </button>
              )}
              {selectedReport.status !== "resolved" && (
                <button
                  onClick={() => handleUpdateStatus(selectedReport.id, "resolved")}
                  className="px-4 py-2 text-white rounded font-medium transition-colors hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: '#059669', borderRadius: '6px' }}
                  disabled={updatingStatus}
                >
                  Mark Resolved
                </button>
              )}
              {selectedReport.status !== "dismissed" && (
                <button
                  onClick={() => handleUpdateStatus(selectedReport.id, "dismissed")}
                  className="px-4 py-2 rounded font-medium transition-colors hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: '#6B7280', color: '#fff', borderRadius: '6px' }}
                  disabled={updatingStatus}
                >
                  Dismiss
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
