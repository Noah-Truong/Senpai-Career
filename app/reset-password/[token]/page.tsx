"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Header from "@/components/Header";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ResetPasswordPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const params = useParams();
  const token = params?.token as string;
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);

  useEffect(() => {
    // Validate token on mount
    if (token) {
      validateToken();
    } else {
      setValidating(false);
      setTokenValid(false);
    }
  }, [token]);

  const validateToken = async () => {
    try {
      // We'll validate the token when submitting, but we can check it here too
      setValidating(false);
      setTokenValid(true);
    } catch (err) {
      setValidating(false);
      setTokenValid(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (password !== confirmPassword) {
      setError(t("resetPassword.passwordsDontMatch") || "Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError(t("resetPassword.passwordTooShort") || "Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to reset password");
      }

      setSuccess(true);
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="min-h-screen" style={{
        background: 'linear-gradient(135deg, rgba(242, 106, 163, 0.03) 0%, rgba(245, 159, 193, 0.03) 35%, rgba(111, 211, 238, 0.03) 70%, rgba(76, 195, 230, 0.03) 100%)'
      }}>
        <Header />
        <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md text-center">
            <p>{t("common.loading") || "Loading..."}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!tokenValid || !token) {
    return (
      <div className="min-h-screen" style={{
        background: 'linear-gradient(135deg, rgba(242, 106, 163, 0.03) 0%, rgba(245, 159, 193, 0.03) 35%, rgba(111, 211, 238, 0.03) 70%, rgba(76, 195, 230, 0.03) 100%)'
      }}>
        <Header />
        <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              <p className="font-medium">{t("resetPassword.invalidToken") || "Invalid or expired reset token"}</p>
              <p className="text-sm mt-1">
                {t("resetPassword.tokenExpired") || "This password reset link is invalid or has expired. Please request a new one."}
              </p>
            </div>
            <Link
              href="/forgot-password"
              className="btn-primary w-full inline-block text-center"
            >
              {t("resetPassword.requestNew") || "Request New Reset Link"}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{
      background: 'linear-gradient(135deg, rgba(242, 106, 163, 0.03) 0%, rgba(245, 159, 193, 0.03) 35%, rgba(111, 211, 238, 0.03) 70%, rgba(76, 195, 230, 0.03) 100%)'
    }}>
      <Header />
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
          <div>
            <h2 className="text-3xl font-bold text-center text-gray-900">
              {t("resetPassword.title") || "Reset Password"}
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              {t("resetPassword.subtitle") || "Enter your new password below."}
            </p>
          </div>

          {success ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                <p className="font-medium">{t("resetPassword.success") || "Password reset successfully!"}</p>
                <p className="text-sm mt-1">
                  {t("resetPassword.redirecting") || "Redirecting to login page..."}
                </p>
              </div>
            </div>
          ) : (
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  {t("resetPassword.newPassword") || "New Password"}
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="••••••••"
                  style={{ color: '#000000' }}
                />
                <p className="mt-1 text-xs text-gray-500">
                  {t("resetPassword.passwordHint") || "Must be at least 8 characters"}
                </p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  {t("form.confirmPassword")}
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="••••••••"
                  style={{ color: '#000000' }}
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (t("common.loading") || "Loading...") : (t("resetPassword.submit") || "Reset Password")}
                </button>
              </div>

              <div className="text-center">
                <Link href="/login" className="text-sm link-gradient">
                  {t("resetPassword.backToLogin") || "Back to Login"}
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

