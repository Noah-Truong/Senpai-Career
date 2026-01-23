"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import Avatar from "@/components/Avatar";
import Link from "next/link";
import { useSession } from "@/contexts/AuthContext";
import { getTranslated } from "@/lib/translation-helpers";
import AvailabilityCalendar from "@/components/AvailabilityCalendar";

export default function PublicProfilePage() {
  const { t, language } = useLanguage();
  const { id } = useParams();
  const { data: session } = useSession();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const currentUserId = (session?.user as any)?.id;
  const isOwnProfile = currentUserId === id;
  const [showCalendar, setShowCalendar] = useState(false);

  const loadUser = useCallback(async () => {
    if (!id) return;
    
    try {
      const response = await fetch(`/api/user/${id}`);
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
              setUser(data.user);
              setLoading(false);
            } else {
              console.warn("User API returned non-JSON response");
              setError("Failed to load user");
              setLoading(false);
            }
          } catch (jsonError) {
            console.error("Failed to parse user JSON:", jsonError);
            setError("Failed to load user");
            setLoading(false);
          }
        } else {
          console.warn("User API returned non-JSON content type");
          setError("Failed to load user");
          setLoading(false);
        }
      } else {
        // Handle error responses
        const contentType = response.headers.get("content-type");
        const isJson = contentType && contentType.includes("application/json");
        
        let errorMessage = "User not found";
        
        if (isJson) {
          try {
            const text = await response.text();
            const trimmedText = text.trim();
            
            if (trimmedText.startsWith("{") || trimmedText.startsWith("[")) {
              const errorData = JSON.parse(text);
              errorMessage = errorData.error || errorMessage;
            }
          } catch (jsonError) {
            // If parsing fails, use default error message
          }
        }
        
        setError(errorMessage);
        setLoading(false);
      }
    } catch (err: any) {
      console.error("Error loading user:", err);
      setError(err.message || "Failed to load user");
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      loadUser();
    }
  }, [id, loadUser]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-gray-600">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-white">
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Edit Link if own profile */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold" style={{ color: '#111827' }}>
            {isCompany ? (user.companyName || t("myPage.companyProfile")) : t("myPage.publicProfile")}
          </h1>
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
              backgroundColor: '#D7FFEF',
              borderLeftColor: '#0F2A44'
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
          <div className="flex gap-4 flex-wrap">
            <Link 
              href={`/messages/new?userId=${user.id}`} 
              className="btn-primary"
            >
              {t("button.sendMessage")}
            </Link>
            {isOBOG && (
              <button
                onClick={() => setShowCalendar(true)}
                className="btn-primary px-6 py-2 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {t("profile.availability.view") || "View Availability"}
              </button>
            )}
          </div>
        )}

        {/* Availability Calendar Modal for OB/OG profiles */}
        {isOBOG && user && (
          <AvailabilityCalendar
            obogId={user.id}
            obogName={user.nickname || user.name}
            isOpen={showCalendar}
            onClose={() => setShowCalendar(false)}
            isOwner={isOwnProfile && session?.user?.role === "obog"}
          />
        )}
      </div>
    </div>
  );
}

