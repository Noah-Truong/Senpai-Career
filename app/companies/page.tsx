"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslated } from "@/lib/translation-helpers";
import Avatar from "@/components/Avatar";

interface Company {
  id: string;
  name: string;
  companyName: string;
  logo?: string;
  profilePhoto?: string;
  overview?: string;
  workLocation?: string;
  hourlyWage?: number;
  weeklyHours?: number;
  weeklyDays?: number;
  minRequiredHours?: number;
  internshipDetails?: string;
  newGradDetails?: string;
  idealCandidate?: string;
  sellingPoints?: string;
  oneLineMessage?: string;
}

export default function CompaniesPage() {
  const { t } = useLanguage();
  const { translate } = useTranslated();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      loadCompanies();
    }
  }, [status, router]);

  const loadCompanies = async () => {
    try {
      const response = await fetch("/api/companies");
      if (!response.ok) {
        throw new Error("Failed to load companies");
      }
      const data = await response.json();
      setCompanies(data.companies || []);
    } catch (err: any) {
      console.error("Error loading companies:", err);
      setError(err.message || "Failed to load companies");
    } finally {
      setLoading(false);
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

  // Filter companies based on search
  const filteredCompanies = companies.filter((company) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      company.companyName?.toLowerCase().includes(search) ||
      company.workLocation?.toLowerCase().includes(search) ||
      company.overview?.toLowerCase().includes(search) ||
      company.oneLineMessage?.toLowerCase().includes(search) ||
      company.sellingPoints?.toLowerCase().includes(search)
    );
  });

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-600">{t("companies.title") || "Companies"}</h1>
        
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
              placeholder={t("companies.searchPlaceholder") || "Search by company name, location, or keywords..."}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              style={{ color: '#000000' }}
            />
          </div>
          {searchTerm && (
            <p className="mt-2 text-sm text-gray-500">
              {filteredCompanies.length} {t("companies.resultsFound") || "companies found"}
            </p>
          )}
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {filteredCompanies.length === 0 ? (
          <div className="card-gradient p-8 text-center">
            <p className="text-gray-600 text-lg mb-4">{searchTerm ? (t("companies.noResults") || "No companies found matching your search.") : (t("companies.empty") || "No companies found.")}</p>
            {searchTerm && <p className="text-gray-500">{t("companies.tryDifferent") || "Try a different search term."}</p>}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCompanies.map((company) => (
              <div
                key={company.id}
                className="card-gradient p-6 hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-start mb-4">
                  <Avatar
                    src={company.logo || company.profilePhoto}
                    alt={company.companyName}
                    size="lg"
                    fallbackText={company.companyName}
                    className="mr-4"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2 text-gray-600">{company.companyName}</h3>
                    {company.oneLineMessage && (
                      <p className="text-sm text-gray-600 mb-2">{translate(company.oneLineMessage)}</p>
                    )}
                  </div>
                </div>

                {company.overview && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-700 line-clamp-3">{translate(company.overview)}</p>
                  </div>
                )}

                <div className="space-y-2 mb-4">
                  {company.workLocation && (
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">{t("companies.workLocation") || "Location"}:</span> {company.workLocation}
                    </p>
                  )}
                  {company.hourlyWage && (
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">{t("companies.hourlyWage") || "Hourly Wage"}:</span> ¥{company.hourlyWage.toLocaleString()}
                    </p>
                  )}
                  {company.weeklyHours && (
                    <p className="text-sm text-gray-600">
                      <span className="font-semibold">{t("companies.weeklyHours") || "Weekly Hours"}:</span> {company.weeklyHours}
                    </p>
                  )}
                </div>

                {company.sellingPoints && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-700 mb-1">{t("companies.sellingPoints") || "Selling Points"}:</p>
                    <p className="text-sm text-gray-600 line-clamp-2">{translate(company.sellingPoints)}</p>
                  </div>
                )}

                <Link
                  href={`/companies/${company.id}`}
                  className="btn-primary w-full text-center block"
                >
                  {t("button.viewDetails") || "View Details"}
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

