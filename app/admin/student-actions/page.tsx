"use client";

import { useSession } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { useLanguage } from "@/contexts/LanguageContext";

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
      loadStudents();
    }
  }, [status, session, router]);

  const loadStudents = async () => {
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

            actions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            const lastOBContact = actions.find(a => a.type === "contact" && a.targetType === "obog");

            return {
              id: student.id,
              name: student.name,
              email: student.email,
              university: student.university,
              actions,
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
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (student.university && student.university.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getActionIcon = (type: string) => {
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
                  <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>
                    {student.actions.length} {t("admin.studentActions.actions") || "actions"}
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

              <div className="p-4">
                <h3 className="font-semibold mb-4" style={{ color: '#111827' }}>
                  {t("admin.studentActions.timeline") || "Action Timeline"}
                </h3>
                
                {selectedStudent.actions.length > 0 ? (
                  <div className="space-y-3">
                    {selectedStudent.actions.map((action) => (
                      <div 
                        key={action.id}
                        className="flex items-start gap-4 p-4 rounded"
                        style={{ backgroundColor: '#D7FFEF' }}
                      >
                        <div className="flex-shrink-0 mt-1">
                          {getActionIcon(action.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium" style={{ color: '#111827' }}>
                              {action.type.charAt(0).toUpperCase() + action.type.slice(1)}
                            </p>
                            <p className="text-xs" style={{ color: '#9CA3AF' }}>
                              {formatDate(action.timestamp)}
                            </p>
                          </div>
                          <p className="text-sm mt-1" style={{ color: '#374151' }}>
                            {action.details}
                          </p>
                          {action.targetName && (
                            <p className="text-xs mt-1" style={{ color: '#6B7280' }}>
                              {action.targetType === "obog" ? "OB/OG" : "Company"}: {action.targetName}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-8" style={{ color: '#6B7280' }}>
                    {t("admin.studentActions.noActions") || "No actions recorded for this student"}
                  </p>
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
