"use client";

import Link from "next/link";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import Avatar from "./Avatar";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";

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

interface StudentListContentProps {
  students: Student[];
}

export default function StudentListContent({ students }: StudentListContentProps) {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [universityFilter, setUniversityFilter] = useState<string>("all");
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [languageFilter, setLanguageFilter] = useState<string[]>([]);
  const [industryFilter, setIndustryFilter] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Get unique values for filters
  const universities = Array.from(new Set(students.map((s) => s.university).filter(Boolean))) as string[];
  universities.sort();

  const years = Array.from(new Set(students.map((s) => s.year).filter(Boolean))) as number[];
  years.sort();

  const allLanguages = Array.from(new Set(
    students.flatMap((s) => s.languages || [])
  )).sort();

  const allIndustries = Array.from(new Set(
    students.map((s) => s.desiredIndustry).filter(Boolean)
  )).sort() as string[];

  // Filter students based on all filters
  const filteredStudents = students.filter((student) => {
    const matchesSearch = searchTerm === "" ||
      (student.nickname || student.name).toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.university?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.nationality?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.skills?.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase())) ||
      student.interests?.some(interest => interest.toLowerCase().includes(searchTerm.toLowerCase())) ||
      student.languages?.some(lang => lang.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesUniversity = universityFilter === "all" || student.university === universityFilter;
    const matchesYear = yearFilter === "all" || student.year?.toString() === yearFilter;
    const matchesLanguage = languageFilter.length === 0 ||
      (student.languages && languageFilter.some(lang =>
        student.languages!.some(sLang => sLang.toLowerCase() === lang.toLowerCase())
      ));
    const matchesIndustry = industryFilter.length === 0 ||
      (student.desiredIndustry && industryFilter.some(ind =>
        student.desiredIndustry!.toLowerCase().includes(ind.toLowerCase())
      ));

    return matchesSearch && matchesUniversity && matchesYear && matchesLanguage && matchesIndustry;
  });

  const getYearLabel = (year: number | undefined) => {
    if (!year) return "";
    if (year === 1) return t("form.year1") || "1st Year";
    if (year === 2) return t("form.year2") || "2nd Year";
    if (year === 3) return t("form.year3") || "3rd Year";
    if (year === 4) return t("form.year4") || "4th Year";
    return t("form.graduate") || "Graduate";
  };

  return (
    <>
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <h2 className="text-3xl font-bold mb-2" style={{ color: '#111827' }}>
          {t("studentList.title") || "Student Directory"}
        </h2>
        <p style={{ color: '#6B7280' }}>
          {t("studentList.subtitle") || "Browse and connect with students looking for career guidance"}
        </p>
      </motion.div>

      {/* Search and Filter */}
      <motion.div
        className="mb-8 card-gradient p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.1 }}
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t("studentList.searchPlaceholder") || "Search by name, university, skills, interests..."}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ color: '#000000' }}
              />
            </div>
          </div>

          {universities.length > 0 && (
            <div className="flex items-center gap-2 flex-shrink min-w-0">
              <label className="text-xs sm:text-sm font-medium whitespace-nowrap sm:whitespace-normal" style={{ color: '#374151' }}>
                {t("studentList.filter.university") || "University"}
              </label>
              <select
                value={universityFilter}
                onChange={(e) => setUniversityFilter(e.target.value)}
                className="px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-w-0 max-w-[120px] sm:max-w-none"
                style={{ color: "#111827" }}
              >
                <option value="all">{t("studentList.filter.all") || "All"}</option>
                {universities.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          )}

          {years.length > 0 && (
            <div className="flex items-center gap-2 flex-shrink min-w-0">
              <label className="text-xs sm:text-sm font-medium whitespace-nowrap sm:whitespace-normal" style={{ color: '#374151' }}>
                {t("studentList.filter.year") || "Year"}
              </label>
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-w-0 max-w-[120px] sm:max-w-none"
                style={{ color: "#111827" }}
              >
                <option value="all">{t("studentList.filter.all") || "All"}</option>
                {years.map((y) => (
                  <option key={y} value={y.toString()}>{getYearLabel(y)}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Advanced Filters Toggle */}
        <div className="mt-4">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-sm font-medium"
            style={{ color: '#0F2A44' }}
          >
            <svg
              className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            {t("studentList.filter.advanced") || "Advanced Filters"}
            {(languageFilter.length > 0 || industryFilter.length > 0) && (
              <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800">
                {languageFilter.length + industryFilter.length}
              </span>
            )}
          </button>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <motion.div
            className="mt-4 pt-4 border-t"
            style={{ borderColor: '#E5E7EB' }}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Language Filter */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                  {t("studentList.filter.language") || "Languages"}
                </label>
                <div className="max-h-40 overflow-y-auto space-y-2 p-2 border rounded" style={{ borderColor: '#D1D5DB' }}>
                  {allLanguages.map((lang) => (
                    <label key={lang} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={languageFilter.includes(lang)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setLanguageFilter([...languageFilter, lang]);
                          } else {
                            setLanguageFilter(languageFilter.filter(l => l !== lang));
                          }
                        }}
                        className="w-4 h-4"
                      />
                      <span style={{ color: '#111827' }}>{lang}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Industry Filter */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                  {t("studentList.filter.industry") || "Desired Industry"}
                </label>
                <div className="max-h-40 overflow-y-auto space-y-2 p-2 border rounded" style={{ borderColor: '#D1D5DB' }}>
                  {allIndustries.slice(0, 20).map((industry) => (
                    <label key={industry} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={industryFilter.includes(industry)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setIndustryFilter([...industryFilter, industry]);
                          } else {
                            setIndustryFilter(industryFilter.filter(i => i !== industry));
                          }
                        }}
                        className="w-4 h-4"
                      />
                      <span className="truncate" style={{ color: '#111827' }}>{industry}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Clear Filters Button */}
            {(languageFilter.length > 0 || industryFilter.length > 0) && (
              <div className="mt-4">
                <button
                  onClick={() => {
                    setLanguageFilter([]);
                    setIndustryFilter([]);
                  }}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {t("studentList.filter.clear") || "Clear Filters"}
                </button>
              </div>
            )}
          </motion.div>
        )}

        {(searchTerm || languageFilter.length > 0 || industryFilter.length > 0 || universityFilter !== "all" || yearFilter !== "all") && (
          <motion.p
            className="mt-2 text-sm"
            style={{ color: '#6B7280' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            {filteredStudents.length} {t("studentList.resultsFound") || "results found"}
          </motion.p>
        )}
      </motion.div>

      {filteredStudents.length === 0 ? (
        <div className="card-gradient p-8 text-center">
          <p className="text-lg" style={{ color: '#6B7280' }}>
            {searchTerm ? (t("studentList.noResults") || "No students found matching your search.") : (t("studentList.empty") || "No students available.")}
          </p>
          <p className="mt-2" style={{ color: '#9CA3AF' }}>
            {searchTerm ? (t("studentList.tryDifferent") || "Try a different search term or filter.") : ""}
          </p>
        </div>
      ) : (
        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {filteredStudents.map((student, index) => (
            <Link
              key={student.id}
              href={`/user/${student.id}`}
              className="block"
            >
              <motion.div
                variants={staggerItem}
                initial="initial"
                animate="animate"
                transition={{ delay: index * 0.05 }}
                className="card-gradient p-6 hover:shadow-xl transition-all duration-300 cursor-pointer"
              >
                <div className="flex items-start mb-4">
                  <Avatar
                    src={student.profilePhoto}
                    alt={student.nickname || student.name}
                    size="lg"
                    fallbackText={student.nickname || student.name}
                    className="mr-4"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold truncate" style={{ color: '#111827' }}>
                      {student.nickname || student.name}
                    </h3>
                    <p className="text-sm truncate" style={{ color: '#6B7280' }}>{student.university}</p>
                    {student.year && (
                      <p className="text-sm" style={{ color: '#6B7280' }}>{getYearLabel(student.year)}</p>
                    )}
                  </div>
                </div>

                {/* Skills */}
                {student.skills && student.skills.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-medium mb-1" style={{ color: '#374151' }}>
                      {t("studentList.card.skills") || "Skills"}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {student.skills.slice(0, 3).map((skill, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-blue-50 rounded text-xs" style={{ color: '#1E40AF' }}>
                          {skill}
                        </span>
                      ))}
                      {student.skills.length > 3 && (
                        <span className="px-2 py-0.5 bg-gray-100 rounded text-xs" style={{ color: '#6B7280' }}>
                          +{student.skills.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Interests */}
                {student.interests && student.interests.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-medium mb-1" style={{ color: '#374151' }}>
                      {t("studentList.card.interests") || "Interests"}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {student.interests.slice(0, 3).map((interest, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-green-50 rounded text-xs" style={{ color: '#166534' }}>
                          {interest}
                        </span>
                      ))}
                      {student.interests.length > 3 && (
                        <span className="px-2 py-0.5 bg-gray-100 rounded text-xs" style={{ color: '#6B7280' }}>
                          +{student.interests.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Additional Info */}
                <div className="text-sm space-y-1" style={{ color: '#6B7280' }}>
                  {student.languages && student.languages.length > 0 && (
                    <p className="truncate">
                      <span className="font-medium">{t("studentList.card.languages") || "Languages:"}</span> {student.languages.slice(0, 2).join(", ")}{student.languages.length > 2 ? "..." : ""}
                    </p>
                  )}
                  {student.nationality && (
                    <p>
                      <span className="font-medium">{t("studentList.card.nationality") || "Nationality:"}</span> {student.nationality}
                    </p>
                  )}
                  {student.desiredIndustry && (
                    <p className="truncate">
                      <span className="font-medium">{t("studentList.card.desiredIndustry") || "Interest:"}</span> {student.desiredIndustry}
                    </p>
                  )}
                </div>
              </motion.div>
            </Link>
          ))}
        </motion.div>
      )}
    </>
  );
}
