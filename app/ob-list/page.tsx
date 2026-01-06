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
      <section className="py-16" style={{ backgroundColor: '#F5F7FA' }}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-6" style={{ color: '#111827' }}>
            {t("obvisit.hero.title")}
          </h1>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: '#6B7280' }}>
            {t("obvisit.hero.subtitle")}
          </p>
        </div>
      </section>

      {/* Safety Rules */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold mb-8" style={{ color: '#111827' }}>{t("obvisit.safety.title")}</h2>
          <div 
            className="p-6 mb-6 border-l-4"
            style={{ backgroundColor: '#FEF3C7', borderLeftColor: '#F59E0B' }}
          >
            <p className="font-semibold mb-2" style={{ color: '#374151' }}>{t("obvisit.safety.important")}</p>
            <ul className="space-y-2 text-sm" style={{ color: '#374151' }}>
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
          <p style={{ color: '#6B7280' }}>
            {t("obvisit.safety.desc")}
          </p>
        </div>
      </section>

      {/* OB/OG List Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="text-center py-12">
              <p style={{ color: '#6B7280' }}>{t("common.loading")}</p>
            </div>
          ) : (
            <OBOGListContent obogUsers={obogUsers} />
          )}
        </div>
      </section>

      {/* CTA Section */}
      {!isLoggedIn && (
        <section className="py-16 text-white" style={{ backgroundColor: '#0F2A44' }}>
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-bold mb-4">{t("obvisit.cta.title")}</h2>
            <p className="text-lg mb-8 opacity-90">
              {t("obvisit.cta.subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup/student"
                className="btn-primary px-8 py-3"
              >
                {t("obvisit.cta.signUpStudent")}
              </Link>
              <Link
                href="/signup/obog"
                className="px-8 py-3 bg-white/20 backdrop-blur-sm border-2 border-white text-white rounded font-semibold hover:bg-white hover:text-gray-900 transition-all"
                style={{ borderRadius: '6px' }}
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
      <footer className="text-white py-12" style={{ backgroundColor: '#111827' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-white">{t("common.copyright")}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
