"use client";

import Header from "@/components/Header";
import { useLanguage } from "@/contexts/LanguageContext";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RegisterPage() {
  const { t } = useLanguage();
  const { data: session } = useSession();
  const router = useRouter();
  
  useEffect(() => {
    if (session) {
      router.push("/");
    }
  }, [session, router]);

  const accountTypes = [
    {
      type: "student",
      href: "/signup/student",
      title: t("nav.studentSignUp"),
      description: t("register.studentDesc"),
      icon: (
        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
        </svg>
      ),
      features: [
        t("register.studentFeature1"),
        t("register.studentFeature2"),
        t("register.studentFeature3"),
      ],
      gradient: "from-pink-500 to-rose-500",
    },
    {
      type: "obog",
      href: "/signup/obog",
      title: t("nav.obogSignUp"),
      description: t("register.obogDesc"),
      icon: (
        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      features: [
        t("register.obogFeature1"),
        t("register.obogFeature2"),
        t("register.obogFeature3"),
      ],
      gradient: "from-cyan-500 to-blue-500",
    },
    {
      type: "company",
      href: "/signup/company",
      title: t("nav.companySignUp"),
      description: t("register.companyDesc"),
      icon: (
        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      features: [
        t("register.companyFeature1"),
        t("register.companyFeature2"),
        t("register.companyFeature3"),
      ],
      gradient: "from-violet-500 to-purple-500",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-16" style={{
        background: 'linear-gradient(135deg, rgba(242, 106, 163, 0.08) 0%, rgba(245, 159, 193, 0.08) 35%, rgba(111, 211, 238, 0.08) 70%, rgba(76, 195, 230, 0.08) 100%)'
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {t("register.title")}
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {t("register.subtitle")}
            </p>
          </div>

          {/* Account Type Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {accountTypes.map((account) => (
              <Link
                key={account.type}
                href={account.href}
                className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden flex flex-col h-full"
              >
                {/* Gradient Header */}
                <div className={`bg-gradient-to-r ${account.gradient} p-6`}>
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
                      {account.icon}
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-white text-center">
                    {account.title}
                  </h2>
                </div>

                {/* Card Content */}
                <div className="p-6 flex flex-col flex-1">
                  <p className="text-gray-600 mb-6 text-center">
                    {account.description}
                  </p>

                  {/* Features List */}
                  <ul className="space-y-3 flex-1">
                    {account.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <svg className={`w-5 h-5 mr-3 mt-0.5 flex-shrink-0 bg-gradient-to-r ${account.gradient} bg-clip-text`} fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: account.type === 'student' ? '#ec4899' : account.type === 'obog' ? '#06b6d4' : '#8b5cf6' }}>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <div className={`w-full py-3 px-6 rounded-lg bg-gradient-to-r ${account.gradient} text-white font-semibold text-center group-hover:opacity-90 transition-opacity mt-6`}>
                    {t("register.getStarted")}
                    <svg className="inline-block w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Already have account */}
          <div className="text-center mt-12">
            <p className="text-gray-600">
              {t("register.haveAccount")}{" "}
              <Link href="/login" className="font-semibold gradient-text hover:underline">
                {t("nav.logIn")}
              </Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
