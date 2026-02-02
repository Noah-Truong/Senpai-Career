"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSession } from "@/contexts/AuthContext";
import CompanyLogo from "@/components/CompanyLogo";
import { motion } from "framer-motion";
import { fadeIn, slideUp, staggerContainer, staggerItem, cardVariants, buttonVariants } from "@/lib/animations";
import Footer from "@/components/Footer";

export default function RecruitingPage() {
  const { t } = useLanguage();
  const { data: session } = useSession();
  const isLoggedIn = !!session;
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const loadListings = useCallback(async () => {
    try {
      const response = await fetch("/api/internships?type=new-grad");
      if (!response.ok) {
        throw new Error(t("recruiting.error.load") || "Failed to load listings");
      }
      const data = await response.json();
      setListings(data.internships || []);
    } catch (error) {
      console.error("Error loading listings:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadListings();
  }, [loadListings]);

  // Pre-compute translated descriptions for better performance
  const listingsWithDescriptions = useMemo(() => {
    return listings.map((listing) => ({
      ...listing,
      _title: listing.titleKey ? t(listing.titleKey) : listing.title,
      _workDetails: listing.workDetailsKey ? t(listing.workDetailsKey) : (listing.workDetails || listing.newGradDetails || ""),
      _skills: (listing.skillsGainedKeys || listing.skillsGained || [])
        .map((s: string) => listing.skillsGainedKeys ? t(s) : s),
      _whyCompany: listing.whyThisCompanyKey ? t(listing.whyThisCompanyKey) : (listing.whyThisCompany || listing.sellingPoints || ""),
    }));
  }, [listings, t]);

  // Filter listings based on search
  const filteredListings = useMemo(() => {
    if (!searchTerm) return listingsWithDescriptions;
    
    const search = searchTerm.toLowerCase();
    return listingsWithDescriptions.filter((listing) => {
      return (
        listing._title?.toLowerCase().includes(search) ||
        listing.companyName?.toLowerCase().includes(search) ||
        listing._workDetails?.toLowerCase().includes(search) ||
        listing._skills.join(" ").toLowerCase().includes(search) ||
        listing._whyCompany?.toLowerCase().includes(search)
      );
    });
  }, [listingsWithDescriptions, searchTerm]);

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#D7FFEF' }}>
      <motion.div 
        className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full"
        initial="initial"
        animate="animate"
        variants={fadeIn}
      >
        {/* Page Header */}
        <motion.div className="p-6 mb-8 border rounded"
          style={{ backgroundColor: 'white', borderColor: '#E5E7EB', borderRadius: '6px' }}
          variants={slideUp}>
          <h1 
            className="text-2xl md:text-3xl font-bold mb-2"
            style={{ color: '#111827' }}
          >
            {t("recruiting.title")}
          </h1>
          <p style={{ color: '#6B7280' }}>
            {t("recruiting.subtitle")}
          </p>
        </motion.div>

        

        {/* Search Bar */}
        <motion.div 
           className="mb-8 p-4 rounded"
           style={{ backgroundColor: 'rgb(255, 255, 255)', borderColor: '#E5E7EB', borderRadius: '6px' }}
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
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t("recruiting.searchPlaceholder") || "Search by title, company, skills..."}
              className="w-full pl-10 pr-4 py-2 bg-white border rounded focus:outline-none focus:ring-2"
              style={{ 
                borderColor: '#D1D5DB', 
                borderRadius: '6px',
                color: '#111827'
              }}
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
              {filteredListings.length} {t("recruiting.resultsFound") || "positions found"}
            </motion.p>
          )}
        </motion.div>

        {loading ? (
          <motion.div 
            className="p-8 text-center border rounded bg-white"
            style={{ borderColor: '#E5E7EB', borderRadius: '6px' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.25 }}
          >
            <p style={{ color: '#000000' }}>{t("common.loading") || "Loading listings..."}</p>
          </motion.div>
        ) : filteredListings.length === 0 ? (
          <motion.div 
            className="p-8 text-center border rounded bg-white"
            style={{ borderColor: '#E5E7EB', borderRadius: '6px' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <p className="text-lg mb-4" style={{ color: '#000000' }}>
              {searchTerm ? (t("recruiting.noResults") || "No positions found matching your search.") : t("recruiting.empty.title")}
            </p>
            <p className="mb-6" style={{ color: '#000000' }}>
              {searchTerm ? (t("recruiting.tryDifferent") || "Try a different search term.") : t("recruiting.empty.desc")}
            </p>
            {!isLoggedIn && !searchTerm && (
              <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                <Link href="/signup/student" className="btn-primary inline-block">
                  {t("recruiting.empty.signUp")}
                </Link>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {filteredListings.map((listing: any, index: number) => (
              <motion.div
                key={listing.id}
                variants={staggerItem}
                initial="initial"
                animate="animate"
                transition={{ delay: index * 0.05 }}
              >
                <Link
                  href={`/recruiting/${listing.id}`}
                  className="bg-white border rounded p-6 hover:shadow-md transition-all duration-200 block"
                  style={{ borderColor: '#E5E7EB', borderRadius: '6px' }}
                >
                <div className="flex items-start mb-4">
                  <CompanyLogo
                    src={listing.companyLogo}
                    alt={listing.companyName}
                    size="md"
                    className="mr-4"
                  />
                  <div className="flex-1">
                    <h3 
                      className="text-base font-semibold mb-1"
                      style={{ color: '#111827' }}
                    >
                      {listing._title}
                    </h3>
                    <p className="text-sm" style={{ color: '#6B7280' }}>{listing.companyName}</p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm line-clamp-2" style={{ color: '#6B7280' }}>
                    {listing._workDetails}
                  </p>
                </div>

                {listing._skills && listing._skills.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {listing._skills.slice(0, 3).map((skill: string, idx: number) => (
                        <span 
                          key={idx} 
                          className="px-2 py-1 rounded text-xs"
                          style={{ backgroundColor: '#D7FFEF', color: '#000000' }}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="text-sm" style={{ color: '#6B7280' }}>
                  <p className="line-clamp-2">
                    {listing._whyCompany}
                  </p>
                </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
      <Footer variant="full" />
    </div>
  );
}
