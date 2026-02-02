"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { fadeIn, slideUp, buttonVariants } from "@/lib/animations";
import { createClient } from "@/lib/supabase/client";
import Footer from "@/components/Footer";

export default function LoginPage() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(t("login.error"));
      } else if (data?.user) {
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
    <div className="min-h-screen" style={{ backgroundColor: '#D7FFEF' }}>
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="max-w-md w-full space-y-8 bg-white p-8 border rounded"
          style={{ borderColor: 'var(--border-default)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-card)' }}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            variants={slideUp}
            initial="initial"
            animate="animate"
          >
            <h2 
              className="text-2xl font-bold text-center"
              style={{ color: '#111827' }}
            >
              {t("login.title")}
            </h2>
            <p className="mt-2 text-center text-sm" style={{ color: '#6B7280' }}>
              {t("login.subtitle")}
            </p>
          </motion.div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <motion.div 
                className="px-4 py-3 rounded border"
                style={{ backgroundColor: '#FEE2E2', borderColor: '#FCA5A5', color: '#DC2626' }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                {error}
              </motion.div>
            )}
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium" style={{ color: '#374151' }}>
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
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 sm:text-sm"
                  placeholder={t("form.emailPlaceholder")}
                  style={{ borderColor: '#D1D5DB', borderRadius: '6px', color: '#111827' }}
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium" style={{ color: '#374151' }}>
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
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 sm:text-sm"
                  placeholder="••••••••"
                  style={{ borderColor: '#D1D5DB', borderRadius: '6px', color: '#111827' }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 border-gray-300 rounded"
                  style={{ accentColor: '#2563EB' }}
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm" style={{ color: '#374151' }}>
                  {t("login.rememberMe")}
                </label>
              </div>

              <div className="text-sm">
                <Link 
                  href="/forgot-password" 
                  className="font-medium hover:underline"
                  style={{ color: '#2563EB' }}
                >
                  {t("login.forgotPassword")}
                </Link>
              </div>
            </div>

            <motion.div>
              <motion.button
                type="submit"
                disabled={loading}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                {loading ? t("common.loading") : t("login.submit")}
              </motion.button>
            </motion.div>
          </form>
        </motion.div>
      </div>

      <Footer variant="full" />
    </div>
  );
}
