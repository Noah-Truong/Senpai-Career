"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import StudentListContent from "@/components/StudentListContent";

interface Student {
  id: string;
  name: string;
  nickname?: string;
  university?: string;
  year?: number;
  nationality?: string;
  jlptLevel?: string;
  languages?: string[];
  interests?: string[];
  skills?: string[];
  desiredIndustry?: string;
  profilePhoto?: string;
}

export default function StudentListPage() {
  const { t } = useLanguage();
  const { data: session, status } = useSession();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStudents = async () => {
      if (status === "loading") return;
      
      if (!session || !session.user) {
        setError("Please log in to view students");
        setLoading(false);
        return;
      }

      // Check if user is corporate_ob or admin
      if (session.user.role !== "corporate_ob" && session.user.role !== "admin") {
        setError("Access denied. Only Corporate OB users can view the student list.");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/students");
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch students");
        }

        const data = await response.json();
        setStudents(data.students || []);
      } catch (err: any) {
        console.error("Error fetching students:", err);
        setError(err.message || "Failed to load students");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [session, status]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="h-24 bg-gray-200 rounded mb-8"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-64 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="card-gradient p-8 text-center">
            <svg
              className="mx-auto h-12 w-12 text-red-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <p className="text-lg text-gray-700 mb-4">{error}</p>
            {!session && (
              <a
                href="/login"
                className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {t("nav.login") || "Log In"}
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <StudentListContent students={students} />
      </div>
    </div>
  );
}
