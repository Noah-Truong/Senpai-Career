"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

interface FilterPanelProps {
  // Search
  searchTerm: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;

  // Type filter (optional - for OB/OG list)
  typeFilter?: "all" | "working-professional" | "job-offer-holder";
  onTypeFilterChange?: (value: "all" | "working-professional" | "job-offer-holder") => void;
  showTypeFilter?: boolean;

  // University filter
  universities?: string[];
  universityFilter?: string;
  onUniversityFilterChange?: (value: string) => void;

  // Language filter
  languages?: string[];
  languageFilter?: string[];
  onLanguageFilterChange?: (values: string[]) => void;

  // Industry/Company filter
  industries?: string[];
  industryFilter?: string[];
  onIndustryFilterChange?: (values: string[]) => void;

  // Results count
  resultsCount?: number;
  showResultsCount?: boolean;

  // Labels (for customization)
  advancedFiltersLabel?: string;
  languageLabel?: string;
  industryLabel?: string;
  clearFiltersLabel?: string;
  allLabel?: string;
  resultsFoundLabel?: string;
}

export default function FilterPanel({
  searchTerm,
  onSearchChange,
  searchPlaceholder,
  typeFilter = "all",
  onTypeFilterChange,
  showTypeFilter = false,
  universities = [],
  universityFilter = "all",
  onUniversityFilterChange,
  languages = [],
  languageFilter = [],
  onLanguageFilterChange,
  industries = [],
  industryFilter = [],
  onIndustryFilterChange,
  resultsCount,
  showResultsCount = true,
  advancedFiltersLabel,
  languageLabel,
  industryLabel,
  clearFiltersLabel,
  allLabel,
  resultsFoundLabel,
}: FilterPanelProps) {
  const { t } = useLanguage();
  const [showFilters, setShowFilters] = useState(false);

  const hasActiveFilters = languageFilter.length > 0 || industryFilter.length > 0;
  const hasAnyActiveFilter = searchTerm || hasActiveFilters || universityFilter !== "all" || typeFilter !== "all";

  return (
    <motion.div 
      className="mb-8 card-gradient p-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: 0.1 }}
    >
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1">
          <div className="relative">
            <svg 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
              />
            </svg>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder || t("obogList.searchPlaceholder") || "Search..."}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              style={{ color: '#000000' }}
            />
          </div>
        </div>

        {/* Type Filter Buttons (for OB/OG) */}
        {showTypeFilter && onTypeFilterChange && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onTypeFilterChange("all")}
              className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base ${
                typeFilter === "all" 
                  ? "bg-pink-500 text-white" 
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {allLabel || t("obogList.filter.all") || "All"}
            </button>
            <button
              onClick={() => onTypeFilterChange("working-professional")}
              className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base ${
                typeFilter === "working-professional"
                  ? "text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              style={{
                backgroundColor: typeFilter === "working-professional" ? '#0F2A44' : undefined
              }}
            >
              {t("obogList.filter.professional") || "Professionals"}
            </button>
            <button
              onClick={() => onTypeFilterChange("job-offer-holder")}
              className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base ${
                typeFilter === "job-offer-holder" 
                  ? "bg-green-500 text-white" 
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {t("obogList.filter.jobOffer") || "Job Offer Holders"}
            </button>
          </div>
        )}

        {/* University Filter */}
        {universities.length > 0 && onUniversityFilterChange && (
          <div className="flex items-center gap-2 flex-shrink min-w-0">
            <label className="text-xs sm:text-sm font-medium text-gray-600 whitespace-nowrap sm:whitespace-normal">
              {t("obogList.filter.university") || "University"}
            </label>
            <select
              value={universityFilter}
              onChange={(e) => onUniversityFilterChange(e.target.value)}
              className="px-2 sm:px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm min-w-0 max-w-[150px] sm:max-w-none"
              style={{ color: "#111827" }}
            >
              <option value="all">{allLabel || t("obogList.filter.all") || "All"}</option>
              {universities.map((u) => (
                <option key={u} value={u}>{u}</option>
              ))}
            </select>
          </div>
        )}
      </div>
      
      {/* Advanced Filters Toggle */}
      {(languages.length > 0 || industries.length > 0) && (
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
            {advancedFiltersLabel || t("obogList.filter.advanced") || "Advanced Filters"}
            {hasActiveFilters && (
              <span className="px-2 py-0.5 text-xs rounded-full bg-indigo-100 text-indigo-800">
                {languageFilter.length + industryFilter.length}
              </span>
            )}
          </button>
        </div>
      )}

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
            {languages.length > 0 && onLanguageFilterChange && (
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                  {languageLabel || t("obogList.filter.language") || "Languages"}
                </label>
                <div className="max-h-40 overflow-y-auto space-y-2 p-2 border rounded" style={{ borderColor: '#D1D5DB' }}>
                  {languages.map((lang) => (
                    <label key={lang} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={languageFilter.includes(lang)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            onLanguageFilterChange([...languageFilter, lang]);
                          } else {
                            onLanguageFilterChange(languageFilter.filter(l => l !== lang));
                          }
                        }}
                        className="w-4 h-4"
                      />
                      <span style={{ color: '#111827' }}>{lang}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Industry/Company Filter */}
            {industries.length > 0 && onIndustryFilterChange && (
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                  {industryLabel || t("obogList.filter.industry") || "Industry / Company"}
                </label>
                <div className="max-h-40 overflow-y-auto space-y-2 p-2 border rounded" style={{ borderColor: '#D1D5DB' }}>
                  {industries.slice(0, 20).map((industry) => (
                    <label key={industry} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={industryFilter.includes(industry)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            onIndustryFilterChange([...industryFilter, industry]);
                          } else {
                            onIndustryFilterChange(industryFilter.filter(i => i !== industry));
                          }
                        }}
                        className="w-4 h-4"
                      />
                      <span className="truncate" style={{ color: '#111827' }}>{industry}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <div className="mt-4">
              <button
                onClick={() => {
                  onLanguageFilterChange?.([]);
                  onIndustryFilterChange?.([]);
                }}
                className="text-sm text-indigo-600 hover:underline"
              >
                {clearFiltersLabel || t("obogList.filter.clear") || "Clear Filters"}
              </button>
            </div>
          )}
        </motion.div>
      )}

      {/* Results Count */}
      {showResultsCount && hasAnyActiveFilter && resultsCount !== undefined && (
        <motion.p 
          className="mt-2 text-sm text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {resultsCount} {resultsFoundLabel || t("obogList.resultsFound") || "results found"}
        </motion.p>
      )}
    </motion.div>
  );
}
