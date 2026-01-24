"use client";

import { useSession } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import Header from "@/components/Header";

export default function CompanyInquiryPage() {
  const { t } = useLanguage();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [formData, setFormData] = useState({
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      // TODO: Send inquiry to API
      // const response = await fetch("/api/company/inquiry", { ... });
      setSuccess(true);
      setFormData({ subject: "", message: "" });
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || t("common.error"));
    } finally {
      setLoading(false);
    }
  }, []);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p>{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-6" style={{ color: '#000000' }}>{t("company.inquiry.title")}</h1>
        <p className="text-gray-600 mb-8">
          {t("company.inquiry.subtitle")}
        </p>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            {t("company.inquiry.success")}
          </div>
        )}

        <div className="card-gradient p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                {t("company.inquiry.subject")} *
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                required
                value={formData.subject}
                onChange={handleChange}
                placeholder={t("company.inquiry.subjectPlaceholder")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                style={{ color: '#000000' }}
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                {t("company.inquiry.message")} *
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={8}
                value={formData.message}
                onChange={handleChange}
                placeholder={t("company.inquiry.messagePlaceholder")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                style={{ color: '#000000' }}
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? t("company.inquiry.sending") : t("company.inquiry.send")}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="btn-secondary"
              >
                {t("button.cancel")}
              </button>
            </div>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-2">{t("company.inquiry.contactDirect")}</p>
            <a
              href="mailto:info@senpaicareer.com"
              className="link-gradient font-semibold"
            >
              info@senpaicareer.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

