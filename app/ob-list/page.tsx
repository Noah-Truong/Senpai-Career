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
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {t("obvisit.hero.title")}
          </h1>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto">
            {t("obvisit.hero.subtitle")}
          </p>
        </div>
      </section>

      {/* Safety Rules */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">{t("obvisit.safety.title")}</h2>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-6">
            <p className="text-gray-700 font-semibold mb-2">{t("obvisit.safety.important")}</p>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• {t("obvisit.safety.1")}</li>
              <li>• {t("obvisit.safety.2")}</li>
              <li>• {t("obvisit.safety.3")}</li>
              <li>• {t("obvisit.safety.4")}</li>
              <li>• {t("obvisit.safety.5")}</li>
              <li>• {t("obvisit.safety.6")}</li>
              <li>• {t("obvisit.safety.7")}</li>
              <li>• {t("obvisit.safety.8")}</li>
            </ul>
          </div>
          <p className="text-gray-700">
            {t("obvisit.safety.desc")}
          </p>
        </div>
      </section>

      {/* OB/OG List Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-600">{t("common.loading")}</p>
            </div>
          ) : (
            <OBOGListContent obogUsers={obogUsers} />
          )}
        </div>
      </section>

      {/* CTA Section */}
      {!isLoggedIn && (
        <section className="py-16 gradient-bg text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">{t("obvisit.cta.title")}</h2>
            <p className="text-xl mb-8 opacity-90">
              {t("obvisit.cta.subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup/student"
                className="btn-secondary px-8 py-3"
              >
                {t("obvisit.cta.signUpStudent")}
              </Link>
              <Link
                href="/signup/obog"
                className="px-8 py-3 bg-white/20 backdrop-blur-sm border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:gradient-text transition-all"
              >
                {t("obvisit.cta.signUpObog")}
              </Link>
            </div>
            <p className="mt-8 text-lg opacity-90">
              {t("obvisit.cta.login")}{" "}
              <Link href="/login" className="underline hover:opacity-80">
                {t("obvisit.cta.loginLink")}
              </Link>
            </p>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="text-white py-12" style={{
        background: 'linear-gradient(135deg, rgba(17, 24, 39, 1) 0%, rgba(31, 41, 55, 1) 100%)',
        borderTop: '2px solid transparent',
        borderImage: 'linear-gradient(135deg, rgba(242, 106, 163, 0.3) 0%, rgba(245, 159, 193, 0.3) 35%, rgba(111, 211, 238, 0.3) 70%, rgba(76, 195, 230, 0.3) 100%) 1'
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-white">{t("common.copyright")}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

