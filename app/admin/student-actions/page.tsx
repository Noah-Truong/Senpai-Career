"use client";

import { useSession } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import AdminLayout from "@/components/AdminLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Report } from "@/types";

interface EnrichedReport extends Report {
  reported?: { name: string; email?: string; role?: string };
  reporter?: { name: string; email?: string; role?: string };
}

interface StudentAction {
  id: string;
  type: "contact" | "meeting" | "application" | "hiring";
  studentId: string;
  studentName: string;
  targetId?: string;
  targetName?: string;
  targetType?: "obog" | "company";
  timestamp: string;
  details?: string;
}

interface Student {
  id: string;
  name: string;
  email: string;
  university?: string;
  actions: StudentAction[];
  reports?: EnrichedReport[];
  lastOBContact?: {
    obogId: string;
    obogName: string;
    timestamp: string;
  };
}

export default function StudentActionsPage() {
  const { t } = useLanguage();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"timeline" | "reports">("timeline");
  const [reportStatusFilter, setReportStatusFilter] = useState<"all" | "pending" | "reviewed" | "resolved" | "dismissed">("all");
  const [updatingReportStatus, setUpdatingReportStatus] = useState<string | null>(null);

  const loadStudentsRef = useRef(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated" && session?.user?.role !== "admin") {
      router.push("/dashboard");
      return;
    }

    if (status === "authenticated" && session?.user?.role === "admin" && !loadStudentsRef.current) {
      loadStudentsRef.current = true;
      loadStudents().finally(() => {
        loadStudentsRef.current = false;
      });
    }
  }, [status, session?.user?.role, router]);

  const loadStudents = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/users");
      if (response.ok) {
        const data = await response.json();
        const studentUsers = data.users?.filter((u: any) => u.role === "student") || [];
        
        const studentsWithActions = await Promise.all(
          studentUsers.map(async (student: any) => {
            const threadsResponse = await fetch(`/api/messages?userId=${student.id}`);
            const actions: StudentAction[] = [];
            
            if (threadsResponse.ok) {
              const threadsData = await threadsResponse.json();
              const threads = threadsData.threads || [];
              
              threads.forEach((thread: any) => {
                const otherParticipant = thread.participants?.find((p: any) => p.id !== student.id);
                if (otherParticipant) {
                  actions.push({
                    id: thread.id,
                    type: "contact",
                    studentId: student.id,
                    studentName: student.name,
                    targetId: otherParticipant.id,
                    targetName: otherParticipant.name,
                    targetType: otherParticipant.role === "obog" ? "obog" : "company",
                    timestamp: thread.lastMessage?.timestamp || thread.createdAt,
                    details: `Messaged ${otherParticipant.name}`,
                  });
                }
              });
            }

            const appsResponse = await fetch(`/api/applications?userId=${student.id}`);
            if (appsResponse.ok) {
              const appsData = await appsResponse.json();
              const applications = appsData.applications || [];
              
              applications.forEach((app: any) => {
                actions.push({
                  id: app.id,
                  type: "application",
                  studentId: student.id,
                  studentName: student.name,
                  targetId: app.listingId,
                  targetName: app.listingTitle || "Job Listing",
                  targetType: "company",
                  timestamp: app.createdAt,
                  details: `Applied to ${app.listingTitle}`,
                });
              });
            }

            // Fetch reports for this student (as reporter)
            const reportsResponse = await fetch(`/api/reports`);
            let reports: EnrichedReport[] = [];
            if (reportsResponse.ok) {
              const reportsData = await reportsResponse.json();
              reports = (reportsData.reports || []).filter((r: EnrichedReport) => r.reporterUserId === student.id);
            }

            actions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            const lastOBContact = actions.find(a => a.type === "contact" && a.targetType === "obog");

            return {
              id: student.id,
              name: student.name,
              email: student.email,
              university: student.university,
              actions,
              reports,
              lastOBContact: lastOBContact ? {
                obogId: lastOBContact.targetId || "",
                obogName: lastOBContact.targetName || "",
                timestamp: lastOBContact.timestamp,
              } : undefined,
            };
          })
        );

        setStudents(studentsWithActions);
      }
    } catch (error) {
      console.error("Error loading students:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const filteredStudents = useMemo(() => 
    students.filter(student =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (student.university && student.university.toLowerCase().includes(searchTerm.toLowerCase()))
    ),
    [students, searchTerm]
  );

  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleString();
  }, []);

  const handleUpdateReportStatus = useCallback(async (reportId: string, newStatus: string, adminNotes?: string) => {
    setUpdatingReportStatus(reportId);
    try {
      const response = await fetch("/api/reports", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: reportId,
          status: newStatus,
          adminNotes: adminNotes || undefined,
        }),
      });

      if (response.ok) {
        // Reload students to get updated reports
        await loadStudents();
      } else {
        const errorData = await response.json();
        alert(errorData.error || t("admin.reports.error.update"));
      }
    } catch (error) {
      console.error("Error updating report:", error);
      alert(t("admin.reports.error.update"));
    } finally {
      setUpdatingReportStatus(null);
    }
  }, [loadStudents, t]);

  const filteredReports = useMemo(() => {
    if (!selectedStudent?.reports) return [];
    if (reportStatusFilter === "all") return selectedStudent.reports;
    return selectedStudent.reports.filter(r => r.status === reportStatusFilter);
  }, [selectedStudent, reportStatusFilter]);

  const getReportStatusColor = useCallback((status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "reviewed": return "bg-blue-100 text-blue-800";
      case "resolved": return "bg-green-100 text-green-800";
      case "dismissed": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  }, []);

  const getActionIcon = useCallback((type: string) => {
    switch (type) {
      case "contact":
        return (
          <svg className="w-5 h-5" fill="none" stroke="#2563EB" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        );
      case "meeting":
        return (
          <svg className="w-5 h-5" fill="none" stroke="#059669" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case "application":
        return (
          <svg className="w-5 h-5" fill="none" stroke="#7C3AED" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case "hiring":
        return (
          <svg className="w-5 h-5" fill="none" stroke="#F59E0B" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
        );
      default:
        return null;
    }
  }, []);

  if (status === "loading" || loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <p style={{ color: '#6B7280' }}>{t("common.loading")}</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1" style={{ color: '#111827' }}>
          {t("admin.studentActions.title") || "Student Action Management"}
        </h1>
        <p style={{ color: '#6B7280' }}>
          {t("admin.studentActions.subtitle") || "Track student activity: contacts, meetings, applications, and hiring outcomes"}
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder={t("admin.studentActions.search") || "Search students by name, email, or university..."}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full md:w-96 px-4 py-2 border rounded"
          style={{ borderColor: '#D1D5DB', borderRadius: '6px', color: '#111827' }}
        />
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Student List */}
        <div className="md:col-span-1">
          <div 
            className="bg-white border rounded"
            style={{ borderColor: '#E5E7EB', borderRadius: '6px' }}
          >
            <div className="p-4 border-b" style={{ borderColor: '#E5E7EB' }}>
              <h2 className="font-semibold" style={{ color: '#111827' }}>
                {t("admin.studentActions.studentList") || "Students"} ({filteredStudents.length})
              </h2>
            </div>
            <div className="max-h-[500px] overflow-y-auto">
              {filteredStudents.map((student) => (
                <button
                  key={student.id}
                  onClick={() => setSelectedStudent(student)}
                  className={`w-full text-left p-4 border-b transition-colors ${
                    selectedStudent?.id === student.id
                      ? ""
                      : "hover:bg-gray-50"
                  }`}
                  style={{
                    backgroundColor: selectedStudent?.id === student.id ? '#D7FFEF' : undefined,
                    borderColor: '#E5E7EB'
                  }}
                >
                  <p className="font-medium" style={{ color: '#111827' }}>{student.name}</p>
                  <p className="text-sm" style={{ color: '#6B7280' }}>{student.email}</p>
                  {student.university && (
                    <p className="text-xs" style={{ color: '#9CA3AF' }}>{student.university}</p>
                  )}
                  <p className="text-xs mt-1 text-navy">
                    {student.actions.length} {t("admin.studentActions.actions") || "actions"}
                    {student.reports && student.reports.length > 0 && (
                      <span className="ml-2">
                        • {student.reports.length} {t("admin.studentActions.reportsCount") || "reports"}
                      </span>
                    )}
                  </p>
                </button>
              ))}
              {filteredStudents.length === 0 && (
                <p className="text-center py-8" style={{ color: '#6B7280' }}>
                  {t("admin.studentActions.noStudents") || "No students found"}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Action Timeline */}
        <div className="md:col-span-2">
          {selectedStudent ? (
            <div 
              className="bg-white border rounded"
              style={{ borderColor: '#E5E7EB', borderRadius: '6px' }}
            >
              <div className="p-4 border-b" style={{ borderColor: '#E5E7EB' }}>
                <h2 className="text-lg font-semibold" style={{ color: '#111827' }}>
                  {selectedStudent.name}
                </h2>
                <p style={{ color: '#6B7280' }}>{selectedStudent.email}</p>
                {selectedStudent.university && (
                  <p className="text-sm" style={{ color: '#9CA3AF' }}>{selectedStudent.university}</p>
                )}
                
                {selectedStudent.lastOBContact && (
                  <div 
                    className="mt-4 p-3 rounded border-l-4"
                    style={{ backgroundColor: '#FEF3C7', borderLeftColor: '#F59E0B' }}
                  >
                    <p className="text-sm font-medium" style={{ color: '#92400E' }}>
                      {t("admin.studentActions.lastOBContact") || "Last OB/OG Contact (for hiring attribution)"}:
                    </p>
                    <p className="text-sm" style={{ color: '#B45309' }}>
                      {selectedStudent.lastOBContact.obogName} - {formatDate(selectedStudent.lastOBContact.timestamp)}
                    </p>
                  </div>
                )}
              </div>

              {/* Tabs */}
              <div className="border-b" style={{ borderColor: '#E5E7EB' }}>
                <div className="flex gap-4 px-4">
                  <button
                    onClick={() => setActiveTab("timeline")}
                    className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                      activeTab === "timeline"
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {t("admin.studentActions.timeline") || "Timeline"}
                    {selectedStudent.actions.length > 0 && (
                      <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800">
                        {selectedStudent.actions.length}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab("reports")}
                    className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                      activeTab === "reports"
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {t("admin.studentActions.reports") || "Reports"}
                    {selectedStudent.reports && selectedStudent.reports.length > 0 && (
                      <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-800">
                        {selectedStudent.reports.length}
                      </span>
                    )}
                  </button>
                </div>
              </div>

              <div className="p-4">
                {activeTab === "timeline" ? (
                  <>
                    <h3 className="font-semibold mb-4" style={{ color: '#111827' }}>
                      {t("admin.studentActions.timeline") || "Action Timeline"}
                    </h3>
                    
                    {selectedStudent.actions.length > 0 ? (
                      <div className="relative">
                        {/* Timeline line */}
                        <div 
                          className="absolute left-6 top-0 bottom-0 w-0.5"
                          style={{ backgroundColor: '#E5E7EB' }}
                        />
                        
                        <div className="space-y-4">
                          {selectedStudent.actions.map((action, index) => (
                            <div 
                              key={action.id}
                              className="relative flex items-start gap-4"
                            >
                              {/* Timeline dot */}
                              <div 
                                className="relative z-10 flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center border-2 bg-white"
                                style={{ 
                                  borderColor: action.type === "contact" ? "#2563EB" :
                                              action.type === "meeting" ? "#059669" :
                                              action.type === "application" ? "#7C3AED" :
                                              "#F59E0B",
                                  backgroundColor: action.type === "contact" ? "#DBEAFE" :
                                                  action.type === "meeting" ? "#D1FAE5" :
                                                  action.type === "application" ? "#EDE9FE" :
                                                  "#FEF3C7"
                                }}
                              >
                                {getActionIcon(action.type)}
                              </div>
                              
                              {/* Content card */}
                              <div 
                                className="flex-1 p-4 rounded-lg border shadow-sm"
                                style={{ 
                                  backgroundColor: '#FFFFFF',
                                  borderColor: '#E5E7EB',
                                  borderRadius: '8px'
                                }}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <p className="font-semibold text-sm" style={{ color: '#111827' }}>
                                    {action.type.charAt(0).toUpperCase() + action.type.slice(1)}
                                  </p>
                                  <p className="text-xs" style={{ color: '#9CA3AF' }}>
                                    {formatDate(action.timestamp)}
                                  </p>
                                </div>
                                <p className="text-sm mb-2" style={{ color: '#374151' }}>
                                  {action.details}
                                </p>
                                {action.targetName && (
                                  <div className="flex items-center gap-2 mt-2">
                                    <span className="text-xs px-2 py-1 rounded" style={{ 
                                      backgroundColor: action.targetType === "obog" ? "#D1FAE5" : "#EDE9FE",
                                      color: action.targetType === "obog" ? "#065F46" : "#6B21A8"
                                    }}>
                                      {action.targetType === "obog" ? t("label.obog") : t("label.company")}
                                    </span>
                                    <p className="text-xs" style={{ color: '#6B7280' }}>
                                      {action.targetName}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-center py-8" style={{ color: '#6B7280' }}>
                        {t("admin.studentActions.noActions") || "No actions recorded for this student"}
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    {/* Report Management */}
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold" style={{ color: '#111827' }}>
                        {t("admin.studentActions.reports") || "Reports"}
                      </h3>
                      {selectedStudent.reports && selectedStudent.reports.length > 0 && (
                        <select
                          value={reportStatusFilter}
                          onChange={(e) => setReportStatusFilter(e.target.value as any)}
                          className="px-3 py-1 text-sm border rounded"
                          style={{ borderColor: '#D1D5DB', borderRadius: '6px' }}
                        >
                          <option value="all">{t("admin.reports.filter.all") || "All"}</option>
                          <option value="pending">{t("admin.reports.filter.pending") || "Pending"}</option>
                          <option value="reviewed">{t("admin.reports.filter.reviewed") || "Reviewed"}</option>
                          <option value="resolved">{t("admin.reports.filter.resolved") || "Resolved"}</option>
                          <option value="dismissed">{t("admin.reports.filter.dismissed") || "Dismissed"}</option>
                        </select>
                      )}
                    </div>

                    {filteredReports.length > 0 ? (
                      <div className="space-y-4">
                        {filteredReports.map((report) => (
                          <div
                            key={report.id}
                            className="p-4 border rounded-lg"
                            style={{ 
                              borderColor: '#E5E7EB',
                              borderRadius: '8px',
                              backgroundColor: '#FFFFFF'
                            }}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className={`px-2 py-1 rounded text-xs font-medium ${getReportStatusColor(report.status)}`}>
                                    {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                                  </span>
                                  <span className="text-xs" style={{ color: '#6B7280' }}>
                                    {formatDate(report.createdAt.toString())}
                                  </span>
                                </div>
                                <p className="font-medium text-sm mb-1" style={{ color: '#111827' }}>
                                  {t("admin.reports.reason") || "Reason"}: {report.reason}
                                </p>
                                {report.reported && (
                                  <p className="text-sm mb-2" style={{ color: '#6B7280' }}>
                                    {t("admin.reports.reportedUser") || "Reported User"}: {report.reported.name} ({report.reported.role})
                                  </p>
                                )}
                                <p className="text-sm" style={{ color: '#374151' }}>
                                  {report.description}
                                </p>
                                {report.adminNotes && (
                                  <div className="mt-3 p-2 rounded" style={{ backgroundColor: '#F3F4F6' }}>
                                    <p className="text-xs font-medium mb-1" style={{ color: '#6B7280' }}>
                                      {t("admin.reports.adminNotes") || "Admin Notes"}:
                                    </p>
                                    <p className="text-xs" style={{ color: '#374151' }}>
                                      {report.adminNotes}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {/* Action buttons */}
                            <div className="flex gap-2 mt-3 flex-wrap">
                              {report.status === "pending" && (
                                <>
                                  <button
                                    onClick={() => handleUpdateReportStatus(report.id, "reviewed")}
                                    disabled={updatingReportStatus === report.id}
                                    className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                                  >
                                    {t("admin.reports.markReviewed") || "Mark Reviewed"}
                                  </button>
                                  <button
                                    onClick={() => handleUpdateReportStatus(report.id, "resolved")}
                                    disabled={updatingReportStatus === report.id}
                                    className="px-3 py-1.5 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                                  >
                                    {t("admin.reports.markResolved") || "Mark Resolved"}
                                  </button>
                                  <button
                                    onClick={() => handleUpdateReportStatus(report.id, "dismissed")}
                                    disabled={updatingReportStatus === report.id}
                                    className="px-3 py-1.5 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
                                  >
                                    {t("admin.reports.dismiss") || "Dismiss"}
                                  </button>
                                </>
                              )}
                              {report.status === "reviewed" && (
                                <>
                                  <button
                                    onClick={() => handleUpdateReportStatus(report.id, "resolved")}
                                    disabled={updatingReportStatus === report.id}
                                    className="px-3 py-1.5 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                                  >
                                    {t("admin.reports.markResolved") || "Mark Resolved"}
                                  </button>
                                  <button
                                    onClick={() => handleUpdateReportStatus(report.id, "dismissed")}
                                    disabled={updatingReportStatus === report.id}
                                    className="px-3 py-1.5 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
                                  >
                                    {t("admin.reports.dismiss") || "Dismiss"}
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center py-8" style={{ color: '#6B7280' }}>
                        {t("admin.studentActions.noReports") || "No reports found for this student"}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          ) : (
            <div 
              className="bg-white border rounded p-8 text-center"
              style={{ borderColor: '#E5E7EB', borderRadius: '6px' }}
            >
              <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="#D1D5DB" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <p style={{ color: '#6B7280' }}>
                {t("admin.studentActions.selectStudent") || "Select a student to view their action timeline"}
              </p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
