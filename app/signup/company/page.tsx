"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { createClient } from "@/lib/supabase/client";

export default function CompanySignupPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const supabase = createClient();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    companyName: "",
    contactName: "",
  });
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
 

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!acceptedTerms) {
      setError("You must accept the Terms of Service and Rules to continue.");
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long.");
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
          role: "company",
          name: formData.contactName,
          companyName: formData.companyName,
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
          setError("Account created successfully! However, automatic login failed. Please log in manually.");
          setTimeout(() => {
            router.push("/login");
          }, 2000);
        } else if (signInData?.user) {
          router.push("/");
          router.refresh();
        } else {
          setError("Account created successfully! However, automatic login failed. Please log in manually.");
          setTimeout(() => {
            router.push("/login");
          }, 2000);
        }
      } catch (signInError: any) {
        console.error("Auto-login error:", signInError);
        setError("Account created successfully! However, automatic login failed. Please log in manually.");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
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
            {t("signup.company.title")}
          </h2>

          {error && (
            <div 
              className="mb-4 px-4 py-3 rounded border"
              style={{ backgroundColor: '#FEE2E2', borderColor: '#FCA5A5', color: '#DC2626' }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4" style={{ color: '#111827' }}>{t("form.accountInfo")}</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium" style={{ color: '#374151' }}>
                    {t("form.companyEmail")} *
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
              <h3 className="text-lg font-semibold mb-4" style={{ color: '#111827' }}>{t("form.companyInfo")}</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium" style={{ color: '#374151' }}>
                    {t("form.companyName")} *
                  </label>
                  <input
                    type="text"
                    id="companyName"
                    name="companyName"
                    required
                    value={formData.companyName}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border rounded focus:outline-none focus:ring-2"
                    style={{ borderColor: '#D1D5DB', borderRadius: '6px', color: '#111827' }}
                  />
                </div>
                <div>
                  <label htmlFor="contactName" className="block text-sm font-medium" style={{ color: '#374151' }}>
                    {t("form.contactName")} *
                  </label>
                  <input
                    type="text"
                    id="contactName"
                    name="contactName"
                    required
                    value={formData.contactName}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border rounded focus:outline-none focus:ring-2"
                    style={{ borderColor: '#D1D5DB', borderRadius: '6px', color: '#111827' }}
                  />
                </div>
              </div>
            </div>

            <div 
              className="p-4 border-l-4"
              style={{ backgroundColor: '#EFF6FF', borderLeftColor: '#2563EB' }}
            >
              <h3 className="text-lg font-semibold mb-2" style={{ color: '#111827' }}>{t("form.forCompanies")}</h3>
              <p className="text-sm mb-4" style={{ color: '#374151' }}>
                {t("form.companyFeatures")}
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm mb-4" style={{ color: '#374151' }}>
                <li>{t("form.companyFeature1")}</li>
                <li>{t("form.companyFeature2")}</li>
                <li>{t("form.companyFeature3")}</li>
                <li>{t("form.companyFeature4")}</li>
              </ul>
              <p className="text-xs mt-4" style={{ color: '#6B7280' }}>
                <strong>{t("form.workHoursNote")}</strong> {t("form.workHoursDesc")}
              </p>
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
                  <p className="font-semibold mb-2">Key Rules:</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>No use outside job hunting/career consultation</li>
                    <li>Exchanging personal contact info: generally prohibited</li>
                    <li>No online meetings after 10pm</li>
                    <li>No meetings involving alcohol</li>
                    <li>No meetings in private off-site rooms</li>
                    <li>No recording / filming / posting to SNS</li>
                    <li>No religious or business solicitation</li>
                    <li>Respect student privacy and platform guidelines</li>
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
                disabled={loading}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? t("common.loading") : t("signup.submit")}
              </button>
            </div>

            <p className="text-center text-sm" style={{ color: '#6B7280' }}>
              {t("signup.alreadyHaveAccount")}{" "}
              <Link href="/login" className="font-medium hover:underline" style={{ color: '#2563EB' }}>
                {t("signup.login")}
              </Link>
            </p>
            <p className="text-center text-sm" style={{ color: '#6B7280' }}>
              {t("signup.questions") || "Have questions?"}{" "}
              <a href="mailto:info@senpaicareer.com" className="font-medium hover:underline" style={{ color: '#2563EB' }}>
                {t("button.contact")}
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
