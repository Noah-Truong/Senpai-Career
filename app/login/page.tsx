"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

export default function LoginPage() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        // More specific error messages
        if (result.error === "CredentialsSignin") {
          setError(t("login.error"));
        } else {
          setError(t("login.errorGeneric"));
        }
      } else if (result?.ok) {
        // Redirect to main page
        router.push("/");
        router.refresh();
      } else {
        setError(t("login.errorGeneric"));
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || t("login.errorGeneric"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{
      background: 'linear-gradient(135deg, rgba(242, 106, 163, 0.03) 0%, rgba(245, 159, 193, 0.03) 35%, rgba(111, 211, 238, 0.03) 70%, rgba(76, 195, 230, 0.03) 100%)'
    }}>
      <Header />
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
          <div>
            <h2 className="text-3xl font-bold text-center text-gray-900">
              {t("login.title")}
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              {t("login.subtitle")}
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  {t("login.email")}
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder={t("form.emailPlaceholder")}
                  style={{ color: '#000000' }}
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  {t("login.password")}
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="••••••••"
                  style={{ color: '#000000' }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 border-gray-300 rounded" style={{ accentColor: '#f26aa3' }}
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  {t("login.rememberMe")}
                </label>
              </div>

              <div className="text-sm">
                <Link href="/forgot-password" className="font-medium link-gradient">
                  {t("login.forgotPassword")}
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? t("common.loading") : t("login.submit")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

