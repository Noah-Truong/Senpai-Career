"use client";

import { useSession } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import Link from "next/link";
import CompanyLogo from "@/components/CompanyLogo";
import SaveButton from "@/components/SaveButton";

interface SavedItem {
  id: string;
  item_type: "company" | "recruitment";
  item_id: string;
  created_at: string;
}

export default function SavedItemsPage() {
  const { t } = useLanguage();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
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
      loadSavedItems();
    }
  }, [status, session, router]);

  const loadSavedItems = async () => {
    try {
      const response = await fetch("/api/saved-items");
      if (response.ok) {
        const data = await response.json();
        setSavedItems(data.savedItems || []);
        
        // Load details for each saved item
        const itemsMap = new Map<string, any>();
        for (const item of data.savedItems || []) {
          try {
            if (item.item_type === "company") {
              const companyResponse = await fetch(`/api/user/${item.item_id}`);
              if (companyResponse.ok) {
                const companyData = await companyResponse.json();
                itemsMap.set(`${item.item_type}_${item.item_id}`, companyData.user);
              }
            } else if (item.item_type === "recruitment") {
              const recruitmentResponse = await fetch(`/api/internships/${item.item_id}`);
              if (recruitmentResponse.ok) {
                const recruitmentData = await recruitmentResponse.json();
                itemsMap.set(`${item.item_type}_${item.item_id}`, recruitmentData.internship);
              }
            }
          } catch (err) {
            console.error(`Error loading ${item.item_type} ${item.item_id}:`, err);
          }
        }
        setItemsData(itemsMap);
      } else {
        setError(t("saved.error.load") || "Failed to load saved items");
      }
    } catch (err: any) {
      console.error("Error loading saved items:", err);
      setError(err.message || t("saved.error.load") || "Failed to load saved items");
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = async (itemType: string, itemId: string) => {
    try {
      const response = await fetch(
        `/api/saved-items?itemType=${itemType}&itemId=${itemId}`,
        { method: "DELETE" }
      );

      if (response.ok) {
        // Reload saved items
        loadSavedItems();
      }
    } catch (err) {
      console.error("Error unsaving item:", err);
    }
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

  const companies = savedItems.filter((item) => item.item_type === "company");
  const recruitments = savedItems.filter((item) => item.item_type === "recruitment");

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: '#000000' }}>
          {t("saved.title") || "Saved Items"}
        </h1>
        <p className="text-gray-600 mb-6">
          {t("saved.description") || "Your saved companies and recruitments"}
        </p>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {savedItems.length === 0 ? (
          <div className="card-gradient p-8 text-center">
            <p className="text-gray-700 text-lg mb-4">
              {t("saved.empty") || "You haven't saved any items yet."}
            </p>
            <p className="text-gray-600 mb-6">
              {t("saved.emptyHint") || "Browse companies and recruitments and click the save button to add them here."}
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/companies" className="btn-primary">
                {t("saved.browseCompanies") || "Browse Companies"}
              </Link>
              <Link href="/for-students/recruiting" className="btn-primary">
                {t("saved.browseRecruitments") || "Browse Recruitments"}
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Saved Companies */}
            {companies.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold mb-4" style={{ color: '#111827' }}>
                  {t("saved.companies") || "Saved Companies"}
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {companies.map((item) => {
                    const company = itemsData.get(`${item.item_type}_${item.item_id}`);
                    if (!company) return null;

                    return (
                      <div
                        key={item.id}
                        className="card-gradient p-6 hover:shadow-xl transition-all duration-300"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <CompanyLogo
                            src={company.logo}
                            alt={company.companyName}
                            size="md"
                            className="mr-4"
                          />
                          <SaveButton
                            itemType="company"
                            itemId={item.item_id}
                            className="flex-shrink-0"
                          />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">
                          {company.companyName}
                        </h3>
                        {company.oneLineMessage && (
                          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                            {company.oneLineMessage}
                          </p>
                        )}
                        <Link
                          href={`/user/${item.item_id}`}
                          className="btn-primary w-full text-center"
                        >
                          {t("button.viewDetails") || "View Details"}
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Saved Recruitments */}
            {recruitments.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold mb-4" style={{ color: '#111827' }}>
                  {t("saved.recruitments") || "Saved Recruitments"}
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recruitments.map((item) => {
                    const recruitment = itemsData.get(`${item.item_type}_${item.item_id}`);
                    if (!recruitment) return null;

                    return (
                      <div
                        key={item.id}
                        className="card-gradient p-6 hover:shadow-xl transition-all duration-300"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <CompanyLogo
                            src={recruitment.companyLogo}
                            alt={recruitment.companyName}
                            size="md"
                            className="mr-4"
                          />
                          <SaveButton
                            itemType="recruitment"
                            itemId={item.item_id}
                            className="flex-shrink-0"
                          />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">
                          {recruitment.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {recruitment.companyName}
                        </p>
                        {recruitment.workDetails && (
                          <p className="text-sm text-gray-700 mb-4 line-clamp-2">
                            {recruitment.workDetails}
                          </p>
                        )}
                        <Link
                          href={`/recruiting/${item.item_id}`}
                          className="btn-primary w-full text-center"
                        >
                          {t("button.viewDetails") || "View Details"}
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
