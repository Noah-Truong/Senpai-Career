"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { useLanguage } from "@/contexts/LanguageContext";
import { Report } from "@/types";

export default function AdminReportsPage() {
  const { t } = useLanguage();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "reviewed" | "resolved">("all");
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
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p>{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  const filteredReports = statusFilter === "all" 
    ? reports 
    : reports.filter(r => r.status === statusFilter);

  const pendingCount = reports.filter(r => r.status === "pending").length;
  const reviewedCount = reports.filter(r => r.status === "reviewed").length;
  const resolvedCount = reports.filter(r => r.status === "resolved").length;

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Reports Management</h1>
          <p className="text-gray-600">Review and manage user reports</p>
        </div>

        {/* Statistics */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="card-gradient p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Total Reports</h3>
            <p className="text-3xl font-bold">{reports.length}</p>
          </div>
          <div className="card-gradient p-6 border-l-4 border-yellow-500">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Pending</h3>
            <p className="text-3xl font-bold text-yellow-700">{pendingCount}</p>
          </div>
          <div className="card-gradient p-6 border-l-4 border-blue-500">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Reviewed</h3>
            <p className="text-3xl font-bold text-blue-700">{reviewedCount}</p>
          </div>
          <div className="card-gradient p-6 border-l-4 border-green-500">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Resolved</h3>
            <p className="text-3xl font-bold text-green-700">{resolvedCount}</p>
          </div>
        </div>

        {/* Filter */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Filter by Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            style={{ color: '#000000' }}
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        {/* Reports List */}
        <div className="card-gradient p-6">
          <h3 className="text-xl font-semibold mb-4">Reports</h3>
          {filteredReports.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No reports found</p>
          ) : (
            <div className="space-y-4">
              {filteredReports.map((report) => (
                <div
                  key={report.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedReport(report)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <span className={`px-3 py-1 rounded text-sm font-semibold ${
                          report.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                          report.status === "reviewed" ? "bg-blue-100 text-blue-800" :
                          "bg-green-100 text-green-800"
                        }`}>
                          {report.status}
                        </span>
                        <span className="text-sm text-gray-600">
                          {new Date(report.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="mb-2">
                        <p className="text-sm text-gray-600">
                          <strong>Reporter:</strong> {report.reporter?.name || "Unknown"} ({report.reporter?.email || "N/A"})
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Reported User:</strong> {report.reported?.name || "Unknown"} ({report.reported?.email || "N/A"})
                        </p>
                      </div>
                      <p className="text-sm font-medium mb-1">Reason: {report.reason}</p>
                      <p className="text-sm text-gray-700 line-clamp-2">{report.description}</p>
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
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold mb-4">Report Details</h2>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <span className={`px-3 py-1 rounded text-sm font-semibold inline-block ${
                    selectedReport.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                    selectedReport.status === "reviewed" ? "bg-blue-100 text-blue-800" :
                    "bg-green-100 text-green-800"
                  }`}>
                    {selectedReport.status}
                  </span>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Created</label>
                  <p className="text-sm text-gray-700">{new Date(selectedReport.createdAt).toLocaleString()}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Reporter</label>
                  <p className="text-sm text-gray-700">
                    {selectedReport.reporter?.name || "Unknown"} ({selectedReport.reporter?.email || "N/A"}) - {selectedReport.reporter?.role || "N/A"}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Reported User</label>
                  <p className="text-sm text-gray-700">
                    {selectedReport.reported?.name || "Unknown"} ({selectedReport.reported?.email || "N/A"}) - {selectedReport.reported?.role || "N/A"}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Reason</label>
                  <p className="text-sm text-gray-700">{selectedReport.reason}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedReport.description}</p>
                </div>

                {selectedReport.adminNotes && (
                  <div>
                    <label className="block text-sm font-medium mb-1">Admin Notes</label>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedReport.adminNotes}</p>
                  </div>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Admin Notes</label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  style={{ color: '#000000' }}
                  placeholder="Add admin notes..."
                />
              </div>

              <div className="flex gap-4 justify-end">
                <button
                  onClick={() => {
                    setSelectedReport(null);
                    setAdminNotes("");
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  disabled={updatingStatus}
                >
                  {t("nav.cancel") || "Cancel"}
                </button>
                {selectedReport.status !== "pending" && (
                  <button
                    onClick={() => handleUpdateStatus(selectedReport.id, "pending")}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50"
                    disabled={updatingStatus}
                  >
                    Mark Pending
                  </button>
                )}
                {selectedReport.status !== "reviewed" && (
                  <button
                    onClick={() => handleUpdateStatus(selectedReport.id, "reviewed")}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    disabled={updatingStatus}
                  >
                    Mark Reviewed
                  </button>
                )}
                {selectedReport.status !== "resolved" && (
                  <button
                    onClick={() => handleUpdateStatus(selectedReport.id, "resolved")}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                    disabled={updatingStatus}
                  >
                    Mark Resolved
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

