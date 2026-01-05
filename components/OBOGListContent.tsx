"use client";

import Link from "next/link";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslated } from "@/lib/translation-helpers";
import Avatar from "./Avatar";

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
  const { t } = useLanguage();
  const { translate } = useTranslated();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "working-professional" | "job-offer-holder">("all");

  // Filter users based on search and type
  const filteredUsers = obogUsers.filter((obog) => {
    const matchesSearch = searchTerm === "" || 
      (obog.nickname || obog.name).toLowerCase().includes(searchTerm.toLowerCase()) ||
      obog.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      obog.university?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      obog.nationality?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      obog.topics?.some(topic => topic.toLowerCase().includes(searchTerm.toLowerCase())) ||
      obog.languages?.some(lang => lang.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = typeFilter === "all" || obog.type === typeFilter;
    
    return matchesSearch && matchesType;
  });

  return (
    <>
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2 text-gray-600">{t("obogList.title")}</h2>
        <p className="text-gray-600">
          {t("obogList.subtitle")}
        </p>
      </div>

      {/* Search and Filter */}
      <div className="mb-8 card-gradient p-4">
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
                placeholder={t("obogList.searchPlaceholder") || "Search by name, company, university, topics..."}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                style={{ color: '#000000' }}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setTypeFilter("all")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                typeFilter === "all" 
                  ? "bg-pink-500 text-white" 
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {t("obogList.filter.all") || "All"}
            </button>
            <button
              onClick={() => setTypeFilter("working-professional")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                typeFilter === "working-professional" 
                  ? "bg-blue-500 text-white" 
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {t("obogList.filter.professional") || "Professionals"}
            </button>
            <button
              onClick={() => setTypeFilter("job-offer-holder")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                typeFilter === "job-offer-holder" 
                  ? "bg-green-500 text-white" 
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {t("obogList.filter.jobOffer") || "Job Offer Holders"}
            </button>
          </div>
        </div>
        {searchTerm && (
          <p className="mt-2 text-sm text-gray-500">
            {filteredUsers.length} {t("obogList.resultsFound") || "results found"}
          </p>
        )}
      </div>

      {filteredUsers.length === 0 ? (
        <div className="card-gradient p-8 text-center">
          <p className="text-gray-600 text-lg">{searchTerm ? (t("obogList.noResults") || "No OB/OG found matching your search.") : t("obogList.empty.title")}</p>
          <p className="text-gray-500 mt-2">{searchTerm ? (t("obogList.tryDifferent") || "Try a different search term or filter.") : t("obogList.empty.desc")}</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((obog) => (
            <Link 
              key={obog.id} 
              href={`/obog/${obog.id}`}
              className="card-gradient p-6 hover:shadow-xl transition-all duration-300 block"
            >
              <div className="flex items-start mb-4">
                <Avatar 
                  src={obog.profilePhoto} 
                  alt={obog.nickname || obog.name}
                  size="lg"
                  fallbackText={obog.nickname || obog.name}
                  className="mr-4"
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
              
              <div className="mb-4">
                <p className="text-sm text-gray-700 mb-3 line-clamp-2">{obog.oneLineMessage ? translate(obog.oneLineMessage) : ""}</p>
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
              
              <div className="text-sm text-gray-600 space-y-1">
                {obog.languages && obog.languages.length > 0 && (
                  <p className="truncate">{t("obogList.card.languages")} {obog.languages.slice(0, 2).join(", ")}{obog.languages.length > 2 ? "..." : ""}</p>
                )}
                {obog.nationality && (
                  <p>{t("obogList.card.nationality")} {obog.nationality}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}

