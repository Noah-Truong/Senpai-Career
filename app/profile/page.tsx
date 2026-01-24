"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "@/contexts/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { getTranslated } from "@/lib/translation-helpers";
import Avatar from "@/components/Avatar";
import MultiSelectDropdown from "@/components/MultiSelectDropdown";
import { NATIONALITY_OPTIONS, INDUSTRY_OPTIONS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import AvailabilityCalendar from "@/components/AvailabilityCalendar";
import UserSettings from "@/components/UserSettings";

// Options for multi-select dropdowns (same as signup pages)
const languageOptions = ["Japanese", "English", "Chinese", "Korean", "Spanish", "French", "German", "Portuguese"];
const interestOptions = ["Technology", "Finance", "Consulting", "Marketing", "Engineering", "Design", "Healthcare", "Education"];
const skillOptions = ["Programming", "Data Analysis", "Project Management", "Design", "Marketing", "Sales", "Research", "Writing"];
const topicOptions = ["Career Change", "Job Search Strategy", "Interview Preparation", "Resume/CV Writing", "Industry Insights", "Networking", "Salary Negotiation", "Work-Life Balance"];

export default function ProfilePage() {
  const { t, language } = useLanguage();
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    // Use window.location for a hard redirect to ensure clean state
    window.location.href = "/login";
  };
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [errorShown, setErrorShown] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [isEditing, setIsEditing] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showAvailabilityCalendar, setShowAvailabilityCalendar] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "settings">("profile");

  // Check if we should auto-open availability calendar from query param
  useEffect(() => {
    const openParam = searchParams?.get("open");
    if (openParam === "availability" && user && user.role === "obog") {
      setShowAvailabilityCalendar(true);
      // Remove query param from URL
      router.replace("/profile", { scroll: false });
    }
  }, [searchParams, user, router]);

  const loadProfile = useCallback(async () => {
    try {
      const response = await fetch("/api/profile");
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
              const processedUser = {
                ...data.user,
                desiredIndustry: data.user.role === 'student' && data.user.desiredIndustry
                  ? (typeof data.user.desiredIndustry === 'string'
                      ? data.user.desiredIndustry.split(', ').filter(Boolean)
                      : Array.isArray(data.user.desiredIndustry)
                        ? data.user.desiredIndustry
                        : [])
                  : [],
                // Store raw oneLineMessage, we'll translate it separately
                rawOneLineMessage: data.user.oneLineMessage,
                oneLineMessage: getTranslated(data.user.oneLineMessage, language)
              };
              setUser(processedUser);
              setFormData(processedUser);
              setLoading(false);
              setError(""); // Clear any previous errors
              setErrorShown(false); // Reset error shown flag on success
            } else {
              console.warn("Profile API returned non-JSON response");
              setError("Failed to load profile");
              setLoading(false);
            }
          } catch (jsonError) {
            console.error("Failed to parse profile JSON:", jsonError);
            setError("Failed to load profile");
            setLoading(false);
          }
        } else {
          console.warn("Profile API returned non-JSON content type");
          setError("Failed to load profile");
          setLoading(false);
        }
      } else {
        // Handle error responses
        const contentType = response.headers.get("content-type");
        const isJson = contentType && contentType.includes("application/json");
        
        let errorMessage = "Failed to load profile";
        
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
        
        // Only show error if we haven't shown it before (prevent repeated popups)
        if (!errorShown || errorMessage !== error) {
          setError(errorMessage);
          setErrorShown(true);
        }
        setLoading(false);
      }
    } catch (err: any) {
      console.error("Profile load error:", err);
      const errMessage = err.message || "Failed to load profile";
      // Only show error if we haven't shown it before
      if (!errorShown || errMessage !== error) {
        setError(errMessage);
        setErrorShown(true);
      }
      setLoading(false);
    }
  }, []); // Remove language dependency - we'll handle translation separately

  // Update translation when language changes without reloading from API
  useEffect(() => {
    if (user?.rawOneLineMessage) {
      setUser((prev: any) => prev ? {
        ...prev,
        oneLineMessage: getTranslated(prev.rawOneLineMessage, language)
      } : null);
      setFormData((prev: any) => prev ? {
        ...prev,
        oneLineMessage: getTranslated(prev.rawOneLineMessage || prev.oneLineMessage, language)
      } : {});
    }
  }, [language, user?.rawOneLineMessage]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      loadProfile();
    }
  }, [status, router, loadProfile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Handle array fields (languages, topics, interests, skills)
    if (name === "languages" || name === "topics" || name === "interests" || name === "skills") {
      setFormData({ ...formData, [name]: value.split(",").map((item: string) => item.trim()) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: "profilePhoto" | "logo") => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setError("Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.");
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError("File size too large. Maximum size is 5MB.");
      return;
    }

    const setUploading = fieldName === "profilePhoto" ? setUploadingPhoto : setUploadingLogo;
    setUploading(true);
    setError("");

    try {
      const uploadData = new FormData();
      uploadData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: uploadData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Failed to upload file" }));
        throw new Error(errorData.error || "Failed to upload file");
      }

      const data = await response.json();
      setFormData((prevFormData: any) => ({ ...prevFormData, [fieldName]: data.url }));
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err: any) {
      setError(err.message || "Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setSaving(true);

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          ...(formData.role === 'student' && {
            desiredIndustry: Array.isArray(formData.desiredIndustry)
              ? formData.desiredIndustry.join(", ")
              : formData.desiredIndustry
          })
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      setUser(data.user);
      setFormData(data.user);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setIsEditing(false);
        setSaving(false); // Stop loading animation after view is restored
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
      setSaving(false); // Stop loading animation on error
    }
  };

  const handleDeleteAccount = async () => {
    setError("");
    setDeleting(true);

    try {
      const response = await fetch("/api/profile/delete", {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete account");
      }

      // Sign out from Supabase Auth and redirect to login
      await supabase.auth.signOut();
      
      // Use window.location for a hard redirect to ensure clean state
      window.location.href = "/login";
    } catch (err: any) {
      setError(err.message || "Failed to delete account");
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <p>{t("common.loading")}</p>
      </div>
    );
  }

  if (!user && !loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card-gradient p-8 text-center">
          <p className="text-gray-700 text-lg mb-4">{t("profile.notFound")}</p>
          {error && (
            <p className="text-red-600 text-sm mt-2">{error}</p>
          )}
          <p className="text-gray-600 text-sm mt-4 mb-6">
            {t("profile.notFoundHint") || "Please try logging out and logging back in, or contact support if the issue persists."}
          </p>
          <button
            onClick={handleSignOut}
            className="btn-primary"
          >
            {t("nav.signOut") || "Sign Out"}
          </button>
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
        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b" style={{ borderColor: '#E5E7EB' }}>
          <button
            onClick={() => {
              setActiveTab("profile");
              setIsEditing(false);
            }}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === "profile"
                ? "border-b-2 text-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
            style={{
              borderBottomColor: activeTab === "profile" ? '#2563EB' : 'transparent',
            }}
          >
            {t("profile.tab.profile") || "Profile"}
          </button>
          <button
            onClick={() => {
              setActiveTab("settings");
              setIsEditing(false);
            }}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === "settings"
                ? "border-b-2 text-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
            style={{
              borderBottomColor: activeTab === "settings" ? '#2563EB' : 'transparent',
            }}
          >
            {t("profile.tab.settings") || "Settings"}
          </button>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold" style={{ color: '#000000' }}>
            {activeTab === "profile" ? t("profile.title") : t("profile.settings.title") || "Settings"}
          </h1>
          {activeTab === "profile" && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="btn-primary"
            >
              {isEditing ? t("profile.view") : t("profile.edit")}
            </button>
          )}
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            {t("profile.updateSuccess")}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <UserSettings />
        )}

        {/* Profile Display Section */}
        {activeTab === "profile" && !isEditing && (
          <div className="card-gradient p-8 mb-6">
            {/* Profile Header */}
            <div className="flex items-start mb-6">
              <Avatar 
                src={user.profilePhoto} 
                alt={user.nickname || user.name || "Profile"} 
                size="xl"
                fallbackText={user.nickname || user.name}
                className="mr-8"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  {isStudent || isCompany &&(
                  <span className={`px-3 py-1 rounded text-sm font-semibold ${
                    user.role === "student" ? "bg-blue-100 text-blue-800" :
                
                    user.role === "company" ? "bg-purple-100 text-purple-800" :
                    "bg-gray-100 text-gray-800"
                  }`}>
                    {user.role?.charAt(0).toUpperCase() + user.role?.slice(1) || "User"}
                  </span>
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
                </div>
                <h2 className="text-3xl font-bold mb-2">{user.nickname || user.name}</h2>
                {user.nickname && user.nickname !== user.name && (
                  <p className="text-lg text-gray-600 mb-2">{user.name}</p>
                )}
                {isStudent && user.university && (
                  <p className="text-lg text-gray-600">{user.university}</p>
                )}
                {isOBOG && (
                  <>
                    {user.university && <p className="text-lg text-gray-600">{user.university}</p>}
                    {user.company && <p className="text-lg text-gray-600">{user.company}</p>}
                  </>
                )}
                {isCompany && user.companyName && (
                  <p className="text-lg text-gray-600">{user.companyName}</p>
                )}
              </div>
            </div>

            {/* Account Info */}
            <div className="mb-6 pb-6 border-b border-gray-200">
              <h3 className="font-semibold mb-3 text-gray-900">{t("profile.accountInfo")}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">{t("form.email")}:</span>
                  <span className="ml-2 text-gray-900 font-medium">{user.email}</span>
                </div>
                
                {user.createdAt && (
                  <div>
                    <span className="text-gray-600">{t("profile.memberSince")}:</span>
                    <span className="ml-2 text-gray-900 font-medium">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Profile Details */}
            <div className="space-y-6">
              {/* Student-specific display */}
              {isStudent && (
                <>
                  {user.year && (
                    <div>
                      <h3 className="font-semibold mb-2 text-gray-900">{t("form.year")}</h3>
                      <p className="text-gray-700">
                        {String(user.year) === "grad" ? t("form.graduate") : 
                         typeof user.year === "number" ? t(`form.year${user.year}`) :
                         t(`form.${user.year}`)}
                      </p>
                    </div>
                  )}
                  {user.nationality && (
                    <div>
                      <h3 className="font-semibold mb-2 text-gray-900">{t("form.nationality")}</h3>
                      <p className="text-gray-700">{user.nationality}</p>
                    </div>
                  )}
                  {user.jlptLevel && (
                    <div>
                      <h3 className="font-semibold mb-2 text-gray-900">{t("form.jlptLevel")}</h3>
                      <span className="px-3 py-1 bg-gray-100 rounded text-gray-700 font-medium">
                        {user.jlptLevel}
                      </span>
                    </div>
                  )}
                  {user.languages && Array.isArray(user.languages) && user.languages.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2 text-gray-900">{t("form.languages")}</h3>
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
                      <h3 className="font-semibold mb-2 text-gray-900">{t("form.interests")}</h3>
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
                      <h3 className="font-semibold mb-2 text-gray-900">{t("form.skills")}</h3>
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
                      <h3 className="font-semibold mb-2 text-gray-900">{t("form.desiredIndustry")}</h3>
                      <span className="px-3 py-1 bg-gray-100 rounded text-gray-700">
                        {user.desiredIndustry}
                      </span>
                    </div>
                  )}
                </>
              )}

              {/* OB/OG-specific display */}
              {isOBOG && (
                <>
                  {user.nationality && (
                    <div>
                      <h3 className="font-semibold mb-2 text-gray-900">{t("form.nationality")}</h3>
                      <p className="text-gray-700">{user.nationality}</p>
                    </div>
                  )}
                  {user.languages && Array.isArray(user.languages) && user.languages.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2 text-gray-900">{t("form.languages")}</h3>
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
                      <h3 className="font-semibold mb-2 text-gray-900">{t("form.topics")}</h3>
                      <div className="flex flex-wrap gap-2">
                        {user.topics.map((topic: string, idx: number) => (
                          <span key={idx} className="px-3 py-1 bg-gray-100 rounded text-gray-700">
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {user.oneLineMessage && (
                    <div className="p-4 rounded-lg border-l-4" style={{
                      backgroundColor: '#D7FFEF',
                      borderLeftColor: '#0F2A44'
                    }}>
                      <h3 className="font-semibold mb-2" style={{ color: '#111827' }}>{t("form.oneLineMessage")}</h3>
                      <p className="text-lg italic" style={{ color: '#374151' }}>{getTranslated(user.oneLineMessage, language)}</p>
                    </div>
                  )}
                  {user.studentEraSummary && (
                    <div>
                      <h3 className="font-semibold mb-2 text-gray-900">{t("obogDetail.studentEraSummary")}</h3>
                      <p className="text-gray-700 whitespace-pre-wrap">{user.studentEraSummary}</p>
                    </div>
                  )}
                </>
              )}

              {/* Company-specific display */}
              {isCompany && (
                <>
                  {user.companyName && (
                    <div>
                      <h3 className="font-semibold mb-2 text-gray-900">{t("form.companyName")}</h3>
                      <p className="text-gray-700 text-lg font-medium">{user.companyName}</p>
                    </div>
                  )}
                  {user.contactName && (
                    <div>
                      <h3 className="font-semibold mb-2 text-gray-900">{t("form.contactName")}</h3>
                      <p className="text-gray-700">{user.contactName}</p>
                    </div>
                  )}
                  {user.logo && (
                    <div>
                      <h3 className="font-semibold mb-2 text-gray-900">{t("form.companyLogo")}</h3>
                      <img 
                        src={user.logo} 
                        alt={user.companyName || "Company Logo"} 
                        className="w-24 h-24 object-contain rounded"
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Edit Form Section */}
        {activeTab === "profile" && isEditing && (
          <form onSubmit={handleSubmit} className="card-gradient p-8 space-y-6">
          {/* Profile Picture */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t("profile.profilePicture")}</h3>
            <div className="flex items-center gap-8 mb-4">
              <Avatar 
                src={formData.profilePhoto} 
                alt={formData.name || "Profile"} 
                size="xl"
                fallbackText={formData.nickname || formData.name}
              />
              <div className="flex-1">
                <label htmlFor="profilePhoto" className="block text-sm font-medium text-gray-700 mb-1">
                  {t("profile.profilePicture")}
                </label>
                <input
                  type="file"
                  id="profilePhoto"
                  name="profilePhoto"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={(e) => handleFileUpload(e, "profilePhoto")}
                  disabled={uploadingPhoto}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  style={{ color: '#000000' }}
                />
                {uploadingPhoto && (
                  <p className="text-xs text-blue-600 mt-1">{t("common.uploading") || "Uploading..."}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">{t("profile.profilePictureHint") || "Upload a JPEG, PNG, GIF, or WebP image (max 5MB)"}</p>
              </div>
            </div>
          </div>

          {/* Account Info (Read-only) */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t("profile.accountInfo")}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("form.email")}
                </label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
                />
                <p className="text-xs text-gray-500 mt-1">{t("profile.emailCannotChange")}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("profile.role")}
                </label>
                <input
                  type="text"
                  value={user.role}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 capitalize"
                />
              </div>
            </div>
          </div>

          {/* Profile Info */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t("form.profileInfo")}</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  {t("form.fullName")} *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name || ""}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  style={{ color: '#000000' }}
                />
              </div>

              {formData.nickname !== undefined && (
                <div>
                  <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-1">
                    {t("form.nickname")}
                  </label>
                  <input
                    type="text"
                    id="nickname"
                    name="nickname"
                    value={formData.nickname || ""}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    style={{ color: '#000000' }}
                  />
                </div>
              )}

              {/* Student-specific fields */}
              {isStudent && (
                <>
                  <div>
                    <label htmlFor="university" className="block text-sm font-medium text-gray-700 mb-1">
                      {t("form.university")} *
                    </label>
                    <input
                      type="text"
                      id="university"
                      name="university"
                      required
                      value={formData.university || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      style={{ color: '#000000' }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
                        {t("form.year")} *
                      </label>
                      <select
                        id="year"
                        name="year"
                        required
                        value={formData.year || ""}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        style={{ color: '#000000' }}
                      >
                        <option value="">{t("form.selectYear")}</option>
                        <option value="1">{t("form.year1")}</option>
                        <option value="2">{t("form.year2")}</option>
                        <option value="3">{t("form.year3")}</option>
                        <option value="4">{t("form.year4")}</option>
                        <option value="grad">{t("form.graduate")}</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="jlptLevel" className="block text-sm font-medium text-gray-700 mb-1">
                        {t("form.jlptLevel")}
                      </label>
                      <select
                        id="jlptLevel"
                        name="jlptLevel"
                        value={formData.jlptLevel || ""}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        style={{ color: '#000000' }}
                      >
                        <option value="">{t("form.jlptNotSpecified")}</option>
                        <option value="N1">N1</option>
                        <option value="N2">N2</option>
                        <option value="N3">N3</option>
                        <option value="N4">N4</option>
                        <option value="N5">N5</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="nationality" className="block text-sm font-medium text-gray-700 mb-1">
                      {t("form.nationality")} *
                    </label>
                    <select
                      id="nationality"
                      name="nationality"
                      required
                      value={formData.nationality || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      style={{ color: '#000000' }}
                    >
                      <option value="">{t("form.selectNationality") || "Select nationality"}</option>
                      {NATIONALITY_OPTIONS.map((nationality) => (
                        <option key={nationality} value={nationality}>
                          {nationality}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <MultiSelectDropdown
                      options={languageOptions}
                      selected={Array.isArray(formData.languages) ? formData.languages : []}
                      onChange={(selected) => setFormData({ ...formData, languages: selected })}
                      label={t("form.languages")}
                      required
                      placeholder={t("form.languagesPlaceholder")}
                      allowOther={true}
                      otherPlaceholder="Enter other language"
                    />
                  </div>

                  <div>
                    <MultiSelectDropdown
                      options={interestOptions}
                      selected={Array.isArray(formData.interests) ? formData.interests : []}
                      onChange={(selected) => setFormData({ ...formData, interests: selected })}
                      label={t("form.interests")}
                      placeholder={t("form.interestsPlaceholder")}
                      allowOther={true}
                      otherPlaceholder="Enter other interest"
                    />
                  </div>

                  <div>
                    <MultiSelectDropdown
                      options={skillOptions}
                      selected={Array.isArray(formData.skills) ? formData.skills : []}
                      onChange={(selected) => setFormData({ ...formData, skills: selected })}
                      label={t("form.skills")}
                      placeholder={t("form.skillsPlaceholder")}
                      allowOther={true}
                      otherPlaceholder="Enter other skill"
                    />
                  </div>

                  <div>
                    <MultiSelectDropdown
                      options={INDUSTRY_OPTIONS}
                      selected={formData.desiredIndustry || []}
                      onChange={(selected) => setFormData({ ...formData, desiredIndustry: selected })}
                      label={t("form.desiredIndustry")}
                      placeholder={t("form.desiredIndustryPlaceholder") || "Select desired industries..."}
                      allowOther={true}
                      otherPlaceholder="Enter other industry"
                    />
                  </div>
                </>
              )}

              {/* OB/OG-specific fields */}
              {isOBOG && (
                <>
                  <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                      {t("form.type")} *
                    </label>
                    <select
                      id="type"
                      name="type"
                      required
                      value={formData.type || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      style={{ color: '#000000' }}
                    >
                      <option value="working-professional">{t("form.typeWorkingProfessional")}</option>
                      <option value="job-offer-holder">{t("form.typeJobOfferHolder")}</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="university" className="block text-sm font-medium text-gray-700 mb-1">
                      {t("form.university")} *
                    </label>
                    <input
                      type="text"
                      id="university"
                      name="university"
                      required
                      value={formData.university || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      style={{ color: '#000000' }}
                    />
                  </div>

                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                      {t("form.company")} *
                    </label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      required
                      value={formData.company || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      style={{ color: '#000000' }}
                    />
                  </div>

                  <div>
                    <label htmlFor="nationality" className="block text-sm font-medium text-gray-700 mb-1">
                      {t("form.nationality")} *
                    </label>
                    <select
                      id="nationality"
                      name="nationality"
                      required
                      value={formData.nationality || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      style={{ color: '#000000' }}
                    >
                      <option value="">{t("form.selectNationality") || "Select nationality"}</option>
                      {NATIONALITY_OPTIONS.map((nationality) => (
                        <option key={nationality} value={nationality}>
                          {nationality}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <MultiSelectDropdown
                      options={languageOptions}
                      selected={Array.isArray(formData.languages) ? formData.languages : []}
                      onChange={(selected) => setFormData({ ...formData, languages: selected })}
                      label={t("form.languages")}
                      required
                      placeholder={t("form.languagesPlaceholder")}
                      allowOther={true}
                      otherPlaceholder="Enter other language"
                    />
                  </div>

                  <div>
                    <MultiSelectDropdown
                      options={topicOptions}
                      selected={Array.isArray(formData.topics) ? formData.topics : []}
                      onChange={(selected) => setFormData({ ...formData, topics: selected })}
                      label={t("form.topics")}
                      required
                      placeholder={t("form.topicsPlaceholder")}
                      allowOther={true}
                      otherPlaceholder="Enter other topic"
                    />
                  </div>

                  <div>
                    <label htmlFor="oneLineMessage" className="block text-sm font-medium text-gray-700 mb-1">
                      {t("form.oneLineMessage")} *
                    </label>
                    <textarea
                      id="oneLineMessage"
                      name="oneLineMessage"
                      required
                      rows={3}
                      value={formData.oneLineMessage || ""}
                      onChange={handleChange}
                      placeholder={t("form.oneLineMessagePlaceholder")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      style={{ color: '#000000' }}
                    />
                  </div>
                </>
              )}

              {/* Company-specific fields */}
              {isCompany && (
                <>
                  <div>
                    <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
                      {t("form.companyName")} *
                    </label>
                    <input
                      type="text"
                      id="companyName"
                      name="companyName"
                      required
                      value={formData.companyName || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      style={{ color: '#000000' }}
                    />
                  </div>

                  <div>
                    <label htmlFor="contactName" className="block text-sm font-medium text-gray-700 mb-1">
                      {t("form.contactName")} *
                    </label>
                    <input
                      type="text"
                      id="contactName"
                      name="contactName"
                      required
                      value={formData.contactName || formData.name || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      style={{ color: '#000000' }}
                    />
                  </div>

                  <div>
                    <label htmlFor="logo" className="block text-sm font-medium text-gray-700 mb-1">
                      {t("form.companyLogo")}
                    </label>
                    {formData.logo && (
                      <div className="mb-2">
                        <img 
                          src={formData.logo} 
                          alt={formData.companyName || "Company Logo"} 
                          className="w-24 h-24 object-contain rounded border border-gray-300"
                        />
                      </div>
                    )}
                    <input
                      type="file"
                      id="logo"
                      name="logo"
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                      onChange={(e) => handleFileUpload(e, "logo")}
                      disabled={uploadingLogo}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      style={{ color: '#000000' }}
                    />
                    {uploadingLogo && (
                      <p className="text-xs text-blue-600 mt-1">{t("common.uploading") || "Uploading..."}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">{t("form.companyLogoHint") || "Upload a JPEG, PNG, GIF, or WebP image (max 5MB)"}</p>
                  </div>
                </>
              )}
            </div>
          </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={saving}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>{t("common.loading")}</span>
                  </>
                ) : (
                  t("profile.save")
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  // Reset form data to original user data
                  setFormData(user);
                }}
                className="btn-secondary"
                disabled={saving}
              >
                {t("button.cancel")}
              </button>
            </div>
          </form>
        )}
        {/* Sign Out Section */}
        {!isEditing && (
          <div className="card-gradient p-8 border-t-2 border-red-200 mb-6">
            <h3 className="text-xl font-semibold mb-4" style={{ color: '#000000' }}>
              {t("profile.signOut.title") || "Sign Out"}
            </h3>
          
          <button
                onClick={handleSignOut}
                className="btn-secondary text-sm"
              >
                {t("nav.signOut")}
              </button>
              </div>
        )}

        {/* Delete Account Section */}
        {!isEditing && (
          <div className="card-gradient p-8 border-t-2 border-red-200">
            <h3 className="text-xl font-semibold mb-4" style={{ color: '#000000' }}>
              {t("profile.deleteAccount.title") || "Delete Account"}
            </h3>
            <p className="text-sm mb-4" style={{ color: '#000000' }}>
              {t("profile.deleteAccount.warning") || "Once you delete your account, there is no going back. Please be certain."}
            </p>
            
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold"
              >
                {t("profile.deleteAccount.button") || "Delete Account"}
              </button>
            ) : (
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded p-4">
                  <p className="text-sm font-semibold text-red-800 mb-2">
                    {t("profile.deleteAccount.confirmTitle") || "Are you absolutely sure?"}
                  </p>
                  <p className="text-sm text-red-700">
                    {t("profile.deleteAccount.confirmMessage") || "This action cannot be undone. This will permanently delete your account and remove all your data from our servers."}
                  </p>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleting}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {deleting ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>{t("profile.deleteAccount.deleting") || "Deleting..."}</span>
                      </>
                    ) : (
                      t("profile.deleteAccount.confirmButton") || "Yes, delete my account"
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setError("");
                    }}
                    disabled={deleting}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-semibold disabled:opacity-50"
                  >
                    {t("button.cancel")}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Availability Calendar Modal */}
        {isOBOG && user && (
          <AvailabilityCalendar
            obogId={user.id}
            obogName={user.nickname || user.name}
            isOpen={showAvailabilityCalendar}
            onClose={() => setShowAvailabilityCalendar(false)}
            isOwner={true}
          />
        )}
      </div>
    </div>
  );
}

