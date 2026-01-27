"use client";

import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslated } from "@/lib/translation-helpers";
import Link from "next/link";
import Avatar from "./Avatar";
import CorporateOBBadge from "./CorporateOBBadge";

interface Company {
  id: string;
  name: string;
  logoUrl?: string;
  industry?: string;
  description?: string;
  website?: string;
  obCount?: number;
}

interface CorporateOBUser {
  id: string;
  userId: string;
  companyId: string;
  isVerified: boolean;
  user?: any;
}

interface CompanyDetailContentProps {
  company: Company;
  corporateOBs: CorporateOBUser[];
}

export default function CompanyDetailContent({ company, corporateOBs }: CompanyDetailContentProps) {
  const { t } = useLanguage();
  const { translate } = useTranslated();

  return (
    <div className="card-gradient p-8">
      {/* Company Header */}
      <div className="flex items-start mb-6">
        {company.logoUrl ? (
          <img
            src={company.logoUrl}
            alt={company.name}
            className="w-24 h-24 object-contain rounded mr-8"
          />
        ) : (
          <div className="w-24 h-24 bg-gray-200 rounded mr-8 flex items-center justify-center">
            <span className="text-2xl font-bold text-gray-400">
              {company.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#111827' }}>
            {company.name}
          </h1>
          {company.industry && (
            <p className="text-lg mb-2" style={{ color: '#6B7280' }}>
              {t("companies.industry")}: {company.industry}
            </p>
          )}
          {company.obCount !== undefined && (
            <p className="text-lg mb-2" style={{ color: '#6B7280' }}>
              {company.obCount} {t("companies.obCount")}
            </p>
          )}
          {company.website && (
            <a
              href={company.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline"
            >
              {company.website}
            </a>
          )}
        </div>
      </div>

      {/* Company Description */}
      {company.description && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2" style={{ color: '#111827' }}>
            {t("companies.about") || "About"}
          </h2>
          <p className="text-gray-700 whitespace-pre-wrap">{translate(company.description)}</p>
        </div>
      )}

      {/* Affiliated Corporate OBs */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4" style={{ color: '#111827' }}>
          {t("companies.affiliatedOBs") || "Affiliated Corporate OBs"}
        </h2>
        {corporateOBs.length === 0 ? (
          <p className="text-gray-600">{t("companies.noOBs") || "No Corporate OBs registered for this company yet."}</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {corporateOBs.map((ob) => (
              <Link
                key={ob.id}
                href={`/user/${ob.userId}`}
                className="p-4 bg-white border rounded hover:shadow-md transition-shadow"
                style={{ borderColor: '#E5E7EB', borderRadius: '6px' }}
              >
                <div className="flex items-center gap-4">
                  <Avatar
                    src={ob.user?.profilePhoto}
                    alt={ob.user?.name || "Corporate OB"}
                    size="md"
                    fallbackText={ob.user?.name}
                    className="shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h3 className="text-base font-semibold truncate" style={{ color: '#111827' }}>
                        {ob.user?.name || "Corporate OB"}
                      </h3>
                      <CorporateOBBadge
                        companyName={company.name}
                        companyLogo={company.logoUrl}
                        isVerified={ob.isVerified}
                        size="sm"
                      />
                    </div>
                    {ob.user?.company && (
                      <p className="text-sm truncate" style={{ color: '#6B7280' }}>
                        {ob.user.company}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
