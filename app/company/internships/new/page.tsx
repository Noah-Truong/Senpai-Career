"use client";

import { useSession } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function NewInternshipPage() {
  const { t } = useLanguage();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    type: "internship" as "internship" | "new-grad",
    title: "",
    compensationType: "hourly" as "hourly" | "fixed" | "other",
    hourlyWage: "",
    fixedSalary: "",
    otherCompensation: "",
    workDetails: "",
    skillsGained: "",
    whyThisCompany: "",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated" && session?.user?.role !== "company") {
      router.push("/dashboard");
      return;
    }
  }, [status, session, router]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setSaving(true);

    try {
      // Parse skillsGained (comma-separated)
      const skillsGained = formData.skillsGained
        .split(",")
        .map(s => s.trim())
        .filter(s => s.length > 0);

      // Prepare compensation data based on type
      let compensationData: any = {
        compensationType: formData.compensationType,
      };

      if (formData.compensationType === "hourly") {
        const wage = Number(formData.hourlyWage);
        if (formData.hourlyWage !== "" && !Number.isNaN(wage)) {
          compensationData.hourlyWage = Math.round(wage);
        }
      } else if (formData.compensationType === "fixed") {
        const salary = Number(formData.fixedSalary);
        if (formData.fixedSalary !== "" && !Number.isNaN(salary)) {
          compensationData.fixedSalary = Math.round(salary);
        }
      } else if (formData.compensationType === "other") {
        compensationData.otherCompensation = formData.otherCompensation;
      }

      const response = await fetch("/api/internships", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          ...compensationData,
          skillsGained,
        }),
      });

      if (!response.ok) {
        // Check if response is JSON before parsing
        const contentType = response.headers.get("content-type");
        const isJson = contentType && contentType.includes("application/json");
        
        let errorMessage = t("company.internship.error.createFailed");
        
        if (isJson) {
          try {
            const text = await response.text();
            const trimmedText = text.trim();
            
            if (trimmedText.startsWith("{") || trimmedText.startsWith("[")) {
              const data = JSON.parse(text);
              errorMessage = data.error || errorMessage;
            }
          } catch (jsonError) {
            // If parsing fails, use default error message
          }
        }
        
        throw new Error(errorMessage);
      }

      setSuccess(true);
      // Keep loading animation until redirect
      setTimeout(() => {
        router.push("/company/internships");
      }, 1500);
      // Don't set saving to false - keep animation until redirect
    } catch (err: any) {
      setError(err.message || t("common.error"));
      setSaving(false); // Only stop loading on error
    }
  }, [formData, router, t]);

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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#000000' }}>
            {t("company.internship.newTitle")}
          </h1>
          <p className="text-gray-600">
            {t("company.internship.newSubtitle")}
          </p>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            {t("company.internship.createdSuccess")}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="card-gradient p-6">
            <h2 className="text-xl font-semibold mb-4" style={{ color: '#000000' }}>{t("company.internship.listingType")}</h2>
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                {t("company.internship.type")} *
              </label>
              <select
                id="type"
                name="type"
                required
                value={formData.type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                style={{ color: '#000000' }}
              >
                <option value="internship">{t("company.internship.type.internship")}</option>
                <option value="new-grad">{t("company.internship.type.newGrad")}</option>
              </select>
            </div>
          </div>

          <div className="card-gradient p-6">
            <h2 className="text-xl font-semibold mb-4" style={{ color: '#000000' }}>{t("company.internship.basicInfo")}</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  {t("company.internship.positionTitle")} *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  placeholder={t("company.internship.positionTitlePlaceholder")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  style={{ color: '#000000' }}
                />
              </div>

              <div>
                <label htmlFor="compensationType" className="block text-sm font-medium text-gray-700 mb-2">
                  {t("form.compensationType")} *
                </label>
                <select
                  id="compensationType"
                  name="compensationType"
                  required
                  value={formData.compensationType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 mb-4"
                  style={{ color: '#000000' }}
                >
                  <option value="hourly">{t("form.compensationHourly")}</option>
                  <option value="fixed">{t("form.compensationFixed")}</option>
                  <option value="other">{t("form.compensationOther")}</option>
                </select>

                {formData.compensationType === "hourly" && (
                  <div>
                    <label htmlFor="hourlyWage" className="block text-sm font-medium text-gray-700 mb-2">
                      {t("form.hourlyWage")} *
                    </label>
                    <input
                      type="number"
                      id="hourlyWage"
                      name="hourlyWage"
                      required
                      min="0"
                      step="1"
                      value={formData.hourlyWage}
                      onChange={handleChange}
                      placeholder="1500"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      style={{ color: '#000000' }}
                    />
                  </div>
                )}

                {formData.compensationType === "fixed" && (
                  <div>
                    <label htmlFor="fixedSalary" className="block text-sm font-medium text-gray-700 mb-2">
                      {t("form.fixedSalary")} *
                    </label>
                    <input
                      type="number"
                      id="fixedSalary"
                      name="fixedSalary"
                      required
                      min="0"
                      step="10000"
                      value={formData.fixedSalary}
                      onChange={handleChange}
                      placeholder="3000000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      style={{ color: '#000000' }}
                    />
                  </div>
                )}

                {formData.compensationType === "other" && (
                  <div>
                    <label htmlFor="otherCompensation" className="block text-sm font-medium text-gray-700 mb-2">
                      {t("form.otherCompensation")} *
                    </label>
                    <textarea
                      id="otherCompensation"
                      name="otherCompensation"
                      required
                      rows={3}
                      value={formData.otherCompensation}
                      onChange={handleChange}
                      placeholder={t("company.internship.otherCompensationPlaceholder")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      style={{ color: '#000000' }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="card-gradient p-6">
            <h2 className="text-xl font-semibold mb-4" style={{ color: '#000000' }}>{t("company.internship.positionDetails")}</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="workDetails" className="block text-sm font-medium text-gray-700 mb-2">
                  {t("company.internship.workDetails")} *
                </label>
                <textarea
                  id="workDetails"
                  name="workDetails"
                  required
                  rows={5}
                  value={formData.workDetails}
                  onChange={handleChange}
                  placeholder={t("company.internship.workDetailsPlaceholder")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  style={{ color: '#000000' }}
                />
              </div>

              <div>
                <label htmlFor="skillsGained" className="block text-sm font-medium text-gray-700 mb-2">
                  {t("company.internship.skillsGained")}
                </label>
                <input
                  type="text"
                  id="skillsGained"
                  name="skillsGained"
                  value={formData.skillsGained}
                  onChange={handleChange}
                  placeholder={t("company.internship.skillsGainedPlaceholder")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  style={{ color: '#000000' }}
                />
                <p className="text-xs text-gray-500 mt-1">{t("company.internship.skillsGainedHint")}</p>
              </div>

              <div>
                <label htmlFor="whyThisCompany" className="block text-sm font-medium text-gray-700 mb-2">
                  {t("listing.whyThisCompany")}
                </label>
                <textarea
                  id="whyThisCompany"
                  name="whyThisCompany"
                  rows={4}
                  value={formData.whyThisCompany}
                  onChange={handleChange}
                  placeholder={t("company.internship.whyThisCompanyPlaceholder")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  style={{ color: '#000000' }}
                />
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>{t("common.submitting")}</span>
                </>
              ) : (
                t("company.internship.createListing")
              )}
            </button>
            <button
              type="button"
              onClick={() => router.push("/company/internships")}
              className="btn-secondary"
              disabled={saving}
            >
              {t("button.cancel")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

