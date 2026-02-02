"use client";

import { useSession } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Avatar from "@/components/Avatar";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";

interface Student {
  id: string;
  name: string;
  nickname?: string;
  profilePhoto?: string;
  university?: string;
  year?: number;
  languages?: string[];
  jlptLevel?: string;
  interests?: string[];
  skills?: string[];
  pastInternships?: string[];
  desiredIndustry?: string;
  desiredWorkLocation?: string;
  weeklyAvailableHours?: number;
  isBanned?: boolean;
}

export default function CompanyStudentsPage() {
  const { t } = useLanguage();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    languages: "",
    jlptLevel: "",
    skills: "",
    workLocation: "",
    weeklyHours: "",
    experience: "",
  });

  const loadStudents = useCallback(async () => {
    try {
      const response = await fetch("/api/users?role=student");
      if (response.ok) {
        const contentType = response.headers.get("content-type");
        const isJson = contentType && contentType.includes("application/json");

        if (isJson) {
          try {
            const text = await response.text();
            const trimmedText = text.trim();

            if (trimmedText.startsWith("{") || trimmedText.startsWith("[")) {
              const data = JSON.parse(text);
              const studentsList = (data.users || []).filter((s: Student) => !s.isBanned) as Student[];
              setAllStudents(studentsList);
            } else {
              console.warn("Users API returned non-JSON response");
            }
          } catch (jsonError) {
            console.error("Failed to parse users JSON:", jsonError);
          }
        } else {
          console.warn("Users API returned non-JSON content type");
        }
      }
    } catch (error) {
      console.error("Error loading students:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Use stable references for user data
  const userRole = session?.user?.role;
  const userId = session?.user?.id;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated" && userRole !== "company") {
      router.push("/dashboard");
      return;
    }

    if (status === "authenticated") {
      loadStudents();
    }
  }, [status, userRole, router, loadStudents]);

  const handleFilterChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({ languages: "", jlptLevel: "", skills: "", workLocation: "", weeklyHours: "", experience: "" });
  }, []);

  const filteredStudents = useMemo(() => {
    let result = [...allStudents];

    if (filters.languages.trim()) {
      const langTerms = filters.languages.toLowerCase().split(",").map((s) => s.trim());
      result = result.filter((student) => {
        if (!student.languages || student.languages.length === 0) return false;
        const studentLangs = student.languages.map((l) => l.toLowerCase());
        return langTerms.some((term) => studentLangs.some((lang) => lang.includes(term)));
      });
    }

    if (filters.jlptLevel) {
      result = result.filter((student) => student.jlptLevel === filters.jlptLevel);
    }

    if (filters.skills.trim()) {
      const skillTerms = filters.skills.toLowerCase().split(",").map((s) => s.trim());
      result = result.filter((student) => {
        if (!student.skills || student.skills.length === 0) return false;
        const studentSkills = student.skills.map((s) => s.toLowerCase());
        return skillTerms.some((term) => studentSkills.some((skill) => skill.includes(term)));
      });
    }

    if (filters.workLocation.trim()) {
      const locationTerm = filters.workLocation.toLowerCase().trim();
      result = result.filter((student) => {
        const location = student.desiredWorkLocation?.toLowerCase() || "";
        return location.includes(locationTerm);
      });
    }

    if (filters.weeklyHours.trim()) {
      const minHours = parseInt(filters.weeklyHours, 10);
      if (!isNaN(minHours)) {
        result = result.filter((student) => (student.weeklyAvailableHours || 0) >= minHours);
      }
    }

    if (filters.experience.trim()) {
      const expTerm = filters.experience.toLowerCase().trim();
      result = result.filter((student) => {
        if (!student.pastInternships || student.pastInternships.length === 0) return false;
        return student.pastInternships.some((exp) => exp.toLowerCase().includes(expTerm));
      });
    }

    return result;
  }, [allStudents, filters]);

  if (status === "loading" || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <p className="text-base sm:text-lg" style={{ color: '#6B7280' }}>{t("common.loading") || "Loading..."}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <motion.div 
          className="mb-6 sm:mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <h2 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: '#111827' }}>
            {t("company.students.title")}
          </h2>
          <p style={{ color: '#6B7280' }}>
            {t("company.students.subtitle")}
          </p>
        </motion.div>

        {/* Filters Section */}
        <motion.div 
          className="card-gradient p-4 sm:p-6 mb-6 sm:mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.1 }}
        >
          <h2 className="text-lg sm:text-xl font-semibold mb-4" style={{ color: '#000000' }}>{t("company.students.filters")}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="languages" className="block text-sm font-medium text-gray-700 mb-1.5">{t("company.students.languages")}</label>
              <input
                id="languages"
                name="languages"
                type="text"
                value={filters.languages}
                onChange={handleFilterChange}
                placeholder={t("company.students.languagesPlaceholder")}
                className="w-full min-h-[44px] px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base"
                style={{ color: '#000000' }}
              />
            </div>
            <div>
              <label htmlFor="jlptLevel" className="block text-sm font-medium text-gray-700 mb-1.5">{t("company.students.jlptLevel")}</label>
              <select
                id="jlptLevel"
                name="jlptLevel"
                value={filters.jlptLevel}
                onChange={handleFilterChange}
                className="w-full min-h-[44px] px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base"
                style={{ color: '#000000' }}
              >
                <option value="">{t("company.students.jlptAll")}</option>
                <option value="N1">N1</option>
                <option value="N2">N2</option>
                <option value="N3">N3</option>
                <option value="N4">N4</option>
                <option value="N5">N5</option>
              </select>
            </div>
            <div>
              <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-1.5">{t("company.students.skills")}</label>
              <input
                id="skills"
                name="skills"
                type="text"
                value={filters.skills}
                onChange={handleFilterChange}
                placeholder={t("company.students.skillsPlaceholder")}
                className="w-full min-h-[44px] px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base"
                style={{ color: '#000000' }}
              />
            </div>
            <div>
              <label htmlFor="workLocation" className="block text-sm font-medium text-gray-700 mb-1.5">{t("company.students.workLocation")}</label>
              <input
                id="workLocation"
                name="workLocation"
                type="text"
                value={filters.workLocation}
                onChange={handleFilterChange}
                placeholder={t("company.students.workLocationPlaceholder")}
                className="w-full min-h-[44px] px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base"
                style={{ color: '#000000' }}
              />
            </div>
            <div>
              <label htmlFor="weeklyHours" className="block text-sm font-medium text-gray-700 mb-1.5">{t("company.students.weeklyHours")}</label>
              <input
                id="weeklyHours"
                name="weeklyHours"
                type="number"
                value={filters.weeklyHours}
                onChange={handleFilterChange}
                placeholder="20"
                min="0"
                className="w-full min-h-[44px] px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base"
                style={{ color: '#000000' }}
              />
            </div>
            <div>
              <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-1.5">{t("company.students.experience")}</label>
              <input
                id="experience"
                name="experience"
                type="text"
                value={filters.experience}
                onChange={handleFilterChange}
                placeholder={t("company.students.experiencePlaceholder")}
                className="w-full min-h-[44px] px-3 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base"
                style={{ color: '#000000' }}
              />
            </div>
          </div>
          {(filters.languages || filters.jlptLevel || filters.skills || filters.workLocation || filters.weeklyHours || filters.experience) && (
            <div className="mt-4">
              <button
                onClick={handleClearFilters}
                className="min-h-[44px] px-4 py-2.5 text-sm link-gradient rounded-md active:opacity-80"
              >
                {t("button.clearFilters") || "Clear All Filters"}
              </button>
            </div>
          )}
        </motion.div>

        {/* Work Hour Rule Note */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 sm:p-4 mb-6 sm:mb-8">
          <p className="text-sm text-gray-700">
            <strong>{t("company.profile.hoursNote")}</strong>
          </p>
        </div>

        {loading ? (
          <div className="card-gradient p-6 sm:p-8 text-center">
            <p className="text-gray-700 text-base sm:text-lg">{t("common.loading")}</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="card-gradient p-6 sm:p-8 text-center">
            <p className="text-gray-700 text-base sm:text-lg">
              {allStudents.length === 0 
                ? t("company.students.empty.noStudents")
                : t("company.students.empty.noMatches")}
            </p>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">
              {allStudents.length === 0 
                ? t("company.students.empty.checkBack")
                : t("company.students.empty.adjustFilters")}
            </p>
          </div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {filteredStudents.map((student, index) => (
              <motion.div
                key={student.id}
                variants={staggerItem}
                initial="initial"
                animate="animate"
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  href={`/user/${student.id}`}
                  className="card-gradient p-4 sm:p-6 hover:shadow-xl transition-all duration-300 block h-full flex flex-col"
                >
                  <div className="flex items-start mb-4">
                    <Avatar
                      src={student.profilePhoto}
                      alt={student.nickname || student.name}
                      size="lg"
                      fallbackText={student.nickname || student.name}
                      className="mr-4 sm:mr-6 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-semibold truncate" style={{ color: '#111827' }}>
                        {student.nickname || student.name}
                      </h3>
                      <p className="text-sm truncate" style={{ color: '#6B7280' }}>{student.university}</p>
                      {student.year && (
                        <p className="text-sm" style={{ color: '#6B7280' }}>
                          {student.year === 1 ? t("form.year1") : 
                           student.year === 2 ? t("form.year2") : 
                           student.year === 3 ? t("form.year3") : 
                           student.year === 4 ? t("form.year4") : t("form.graduate")}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Skills */}
                  {student.skills && student.skills.length > 0 && (
                    <div className="mb-3">
                      <div className="flex flex-wrap gap-2">
                        {student.skills.slice(0, 3).map((skill: string, idx: number) => (
                          <span key={idx} className="px-2 py-1 bg-gray-100 rounded text-xs" style={{ color: '#374151' }}>
                            {skill}
                          </span>
                        ))}
                        {student.skills.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 rounded text-xs" style={{ color: '#6B7280' }}>
                            +{student.skills.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Interests */}
                  {student.interests && student.interests.length > 0 && (
                    <div className="mb-3">
                      <div className="flex flex-wrap gap-2">
                        {student.interests.slice(0, 3).map((interest: string, idx: number) => (
                          <span key={idx} className="px-2 py-1 bg-green-50 rounded text-xs" style={{ color: '#166534' }}>
                            {interest}
                          </span>
                        ))}
                        {student.interests.length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 rounded text-xs" style={{ color: '#6B7280' }}>
                            +{student.interests.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Spacer to push footer content to bottom */}
                  <div className="flex-grow" />
                  
                  {/* Additional Info */}
                  <div className="text-sm space-y-1 mt-auto" style={{ color: '#6B7280' }}>
                    {student.languages && student.languages.length > 0 && (
                      <p className="truncate">
                        <span className="font-medium">{t("studentList.card.languages") || "Languages:"}</span> {student.languages.slice(0, 2).join(", ")}{student.languages.length > 2 ? "..." : ""}
                      </p>
                    )}
                    {student.jlptLevel && (
                      <p>
                        <span className="font-medium">JLPT:</span> {student.jlptLevel}
                      </p>
                    )}
                    {student.desiredIndustry && (
                      <p className="truncate">
                        <span className="font-medium">{t("studentList.card.desiredIndustry") || "Interest:"}</span> {student.desiredIndustry}
                      </p>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
  );
}

