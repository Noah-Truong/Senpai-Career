"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import MultiSelectDropdown from "@/components/MultiSelectDropdown";
import { NATIONALITY_OPTIONS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import Footer from "@/components/Footer";

export default function CorporateOBSignupPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    nickname: "",
    type: "working-professional",
    university: "",
    company: "",
    nationality: "",
    languages: [] as string[],
    topics: [] as string[],
    oneLineMessage: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [verificationEmailSent, setVerificationEmailSent] = useState(false);

  const languageOptions = useMemo(() => [
    t("form.language.japanese") || "Japanese",
    t("form.language.english") || "English",
    t("form.language.chinese") || "Chinese",
    t("form.language.korean") || "Korean",
    t("form.language.spanish") || "Spanish",
    t("form.language.french") || "French",
    t("form.language.german") || "German",
    t("form.language.portuguese") || "Portuguese",
  ], [t]);

  const topicOptions = useMemo(() => [
    t("form.topic.careerChange") || "Career Change",
    t("form.topic.jobSearchStrategy") || "Job Search Strategy",
    t("form.topic.interviewPreparation") || "Interview Preparation",
    t("form.topic.resumeWriting") || "Resume/CV Writing",
    t("form.topic.industryInsights") || "Industry Insights",
    t("form.topic.networking") || "Networking",
    t("form.topic.salaryNegotiation") || "Salary Negotiation",
    t("form.topic.workLifeBalance") || "Work-Life Balance",
  ], [t]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!acceptedTerms) {
      setError(t("signup.errors.acceptTermsRequired"));
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError(t("signup.errors.passwordMismatch"));
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError(t("signup.errors.passwordTooShort"));
      setLoading(false);
      return;
    }

    try {
      // Sign up as regular OB/OG first - admin will convert to Corporate OB
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          role: "corporate_ob",
          name: formData.name,
          nickname: formData.nickname,
          type: formData.type,
          university: formData.university,
          company: formData.company,
          nationality: formData.nationality,
          languages: formData.languages || [],
          topics: formData.topics || [],
          oneLineMessage: formData.oneLineMessage,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t("corporateOb.signup.error.createAccount") || "Failed to create account");
      }

      try {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (signInError) {
          setSuccess(t("corporateOb.signup.success") || "Account created! Please contact admin to be assigned as Corporate OB.");
          setVerificationEmailSent(true);
        } else if (signInData?.user) {
          setSuccess(t("corporateOb.signup.success") || "Account created! Please contact admin to be assigned as Corporate OB.");
          setVerificationEmailSent(true);
        } else {
          setSuccess(t("corporateOb.signup.success") || "Account created! Please contact admin to be assigned as Corporate OB.");
          setVerificationEmailSent(true);
        }
      } catch (signInError: any) {
        console.error("Auto-login error:", signInError);
        setSuccess(t("corporateOb.signup.success") || "Account created! Please contact admin to be assigned as Corporate OB.");
        setVerificationEmailSent(true);
      }
    } catch (err: any) {
      setError(err.message || t("corporateOb.signup.error.createAccount") || "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#D7FFEF' }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="card-gradient p-6 sm:p-8">
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2" style={{ color: '#111827' }}>
              {t("corporateOb.signup.title") || "Corporate OB Sign Up"}
            </h1>
            <p className="text-sm sm:text-base" style={{ color: '#6B7280' }}>
              {t("corporateOb.signup.subtitle") || "Sign up as a Corporate OB. After registration, please contact an admin to be assigned to your company."}
            </p>
          </div>

          {/* Notice */}
          <div 
            className="mb-6 p-4 border-l-4 rounded"
            style={{ 
              backgroundColor: '#FEF3C7', 
              borderLeftColor: '#F59E0B',
              borderRadius: '6px'
            }}
          >
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#92400E' }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="text-sm font-semibold mb-1" style={{ color: '#92400E' }}>
                  {t("corporateOb.signup.noticeTitle") || "Admin Approval Required"}
                </h3>
                <p className="text-xs sm:text-sm" style={{ color: '#78350F' }}>
                  {t("corporateOb.signup.noticeDescription") || "After creating your account, an admin will need to assign you as a Corporate OB and link you to your company. You'll be able to send messages to students once approved."}
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded text-sm">
              {success}
            </div>
          )}

          {verificationEmailSent ? (
            <div className="text-center py-8">
              <p className="text-lg mb-4" style={{ color: '#111827' }}>
                {t("corporateOb.signup.success")}
              </p>
              <Link href="/login" className="btn-primary inline-block">
                {t("nav.logIn")}
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Account Info */}
              <div>
                <h3 className="text-lg font-semibold mb-4" style={{ color: '#111827' }}>{t("form.accountInfo")}</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium" style={{ color: '#374151' }}>
                      {t("form.email")} *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 min-h-[44px]"
                      style={{ borderColor: '#D1D5DB', borderRadius: '6px', color: '#111827' }}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium" style={{ color: '#374151' }}>
                        {t("form.password")} *
                      </label>
                      <input
                        type="password"
                        id="password"
                        name="password"
                        required
                        value={formData.password}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 min-h-[44px]"
                        style={{ borderColor: '#D1D5DB', borderRadius: '6px', color: '#111827' }}
                      />
                    </div>
                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium" style={{ color: '#374151' }}>
                        {t("form.confirmPassword")} *
                      </label>
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        required
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 min-h-[44px]"
                        style={{ borderColor: '#D1D5DB', borderRadius: '6px', color: '#111827' }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Info */}
              <div>
                <h3 className="text-lg font-semibold mb-4" style={{ color: '#111827' }}>{t("form.profileInfo")}</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="type" className="block text-sm font-medium" style={{ color: '#374151' }}>
                      {t("form.type")} *
                    </label>
                    <select
                      id="type"
                      name="type"
                      required
                      value={formData.type}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 min-h-[44px]"
                      style={{ borderColor: '#D1D5DB', borderRadius: '6px', color: '#111827' }}
                    >
                      <option value="working-professional">{t("form.typeWorkingProfessional")}</option>
                      <option value="job-offer-holder">{t("form.typeJobOfferHolder")}</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium" style={{ color: '#374151' }}>
                      {t("form.fullName")} *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 min-h-[44px]"
                      style={{ borderColor: '#D1D5DB', borderRadius: '6px', color: '#111827' }}
                    />
                  </div>
                  <div>
                    <label htmlFor="nickname" className="block text-sm font-medium" style={{ color: '#374151' }}>
                      {t("form.nickname")}
                    </label>
                    <input
                      type="text"
                      id="nickname"
                      name="nickname"
                      value={formData.nickname}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 min-h-[44px]"
                      style={{ borderColor: '#D1D5DB', borderRadius: '6px', color: '#111827' }}
                    />
                  </div>
                  <div>
                    <label htmlFor="university" className="block text-sm font-medium" style={{ color: '#374151' }}>
                      {t("form.university")} *
                    </label>
                    <input
                      type="text"
                      id="university"
                      name="university"
                      required
                      value={formData.university}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 min-h-[44px]"
                      style={{ borderColor: '#D1D5DB', borderRadius: '6px', color: '#111827' }}
                    />
                  </div>
                  <div>
                    <label htmlFor="company" className="block text-sm font-medium" style={{ color: '#374151' }}>
                      {t("form.company")} *
                    </label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      required
                      value={formData.company}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 min-h-[44px]"
                      style={{ borderColor: '#D1D5DB', borderRadius: '6px', color: '#111827' }}
                      placeholder={t("corporateOb.signup.companyPlaceholder") || "Your company name (admin will link this)"}
                    />
                  </div>
                  <div>
                    <label htmlFor="nationality" className="block text-sm font-medium" style={{ color: '#374151' }}>
                      {t("form.nationality")} *
                    </label>
                    <select
                      id="nationality"
                      name="nationality"
                      required
                      value={formData.nationality}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 min-h-[44px]"
                      style={{ borderColor: '#D1D5DB', borderRadius: '6px', color: '#111827' }}
                    >
                      <option value="">{t("form.selectNationality")}</option>
                      {NATIONALITY_OPTIONS.map((nat) => (
                        <option key={nat} value={nat}>{nat}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                      {t("form.languages")} *
                    </label>
                    <MultiSelectDropdown
                      options={languageOptions}
                      selected={formData.languages}
                      onChange={(selected) => setFormData(prev => ({ ...prev, languages: selected }))}
                      placeholder={t("form.selectLanguages")}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                      {t("form.topics")}
                    </label>
                    <MultiSelectDropdown
                      options={topicOptions}
                      selected={formData.topics}
                      onChange={(selected) => setFormData(prev => ({ ...prev, topics: selected }))}
                      placeholder={t("form.selectTopics")}
                    />
                  </div>
                  <div>
                    <label htmlFor="oneLineMessage" className="block text-sm font-medium" style={{ color: '#374151' }}>
                      {t("form.oneLineMessage")}
                    </label>
                    <textarea
                      id="oneLineMessage"
                      name="oneLineMessage"
                      rows={3}
                      value={formData.oneLineMessage}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 min-h-[44px]"
                      style={{ borderColor: '#D1D5DB', borderRadius: '6px', color: '#111827' }}
                      placeholder={t("form.oneLineMessagePlaceholder")}
                    />
                  </div>
                </div>
              </div>

              {/* Terms and Rules */}
              <div 
                className="p-4 border-l-4"
                style={{ backgroundColor: '#FEF3C7', borderLeftColor: '#F59E0B' }}
              >
                <h3 className="text-lg font-semibold mb-4" style={{ color: '#111827' }}>{t("form.termsAndRules")}</h3>
                <div className="space-y-3 text-sm mb-4" style={{ color: '#374151' }}>
                  <p className="font-semibold">{t("form.readAndAccept")}</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>{t("form.termsOfService")}</li>
                    <li>{t("form.platformRules")}</li>
                  </ul>
                  <div 
                    className="mt-4 p-3 bg-white rounded border"
                    style={{ borderColor: '#F59E0B' }}
                  >
                    <p className="font-semibold mb-2">{t("form.keyRules")}</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>{t("form.rules.noOutsideConsultation")}</li>
                      <li>{t("form.rules.noPersonalContact")}</li>
                      <li>{t("form.rules.noLateMeetings")}</li>
                      <li>{t("form.rules.noAlcohol")}</li>
                      <li>{t("form.rules.noPrivateRooms")}</li>
                      <li>{t("form.rules.noRecording")}</li>
                      <li>{t("form.rules.noSolicitation")}</li>
                      <li>{t("form.rules.noPoaching")}</li>
                      <li>{t("form.rules.respectPrivacy")}</li>
                      <li>{t("form.rules.noGhosting")}</li>
                    </ul>
                  </div>
                </div>
                <label className="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="h-4 w-4 border-gray-300 rounded"
                    style={{ accentColor: '#2563EB' }}
                  />
                  <span className="ml-2 text-sm leading-none" style={{ color: '#374151' }}>
                    {t("signup.acceptTerms")} *
                  </span>
                </label>
              </div>

              {/* Submit */}
              <div className="flex flex-col-reverse sm:flex-row gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto min-h-[44px] btn-primary disabled:opacity-50 disabled:cursor-not-allowed px-6 py-2"
                >
                  {loading ? t("common.loading") : t("button.signUp")}
                </button>
                <Link
                  href="/register"
                  className="w-full sm:w-auto min-h-[44px] btn-secondary text-center px-6 py-2"
                >
                  {t("button.cancel")}
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>

      <Footer variant="full" />
    </div>
  );
}
