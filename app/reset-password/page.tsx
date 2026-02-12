"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { createClient } from "@/lib/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

/**
 * Handles Supabase's password reset redirect: /reset-password#access_token=...&type=recovery
 * (Supabase does not put the token in the path, so this page must exist at /reset-password.)
 */
export default function ResetPasswordPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const supabase = createClient();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) {
      setValidating(false);
      setTokenValid(false);
      return;
    }

    const hashParams = new URLSearchParams(hash.substring(1));
    const type = hashParams.get("type");
    const accessToken = hashParams.get("access_token");

    if (type === "recovery" && accessToken) {
      supabase.auth
        .verifyOtp({
          token_hash: accessToken,
          type: "recovery",
        })
        .then(({ error: verifyError }) => {
          if (verifyError) {
            console.error("Token validation error:", verifyError);
            setTokenValid(false);
          } else {
            setTokenValid(true);
          }
        })
        .finally(() => setValidating(false));
    } else {
      setValidating(false);
      setTokenValid(false);
    }
  }, [supabase]);

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
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) throw new Error(updateError.message || "Failed to reset password");

      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch (err: any) {
      setError(err.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  const pageStyle = {
    background: "linear-gradient(135deg, #F26AA30D 0%, #F59FC10D 35%, #6FD3EE0D 70%, #4CC3E60D 100%)",
  };

  if (validating) {
    return (
      <div className="min-h-screen" style={pageStyle}>
       
        <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md text-center">
            <p>{t("common.loading") || "Loading..."}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen" style={pageStyle}>
    
        <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              <p className="font-medium">{t("resetPassword.invalidToken") || "Invalid or expired reset token"}</p>
              <p className="text-sm mt-1">
                {t("resetPassword.tokenExpired") ||
                  "This password reset link is invalid or has expired. Please request a new one."}
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
    <div className="min-h-screen" style={pageStyle}>
   
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
                  style={{ color: "#000000" }}
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
                  style={{ color: "#000000" }}
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? t("common.loading") || "Loading..." : t("resetPassword.submit") || "Reset Password"}
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

      <Footer variant="full" />
    </div>
  );
}
