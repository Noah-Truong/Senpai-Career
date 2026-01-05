"use client";

import Header from "@/components/Header";
import { useLanguage } from "@/contexts/LanguageContext";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AuthPage() {
  const { t } = useLanguage();
  const { data: session } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  
  useEffect(() => {
    if (session) {
      router.push("/");
    }
  }, [session, router]);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <section className="relative py-16" style={{
        background: 'linear-gradient(135deg, rgba(242, 106, 163, 0.08) 0%, rgba(245, 159, 193, 0.08) 35%, rgba(111, 211, 238, 0.08) 70%, rgba(76, 195, 230, 0.08) 100%)'
      }}>
        <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8">
          {/* Tab Selector */}
          <div className="flex mb-8 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab("login")}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                activeTab === "login"
                  ? "bg-white shadow-md text-gray-900"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {t("nav.logIn")}
            </button>
            <button
              onClick={() => setActiveTab("register")}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
                activeTab === "register"
                  ? "bg-white shadow-md text-gray-900"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {t("nav.signUp")}
            </button>
          </div>

          {/* Login Section */}
          {activeTab === "login" && (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                {t("auth.login.title") || "Welcome Back"}
              </h1>
              <p className="text-gray-600 mb-8 text-center">
                {t("auth.login.subtitle") || "Sign in to access your account"}
              </p>
              
              <Link
                href="/login"
                className="btn-primary w-full block text-center py-3"
              >
                {t("auth.login.continue") || "Continue to Login"}
              </Link>
              
              <div className="mt-6 text-center">
                <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-800">
                  {t("auth.forgotPassword") || "Forgot your password?"}
                </Link>
              </div>
            </div>
          )}

          {/* Register Section */}
          {activeTab === "register" && (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                {t("auth.register.title") || "Create Account"}
              </h1>
              <p className="text-gray-600 mb-8 text-center">
                {t("auth.register.subtitle") || "Choose your account type to get started"}
              </p>
              
              <div className="space-y-4">
                <Link
                  href="/signup/student"
                  className="block w-full p-4 border-2 border-gray-200 rounded-lg hover:border-pink-400 hover:bg-pink-50 transition-all group"
                >
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-pink-100 flex items-center justify-center mr-4 group-hover:bg-pink-200 transition-colors">
                      <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{t("nav.studentSignUp")}</h3>
                      <p className="text-sm text-gray-600">{t("auth.register.studentDesc") || "For international students"}</p>
                    </div>
                  </div>
                </Link>

                <Link
                  href="/signup/obog"
                  className="block w-full p-4 border-2 border-gray-200 rounded-lg hover:border-cyan-400 hover:bg-cyan-50 transition-all group"
                >
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-cyan-100 flex items-center justify-center mr-4 group-hover:bg-cyan-200 transition-colors">
                      <svg className="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{t("nav.obogSignUp")}</h3>
                      <p className="text-sm text-gray-600">{t("auth.register.obogDesc") || "For working professionals"}</p>
                    </div>
                  </div>
                </Link>

                <Link
                  href="/signup/company"
                  className="block w-full p-4 border-2 border-gray-200 rounded-lg hover:border-violet-400 hover:bg-violet-50 transition-all group"
                >
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center mr-4 group-hover:bg-violet-200 transition-colors">
                      <svg className="w-6 h-6 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{t("nav.companySignUp")}</h3>
                      <p className="text-sm text-gray-600">{t("auth.register.companyDesc") || "For companies recruiting"}</p>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

