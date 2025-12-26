"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

export default function OBOGSignupPage() {
  const { t } = useLanguage();
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
    languages: "",
    topics: "",
    oneLineMessage: "",
  });
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
          role: "obog",
          name: formData.name,
          nickname: formData.nickname,
          type: formData.type,
          university: formData.university,
          company: formData.company,
          nationality: formData.nationality,
          languages: formData.languages ? formData.languages.split(",").map((l: string) => l.trim()) : [],
          topics: formData.topics ? formData.topics.split(",").map((t: string) => t.trim()) : [],
          oneLineMessage: formData.oneLineMessage,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create account");
      }

      // Auto-login after signup
      try {
        const signInResult = await signIn("credentials", {
          redirect: false,
          email: formData.email,
          password: formData.password,
        });

        if (signInResult?.ok) {
          // Successfully signed in - redirect to main page
          router.push("/");
          router.refresh();
        } else {
          // Login failed but account was created
          setError("Account created successfully! However, automatic login failed. Please log in manually.");
          // Still redirect to login page after a short delay
          setTimeout(() => {
            router.push("/login");
          }, 2000);
        }
      } catch (signInError: any) {
        // Account created but sign-in failed
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
    <div className="min-h-screen" style={{
      background: 'linear-gradient(135deg, rgba(242, 106, 163, 0.03) 0%, rgba(245, 159, 193, 0.03) 35%, rgba(111, 211, 238, 0.03) 70%, rgba(76, 195, 230, 0.03) 100%)'
    }}>
      <Header />
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-6">
            {t("signup.obog.title")}
          </h2>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t("form.accountInfo")}</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    {t("form.email")} *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    style={{ color: '#000000' }}
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    {t("form.password")} *
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    style={{ color: '#000000' }}
                  />
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    {t("form.confirmPassword")} *
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    style={{ color: '#000000' }}
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t("form.profileInfo")}</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                    {t("form.type")} *
                  </label>
                  <select
                    id="type"
                    name="type"
                    required
                    value={formData.type}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    style={{ color: '#000000' }}
                  >
                    <option value="working-professional">{t("form.typeWorkingProfessional")}</option>
                    <option value="job-offer-holder">{t("form.typeJobOfferHolder")}</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    {t("form.fullName")} *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    style={{ color: '#000000' }}
                  />
                </div>
                <div>
                  <label htmlFor="nickname" className="block text-sm font-medium text-gray-700">
                    {t("form.nickname")}
                  </label>
                  <input
                    type="text"
                    id="nickname"
                    name="nickname"
                    value={formData.nickname}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    style={{ color: '#000000' }}
                  />
                </div>
                <div>
                  <label htmlFor="university" className="block text-sm font-medium text-gray-700">
                    {t("form.university")} *
                  </label>
                  <input
                    type="text"
                    id="university"
                    name="university"
                    required
                    value={formData.university}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    style={{ color: '#000000' }}
                  />
                </div>
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                    {t("form.company")} *
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    required
                    value={formData.company}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    style={{ color: '#000000' }}
                  />
                </div>
                <div>
                  <label htmlFor="nationality" className="block text-sm font-medium text-gray-700">
                    {t("form.nationality")} *
                  </label>
                  <input
                    type="text"
                    id="nationality"
                    name="nationality"
                    required
                    value={formData.nationality}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    style={{ color: '#000000' }}
                  />
                </div>
                <div>
                  <label htmlFor="languages" className="block text-sm font-medium text-gray-700">
                    {t("form.languages")} *
                  </label>
                  <input
                    type="text"
                    id="languages"
                    name="languages"
                    required
                    value={formData.languages}
                    onChange={handleChange}
                    placeholder={t("form.languagesPlaceholder")}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    style={{ color: '#000000' }}
                  />
                </div>
                <div>
                  <label htmlFor="topics" className="block text-sm font-medium text-gray-700">
                    {t("form.topics")} *
                  </label>
                  <input
                    type="text"
                    id="topics"
                    name="topics"
                    required
                    value={formData.topics}
                    onChange={handleChange}
                    placeholder={t("form.topicsPlaceholder")}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    style={{ color: '#000000' }}
                  />
                </div>
                <div>
                  <label htmlFor="oneLineMessage" className="block text-sm font-medium text-gray-700">
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
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    style={{ color: '#000000' }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t("form.termsAndRules")}</h3>
              <div className="space-y-3 text-sm text-gray-700 mb-4">
                <p className="font-semibold">{t("form.readAndAccept")}</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>{t("form.termsOfService")}</li>
                  <li>{t("form.platformRules")}</li>
                </ul>
                <div className="mt-4 p-3 bg-white rounded border border-yellow-300">
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
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  style={{ accentColor: '#f26aa3' }}
                />
                <span className="ml-2 text-sm text-gray-700">
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

            <p className="text-center text-sm text-gray-600">
              {t("signup.alreadyHaveAccount")}{" "}
              <Link href="/login" className="font-medium link-gradient">
                {t("signup.login")}
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

