"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSession } from "next-auth/react";
import CompanyLogo from "@/components/CompanyLogo";

export default function RecruitingPage() {
  const { t } = useLanguage();
  const { data: session } = useSession();
  const isLoggedIn = !!session;
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    try {
      const response = await fetch("/api/internships?type=new-grad");
      if (!response.ok) {
        throw new Error("Failed to load listings");
      }
      const data = await response.json();
      setListings(data.internships || []);
    } catch (error) {
      console.error("Error loading listings:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#000000' }}>{t("recruiting.title")}</h1>
          <p className="text-gray-600" style={{ color: '#000000' }}>
            {t("recruiting.subtitle")}
          </p>
        </div>

        {/* Info Section */}
        <div className="card-gradient p-6 mb-8">
          <h2 className="text-xl font-semibold mb-3" style={{ color: '#000000' }}>{t("recruiting.about.title")}</h2>
          <p className="text-gray-700 mb-4">
            {t("recruiting.about.desc")}
          </p>
        </div>

        {loading ? (
          <div className="card-gradient p-8 text-center">
            <p className="text-gray-700 text-lg">Loading listings...</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="card-gradient p-8 text-center">
            <p className="text-gray-700 text-lg mb-4">{t("recruiting.empty.title")}</p>
            <p className="text-gray-600 mb-6">
              {t("recruiting.empty.desc")}
            </p>
            {!isLoggedIn && (
              <Link href="/signup/student" className="btn-primary inline-block">
                {t("recruiting.empty.signUp")}
              </Link>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing: any) => (
              <Link
                key={listing.id}
                href={`/recruiting/${listing.id}`}
                className="card-gradient p-6 hover:shadow-xl transition-all duration-300 block"
              >
                <div className="flex items-start mb-4">
                  <CompanyLogo
                    src={listing.companyLogo}
                    alt={listing.companyName}
                    size="md"
                    className="mr-4"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2" style={{ color: '#000000' }}>
                      {listing.titleKey ? t(listing.titleKey) : listing.title}
                    </h3>
                    <p className="text-sm text-gray-600" style={{ color: '#000000' }}>{listing.companyName}</p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm text-gray-700 line-clamp-2">
                    {listing.workDetailsKey ? t(listing.workDetailsKey) : listing.workDetails || listing.newGradDetails}
                  </p>
                </div>

                {((listing.skillsGainedKeys && listing.skillsGainedKeys.length > 0) || (listing.skillsGained && listing.skillsGained.length > 0)) && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2" style={{ color: '#000000' }}>
                      {(listing.skillsGainedKeys || listing.skillsGained).slice(0, 3).map((skillKeyOrSkill: string, idx: number) => (
                        <span key={idx} className="px-2 py-1 bg-gray-100 rounded text-xs">
                          {listing.skillsGainedKeys ? t(skillKeyOrSkill) : skillKeyOrSkill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="text-sm text-gray-600">
                  <p className="line-clamp-2">
                    {listing.whyThisCompanyKey ? t(listing.whyThisCompanyKey) : listing.whyThisCompany || listing.sellingPoints}
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

