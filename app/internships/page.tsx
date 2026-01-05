"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSession } from "next-auth/react";
import CompanyLogo from "@/components/CompanyLogo";

export default function InternshipPage() {
  const { t } = useLanguage();
  const { data: session } = useSession();
  const isLoggedIn = !!session;
  const [internships, setInternships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadInternships();
  }, []);

  const loadInternships = async () => {
    try {
      const response = await fetch("/api/internships?type=internship");
      if (!response.ok) {
        throw new Error("Failed to load internships");
      }
      const data = await response.json();
      setInternships(data.internships || []);
    } catch (error) {
      console.error("Error loading internships:", error);
    } finally {
      setLoading(false);
    }
  };

  // Filter internships based on search
  const filteredInternships = internships.filter((internship) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    const title = internship.titleKey ? t(internship.titleKey) : internship.title;
    const workDetails = internship.workDetailsKey ? t(internship.workDetailsKey) : internship.workDetails;
    const skills = (internship.skillsGainedKeys || internship.skillsGained || [])
      .map((s: string) => internship.skillsGainedKeys ? t(s) : s)
      .join(" ");
    
    return (
      title?.toLowerCase().includes(search) ||
      internship.companyName?.toLowerCase().includes(search) ||
      workDetails?.toLowerCase().includes(search) ||
      skills.toLowerCase().includes(search)
    );
  });

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-gray-600">{t("internship.title")}</h1>
          <p className="text-gray-600">
            {t("internship.subtitle")}
          </p>
        </div>

        {/* Info Section */}
        <div className="card-gradient p-6 mb-8">
          <h2 className="text-xl font-semibold mb-3 text-gray-600">{t("internship.about.title")}</h2>
          <p className="text-gray-600 mb-4">
            {t("internship.about.desc")}
          </p>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-4">
            <p className="text-sm text-gray-600">
              <strong>{t("internship.about.hours")}</strong> {t("internship.about.hoursDesc")}
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-8 card-gradient p-4">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t("internship.searchPlaceholder") || "Search by title, company, skills..."}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              style={{ color: '#000000' }}
            />
          </div>
          {searchTerm && (
            <p className="mt-2 text-sm text-gray-500">
              {filteredInternships.length} {t("internship.resultsFound") || "internships found"}
            </p>
          )}
        </div>

        {loading ? (
          <div className="card-gradient p-8 text-center">
            <p className="text-gray-600 text-lg">{t("common.loading") || "Loading internships..."}</p>
          </div>
        ) : filteredInternships.length === 0 ? (
          <div className="card-gradient p-8 text-center">
            <p className="text-gray-600 text-lg mb-4">{searchTerm ? (t("internship.noResults") || "No internships found matching your search.") : t("internship.empty.title")}</p>
            <p className="text-gray-500 mb-6">
              {searchTerm ? (t("internship.tryDifferent") || "Try a different search term.") : t("internship.empty.desc")}
            </p>
            {!isLoggedIn && !searchTerm && (
              <Link href="/signup/student" className="btn-primary inline-block">
                {t("internship.empty.signUp")}
              </Link>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInternships.map((internship: any) => (
              <Link
                key={internship.id}
                href={`/internships/${internship.id}`}
                className="card-gradient p-6 hover:shadow-xl transition-all duration-300 block"
              >
                <div className="flex items-start mb-4">
                  <CompanyLogo
                    src={internship.companyLogo}
                    alt={internship.companyName}
                    size="md"
                    className="mr-4"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2 text-gray-600">
                      {internship.titleKey ? t(internship.titleKey) : internship.title}
                    </h3>
                    <p className="text-sm text-gray-600">{internship.companyName}</p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-600 mb-1">
                    {t("label.hourlyWage")}: ¥{internship.hourlyWage?.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {internship.workDetailsKey ? t(internship.workDetailsKey) : internship.workDetails}
                  </p>
                </div>

                {((internship.skillsGainedKeys && internship.skillsGainedKeys.length > 0) || (internship.skillsGained && internship.skillsGained.length > 0)) && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {(internship.skillsGainedKeys || internship.skillsGained).slice(0, 3).map((skillKeyOrSkill: string, idx: number) => (
                        <span key={idx} className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">
                          {internship.skillsGainedKeys ? t(skillKeyOrSkill) : skillKeyOrSkill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="text-sm text-gray-600">
                  <p className="line-clamp-2">
                    {internship.whyThisCompanyKey ? t(internship.whyThisCompanyKey) : internship.whyThisCompany}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

