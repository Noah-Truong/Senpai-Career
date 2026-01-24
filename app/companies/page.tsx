"use client";

import { useSession } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslated } from "@/lib/translation-helpers";
import Avatar from "@/components/Avatar";
import { motion } from "framer-motion";
import { fadeIn, slideUp, staggerContainer, staggerItem, cardVariants, buttonVariants } from "@/lib/animations";

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
      if (response.ok) {
        // Check if response is JSON before parsing
        const contentType = response.headers.get("content-type");
        const isJson = contentType && contentType.includes("application/json");
        
        if (isJson) {
          try {
            const text = await response.text();
            const trimmedText = text.trim();
            
            if (trimmedText.startsWith("{") || trimmedText.startsWith("[")) {
              const data = JSON.parse(text);
              setCompanies(data.companies || []);
            } else {
              console.warn("Companies API returned non-JSON response");
              setError("Failed to load companies");
            }
          } catch (jsonError) {
            console.error("Failed to parse companies JSON:", jsonError);
            setError("Failed to load companies");
          }
        } else {
          console.warn("Companies API returned non-JSON content type");
          setError("Failed to load companies");
        }
      } else {
        // Handle error responses
        const contentType = response.headers.get("content-type");
        const isJson = contentType && contentType.includes("application/json");
        
        let errorMessage = "Failed to load companies";
        
        if (isJson) {
          try {
            const text = await response.text();
            const trimmedText = text.trim();
            
            if (trimmedText.startsWith("{") || trimmedText.startsWith("[")) {
              const data = JSON.parse(text);
              errorMessage = data.error || errorMessage;
            }
          } catch (jsonError) {
            // If parsing fails, use default error message
          }
        }
        
        setError(errorMessage);
      }
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p style={{ color: '#6B7280' }}>{t("common.loading")}</p>
        </div>
      </div>
    );
  }

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
      <motion.div 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        initial="initial"
        animate="animate"
        variants={fadeIn}
      >
        <motion.h1 
          className="text-2xl font-bold mb-6" 
          style={{ color: '#111827' }}
          variants={slideUp}
        >
          {t("companies.title") || "Companies"}
        </motion.h1>
        
        {/* Search Bar */}
        <motion.div 
          className="mb-8 p-4 border rounded"
          style={{ backgroundColor: '#D7FFEF', borderColor: '#E5E7EB', borderRadius: '6px' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.1 }}
        >
          <div className="relative">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" fill="none" stroke="#9CA3AF" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t("companies.searchPlaceholder") || "Search by company name, location, or keywords..."}
              className="w-full pl-10 pr-4 py-2 bg-white border rounded focus:outline-none focus:ring-2"
              style={{ borderColor: '#D1D5DB', borderRadius: '6px', color: '#111827' }}
            />
          </div>
          {searchTerm && (
            <motion.p 
              className="mt-2 text-sm" 
              style={{ color: '#6B7280' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              {filteredCompanies.length} {t("companies.resultsFound") || "companies found"}
            </motion.p>
          )}
        </motion.div>

        {error && (
          <motion.div 
            className="mb-4 px-4 py-3 rounded border"
            style={{ backgroundColor: '#FEE2E2', borderColor: '#FCA5A5', color: '#DC2626' }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            {error}
          </motion.div>
        )}

        {filteredCompanies.length === 0 ? (
          <motion.div 
            className="p-8 text-center border rounded"
            style={{ backgroundColor: '#D7FFEF', borderColor: '#E5E7EB', borderRadius: '6px' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <p className="text-lg mb-4" style={{ color: '#374151' }}>
              {searchTerm ? (t("companies.noResults") || "No companies found matching your search.") : (t("companies.empty") || "No companies found.")}
            </p>
            {searchTerm && <p style={{ color: '#6B7280' }}>{t("companies.tryDifferent") || "Try a different search term."}</p>}
          </motion.div>
        ) : (
          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {filteredCompanies.map((company, index) => (
              <motion.div
                key={company.id}
                className="p-6 bg-white border rounded hover:shadow-md transition-all duration-300"
                style={{ borderColor: '#E5E7EB', borderRadius: '6px' }}
                variants={cardVariants}
                whileHover="hover"
                initial="initial"
                animate="animate"
                transition={{ delay: index * 0.05 }}
              >
                <div className="flex items-start mb-4">
                  <Avatar
                    src={company.logo || company.profilePhoto}
                    alt={company.companyName}
                    size="lg"
                    fallbackText={company.companyName}
                    className="mr-6"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2" style={{ color: '#111827' }}>{company.companyName}</h3>
                    {company.oneLineMessage && (
                      <p className="text-sm mb-2" style={{ color: '#6B7280' }}>{translate(company.oneLineMessage)}</p>
                    )}
                  </div>
                </div>

                {company.overview && (
                  <div className="mb-4">
                    <p className="text-sm line-clamp-3" style={{ color: '#374151' }}>{translate(company.overview)}</p>
                  </div>
                )}

                <div className="space-y-2 mb-4">
                  {company.workLocation && (
                    <p className="text-sm" style={{ color: '#6B7280' }}>
                      <span className="font-semibold" style={{ color: '#374151' }}>{t("companies.workLocation") || "Location"}:</span> {company.workLocation}
                    </p>
                  )}
                  {company.hourlyWage && (
                    <p className="text-sm" style={{ color: '#6B7280' }}>
                      <span className="font-semibold" style={{ color: '#374151' }}>{t("companies.hourlyWage") || "Hourly Wage"}:</span> ¥{company.hourlyWage.toLocaleString()}
                    </p>
                  )}
                  {company.weeklyHours && (
                    <p className="text-sm" style={{ color: '#6B7280' }}>
                      <span className="font-semibold" style={{ color: '#374151' }}>{t("companies.weeklyHours") || "Weekly Hours"}:</span> {company.weeklyHours}
                    </p>
                  )}
                </div>

                {company.sellingPoints && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold mb-1" style={{ color: '#374151' }}>{t("companies.sellingPoints") || "Selling Points"}:</p>
                    <p className="text-sm line-clamp-2" style={{ color: '#6B7280' }}>{translate(company.sellingPoints)}</p>
                  </div>
                )}

                <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                  <Link
                    href={`/companies/${company.id}`}
                    className="btn-primary w-full text-center block"
                  >
                    {t("button.viewDetails") || "View Details"}
                  </Link>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
