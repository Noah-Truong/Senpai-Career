"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import Link from "next/link";
import { useSession } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import StudentIcon from "@/components/icons/StudentIcon";
import CompanyIcon from "@/components/icons/CompanyIcon";
import AlumIcon from "@/components/icons/AlumIcon";
import CorporateOBIcon from "@/components/icons/CorporateOBIcon";
import Footer from "@/components/Footer";

export default function RegisterPage() {
  const { t } = useLanguage();
  const { data: session } = useSession();
  const router = useRouter();
  
  useEffect(() => {
    if (session?.user) {
      router.push("/");
    }
  }, [session, router]);

  const accountTypes = [
    {
      type: "student",
      href: "/signup/student",
      title: t("role.student"),
      description: t("register.studentDesc"),
      icon: (<StudentIcon />),
      features: [
        t("register.studentFeature1"),
        t("register.studentFeature2"),
        t("register.studentFeature3"),
      ],
    },
    {
      type: "obog",
      href: "/signup/obog",
      title: t("role.obog"),
      description: t("register.obogDesc"),
      icon: (<AlumIcon />),
      features: [
        t("register.obogFeature1"),
        t("register.obogFeature2"),
        t("register.obogFeature3"),
      ],
    },
    {
      type: "corporate-ob",
      href: "/signup/corporate-ob",
      title: t("role.corporateOb"),
      description: t("register.corporateObDesc") || "Company-affiliated alumni who can message students",
      icon: (<CorporateOBIcon />),
      features: [
        t("register.corporateObFeature1") || "Send messages to students",
        t("register.corporateObFeature2") || "Pay-per-message billing (¥500)",
        t("register.corporateObFeature3") || "Company affiliation",
      ],
    },
    {
      type: "company",
      href: "/signup/company",
      title: t("role.company"),
      description: t("register.companyDesc"),
      icon: (<CompanyIcon />),
      features: [
        t("register.companyFeature1"),
        t("register.companyFeature2"),
        t("register.companyFeature3"),
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section 
        className="py-12 md:py-16" 
        style={{ backgroundColor: '#D7FFEF' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h1 
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{ color: '#111827' }}
            >
              {t("register.title")}
            </h1>
            <p 
              className="text-lg max-w-2xl mx-auto"
              style={{ color: '#6B7280' }}
            >
              {t("register.subtitle")}
            </p>
          </div>

          {/* Account Type Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {accountTypes.map((account) => (
              <div
                key={account.type}
                className="bg-white border rounded shadow-sm overflow-hidden flex flex-col h-full"
                style={{ borderColor: '#E5E7EB', borderRadius: '6px' }}
              >
                {/* Card Header - Fixed height for consistency */}
                <div 
                  className="p-6 text-center text-white flex flex-col items-center"
                  style={{ backgroundColor: '#0F2A44', height: '220px' }}
                >
                  <div 
                    className="w-20 h-20 rounded flex items-center justify-center mb-4 mt-2"
                    style={{ backgroundColor: 'transparent' }}
                  >
                    {account.icon}
                  </div>
                  <h2 className={`font-semibold text-white ${account.type === 'corporate-ob' ? 'text-lg' : 'text-xl'}`}>
                    {account.title}
                  </h2>
                </div>

                {/* Card Content */}
                <div className="p-6 flex flex-col flex-1">
                  <p 
                    className="mb-6 text-center text-sm"
                    style={{ color: '#6B7280' }}
                  >
                    {account.description}
                  </p>

                  {/* Features List */}
                  <ul className="space-y-3 flex-1">
                    {account.features.map((feature, index) => (
                      <li 
                        key={index} 
                        className="flex items-start"
                      >
                        <svg 
                          className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" 
                          fill="none" 
                          stroke="#059669" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span style={{ color: '#374151', fontSize: '14px' }}>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button - Only this is wrapped in Link */}
                  <Link
                    href={account.href}
                    className="w-full py-3 px-6 rounded text-white font-medium text-center mt-6 flex items-center justify-center hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: '#2563EB', borderRadius: '6px' }}
                  >
                    {t("register.getStarted")}
                    <svg 
                      className="w-4 h-4 ml-2" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Already have account */}
          <div className="text-center mt-10">
            <p style={{ color: '#6B7280' }}>
              {t("register.haveAccount")}{" "}
              <Link 
                href="/login" 
                className="font-medium hover:underline"
                style={{ color: '#2563EB' }}
              >
                {t("nav.logIn")}
              </Link>
            </p>
          </div>
        </div>
      </section>

      <Footer variant="full" />
    </div>
  );
}
