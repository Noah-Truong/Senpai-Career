"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import { useLanguage } from "@/contexts/LanguageContext";
import Avatar from "@/components/Avatar";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { getTranslated } from "@/lib/translation-helpers";

export default function PublicProfilePage() {
  const { t, language } = useLanguage();
  const { id } = useParams();
  const { data: session } = useSession();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const currentUserId = (session?.user as any)?.id;
  const isOwnProfile = currentUserId === id;

  useEffect(() => {
    if (id) {
      loadUser();
    }
  }, [id]);

  const loadUser = async () => {
    try {
      const response = await fetch(`/api/user/${id}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "User not found" }));
        throw new Error(errorData.error || "User not found");
      }
      const data = await response.json();
      setUser(data.user);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || "Failed to load user");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-gray-600">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="card-gradient p-8 text-center">
            <p className="text-gray-700 text-lg mb-4">{error || t("profile.notFound")}</p>
            <Link href="/" className="btn-primary">
              {t("nav.home")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isStudent = user.role === "student";
  const isOBOG = user.role === "obog";
  const isCompany = user.role === "company";

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Edit Link if own profile */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold" style={{ color: '#111827' }}>
            {isCompany ? (user.companyName || t("myPage.companyProfile")) : t("myPage.publicProfile")}
          </h1>
          {isOwnProfile && (
            <Link href="/profile" className="btn-primary">
              {t("profile.edit")}
            </Link>
          )}
        </div>

        {/* Profile Card */}
        <div className="card-gradient p-8 mb-6">
          {/* Profile Header */}
          <div className="flex items-start mb-6">
            {isCompany && user.logo ? (
              <img 
                src={user.logo} 
                alt={user.companyName || "Company"} 
                className="w-24 h-24 object-contain rounded mr-6"
              />
            ) : (
              <Avatar 
                src={user.profilePhoto} 
                alt={user.nickname || user.name || "Profile"} 
                size="xl"
                fallbackText={user.nickname || user.name || user.companyName}
                className="mr-6"
              />
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className={`px-3 py-1 rounded text-sm font-semibold ${
                  user.role === "student" ? "bg-blue-100 text-blue-800" :
                  user.role === "obog" ? "bg-green-100 text-green-800" :
                  user.role === "company" ? "bg-purple-100 text-purple-800" :
                  "bg-gray-100 text-gray-800"
                }`}>
                  {user.role === "student" ? t("myPage.student") :
                   user.role === "obog" ? "OB/OG" :
                   user.role === "company" ? t("myPage.company") : user.role}
                </span>
                {isOBOG && user.type && (
                  <span className={`px-3 py-1 rounded text-sm font-semibold ${
                    user.type === "working-professional" 
                      ? "bg-blue-100 text-blue-800" 
                      : "bg-green-100 text-green-800"
                  }`}>
                    {user.type === "working-professional" ? t("obogDetail.workingProfessional") : t("obogDetail.jobOfferHolder")}
                  </span>
                )}
              </div>
              <h2 className="text-3xl font-bold mb-2" style={{ color: '#111827' }}>
                {isCompany ? user.companyName : (user.nickname || user.name)}
              </h2>
              {!isCompany && user.nickname && user.nickname !== user.name && (
                <p className="text-lg text-gray-600 mb-2">{user.name}</p>
              )}
              {isStudent && user.university && (
                <p className="text-lg text-gray-600">{user.university}</p>
              )}
              {isOBOG && (
                <>
                  {user.university && <p className="text-lg text-gray-600">{user.university}</p>}
                  {user.company && <p className="text-lg text-gray-600 font-medium">{user.company}</p>}
                </>
              )}
            </div>
          </div>

          {/* One Line Message (for OB/OG and Company) */}
          {(isOBOG || isCompany) && user.oneLineMessage && (
            <div className="p-4 rounded-lg border-l-4 mb-6" style={{
              backgroundColor: '#F5F7FA',
              borderLeftColor: '#2563EB'
            }}>
              <p className="text-lg italic" style={{ color: '#374151' }}>
                "{getTranslated(user.oneLineMessage, language)}"
              </p>
            </div>
          )}

          {/* Profile Details */}
          <div className="space-y-6">
            {/* Student Profile */}
            {isStudent && (
              <>
                {user.year && (
                  <div>
                    <h3 className="font-semibold mb-2" style={{ color: '#111827' }}>{t("form.year")}</h3>
                    <p className="text-gray-700">
                      {String(user.year) === "grad" ? t("form.graduate") : 
                       typeof user.year === "number" ? t(`form.year${user.year}`) :
                       t(`form.${user.year}`)}
                    </p>
                  </div>
                )}
                {user.nationality && (
                  <div>
                    <h3 className="font-semibold mb-2" style={{ color: '#111827' }}>{t("form.nationality")}</h3>
                    <p className="text-gray-700">{user.nationality}</p>
                  </div>
                )}
                {user.jlptLevel && (
                  <div>
                    <h3 className="font-semibold mb-2" style={{ color: '#111827' }}>{t("form.jlptLevel")}</h3>
                    <span className="px-3 py-1 bg-gray-100 rounded text-gray-700 font-medium">
                      {user.jlptLevel}
                    </span>
                  </div>
                )}
                {user.languages && Array.isArray(user.languages) && user.languages.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2" style={{ color: '#111827' }}>{t("form.languages")}</h3>
                    <div className="flex flex-wrap gap-2">
                      {user.languages.map((lang: string, idx: number) => (
                        <span key={idx} className="px-3 py-1 bg-gray-100 rounded text-gray-700">
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {user.interests && Array.isArray(user.interests) && user.interests.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2" style={{ color: '#111827' }}>{t("form.interests")}</h3>
                    <div className="flex flex-wrap gap-2">
                      {user.interests.map((interest: string, idx: number) => (
                        <span key={idx} className="px-3 py-1 bg-gray-100 rounded text-gray-700">
                          {interest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {user.skills && Array.isArray(user.skills) && user.skills.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2" style={{ color: '#111827' }}>{t("form.skills")}</h3>
                    <div className="flex flex-wrap gap-2">
                      {user.skills.map((skill: string, idx: number) => (
                        <span key={idx} className="px-3 py-1 bg-gray-100 rounded text-gray-700">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {user.desiredIndustry && (
                  <div>
                    <h3 className="font-semibold mb-2" style={{ color: '#111827' }}>{t("form.desiredIndustry")}</h3>
                    <span className="px-3 py-1 bg-gray-100 rounded text-gray-700">
                      {user.desiredIndustry}
                    </span>
                  </div>
                )}
              </>
            )}

            {/* OB/OG Profile */}
            {isOBOG && (
              <>
                {user.nationality && (
                  <div>
                    <h3 className="font-semibold mb-2" style={{ color: '#111827' }}>{t("form.nationality")}</h3>
                    <p className="text-gray-700">{user.nationality}</p>
                  </div>
                )}
                {user.languages && Array.isArray(user.languages) && user.languages.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2" style={{ color: '#111827' }}>{t("form.languages")}</h3>
                    <div className="flex flex-wrap gap-2">
                      {user.languages.map((lang: string, idx: number) => (
                        <span key={idx} className="px-3 py-1 bg-gray-100 rounded text-gray-700">
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {user.topics && Array.isArray(user.topics) && user.topics.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2" style={{ color: '#111827' }}>{t("form.topics")}</h3>
                    <div className="flex flex-wrap gap-2">
                      {user.topics.map((topic: string, idx: number) => (
                        <span key={idx} className="px-3 py-1 rounded text-white font-medium" style={{ backgroundColor: '#0F2A44' }}>
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {user.studentEraSummary && (
                  <div>
                    <h3 className="font-semibold mb-2" style={{ color: '#111827' }}>{t("obogDetail.studentEraSummary")}</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {getTranslated(user.studentEraSummary, language)}
                    </p>
                  </div>
                )}
              </>
            )}

            {/* Company Profile */}
            {isCompany && (
              <>
                {user.overview && (
                  <div>
                    <h3 className="font-semibold mb-2" style={{ color: '#111827' }}>{t("company.profile.overview")}</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {getTranslated(user.overview, language)}
                    </p>
                  </div>
                )}
                {user.workLocation && (
                  <div>
                    <h3 className="font-semibold mb-2" style={{ color: '#111827' }}>{t("companies.workLocation")}</h3>
                    <p className="text-gray-700">{user.workLocation}</p>
                  </div>
                )}
                {(user.hourlyWage || user.weeklyHours) && (
                  <div className="grid grid-cols-2 gap-4">
                    {user.hourlyWage && (
                      <div>
                        <h3 className="font-semibold mb-2" style={{ color: '#111827' }}>{t("companies.hourlyWage")}</h3>
                        <p className="text-gray-700">¥{user.hourlyWage.toLocaleString()}/hr</p>
                      </div>
                    )}
                    {user.weeklyHours && (
                      <div>
                        <h3 className="font-semibold mb-2" style={{ color: '#111827' }}>{t("companies.weeklyHours")}</h3>
                        <p className="text-gray-700">{user.weeklyHours} hrs/week</p>
                      </div>
                    )}
                  </div>
                )}
                {user.sellingPoints && (
                  <div>
                    <h3 className="font-semibold mb-2" style={{ color: '#111827' }}>{t("companies.sellingPoints")}</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {getTranslated(user.sellingPoints, language)}
                    </p>
                  </div>
                )}
                {user.idealCandidate && (
                  <div>
                    <h3 className="font-semibold mb-2" style={{ color: '#111827' }}>{t("company.profile.idealCandidate")}</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {getTranslated(user.idealCandidate, language)}
                    </p>
                  </div>
                )}
                {user.internshipDetails && (
                  <div>
                    <h3 className="font-semibold mb-2" style={{ color: '#111827' }}>{t("company.profile.internshipDetails")}</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {getTranslated(user.internshipDetails, language)}
                    </p>
                  </div>
                )}
                {user.newGradDetails && (
                  <div>
                    <h3 className="font-semibold mb-2" style={{ color: '#111827' }}>{t("company.profile.newGradDetails")}</h3>
                    <p className="text-gray-700 whitespace-pre-wrap">
                      {getTranslated(user.newGradDetails, language)}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Member Since */}
          {user.createdAt && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                {t("profile.memberSince")}: {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {!isOwnProfile && session && (
          <div className="flex gap-4">
            <Link 
              href={`/messages/new?userId=${user.id}`} 
              className="btn-primary"
            >
              {t("button.sendMessage")}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

