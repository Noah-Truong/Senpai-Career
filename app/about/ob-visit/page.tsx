"use client";

import Header from "@/components/Header";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import OBOGListContent from "@/components/OBOGListContent";

export default function OBVisitPage() {
  const { t } = useLanguage();
  const { data: session } = useSession();
  const isLoggedIn = !!session;
  const [obogUsers, setObogUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch OB/OG users
    fetch("/api/obog")
      .then(res => res.json())
      .then(data => {
        setObogUsers(data.users || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading OB/OG users:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header />
    
    <section className="py-16"
    style={{
      background: '#F5F7FA'
    }}
    >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">{t("obvisit.whatIs.title")}</h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-lg text-gray-700 mb-6">
                {t("obvisit.whatIs.p1")}
              </p>
              <p className="text-lg text-gray-700 mb-6">
                {t("obvisit.whatIs.p2")}
              </p>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">{t("obvisit.benefits.title")}</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4 bg-[#0F2A44]">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: '#000000' }}>{t("obvisit.benefits.consultation.title")}</h3>
              <p className="text-gray-700">
                {t("obvisit.benefits.consultation.desc")}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4 bg-[#0F2A44]">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: '#000000' }}>{t("obvisit.benefits.strategy.title")}</h3>
              <p className="text-gray-700">
                {t("obvisit.benefits.strategy.desc")}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4 bg-[#0F2A44]">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: '#000000' }}>{t("obvisit.benefits.culture.title")}</h3>
              <p className="text-gray-700">
                {t("obvisit.benefits.culture.desc")}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4 bg-[#0F2A44]">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: '#000000' }}>{t("obvisit.benefits.interview.title")}</h3>
              <p className="text-gray-700">
                {t("obvisit.benefits.interview.desc")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Profile Types */}
      <section className="py-16" style={{
        background: '#F5F7FA'
      }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">{t("obvisit.profiles.title")}</h2>
          <div className="space-y-6">
            <div className="border-l-4 pl-6" style={{ borderColor: '#2563EB' }}>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">{t("obvisit.profiles.holders.title")}</h3>
              <p className="text-gray-700 mb-4">
                {t("obvisit.profiles.holders.desc")}
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="gradient-text mr-2">•</span>
                  <span>{t("obvisit.profiles.holders.1")}</span>
                </li>
                <li className="flex items-start">
                  <span className="gradient-text mr-2">•</span>
                  <span>{t("obvisit.profiles.holders.2")}</span>
                </li>
                <li className="flex items-start">
                  <span className="gradient-text mr-2">•</span>
                  <span>{t("obvisit.profiles.holders.3")}</span>
                </li>
              </ul>
            </div>
            <div className="border-l-4 pl-6" style={{ borderColor: '#2563EB' }}>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">{t("obvisit.profiles.professionals.title")}</h3>
              <p className="text-gray-700 mb-4">
                {t("obvisit.profiles.professionals.desc")}
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="gradient-text mr-2">•</span>
                  <span>{t("obvisit.profiles.professionals.1")}</span>
                </li>
                <li className="flex items-start">
                  <span className="gradient-text mr-2">•</span>
                  <span>{t("obvisit.profiles.professionals.2")}</span>
                </li>
                <li className="flex items-start">
                  <span className="gradient-text mr-2">•</span>
                  <span>{t("obvisit.profiles.professionals.3")}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">{t("obvisit.howItWorks.title")}</h2>
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-10 h-10 bg-[#0F2A44] text-white rounded-full flex items-center justify-center font-bold mr-4">
                  1
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: '#000000' }}>{t("obvisit.howItWorks.1.title")}</h3>
                  <p className="text-gray-700">
                    {t("obvisit.howItWorks.1.desc")}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-10 h-10 bg-[#0F2A44] text-white rounded-full flex items-center justify-center font-bold mr-4">
                  2
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: '#000000' }}>{t("obvisit.howItWorks.2.title")}</h3>
                  <p className="text-gray-700">
                    {t("obvisit.howItWorks.2.desc")}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-10 h-10 bg-[#0F2A44] text-white rounded-full flex items-center justify-center font-bold mr-4">
                  3
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: '#000000' }}>{t("obvisit.howItWorks.3.title")}</h3>
                  <p className="text-gray-700">
                    {t("obvisit.howItWorks.3.desc")}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-10 h-10 bg-[#0F2A44] text-white rounded-full flex items-center justify-center font-bold mr-4">
                  4
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: '#000000' }}>{t("obvisit.howItWorks.4.title")}</h3>
                  <p className="text-gray-700">
                    {t("obvisit.howItWorks.4.desc")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

