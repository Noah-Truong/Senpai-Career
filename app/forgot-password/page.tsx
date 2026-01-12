"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import Header from "@/components/Header";

export default function ForgotPasswordPage() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetUrl, setResetUrl] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send reset email");
      }

      setSuccess(true);
      
      // In development, if Resend returns a reset link (due to test restrictions), show it
      if (data.resetUrl) {
        setResetUrl(data.resetUrl);
      }
    } catch (err: any) {
      setError(err.message || "Failed to process request");
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
              {t("forgotPassword.title") || "Forgot Password"}
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              {t("forgotPassword.subtitle") || "Enter your email address and we'll send you a link to reset your password."}
            </p>
          </div>

          {success ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                <p className="font-medium">{t("forgotPassword.success") || "Password reset email sent!"}</p>
                <p className="text-sm mt-1">
                  {resetUrl 
                    ? "Password reset link generated. Use the link below to reset your password."
                    : t("forgotPassword.checkEmail") || "Please check your email for the password reset link."
                  }
                </p>
              </div>
              
              {resetUrl && (
                <div
                  className="px-4 py-3 rounded border"
                  style={{ backgroundColor: '#D7FFEF', borderColor: '#B8F5DC', color: '#0F2A44' }}
                >
                  <p className="text-sm font-medium mb-2">Development Mode - Reset Link:</p>
                  <Link
                    href={resetUrl}
                    className="text-sm underline break-all block"
                  >
                    {resetUrl}
                  </Link>
                </div>
              )}

              <Link
                href="/login"
                className="btn-primary w-full inline-block text-center"
              >
                {t("forgotPassword.backToLogin") || "Back to Login"}
              </Link>
            </div>
          ) : (
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

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
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:z-10 sm:text-sm"
                  style={{ borderRadius: '6px', color: '#000000' }}
                  placeholder={t("form.emailPlaceholder")}
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (t("common.loading") || "Loading...") : (t("forgotPassword.submit") || "Send Reset Link")}
                </button>
              </div>

              <div className="text-center">
                <Link href="/login" className="text-sm link-gradient">
                  {t("forgotPassword.backToLogin") || "Back to Login"}
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

