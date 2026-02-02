"use client";

import { useSession } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import Link from "next/link";
import CompanyLogo from "@/components/CompanyLogo";
import Avatar from "@/components/Avatar";

interface HistoryItem {
  id: string;
  item_type: "company" | "recruitment" | "obog";
  item_id: string;
  viewed_at: string;
}

export default function BrowsingHistoryPage() {
  const { t } = useLanguage();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [itemsData, setItemsData] = useState<Map<string, any>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated" && session?.user?.role !== "student") {
      router.push("/dashboard");
      return;
    }

    if (status === "authenticated") {
      loadHistory();
    }
  }, [status, session, router]);

  const loadHistory = async () => {
    try {
      const response = await fetch("/api/browsing-history?limit=50");
      if (response.ok) {
        const data = await response.json();
        setHistory(data.history || []);
        
        // Load details for each history item
        const itemsMap = new Map<string, any>();
        
        // Pre-fetch all companies for company lookups
        let companiesMap = new Map<string, any>();
        const hasCompanyItems = (data.history || []).some((item: HistoryItem) => item.item_type === "company");
        if (hasCompanyItems) {
          try {
            const companiesResponse = await fetch("/api/companies");
            if (companiesResponse.ok) {
              const companiesData = await companiesResponse.json();
              (companiesData.companies || []).forEach((company: any) => {
                companiesMap.set(company.id, company);
              });
            }
          } catch (err) {
            console.error("Error loading companies:", err);
          }
        }
        
        for (const item of data.history || []) {
          try {
            if (item.item_type === "company") {
              // Look up company from pre-fetched data
              const company = companiesMap.get(item.item_id);
              if (company) {
                itemsMap.set(`${item.item_type}_${item.item_id}`, company);
              }
            } else if (item.item_type === "recruitment") {
              const recruitmentResponse = await fetch(`/api/internships/${item.item_id}`);
              if (recruitmentResponse.ok) {
                const recruitmentData = await recruitmentResponse.json();
                itemsMap.set(`${item.item_type}_${item.item_id}`, recruitmentData.internship);
              }
            } else if (item.item_type === "obog") {
              const obogResponse = await fetch(`/api/user/${item.item_id}`);
              if (obogResponse.ok) {
                const obogData = await obogResponse.json();
                itemsMap.set(`${item.item_type}_${item.item_id}`, obogData.user);
              }
            }
          } catch (err) {
            console.error(`Error loading ${item.item_type} ${item.item_id}:`, err);
          }
        }
        setItemsData(itemsMap);
      } else {
        setError(t("history.error.load") || "Failed to load browsing history");
      }
    } catch (err: any) {
      console.error("Error loading browsing history:", err);
      setError(err.message || t("history.error.load") || "Failed to load browsing history");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t("history.justNow") || "Just now";
    if (diffMins < 60) return `${diffMins} ${t("history.minutesAgo") || "minutes ago"}`;
    if (diffHours < 24) return `${diffHours} ${t("history.hoursAgo") || "hours ago"}`;
    if (diffDays < 7) return `${diffDays} ${t("history.daysAgo") || "days ago"}`;
    return date.toLocaleDateString();
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p>{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: '#000000' }}>
          {t("history.title") || "Browsing History"}
        </h1>
        <p className="text-gray-600 mb-6">
          {t("history.description") || "Recently viewed companies and recruitments"}
        </p>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {history.length === 0 ? (
          <div className="card-gradient p-8 text-center">
            <p className="text-gray-700 text-lg mb-4">
              {t("history.empty") || "No browsing history yet."}
            </p>
            <p className="text-gray-600 mb-6">
              {t("history.emptyHint") || "Start browsing companies, profiles, and recruitments to see them here."}
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/companies" className="btn-primary">
                {t("history.browseCompanies") || "Browse Companies"}
              </Link>
              <Link href="/ob-list" className="btn-primary">
                {t("history.browseOBOG") || "Browse OB/OG"}
              </Link>
              <Link href="/for-students/internships" className="btn-primary">
                {t("history.browseInternships") || "Browse Internships"}
              </Link>
              <Link href="/for-students/recruiting" className="btn-primary">
                {t("history.browseRecruitments") || "Browse New Grad"}
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((item) => {
              const itemData = itemsData.get(`${item.item_type}_${item.item_id}`);
              if (!itemData) return null;

              // Determine the type badge and link
              const getTypeBadge = () => {
                if (item.item_type === "company") {
                  return { label: t("history.type.company") || "Company", color: "bg-purple-100 text-purple-800" };
                } else if (item.item_type === "obog") {
                  const roleLabel = itemData.role === "corporate_ob" 
                    ? (t("role.corporateOb") || "Corporate OB")
                    : (t("label.obog") || "OB/OG");
                  return { label: roleLabel, color: "bg-green-100 text-green-800" };
                } else if (item.item_type === "recruitment") {
                  const isInternship = itemData.type === "internship";
                  return isInternship
                    ? { label: t("history.type.internship") || "Internship", color: "bg-blue-100 text-blue-800" }
                    : { label: t("history.type.newGrad") || "New Grad", color: "bg-indigo-100 text-indigo-800" };
                }
                return { label: "", color: "" };
              };

              const getDetailLink = () => {
                if (item.item_type === "company") {
                  return `/companies/${item.item_id}`;
                } else if (item.item_type === "obog") {
                  return `/user/${item.item_id}`;
                } else if (item.item_type === "recruitment") {
                  const isInternship = itemData.type === "internship";
                  return isInternship ? `/internships/${item.item_id}` : `/recruiting/${item.item_id}`;
                }
                return "#";
              };

              const typeBadge = getTypeBadge();

              return (
                <Link
                  key={item.id}
                  href={getDetailLink()}
                  className="block card-gradient p-6 hover:shadow-lg transition-all duration-200"
                >
                  <div className="flex items-start gap-4">
                    {item.item_type === "obog" ? (
                      <Avatar
                        src={itemData.profilePhoto}
                        alt={itemData.nickname || itemData.name || "OB/OG"}
                        size="md"
                        fallbackText={itemData.nickname || itemData.name}
                      />
                    ) : (
                      <CompanyLogo
                        src={
                          item.item_type === "company"
                            ? itemData.logo
                            : itemData.companyLogo
                        }
                        alt={
                          item.item_type === "company"
                            ? itemData.companyName
                            : itemData.companyName
                        }
                        size="md"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-semibold text-navy hover:text-navy/80 transition-colors">
                              {item.item_type === "company"
                                ? itemData.companyName
                                : item.item_type === "obog"
                                ? (itemData.nickname || itemData.name)
                                : itemData.title}
                            </h3>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${typeBadge.color}`}>
                              {typeBadge.label}
                            </span>
                          </div>
                          {item.item_type === "recruitment" && (
                            <p className="text-sm text-gray-600">
                              {itemData.companyName}
                            </p>
                          )}
                          {item.item_type === "obog" && itemData.company && (
                            <p className="text-sm text-gray-600">
                              {itemData.company}
                            </p>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatDate(item.viewed_at)}
                        </span>
                      </div>
                      {item.item_type === "company" && (itemData.overview || itemData.oneLineMessage) && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {itemData.overview || itemData.oneLineMessage}
                        </p>
                      )}
                      {item.item_type === "company" && itemData.industry && (
                        <p className="text-xs text-gray-500 mt-1">
                          {t("companies.industry") || "Industry"}: {itemData.industry}
                        </p>
                      )}
                      {item.item_type === "recruitment" && itemData.workDetails && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {itemData.workDetails}
                        </p>
                      )}
                      {item.item_type === "obog" && itemData.oneLineMessage && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {itemData.oneLineMessage}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
