"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import SidebarLayout from "@/components/SidebarLayout";
import Link from "next/link";

export default function CorporateOBDashboardPage() {
  const { t } = useLanguage();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [corporateOBInfo, setCorporateOBInfo] = useState<any>(null);
  const [billingStats, setBillingStats] = useState<any>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      if (session?.user?.role !== "corporate_ob") {
        router.push("/");
        return;
      }
      loadDashboardData();
    }
  }, [status, router, session]);

  const loadDashboardData = async () => {
    try {
      // Load Corporate OB info
      const infoResponse = await fetch(`/api/corporate-ob/info?userId=${session?.user?.id}`);
      if (infoResponse.ok) {
        const infoData = await infoResponse.json();
        setCorporateOBInfo(infoData);
      }

      // Load billing stats (current month)
      const billingResponse = await fetch("/api/billing/history?page=1&limit=100");
      if (billingResponse.ok) {
        const billingData = await billingResponse.json();
        const currentMonth = new Date().toISOString().substring(0, 7);
        const currentMonthTotal = billingData.monthlyTotals?.[currentMonth] || { total: 0, count: 0 };
        setBillingStats(currentMonthTotal);
      }
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <SidebarLayout role="corporate_ob">
        <div className="flex items-center justify-center h-64">
          <p style={{ color: '#6B7280' }}>{t("common.loading")}</p>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout role="corporate_ob">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2" style={{ color: '#111827' }}>
          {t("corporateOb.dashboard.title") || "Corporate OB Dashboard"}
        </h1>
        <p className="text-sm" style={{ color: '#6B7280' }}>
          {t("corporateOb.dashboard.subtitle") || "Manage your Corporate OB account and billing"}
        </p>
      </div>

      {/* Company Info */}
      {corporateOBInfo?.company && (
        <div className="card-gradient p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4" style={{ color: '#111827' }}>
            {t("corporateOb.dashboard.companyInfo") || "Company Information"}
          </h2>
          <div className="flex items-start gap-4">
            {corporateOBInfo.company.logoUrl && (
              <img
                src={corporateOBInfo.company.logoUrl}
                alt={corporateOBInfo.company.name}
                className="w-16 h-16 object-contain rounded"
              />
            )}
            <div>
              <h3 className="text-lg font-semibold" style={{ color: '#111827' }}>
                {corporateOBInfo.company.name}
              </h3>
              {corporateOBInfo.company.industry && (
                <p className="text-sm" style={{ color: '#6B7280' }}>
                  {t("companies.industry")}: {corporateOBInfo.company.industry}
                </p>
              )}
              {corporateOBInfo.isVerified && (
                <span className="inline-block mt-2 px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-800">
                  {t("corporateOb.verified")}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Billing Widget */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="card-gradient p-6">
          <h2 className="text-lg font-semibold mb-4" style={{ color: '#111827' }}>
            {t("corporateOb.monthlyTotal")}
          </h2>
          <p className="text-3xl font-bold mb-2" style={{ color: '#111827' }}>
            ¥{billingStats?.total?.toLocaleString() || 0}
          </p>
          <p className="text-sm" style={{ color: '#6B7280' }}>
            {t("corporateOb.messageCount")}: {billingStats?.count || 0}
          </p>
        </div>
        <div className="card-gradient p-6">
          <h2 className="text-lg font-semibold mb-4" style={{ color: '#111827' }}>
            {t("corporateOb.paymentMethods")}
          </h2>
          <Link
            href="/corporate-ob/billing/payment-methods"
            className="btn-primary inline-block"
          >
            {t("corporateOb.managePaymentMethods") || "Manage Payment Methods"}
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card-gradient p-6">
        <h2 className="text-lg font-semibold mb-4" style={{ color: '#111827' }}>
          {t("corporateOb.dashboard.quickActions") || "Quick Actions"}
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            href="/messages"
            className="p-4 border rounded hover:shadow-md transition-shadow"
            style={{ borderColor: '#E5E7EB', borderRadius: '6px' }}
          >
            <h3 className="font-semibold mb-2" style={{ color: '#111827' }}>
              {t("nav.messages")}
            </h3>
            <p className="text-sm" style={{ color: '#6B7280' }}>
              {t("corporateOb.dashboard.sendMessages") || "Send messages to students"}
            </p>
          </Link>
          <Link
            href="/corporate-ob/billing"
            className="p-4 border rounded hover:shadow-md transition-shadow"
            style={{ borderColor: '#E5E7EB', borderRadius: '6px' }}
          >
            <h3 className="font-semibold mb-2" style={{ color: '#111827' }}>
              {t("corporateOb.billingHistory")}
            </h3>
            <p className="text-sm" style={{ color: '#6B7280' }}>
              {t("corporateOb.dashboard.viewBilling") || "View billing history"}
            </p>
          </Link>
          <Link
            href="/profile"
            className="p-4 border rounded hover:shadow-md transition-shadow"
            style={{ borderColor: '#E5E7EB', borderRadius: '6px' }}
          >
            <h3 className="font-semibold mb-2" style={{ color: '#111827' }}>
              {t("nav.profile")}
            </h3>
            <p className="text-sm" style={{ color: '#6B7280' }}>
              {t("corporateOb.dashboard.editProfile") || "Edit your profile"}
            </p>
          </Link>
        </div>
      </div>
    </SidebarLayout>
  );
}
