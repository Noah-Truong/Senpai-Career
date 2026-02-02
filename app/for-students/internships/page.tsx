"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSession } from "@/contexts/AuthContext";
import CompanyLogo from "@/components/CompanyLogo";
import Pagination from "@/components/Pagination";
import { motion } from "framer-motion";
import { fadeIn, slideUp, staggerContainer, staggerItem, cardVariants, buttonVariants } from "@/lib/animations";
import Footer from "@/components/Footer";

const DEFAULT_ITEMS_PER_PAGE = 12;

export default function InternshipPage() {
  const { t } = useLanguage();
  const { data: session } = useSession();
  const isLoggedIn = !!session;
  const [internships, setInternships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_ITEMS_PER_PAGE);

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
  const filteredInternships = useMemo(() => {
    return internships.filter((internship) => {
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
  }, [internships, searchTerm, t]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredInternships.length / itemsPerPage));
  const paginatedInternships = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredInternships.slice(start, start + itemsPerPage);
  }, [filteredInternships, currentPage, itemsPerPage]);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#D7FFEF' }}>
      <motion.div 
        className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full"
        initial="initial"
        animate="animate"
        variants={fadeIn}
      >
        

        {/* Info Section */}
        <motion.div 
          className="p-6 mb-8 border rounded"
          style={{ backgroundColor: 'white', borderColor: '#E5E7EB', borderRadius: '6px' }}
          variants={slideUp}
        >
          <h2 
            className="text-lg font-semibold mb-3"
            style={{ color: '#000000' }}
          >
            {t("internship.about.title")}
          </h2>
          <p style={{ color: '#000000' }} className="mb-4">
            {t("internship.about.desc")}
          </p>
          <div 
            className="p-4 border-l-4"
            style={{ backgroundColor: '#FEF3C7', borderColor: '#F59E0B' }}
          >
            <p className="text-sm" style={{ color: '#374151' }}>
              <strong>{t("internship.about.hours")}</strong> {t("internship.about.hoursDesc")}
            </p>
          </div>
        </motion.div>

        {/* Search Bar */}
        <motion.div 
          className="mb-8 p-4 rounded"
          style={{ backgroundColor: '#D7FFEF', borderColor: '#E5E7EB', borderRadius: '6px' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: 0.1 }}
        >
          <div className="relative">
            <svg 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" 
              fill="none" 
              stroke="#9CA3AF" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <motion.input
              type="text"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              placeholder={t("internship.searchPlaceholder") || "Search by title, company, skills..."}
              className="w-full pl-10 pr-4 py-2 bg-white border rounded focus:outline-none focus:ring-2"
              style={{ 
                borderColor: '#D1D5DB', 
                borderRadius: '6px',
                color: '#111827'
              }}
              whileFocus={{ scale: 1.01 }}
              transition={{ duration: 0.2 }}
            />
          </div>
          {searchTerm && (
            <motion.p 
              className="mt-2 text-sm" 
              style={{ color: '#000000' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              {filteredInternships.length} {t("internship.resultsFound") || "internships found"}
            </motion.p>
          )}
        </motion.div>

        {loading ? (
          <div 
            className="p-8 text-center border rounded"
            style={{ backgroundColor: '#D7FFEF', borderColor: '#E5E7EB', borderRadius: '6px' }}
          >
            <p style={{ color: '#000000' }}>{t("common.loading") || "Loading internships..."}</p>
          </div>
        ) : filteredInternships.length === 0 ? (
          <div 
            className="p-8 text-center border rounded"
            style={{ backgroundColor: '#D7FFEF', borderColor: '#E5E7EB', borderRadius: '6px' }}
          >
            <p className="text-lg mb-4" style={{ color: '#000000' }}>
              {searchTerm ? (t("internship.noResults") || "No internships found matching your search.") : t("internship.empty.title")}
            </p>
            <p className="mb-6" style={{ color: '#000000' }}>
              {searchTerm ? (t("internship.tryDifferent") || "Try a different search term.") : t("internship.empty.desc")}
            </p>
            {!isLoggedIn && !searchTerm && (
              <Link href="/signup/student" className="btn-primary inline-block">
                {t("internship.empty.signUp")}
              </Link>
            )}
          </div>
        ) : (
          <>
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {paginatedInternships.map((internship: any, index: number) => (
              <motion.div
                key={internship.id}
                variants={staggerItem}
                initial="initial"
                animate="animate"
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  href={`/internships/${internship.id}`}
                  className="bg-white border rounded p-6 hover:shadow-md transition-all duration-200 block h-full flex flex-col"
                  style={{ borderColor: '#E5E7EB', borderRadius: '6px' }}
                >
                <div className="flex items-start mb-4 flex-shrink-0">
                  <CompanyLogo
                    src={internship.companyLogo}
                    alt={internship.companyName}
                    size="md"
                    className="mr-4"
                  />
                  <div className="flex-1">
                    <h3 
                      className="text-base font-semibold mb-1"
                      style={{ color: '#111827' }}
                    >
                      {internship.titleKey ? t(internship.titleKey) : internship.title}
                    </h3>
                    <p className="text-sm" style={{ color: '#6B7280' }}>{internship.companyName}</p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm font-medium mb-1" style={{ color: '#0F2A44' }}>
                    {internship.compensationType === "hourly" && `${t("compensation.hourly")}: ¥${internship.hourlyWage?.toLocaleString()}/hr`}
                    {internship.compensationType === "fixed" && `${t("compensation.fixed")}: ¥${internship.fixedSalary?.toLocaleString()}/year`}
                    {internship.compensationType === "other" && `${t("compensation.other")}: ${internship.otherCompensation}`}
                  </p>
                  <p className="text-sm line-clamp-2" style={{ color: '#6B7280' }}>
                    {internship.workDetailsKey ? t(internship.workDetailsKey) : internship.workDetails}
                  </p>
                </div>

                {((internship.skillsGainedKeys && internship.skillsGainedKeys.length > 0) || (internship.skillsGained && internship.skillsGained.length > 0)) && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {(internship.skillsGainedKeys || internship.skillsGained).slice(0, 3).map((skillKeyOrSkill: string, idx: number) => (
                        <span 
                          key={idx} 
                          className="px-2 py-1 rounded text-xs"
                          style={{ backgroundColor: '#D7FFEF', color: '#000000' }}
                        >
                          {internship.skillsGainedKeys ? t(skillKeyOrSkill) : skillKeyOrSkill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Spacer to push content to bottom */}
                <div className="flex-grow" />
                
                <div className="text-sm mt-auto" style={{ color: '#6B7280' }}>
                  <p className="line-clamp-2">
                    {internship.whyThisCompanyKey ? t(internship.whyThisCompanyKey) : internship.whyThisCompany}
                  </p>
                </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredInternships.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(n) => { setItemsPerPage(n); setCurrentPage(1); }}
            itemsPerPageOptions={[9, 12, 24, 48]}
            showItemsPerPage={true}
          />
          </>
        )}
      </motion.div>
      <Footer variant="full" />
    </div>
  );
}
