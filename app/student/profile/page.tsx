"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import Avatar from "@/components/Avatar";
import MultiSelectDropdown from "@/components/MultiSelectDropdown";
import { NATIONALITY_OPTIONS, INDUSTRY_OPTIONS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import SidebarLayout from "@/components/SidebarLayout";

const languageOptions = ["Japanese", "English", "Chinese", "Korean", "Spanish", "French", "German", "Portuguese"];
const interestOptions = ["Technology", "Finance", "Consulting", "Marketing", "Engineering", "Design", "Healthcare", "Education"];
const skillOptions = ["Programming", "Data Analysis", "Project Management", "Design", "Marketing", "Sales", "Research", "Writing"];

export default function StudentProfilePage() {
  const { t, language } = useLanguage();
  const { data: session, status } = useSession();
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submittingCompliance, setSubmittingCompliance] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState<any>({});
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "compliance">("profile");
  const [complianceAgreed, setComplianceAgreed] = useState(false);
  const [complianceDocuments, setComplianceDocuments] = useState<string[]>([]);
  const [uploadingDocument, setUploadingDocument] = useState<string | null>(null);
  const [permissionDocument, setPermissionDocument] = useState<string>("");
  const [japaneseCertDocument, setJapaneseCertDocument] = useState<string>("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated" && session?.user?.role !== "student") {
      router.push("/dashboard");
      return;
    }

    if (status === "authenticated") {
      loadProfile();
    }
  }, [status, router, session]);

  const loadProfile = async () => {
    try {
      const response = await fetch("/api/profile");
      const contentType = response.headers.get("content-type");
      const isJson = contentType && contentType.includes("application/json");
      if (!response.ok) {
        let msg = "Failed to load profile";
        if (isJson) {
          try {
            const t = await response.text();
            if (t.trim().startsWith("{")) {
              const d = JSON.parse(t);
              msg = d.error || msg;
            }
          } catch {}
        }
        setError(msg);
        setLoading(false);
        return;
      }
      if (!isJson) {
        setError("Failed to load profile");
        setLoading(false);
        return;
      }
      const text = await response.text();
      const t = text.trim();
      if (!t.startsWith("{") && !t.startsWith("[")) {
        setError("Failed to load profile");
        setLoading(false);
        return;
      }
      const data = JSON.parse(text);
      const u = data.user || data;
      const processedUser = {
        ...u,
        desiredIndustry: u.role === "student" && u.desiredIndustry
          ? (typeof u.desiredIndustry === "string"
              ? u.desiredIndustry.split(", ").filter(Boolean)
              : Array.isArray(u.desiredIndustry)
                ? u.desiredIndustry
                : [])
          : [],
      };
      setUser(processedUser);
      setFormData(processedUser);
      setComplianceAgreed(processedUser.complianceAgreed || false);
      setComplianceDocuments(processedUser.complianceDocuments || []);
      // Extract document URLs from compliance_documents array
      const docs = processedUser.complianceDocuments || [];
      setPermissionDocument(docs.find((d: string) => d.includes("permission") || d.includes("activity")) || "");
      setJapaneseCertDocument(docs.find((d: string) => d.includes("japanese") || d.includes("jlpt") || d.includes("cert")) || "");
      setError("");
      setLoading(false);
    } catch (err: any) {
      console.error("Profile load error:", err);
      setError(err.message || "Failed to load profile");
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === "languages" || name === "interests" || name === "skills") {
      setFormData({ ...formData, [name]: value.split(",").map((item: string) => item.trim()) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: "profilePhoto") => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setError("Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.");
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("File size too large. Maximum size is 5MB.");
      return;
    }

    setUploadingPhoto(true);
    setError("");

    try {
      const uploadData = new FormData();
      uploadData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: uploadData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload file");
      }

      const data = await response.json();
      setFormData((prevFormData: any) => ({ ...prevFormData, [fieldName]: data.url }));
      setSuccess("Photo uploaded successfully!");
      setTimeout(() => setSuccess(""), 2000);
    } catch (err: any) {
      setError(err.message || "Failed to upload file");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          profileCompleted: true,
          desiredIndustry: Array.isArray(formData.desiredIndustry)
            ? formData.desiredIndustry.join(", ")
            : formData.desiredIndustry,
        }),
      });

      const ct = response.headers.get("content-type");
      const isJson = ct && ct.includes("application/json");
      if (!response.ok) {
        let msg = "Failed to update profile";
        if (isJson) {
          try {
            const t = await response.text();
            if (t.trim().startsWith("{")) {
              const d = JSON.parse(t);
              msg = d.error || msg;
            }
          } catch {}
        }
        setError(msg);
        setSaving(false);
        return;
      }
      if (!isJson) {
        setError("Failed to update profile");
        setSaving(false);
        return;
      }
      const text = await response.text();
      if (!text.trim().startsWith("{")) {
        setError("Failed to update profile");
        setSaving(false);
        return;
      }
      const data = JSON.parse(text);
      const u = data.user || data;
      setUser(u);
      setFormData(u);
      setSuccess("Profile saved successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleDocumentUpload = async (file: File, documentType: "permission" | "japanese") => {
    setUploadingDocument(documentType);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("bucket", "compliance-documents"); // Use compliance-documents bucket

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload document");
      }

      const data = await response.json();
      const documentUrl = data.url;

      if (documentType === "permission") {
        setPermissionDocument(documentUrl);
      } else {
        setJapaneseCertDocument(documentUrl);
      }

      // Update compliance documents array
      const updatedDocs = [...complianceDocuments];
      if (documentType === "permission") {
        const existingIndex = updatedDocs.findIndex((d: string) => d.includes("permission") || d.includes("activity"));
        if (existingIndex >= 0) {
          updatedDocs[existingIndex] = documentUrl;
        } else {
          updatedDocs.push(documentUrl);
        }
      } else {
        const existingIndex = updatedDocs.findIndex((d: string) => d.includes("japanese") || d.includes("jlpt") || d.includes("cert"));
        if (existingIndex >= 0) {
          updatedDocs[existingIndex] = documentUrl;
        } else {
          updatedDocs.push(documentUrl);
        }
      }
      setComplianceDocuments(updatedDocs);
    } catch (err: any) {
      setError(err.message || "Failed to upload document");
    } finally {
      setUploadingDocument(null);
    }
  };

  const handleComplianceSubmit = async () => {
    if (!complianceAgreed) {
      setError("You must agree to the terms and rules to proceed.");
      return;
    }

    // For international students, require both documents
    const isInternational = user?.nationality && user.nationality.toLowerCase() !== "japan" && user.nationality.toLowerCase() !== "japanese";
    if (isInternational) {
      if (!permissionDocument) {
        setError("Permission for Activities Outside Qualification document is required for international students.");
        return;
      }
      if (!japaneseCertDocument) {
        setError("Japanese Language Certification document is required for international students.");
        return;
      }
    }

    setError("");
    setSuccess("");
    setSubmittingCompliance(true);

    // Build documents array with metadata
    const documentsToSubmit: string[] = [];
    if (permissionDocument) documentsToSubmit.push(`permission:${permissionDocument}`);
    if (japaneseCertDocument) documentsToSubmit.push(`japanese_cert:${japaneseCertDocument}`);

    try {
      const response = await fetch("/api/profile/compliance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          complianceAgreed: true,
          complianceDocuments: documentsToSubmit.length > 0 ? documentsToSubmit : complianceDocuments,
        }),
      });

      const ct = response.headers.get("content-type");
      const isJson = ct && ct.includes("application/json");
      if (!response.ok) {
        let msg = "Failed to submit compliance";
        if (isJson) {
          try {
            const t = await response.text();
            if (t.trim().startsWith("{")) {
              const d = JSON.parse(t);
              msg = d.error || msg;
            }
          } catch {}
        }
        setError(msg);
        setSubmittingCompliance(false);
        return;
      }
      if (!isJson) {
        setError("Failed to submit compliance");
        setSubmittingCompliance(false);
        return;
      }
      const text = await response.text();
      if (!text.trim().startsWith("{")) {
        setError("Failed to submit compliance");
        setSubmittingCompliance(false);
        return;
      }
      const data = JSON.parse(text);

      setUser({ ...user, complianceAgreed: true, complianceStatus: data.complianceStatus || "submitted" });
      setSuccess("Compliance submitted successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to submit compliance");
    } finally {
      setSubmittingCompliance(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <SidebarLayout role="student">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p>{t("common.loading")}</p>
        </div>
      </SidebarLayout>
    );
  }

  if (!user) {
    return (
      <SidebarLayout role="student">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="card-gradient p-8 text-center">
            <p className="text-gray-700 text-lg mb-4">{error || t("profile.notFound")}</p>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  const profileComplete = user.profileCompleted && 
    user.university && 
    user.year && 
    user.nationality && 
    user.languages && 
    user.languages.length > 0;

  return (
   
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-6" style={{ color: '#111827' }}>
          Student Profile & Compliance
        </h1>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Profile Completion</span>
            <span className="text-sm font-medium text-gray-700">
              {profileComplete ? "100%" : "In Progress"}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                profileComplete ? "bg-green-500" : "bg-blue-500"
              }`}
              style={{ width: profileComplete ? "100%" : "50%" }}
            />
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab("profile")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "profile"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Profile Information
            </button>
            <button
              onClick={() => setActiveTab("compliance")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "compliance"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Compliance Submission
              {user.complianceAgreed && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded-full">
                  ✓ Submitted
                </span>
              )}
            </button>
          </nav>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <form onSubmit={handleProfileSubmit} className="card-gradient p-8 space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-6" style={{ color: '#111827' }}>
                Complete Your Profile
              </h2>
            </div>

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
                  <input
                    type="file"
                    id="profilePhoto"
                    name="profilePhoto"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={(e) => handleFileUpload(e, "profilePhoto")}
                    disabled={uploadingPhoto}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-200 file:text-gray-700 hover:file:bg-gray-300"
                  />
                  {uploadingPhoto && (
                    <p className="text-xs text-blue-600 mt-1">{t("common.uploading") || "Uploading..."}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Basic Info */}
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
                />
              </div>

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
                />
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
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            </div>

            <div className="flex gap-4 pt-4">
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
                  "Save Profile"
                )}
              </button>
            </div>
          </form>
        )}

        {/* Compliance Tab */}
        {activeTab === "compliance" && (
          <div className="card-gradient p-8 space-y-6">
            <div>
              <h2 className="text-2xl font-semibold mb-4" style={{ color: '#111827' }}>
                Compliance Submission
              </h2>
              <p className="text-gray-600 mb-6">
                Please read and agree to the terms and rules before using the platform.
              </p>
            </div>

            {/* Terms and Rules */}
            <div 
              className="p-6 border-l-4 mb-6 max-h-96 overflow-y-auto"
              style={{ backgroundColor: '#FEF3C7', borderLeftColor: '#F59E0B' }}
            >
              <h3 className="text-lg font-semibold mb-4" style={{ color: '#111827' }}>
                Terms of Service & Platform Rules
              </h3>
              <div className="space-y-4 text-sm" style={{ color: '#374151' }}>
                <div>
                  <p className="font-semibold mb-2">Platform Usage</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>This platform is for job hunting and career consultation purposes only</li>
                    <li>Exchanging personal contact information is generally prohibited</li>
                  </ul>
                </div>

                <div 
                  className="mt-4 p-4 bg-white rounded border"
                  style={{ borderColor: '#F59E0B' }}
                >
                  <p className="font-semibold mb-3">Key Safety Rules:</p>
                  <ul className="list-disc list-inside space-y-2 text-xs">
                    <li>No use outside job hunting/career consultation</li>
                    <li>Exchanging personal contact info: generally prohibited</li>
                    <li>No online meetings after 10pm</li>
                    <li>No meetings involving alcohol</li>
                    <li>No meetings in private off-site rooms (recommend open cafe / office meeting room)</li>
                    <li>No recording / filming / posting to SNS</li>
                    <li>No religious or business solicitation</li>
                    <li>Strong warning: no ghosting / no-show for students (2 strikes = permanent ban)</li>
                  </ul>
                  <p className="mt-3 text-xs italic">
                    These rules are designed to keep our community safe and focused on career development. 
                    Violations are taken seriously and may result in account suspension or permanent ban.
                  </p>
                </div>
              </div>
            </div>

            {/* Compliance Agreement */}
            <div className="space-y-4">
              <label className="flex items-start cursor-pointer">
                <input
                  type="checkbox"
                  checked={complianceAgreed}
                  onChange={(e) => setComplianceAgreed(e.target.checked)}
                  className="mt-1 h-5 w-5 border-gray-300 rounded"
                  style={{ accentColor: '#2563EB' }}
                  disabled={user?.complianceStatus === "approved" || user?.complianceStatus === "submitted"}
                />
                <span className="ml-3 text-sm" style={{ color: '#374151' }}>
                  <span className="font-semibold">I acknowledge that I have read and understood</span> the Terms of Service 
                  and Platform Rules. I agree to comply with all stated rules and understand that violations may result 
                  in account suspension or permanent ban.
                </span>
              </label>

              {/* Document Upload Section - Required for International Students */}
              {(user?.nationality && user.nationality.toLowerCase() !== "japan" && user.nationality.toLowerCase() !== "japanese") && (
                <div className="space-y-4 mt-6 p-4 border rounded" style={{ borderColor: '#E5E7EB', backgroundColor: '#F9FAFB' }}>
                  <h3 className="text-lg font-semibold" style={{ color: '#111827' }}>
                    Required Documents (International Students)
                  </h3>
                  
                  {/* Permission for Activities Outside Qualification */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium" style={{ color: '#374151' }}>
                      Permission for Activities Outside Qualification *
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleDocumentUpload(file, "permission");
                        }}
                        disabled={user?.complianceStatus === "approved" || uploadingDocument === "permission"}
                        className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-200 file:text-gray-700 hover:file:bg-gray-300"
                      />
                      {uploadingDocument === "permission" && (
                        <span className="text-sm text-gray-500">Uploading...</span>
                      )}
                    </div>
                    {permissionDocument && (
                      <div className="flex items-center gap-2 text-sm text-green-700">
                        <span>✓</span>
                        <a href={permissionDocument} target="_blank" rel="noopener noreferrer" className="underline">
                          View uploaded document
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Japanese Language Certification */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium" style={{ color: '#374151' }}>
                      Japanese Language Certification *
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleDocumentUpload(file, "japanese");
                        }}
                        disabled={user?.complianceStatus === "approved" || uploadingDocument === "japanese"}
                        className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-200 file:text-gray-700 hover:file:bg-gray-300"
                      />
                      {uploadingDocument === "japanese" && (
                        <span className="text-sm text-gray-500">Uploading...</span>
                      )}
                    </div>
                    {japaneseCertDocument && (
                      <div className="flex items-center gap-2 text-sm text-green-700">
                        <span>✓</span>
                        <a href={japaneseCertDocument} target="_blank" rel="noopener noreferrer" className="underline">
                          View uploaded document
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Compliance Status Display */}
              {user?.complianceAgreed && (
                <div className={`border rounded p-4 ${
                  user.complianceStatus === "approved" 
                    ? "bg-green-50 border-green-200" 
                    : user.complianceStatus === "rejected"
                    ? "bg-red-50 border-red-200"
                    : "bg-yellow-50 border-yellow-200"
                }`}>
                  <p className={`text-sm ${
                    user.complianceStatus === "approved" 
                      ? "text-green-800" 
                      : user.complianceStatus === "rejected"
                      ? "text-red-800"
                      : "text-yellow-800"
                  }`}>
                    {user.complianceStatus === "approved" && "✓ "}
                    {user.complianceStatus === "rejected" && "✗ "}
                    Compliance {user.complianceStatus === "approved" ? "approved" : user.complianceStatus === "rejected" ? "rejected" : "submitted"} on {user.complianceAgreedAt 
                      ? new Date(user.complianceAgreedAt).toLocaleDateString() 
                      : "recently"}
                  </p>
                  {user.complianceStatus === "submitted" && (
                    <p className="text-xs text-yellow-700 mt-1">
                      Your documents are under review by an administrator. You will be notified once approved.
                    </p>
                  )}
                  {user.complianceStatus === "rejected" && (
                    <p className="text-xs text-red-700 mt-1">
                      Your compliance submission was rejected. Please review and resubmit your documents.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Submit Button */}
            {user?.complianceStatus !== "approved" && (
              <div className="pt-4">
                <button
                  onClick={handleComplianceSubmit}
                  disabled={!complianceAgreed || submittingCompliance || user?.complianceStatus === "submitted"}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submittingCompliance ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Submitting...</span>
                    </>
                  ) : user?.complianceStatus === "submitted" ? (
                    "Under Review"
                  ) : (
                    "Submit Compliance Documents"
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
  
  );
}
