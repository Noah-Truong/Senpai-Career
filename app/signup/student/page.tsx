"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import MultiSelectDropdown from "@/components/MultiSelectDropdown";
import { NATIONALITY_OPTIONS, INDUSTRY_OPTIONS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import { isBlockedFreeDomain, getBlockedDomainError } from "@/lib/blocked-email-domains";

export default function StudentSignupPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    nickname: "",
    university: "",
    nationality: "",
    year: "",
    languages: [] as string[],
    interests: [] as string[],
    skills: [] as string[],
    desiredIndustry: [] as string[],
    jlptLevel: "",
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

  const interestOptions = useMemo(() => [
    t("form.interest.technology") || "Technology",
    t("form.interest.finance") || "Finance",
    t("form.interest.consulting") || "Consulting",
    t("form.interest.marketing") || "Marketing",
    t("form.interest.engineering") || "Engineering",
    t("form.interest.design") || "Design",
    t("form.interest.healthcare") || "Healthcare",
    t("form.interest.education") || "Education",
  ], [t]);

  const skillOptions = useMemo(() => [
    t("form.skill.programming") || "Programming",
    t("form.skill.dataAnalysis") || "Data Analysis",
    t("form.skill.projectManagement") || "Project Management",
    t("form.skill.design") || "Design",
    t("form.skill.marketing") || "Marketing",
    t("form.skill.sales") || "Sales",
    t("form.skill.research") || "Research",
    t("form.skill.writing") || "Writing",
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

    // TODO: Uncomment for production - free email detection
    // if (isBlockedFreeDomain(formData.email)) {
    //   setError(getBlockedDomainError());
    //   setLoading(false);
    //   return;
    // }

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
          role: "student",
          name: formData.name,
          nickname: formData.nickname,
          university: formData.university,
          nationality: formData.nationality,
          year: formData.year ? parseInt(formData.year) : undefined,
          languages: formData.languages || [],
          interests: formData.interests || [],
          skills: formData.skills || [],
          desiredIndustry: formData.desiredIndustry.join(", "),
          jlptLevel: formData.jlptLevel,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: "Failed to parse error response" }));
        throw new Error(data.error || `Failed to create account (${response.status})`);
      }

      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Auto-login with Supabase
      try {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (signInError) {
          // Auto-login failed (non-critical)
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
      console.error("Signup error:", err);
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
          <h2 
            className="text-2xl font-bold text-center mb-6"
            style={{ color: '#111827' }}
          >
            {t("signup.student.title")}
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

            {/* Profile Info */}
            <div>
              <h3 className="text-lg font-semibold mb-4" style={{ color: '#111827' }}>{t("form.profileInfo")}</h3>
              <div className="space-y-4">
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
                <div className="grid grid-cols-2 gap-4">
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
                    <label htmlFor="year" className="block text-sm font-medium" style={{ color: '#374151' }}>
                      {t("form.year")} *
                    </label>
                    <select
                      id="year"
                      name="year"
                      required
                      value={formData.year}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border rounded focus:outline-none focus:ring-2"
                      style={{ borderColor: '#D1D5DB', borderRadius: '6px', color: '#111827' }}
                    >
                      <option value="">{t("form.selectYear")}</option>
                      <option value="1">{t("form.year1")}</option>
                      <option value="2">{t("form.year2")}</option>
                      <option value="3">{t("form.year3")}</option>
                      <option value="4">{t("form.year4")}</option>
                      <option value="grad">{t("form.graduate")}</option>
                    </select>
                  </div>
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
                    otherPlaceholder={t("form.otherLanguage") || "Enter other language"}
                  />
                </div>
                <div>
                  <label htmlFor="jlptLevel" className="block text-sm font-medium" style={{ color: '#374151' }}>
                    {t("form.jlptLevel")}
                  </label>
                  <select
                    id="jlptLevel"
                    name="jlptLevel"
                    value={formData.jlptLevel}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border rounded focus:outline-none focus:ring-2"
                    style={{ borderColor: '#D1D5DB', borderRadius: '6px', color: '#111827' }}
                  >
                    <option value="">{t("form.jlptNotSpecified")}</option>
                    <option value="N1">N1</option>
                    <option value="N2">N2</option>
                    <option value="N3">N3</option>
                    <option value="N4">N4</option>
                    <option value="N5">N5</option>
                  </select>
                </div>
                <div>
                  <MultiSelectDropdown
                    options={interestOptions}
                    selected={formData.interests}
                    onChange={(selected) => setFormData({ ...formData, interests: selected })}
                    label={t("form.interests")}
                    placeholder={t("form.interestsPlaceholder") || "Select interests..."}
                    allowOther={true}
                    otherPlaceholder={t("form.otherInterest") || "Enter other interest"}
                  />
                </div>
                <div>
                  <MultiSelectDropdown
                    options={skillOptions}
                    selected={formData.skills}
                    onChange={(selected) => setFormData({ ...formData, skills: selected })}
                    label={t("form.skills")}
                    placeholder={t("form.skillsPlaceholder") || "Select skills..."}
                    allowOther={true}
                    otherPlaceholder="Enter other skill"
                  />
                </div>
                <div>
                  <MultiSelectDropdown
                    options={INDUSTRY_OPTIONS}
                    selected={formData.desiredIndustry}
                    onChange={(selected) => setFormData({ ...formData, desiredIndustry: selected })}
                    label={t("form.desiredIndustry")}
                    placeholder={t("form.desiredIndustryPlaceholder") || "Select desired industries..."}
                    allowOther={true}
                    otherPlaceholder={t("form.otherIndustry") || "Enter other industry"}
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
                    <li>No use outside job hunting/career consultation</li>
                    <li>Exchanging personal contact info: generally prohibited</li>
                    <li>No online meetings after 10pm</li>
                    <li>No meetings involving alcohol</li>
                    <li>No meetings in private off-site rooms</li>
                    <li>No recording / filming / posting to SNS</li>
                    <li>No religious or business solicitation</li>
                    <li>No ghosting / no-show (2 strikes = permanent ban)</li>
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
