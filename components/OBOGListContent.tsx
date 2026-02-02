"use client";

import Link from "next/link";
import { useState, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { getTranslated } from "@/lib/translation-helpers";
import Avatar from "./Avatar";
import Pagination from "./Pagination";
import { motion } from "framer-motion";
import { fadeIn, slideUp, staggerContainer, staggerItem, cardVariants, buttonVariants } from "@/lib/animations";

interface OBOGUser {
  id: string;
  name: string;
  nickname?: string;
  type: "working-professional" | "job-offer-holder";
  university?: string;
  company?: string;
  oneLineMessage?: string;
  topics?: string[];
  languages?: string[];
  nationality?: string;
  profilePhoto?: string;
}

interface OBOGListContentProps {
  obogUsers: OBOGUser[];
}

export default function OBOGListContent({ obogUsers }: OBOGListContentProps) {
  const { t, language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "working-professional" | "job-offer-holder">("all");
  const [universityFilter, setUniversityFilter] = useState<string>("all");
  const [languageFilter, setLanguageFilter] = useState<string[]>([]);
  const [industryFilter, setIndustryFilter] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  const universities = Array.from(new Set(obogUsers.map((o) => o.university).filter(Boolean))) as string[];
  universities.sort();

  // Get unique languages from all OB/OG users
  const allLanguages = Array.from(new Set(
    obogUsers.flatMap((o) => o.languages || [])
  )).sort();

  // Get unique companies (as industry proxy)
  const allCompanies = Array.from(new Set(
    obogUsers.map((o) => o.company).filter(Boolean)
  )).sort() as string[];

  // Filter users based on all filters
  const filteredUsers = obogUsers.filter((obog) => {
    const matchesSearch = searchTerm === "" || 
      (obog.nickname || obog.name).toLowerCase().includes(searchTerm.toLowerCase()) ||
      obog.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      obog.university?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      obog.nationality?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      obog.topics?.some(topic => topic.toLowerCase().includes(searchTerm.toLowerCase())) ||
      obog.languages?.some(lang => lang.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = typeFilter === "all" || obog.type === typeFilter;
    const matchesUniversity = universityFilter === "all" || obog.university === universityFilter;
    const matchesLanguage = languageFilter.length === 0 || 
      (obog.languages && languageFilter.some(lang => 
        obog.languages!.some(obogLang => obogLang.toLowerCase() === lang.toLowerCase())
      ));
    const matchesIndustry = industryFilter.length === 0 || 
      (obog.company && industryFilter.some(ind => 
        obog.company!.toLowerCase().includes(ind.toLowerCase())
      ));
    
    return matchesSearch && matchesType && matchesUniversity && matchesLanguage && matchesIndustry;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredUsers, currentPage, itemsPerPage]);

  // Reset to page 1 when filters change
  const handleFilterChange = () => {
    setCurrentPage(1);
  };

  return (
    <>
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        <h2 className="text-3xl font-bold mb-2 text-gray-600">{t("obogList.title")}</h2>
        <p className="text-gray-600">
          {t("obogList.subtitle")}
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
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                placeholder={t("obogList.searchPlaceholder") || "Search by name, company, university, topics..."}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                style={{ color: '#000000' }}
              />
            </div>
          </div>
          <motion.div 
            className="flex flex-wrap gap-2"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <motion.button
              onClick={() => { setTypeFilter("all"); setCurrentPage(1); }}
              className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base ${
                typeFilter === "all" 
                  ? "bg-pink-500 text-white" 
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              {t("obogList.filter.all") || "All"}
            </motion.button>
            <motion.button
              onClick={() => { setTypeFilter("working-professional"); setCurrentPage(1); }}
              className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base ${
                typeFilter === "working-professional"
                  ? "text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              style={{
                backgroundColor: typeFilter === "working-professional" ? '#0F2A44' : undefined
              }}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              {t("obogList.filter.professional") || "Professionals"}
            </motion.button>
            <motion.button
              onClick={() => { setTypeFilter("job-offer-holder"); setCurrentPage(1); }}
              className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base ${
                typeFilter === "job-offer-holder" 
                  ? "bg-green-500 text-white" 
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              {t("obogList.filter.jobOffer") || "Job Offer Holders"}
            </motion.button>
          </motion.div>
          {universities.length > 0 && (
            <div className="flex items-center gap-2 flex-shrink min-w-0">
              <label className="text-xs sm:text-sm font-medium text-gray-600 whitespace-nowrap sm:whitespace-normal">
                {t("obogList.filter.university") || "University"}
              </label>
              <select
                value={universityFilter}
                onChange={(e) => { setUniversityFilter(e.target.value); setCurrentPage(1); }}
                className="px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm min-w-0 max-w-[150px] sm:max-w-none"
                style={{ color: "#111827" }}
              >
                <option value="all">{t("obogList.filter.all") || "All"}</option>
                {universities.map((u) => (
                  <option key={u} value={u}>{u}</option>
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
            {t("obogList.filter.advanced") || "Advanced Filters"}
            {(languageFilter.length > 0 || industryFilter.length > 0) && (
              <span className="px-2 py-0.5 text-xs rounded-full bg-indigo-100 text-indigo-800">
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
                  {t("obogList.filter.language") || "Languages"}
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
                          setCurrentPage(1);
                        }}
                        className="w-4 h-4"
                      />
                      <span style={{ color: '#111827' }}>{lang}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Industry/Company Filter */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                  {t("obogList.filter.industry") || "Industry / Company"}
                </label>
                <div className="max-h-40 overflow-y-auto space-y-2 p-2 border rounded" style={{ borderColor: '#D1D5DB' }}>
                  {allCompanies.slice(0, 20).map((company) => (
                    <label key={company} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={industryFilter.includes(company)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setIndustryFilter([...industryFilter, company]);
                          } else {
                            setIndustryFilter(industryFilter.filter(c => c !== company));
                          }
                          setCurrentPage(1);
                        }}
                        className="w-4 h-4"
                      />
                      <span className="truncate" style={{ color: '#111827' }}>{company}</span>
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
                  className="text-sm text-indigo-600 hover:underline"
                >
                  {t("obogList.filter.clear") || "Clear Filters"}
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* Active Filters Indicator */}
        {(searchTerm || typeFilter !== "all" || universityFilter !== "all" || languageFilter.length > 0 || industryFilter.length > 0) && (
          <motion.div 
            className="mt-3 flex flex-wrap items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            <span className="text-sm font-medium" style={{ color: '#6B7280' }}>
              {filteredUsers.length} {t("obogList.resultsFound") || "results found"}
            </span>
            <span className="text-gray-300">|</span>
            <span className="text-xs" style={{ color: '#9CA3AF' }}>{t("filter.activeFilters") || "Active filters:"}</span>
            
            {searchTerm && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                &quot;{searchTerm}&quot;
                <button onClick={() => { setSearchTerm(""); setCurrentPage(1); }} className="hover:text-blue-600" aria-label="Remove filter">×</button>
              </span>
            )}
            {typeFilter !== "all" && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                {typeFilter === "working-professional" ? t("obogList.card.workingProfessional") : t("obogList.card.jobOfferHolder")}
                <button onClick={() => { setTypeFilter("all"); setCurrentPage(1); }} className="hover:text-purple-600" aria-label="Remove filter">×</button>
              </span>
            )}
            {universityFilter !== "all" && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs">
                {universityFilter}
                <button onClick={() => { setUniversityFilter("all"); setCurrentPage(1); }} className="hover:text-indigo-600" aria-label="Remove filter">×</button>
              </span>
            )}
            {languageFilter.map((lang) => (
              <span key={lang} className="inline-flex items-center gap-1 px-2 py-1 bg-teal-100 text-teal-800 rounded-full text-xs">
                {lang}
                <button 
                  onClick={() => { setLanguageFilter(languageFilter.filter(l => l !== lang)); setCurrentPage(1); }} 
                  className="hover:text-teal-600" 
                  aria-label="Remove filter"
                >×</button>
              </span>
            ))}
            {industryFilter.map((ind) => (
              <span key={ind} className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-800 rounded-full text-xs">
                {ind}
                <button 
                  onClick={() => { setIndustryFilter(industryFilter.filter(i => i !== ind)); setCurrentPage(1); }} 
                  className="hover:text-amber-600" 
                  aria-label="Remove filter"
                >×</button>
              </span>
            ))}
            
            {/* Clear All Filters */}
            <button
              onClick={() => {
                setSearchTerm("");
                setTypeFilter("all");
                setUniversityFilter("all");
                setLanguageFilter([]);
                setIndustryFilter([]);
                setCurrentPage(1);
              }}
              className="text-xs font-medium hover:underline"
              style={{ color: '#DC2626' }}
            >
              {t("filter.clearAll") || "Clear all"}
            </button>
          </motion.div>
        )}
      </motion.div>

      {filteredUsers.length === 0 ? (
        <div className="card-gradient p-8 text-center">
          <p className="text-gray-600 text-lg">{searchTerm ? (t("obogList.noResults") || "No OB/OG found matching your search.") : t("obogList.empty.title")}</p>
          <p className="text-gray-500 mt-2">{searchTerm ? (t("obogList.tryDifferent") || "Try a different search term or filter.") : t("obogList.empty.desc")}</p>
        </div>
      ) : (
        <>
        <motion.div 
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {paginatedUsers.map((obog, index) => (
            <motion.div
              key={obog.id}
              variants={staggerItem}
              initial="initial"
              animate="animate"
              transition={{ delay: index * 0.05 }}
            >
              <Link 
                href={`/obog/${obog.id}`}
                className="card-gradient p-6 hover:shadow-xl transition-all duration-300 block h-full flex flex-col"
              >
              <div className="flex items-start mb-4">
                <Avatar 
                  src={obog.profilePhoto} 
                  alt={obog.nickname || obog.name}
                  size="lg"
                  fallbackText={obog.nickname || obog.name}
                  className="mr-6"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-semibold whitespace-nowrap ${
                      obog.type === "working-professional" 
                        ? "bg-blue-100 text-blue-800" 
                        : "bg-green-100 text-green-800"
                    }`}>
                      {obog.type === "working-professional" ? t("obogList.card.workingProfessional") : t("obogList.card.jobOfferHolder")}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold truncate text-gray-600">{obog.nickname || obog.name}</h3>
                  <p className="text-sm text-gray-600 truncate">{obog.university}</p>
                  <p className="text-sm text-gray-600 truncate">{obog.company}</p>
                </div>
              </div>
              
              <div className="mb-4 flex-shrink-0">
                <p className="text-sm text-gray-700 mb-3 line-clamp-2">{obog.oneLineMessage ? getTranslated(obog.oneLineMessage, language) : ""}</p>
                {obog.topics && obog.topics.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {obog.topics.slice(0, 3).map((topic, idx) => (
                      <span key={idx} className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">
                        {topic}
                      </span>
                    ))}
                    {obog.topics.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">
                        +{obog.topics.length - 3} {t("obogList.card.more")}
                      </span>
                    )}
                  </div>
                )}
              </div>
              
              {/* Spacer to push footer content to bottom */}
              <div className="flex-grow" />
              
              <div className="text-sm text-gray-600 space-y-1 mt-auto">
                {obog.languages && obog.languages.length > 0 && (
                  <p className="truncate">{t("obogList.card.languages")} {obog.languages.slice(0, 2).join(", ")}{obog.languages.length > 2 ? "..." : ""}</p>
                )}
                {obog.nationality && (
                  <p>{t("obogList.card.nationality")} {obog.nationality}</p>
                )}
              </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
        
        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredUsers.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={(newItemsPerPage) => {
            setItemsPerPage(newItemsPerPage);
            setCurrentPage(1);
          }}
          itemsPerPageOptions={[12, 24, 48, 96]}
        />
        </>
      )}
    </>
  );
}

