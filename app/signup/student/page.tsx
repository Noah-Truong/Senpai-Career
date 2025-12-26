"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

export default function StudentSignupPage() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    nickname: "",
    university: "",
    nationality: "",
    year: "",
    languages: "",
    interests: "",
    skills: "",
    desiredIndustry: "",
    jlptLevel: "",
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
          role: "student",
          name: formData.name,
          nickname: formData.nickname,
          university: formData.university,
          nationality: formData.nationality,
          year: formData.year ? parseInt(formData.year) : undefined,
          languages: formData.languages ? formData.languages.split(",").map((l: string) => l.trim()) : [],
          interests: formData.interests ? formData.interests.split(",").map((i: string) => i.trim()) : [],
          skills: formData.skills ? formData.skills.split(",").map((s: string) => s.trim()) : [],
          desiredIndustry: formData.desiredIndustry,
          jlptLevel: formData.jlptLevel,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: "Failed to parse error response" }));
        throw new Error(data.error || `Failed to create account (${response.status})`);
      }

      const data = await response.json();

      // Auto-login after signup - wait a moment for the user to be fully saved
      await new Promise(resolve => setTimeout(resolve, 500));
      
      try {
        const signInResult = await signIn("credentials", {
          redirect: false,
          email: formData.email,
          password: formData.password,
          callbackUrl: "/",
        });

        if (signInResult?.ok) {
          // Successfully signed in - redirect to main page
          router.push("/");
          router.refresh();
        } else if (signInResult?.error) {
          // Login failed but account was created
          console.log("Auto-login failed:", signInResult.error);
          setError("Account created successfully! Redirecting to login page...");
          setTimeout(() => {
            router.push("/login");
          }, 2000);
        } else {
          setError("Account created successfully! Redirecting to login page...");
          setTimeout(() => {
            router.push("/login");
          }, 2000);
        }
      } catch (signInError: any) {
        // Account created but sign-in failed
        console.error("Auto-login error:", signInError);
        setError("Account created successfully! Redirecting to login page...");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }
    } catch (err: any) {
      console.error("Signup error:", err);
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
            {t("signup.student.title")}
          </h2>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Account Info */}
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

            {/* Profile Info */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{t("form.profileInfo")}</h3>
              <div className="space-y-4">
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
                <div className="grid grid-cols-2 gap-4">
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
                    <label htmlFor="year" className="block text-sm font-medium text-gray-700">
                      {t("form.year")} *
                    </label>
                    <select
                      style={{ color: '#000000' }}
                      id="year"
                      name="year"
                      required
                      value={formData.year}
                      onChange={handleChange}
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                  <label htmlFor="jlptLevel" className="block text-sm font-medium text-gray-700">
                    {t("form.jlptLevel")}
                  </label>
                  <select
                    id="jlptLevel"
                    name="jlptLevel"
                    value={formData.jlptLevel}
                    onChange={handleChange}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
                <div>
                  <label htmlFor="interests" className="block text-sm font-medium text-gray-700">
                    {t("form.interests")}
                  </label>
                  <input
                    type="text"
                    id="interests"
                    name="interests"
                    value={formData.interests}
                    onChange={handleChange}
                    placeholder={t("form.interestsPlaceholder")}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    style={{ color: '#000000' }}
                  />
                </div>
                <div>
                  <label htmlFor="skills" className="block text-sm font-medium text-gray-700">
                    {t("form.skills")}
                  </label>
                  <input
                    type="text"
                    id="skills"
                    name="skills"
                    value={formData.skills}
                    onChange={handleChange}
                    placeholder={t("form.skillsPlaceholder")}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    style={{ color: '#000000' }}
                  />
                </div>
                <div>
                  <label htmlFor="desiredIndustry" className="block text-sm font-medium text-gray-700">
                    {t("form.desiredIndustry")}
                  </label>
                  <input
                    type="text"
                    id="desiredIndustry"
                    name="desiredIndustry"
                    value={formData.desiredIndustry}
                    onChange={handleChange}
                    placeholder={t("form.desiredIndustryPlaceholder")}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    style={{ color: '#000000' }}
                  />
                </div>
              </div>
            </div>

            {/* Terms and Rules */}
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
                    <li>No ghosting / no-show (2 strikes = permanent ban)</li>
                  </ul>
                </div>
              </div>
              <label className="flex items-start">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
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

