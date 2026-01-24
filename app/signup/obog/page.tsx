"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import MultiSelectDropdown from "@/components/MultiSelectDropdown";
import { NATIONALITY_OPTIONS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import { isBlockedFreeDomain, getBlockedDomainError } from "@/lib/blocked-email-domains";

export default function OBOGSignupPage() {
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
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [verificationEmailSent, setVerificationEmailSent] = useState(false);
 

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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

  
    if (isBlockedFreeDomain(formData.email)) {
       setError(getBlockedDomainError());
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
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          role: "obog",
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
        throw new Error(data.error || "Failed to create account");
      }

      try {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (signInError) {
          setSuccess(t("signup.success.checkEmail") || "Account created successfully! Please check your email to confirm your account.");
          setVerificationEmailSent(true);
        } else if (signInData?.user) {
          router.push("/");
          router.refresh();
        } else {
          setSuccess(t("signup.success.checkEmail") || "Account created successfully! Please check your email to confirm your account.");
          setVerificationEmailSent(true);
        }
      } catch (signInError: any) {
        console.error("Auto-login error:", signInError);
        setSuccess(t("signup.success.checkEmail") || "Account created successfully! Please check your email to confirm your account.");
        setVerificationEmailSent(true);
      }
    } catch (err: any) {
      setError(err.message || "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#D7FFEF' }}>
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div 
          className="max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto bg-white p-8 border rounded"
          style={{ borderColor: '#E5E7EB', borderRadius: '6px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)' }}
        >
          <h2 className="text-2xl font-bold text-center mb-6" style={{ color: '#111827' }}>
            {t("signup.obog.title")}
          </h2>

          {error && (
            <div
              className="mb-4 px-4 py-3 rounded border"
              style={{ backgroundColor: '#FEE2E2', borderColor: '#FCA5A5', color: '#DC2626' }}
            >
              {error}
            </div>
          )}

          {success && (
            <div
              className="mb-4 px-4 py-3 rounded border"
              style={{ backgroundColor: '#D1FAE5', borderColor: '#6EE7B7', color: '#059669' }}
            >
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
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
                    className="mt-1 block w-full px-3 py-2 border rounded focus:outline-none focus:ring-2"
                    style={{ borderColor: '#D1D5DB', borderRadius: '6px', color: '#111827' }}
                  />
                </div>
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
                    className="mt-1 block w-full px-3 py-2 border rounded focus:outline-none focus:ring-2"
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
                    className="mt-1 block w-full px-3 py-2 border rounded focus:outline-none focus:ring-2"
                    style={{ borderColor: '#D1D5DB', borderRadius: '6px', color: '#111827' }}
                  />
                </div>
              </div>
            </div>

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
                    className="mt-1 block w-full px-3 py-2 border rounded focus:outline-none focus:ring-2"
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
                    className="mt-1 block w-full px-3 py-2 border rounded focus:outline-none focus:ring-2"
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
                    className="mt-1 block w-full px-3 py-2 border rounded focus:outline-none focus:ring-2"
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
                    className="mt-1 block w-full px-3 py-2 border rounded focus:outline-none focus:ring-2"
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
                    className="mt-1 block w-full px-3 py-2 border rounded focus:outline-none focus:ring-2"
                    style={{ borderColor: '#D1D5DB', borderRadius: '6px', color: '#111827' }}
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
                    className="mt-1 block w-full px-3 py-2 border rounded focus:outline-none focus:ring-2"
                    style={{ borderColor: '#D1D5DB', borderRadius: '6px', color: '#111827' }}
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
                    selected={formData.languages}
                    onChange={(selected) => setFormData({ ...formData, languages: selected })}
                    label={t("form.languages")}
                    required
                    placeholder={t("form.languagesPlaceholder") || "Select languages..."}
                    allowOther={true}
                    otherPlaceholder="Enter other language"
                  />
                </div>
                <div>
                  <MultiSelectDropdown
                    options={topicOptions}
                    selected={formData.topics}
                    onChange={(selected) => setFormData({ ...formData, topics: selected })}
                    label={t("form.topics")}
                    required
                    placeholder={t("form.topicsPlaceholder") || "Select topics..."}
                    allowOther={true}
                    otherPlaceholder={t("form.otherTopic") || "Enter other topic"}
                  />
                </div>
                <div>
                  <label htmlFor="oneLineMessage" className="block text-sm font-medium" style={{ color: '#374151' }}>
                    {t("form.oneLineMessage")} *
                  </label>
                  <textarea
                    id="oneLineMessage"
                    name="oneLineMessage"
                    required
                    rows={3}
                    value={formData.oneLineMessage}
                    onChange={handleChange}
                    placeholder={t("form.oneLineMessagePlaceholder")}
                    className="mt-1 block w-full px-3 py-2 border rounded focus:outline-none focus:ring-2"
                    style={{ borderColor: '#D1D5DB', borderRadius: '6px', color: '#111827' }}
                  />
                </div>
              </div>
            </div>

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
                    <li>No use outside job hunting/career consultation</li>
                    <li>Exchanging personal contact info: generally prohibited</li>
                    <li>No online meetings after 10pm</li>
                    <li>No meetings involving alcohol</li>
                    <li>No meetings in private off-site rooms</li>
                    <li>No recording / filming / posting to SNS</li>
                    <li>No religious or business solicitation</li>
                    <li><strong>No "poaching" / taking students off-platform to recruit directly</strong></li>
                  </ul>
                </div>
              </div>
              <label className="flex items-start">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-1 h-4 w-4 border-gray-300 rounded"
                  style={{ accentColor: '#2563EB' }}
                />
                <span className="ml-2 text-sm" style={{ color: '#374151' }}>
                  {t("signup.acceptTerms")} *
                </span>
              </label>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading || verificationEmailSent}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading
                  ? t("common.loading")
                  : verificationEmailSent
                    ? (t("signup.verificationEmailSent") || "Verification email sent")
                    : t("signup.submit")}
              </button>
            </div>

            <p className="text-center text-sm" style={{ color: '#6B7280' }}>
              {t("signup.alreadyHaveAccount")}{" "}
              <Link href="/login" className="font-medium hover:underline" style={{ color: '#2563EB' }}>
                {t("signup.login")}
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
