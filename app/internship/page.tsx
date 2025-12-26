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

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#000000' }}>{t("internship.title")}</h1>
          <p className="text-gray-600">
            {t("internship.subtitle")}
          </p>
        </div>

        {/* Info Section */}
        <div className="card-gradient p-6 mb-8">
          <h2 className="text-xl font-semibold mb-3" style={{ color: '#000000' }}>{t("internship.about.title")}</h2>
          <p className="text-gray-700 mb-4">
            {t("internship.about.desc")}
          </p>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-4">
            <p className="text-sm text-gray-700" style={{ color: '#000000' }}>
              <strong>{t("internship.about.hours")}</strong> {t("internship.about.hoursDesc")}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="card-gradient p-8 text-center">
            <p className="text-gray-700 text-lg">Loading internships...</p>
          </div>
        ) : internships.length === 0 ? (
          <div className="card-gradient p-8 text-center">
            <p className="text-gray-700 text-lg mb-4" style={{ color: '#000000' }}>{t("internship.empty.title")}</p>
            <p className="text-gray-600 mb-6">
              {t("internship.empty.desc")}
            </p>
            {!isLoggedIn && (
              <Link href="/signup/student" className="btn-primary inline-block">
                {t("internship.empty.signUp")}
              </Link>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {internships.map((internship: any) => (
              <Link
                key={internship.id}
                href={`/internship/${internship.id}`}
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
                    <h3 className="text-lg font-semibold mb-2" style={{ color: '#000000' }}>
                      {internship.titleKey ? t(internship.titleKey) : internship.title}
                    </h3>
                    <p className="text-sm text-gray-600" style={{ color: '#000000' }}>{internship.companyName}</p>
                  </div>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-900 mb-1">
                    {t("label.hourlyWage")}: ¥{internship.hourlyWage?.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-700 line-clamp-2" style={{ color: '#000000' }}>
                    {internship.workDetailsKey ? t(internship.workDetailsKey) : internship.workDetails}
                  </p>
                </div>

                {((internship.skillsGainedKeys && internship.skillsGainedKeys.length > 0) || (internship.skillsGained && internship.skillsGained.length > 0)) && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2" style={{ color: '#000000' }}>
                      {(internship.skillsGainedKeys || internship.skillsGained).slice(0, 3).map((skillKeyOrSkill: string, idx: number) => (
                        <span key={idx} className="px-2 py-1 bg-gray-100 rounded text-xs">
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

