"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import Avatar from "@/components/Avatar";
import Link from "next/link";
import { useSession } from "@/contexts/AuthContext";
import { getTranslated } from "@/lib/translation-helpers";
import AvailabilityCalendar from "@/components/AvailabilityCalendar";
import SaveButton from "@/components/SaveButton";
import CorporateOBBadge from "@/components/CorporateOBBadge";

export default function PublicProfilePage() {
  const { t, language } = useLanguage();
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [corporateOBInfo, setCorporateOBInfo] = useState<any>(null);

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
              
              // Fetch average rating if user is OB/OG
              if (data.user?.role === "obog" && data.user?.id) {
                try {
                  const reviewResponse = await fetch(`/api/reviews?userId=${data.user.id}`);
                  if (reviewResponse.ok) {
                    const reviewContentType = reviewResponse.headers.get("content-type");
                    const isJson = reviewContentType?.includes("application/json");
                    if (isJson) {
                      const reviewText = await reviewResponse.text();
                      const reviewTrimmed = reviewText.trim();
                      if (reviewTrimmed.startsWith("{") || reviewTrimmed.startsWith("[")) {
                        const reviewData = JSON.parse(reviewText);
                        setAverageRating(reviewData.averageRating || null);
                      }
                    }
                  }
                } catch (err) {
                  console.error("Error fetching rating:", err);
                }
              }

              // Fetch Corporate OB info if user is Corporate OB
              if (data.user?.role === "corporate_ob" && data.user?.id) {
                try {
                  const corporateOBResponse = await fetch(`/api/corporate-ob/info?userId=${data.user.id}`);
                  if (corporateOBResponse.ok) {
                    const corporateOBContentType = corporateOBResponse.headers.get("content-type");
                    const isJson = corporateOBContentType?.includes("application/json");
                    if (isJson) {
                      const corporateOBText = await corporateOBResponse.text();
                      const corporateOBTrimmed = corporateOBText.trim();
                      if (corporateOBTrimmed.startsWith("{") || corporateOBTrimmed.startsWith("[")) {
                        const corporateOBData = JSON.parse(corporateOBText);
                        setCorporateOBInfo(corporateOBData);
                      }
                    }
                  }
                } catch (err) {
                  console.error("Error fetching Corporate OB info:", err);
                }
              }
              
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

  // Record browsing history (students only, for OB/OG and company profiles)
  useEffect(() => {
    if (user && session?.user?.role === "student" && id) {
      if (user.role === "obog" || user.role === "corporate_ob") {
        fetch("/api/browsing-history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ itemType: "obog", itemId: id }),
        }).catch(console.error);
      } else if (user.role === "company") {
        fetch("/api/browsing-history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ itemType: "company", itemId: id }),
        }).catch(console.error);
      }
    }
  }, [user, id, session?.user?.role]);

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
  const isCorporateOB = user.role === "corporate_ob";

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button 
        onClick={() => router.back()} 
        className="text-blue-600 hover:text-blue-800 mb-4 inline-block"
      >
        ← {t("button.back")}
      </button>
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
                className="w-24 h-24 object-contain rounded mr-8"
              />
            ) : (
              <Avatar 
                src={user.profilePhoto} 
                alt={user.nickname || user.name || "Profile"} 
                size="xl"
                fallbackText={user.nickname || user.name || user.companyName}
                className="mr-8"
              />
            )}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-3 py-1 rounded text-sm font-semibold ${
                  user.role === "student" ? "bg-blue-100 text-blue-800" :
                  user.role === "obog" ? "bg-green-100 text-green-800" :
                  user.role === "company" ? "bg-purple-100 text-purple-800" :
                  user.role === "corporate_ob" ? "bg-indigo-100 text-indigo-800" :
                  "bg-gray-100 text-gray-800"
                }`}>
                  {user.role === "student" ? t("myPage.student") :
                   user.role === "obog" ? t("label.obog") :
                   user.role === "company" ? t("myPage.company") :
                   user.role === "corporate_ob" ? t("role.corporateOb") : user.role}
                </span>
                {isCorporateOB && corporateOBInfo && (
                  <CorporateOBBadge
                    companyName={corporateOBInfo.company?.name}
                    companyLogo={corporateOBInfo.company?.logoUrl}
                    isVerified={corporateOBInfo.isVerified}
                    size="md"
                  />
                )}
                {isOBOG && user.type && (
                  <span className={`px-3 py-1 rounded text-sm font-semibold ${
                    user.type === "working-professional" 
                      ? "bg-blue-100 text-blue-800" 
                      : "bg-green-100 text-green-800"
                  }`}>
                    {user.type === "working-professional" ? t("obogDetail.workingProfessional") : t("obogDetail.jobOfferHolder")}
                  </span>
                )}
                {isOBOG && averageRating && averageRating > 0 && (
                  <div className="flex items-center gap-1 px-3 py-1 rounded text-sm font-semibold bg-yellow-50 border border-yellow-200">
                    <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-yellow-700 font-semibold">{averageRating.toFixed(1)}</span>
                    <span className="text-yellow-600 text-xs">({t("review.averageRating") || "rating"})</span>
                  </div>
                )}
                </div>
                {/* Save Button for OB/OG profiles */}
                {(isOBOG || isCorporateOB) && session?.user?.role === "student" && (
                  <SaveButton itemType="obog" itemId={user.id} />
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
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold" style={{ color: '#111827' }}>
                    {t("company.profile.title") || "Company Profile"}
                  </h2>
                  {session?.user?.role === "student" && (
                    <SaveButton itemType="company" itemId={user.id} />
                  )}
                </div>
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
                {(user.hourlyWage !== undefined && user.hourlyWage !== null) || (user.weeklyHours !== undefined && user.weeklyHours !== null) ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(user.hourlyWage !== undefined && user.hourlyWage !== null) && (
                      <div>
                        <h3 className="font-semibold mb-2" style={{ color: '#111827' }}>{t("companies.hourlyWage")}</h3>
                        <p className="text-gray-700">¥{Number(user.hourlyWage).toLocaleString()}/hr</p>
                      </div>
                    )}
                    {(user.weeklyHours !== undefined && user.weeklyHours !== null) && (
                      <div>
                        <h3 className="font-semibold mb-2" style={{ color: '#111827' }}>{t("companies.weeklyHours")}</h3>
                        <p className="text-gray-700">{user.weeklyHours} hrs/week</p>
                      </div>
                    )}
                  </div>
                ) : null}
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

