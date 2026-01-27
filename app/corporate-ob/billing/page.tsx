"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import SidebarLayout from "@/components/SidebarLayout";

interface Charge {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  recipient: {
    name: string;
    email: string;
  } | null;
}

interface MonthlyTotal {
  total: number;
  count: number;
}

export default function BillingHistoryPage() {
  const { t } = useLanguage();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [charges, setCharges] = useState<Charge[]>([]);
  const [monthlyTotals, setMonthlyTotals] = useState<Record<string, MonthlyTotal>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);

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
      loadBillingHistory();
    }
  }, [status, router, session, page]);

  const loadBillingHistory = async () => {
    try {
      const response = await fetch(`/api/billing/history?page=${page}&limit=20`);
      if (response.ok) {
        const data = await response.json();
        setCharges(data.charges || []);
        setMonthlyTotals(data.monthlyTotals || {});
        setPagination(data.pagination);
      } else {
        const data = await response.json();
        setError(data.error || "Failed to load billing history");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load billing history");
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
          {t("corporateOb.billingHistory")}
        </h1>
        <p className="text-sm" style={{ color: '#6B7280' }}>
          {t("corporateOb.billingHistory.subtitle") || "View your message charges and billing history"}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
          {error}
        </div>
      )}

      {/* Monthly Summary */}
      {Object.keys(monthlyTotals).length > 0 && (
        <div className="card-gradient p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4" style={{ color: '#111827' }}>
            {t("corporateOb.billingHistory.monthlySummary") || "Monthly Summary"}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(monthlyTotals)
              .sort(([a], [b]) => b.localeCompare(a))
              .slice(0, 6)
              .map(([month, totals]) => (
                <div
                  key={month}
                  className="p-4 border rounded"
                  style={{ borderColor: '#E5E7EB', borderRadius: '6px' }}
                >
                  <p className="text-sm font-semibold mb-2" style={{ color: '#111827' }}>
                    {new Date(month + "-01").toLocaleDateString("en-US", { year: "numeric", month: "long" })}
                  </p>
                  <p className="text-2xl font-bold mb-1" style={{ color: '#111827' }}>
                    ¥{totals.total.toLocaleString()}
                  </p>
                  <p className="text-sm" style={{ color: '#6B7280' }}>
                    {totals.count} {t("corporateOb.messageCount")}
                  </p>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Charges Table */}
      <div className="card-gradient p-6">
        <h2 className="text-lg font-semibold mb-4" style={{ color: '#111827' }}>
          {t("corporateOb.charges")}
        </h2>
        {charges.length === 0 ? (
          <p className="text-sm" style={{ color: '#6B7280' }}>
            {t("corporateOb.billingHistory.noCharges") || "No charges yet"}
          </p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y" style={{ borderColor: '#E5E7EB' }}>
                <thead style={{ backgroundColor: '#D7FFEF' }}>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase" style={{ color: '#6B7280' }}>
                      {t("corporateOb.billingHistory.date") || "Date"}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase" style={{ color: '#6B7280' }}>
                      {t("corporateOb.billingHistory.amount") || "Amount"}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase" style={{ color: '#6B7280' }}>
                      {t("corporateOb.billingHistory.recipient") || "Recipient"}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase" style={{ color: '#6B7280' }}>
                      {t("corporateOb.billingHistory.status") || "Status"}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y" style={{ borderColor: '#E5E7EB' }}>
                  {charges.map((charge) => (
                    <tr key={charge.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm" style={{ color: '#111827' }}>
                        {new Date(charge.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold" style={{ color: '#111827' }}>
                        ¥{charge.amount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: '#6B7280' }}>
                        {charge.recipient ? (
                          <div>
                            <p className="font-medium" style={{ color: '#111827' }}>
                              {charge.recipient.name}
                            </p>
                            <p className="text-xs">{charge.recipient.email}</p>
                          </div>
                        ) : (
                          <span className="text-xs">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded ${
                            charge.status === "succeeded"
                              ? "bg-green-100 text-green-800"
                              : charge.status === "failed"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {charge.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
                  style={{ borderColor: '#D1D5DB', borderRadius: '6px' }}
                >
                  {t("button.previous") || "Previous"}
                </button>
                <span className="text-sm" style={{ color: '#6B7280' }}>
                  {t("common.page") || "Page"} {page} {t("common.of") || "of"} {pagination.totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                  disabled={page === pagination.totalPages}
                  className="px-4 py-2 border rounded disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
                  style={{ borderColor: '#D1D5DB', borderRadius: '6px' }}
                >
                  {t("button.next") || "Next"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </SidebarLayout>
  );
}
