"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslated } from "@/lib/translation-helpers";
import Avatar from "./Avatar";
import { cardVariants } from "@/lib/animations";

interface Company {
  id: string;
  name?: string;
  companyName: string;
  logo?: string;
  profilePhoto?: string;
  overview?: string;
  workLocation?: string;
  hourlyWage?: number;
  weeklyHours?: number;
  oneLineMessage?: string;
  industry?: string;
  sellingPoints?: string;
  obCount?: number;
}

interface CompanyCardProps {
  company: Company;
  index?: number;
}

export default function CompanyCard({ company, index = 0 }: CompanyCardProps) {
  const { t } = useLanguage();
  const { translate } = useTranslated();

  return (
    <Link
      href={`/companies/${company.id}`}
      className="block"
    >
      <motion.div
        className="p-6 bg-white border rounded hover:shadow-md transition-all duration-300 h-full cursor-pointer"
        style={{ borderColor: '#E5E7EB', borderRadius: '6px' }}
        variants={cardVariants}
        whileHover="hover"
        initial="initial"
        animate="animate"
        transition={{ delay: index * 0.05 }}
      >
        <div className="flex items-start mb-4">
          <Avatar
            src={company.logo || company.profilePhoto}
            alt={company.companyName}
            size="lg"
            fallbackText={company.companyName}
            className="mr-6"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <h3 className="text-lg font-semibold" style={{ color: '#111827' }}>
                {company.companyName}
              </h3>
              {company.obCount !== undefined && (
                <span className="px-2 py-1 text-xs font-semibold rounded bg-indigo-100 text-indigo-800">
                  {company.obCount} {t("companies.obCount") || "Corporate OBs"}
                </span>
              )}
            </div>
            {company.industry && (
              <p className="text-xs mb-1" style={{ color: '#6B7280' }}>
                {t("companies.industry") || "Industry"}: {company.industry}
              </p>
            )}
            {company.oneLineMessage && (
              <p className="text-sm mb-2" style={{ color: '#6B7280' }}>
                {translate(company.oneLineMessage)}
              </p>
            )}
          </div>
        </div>

        {company.overview && (
          <div className="mb-4">
            <p className="text-sm line-clamp-3" style={{ color: '#374151' }}>
              {translate(company.overview)}
            </p>
          </div>
        )}

        <div className="space-y-2 mb-4">
          {company.workLocation && (
            <p className="text-sm" style={{ color: '#6B7280' }}>
              <span className="font-semibold" style={{ color: '#374151' }}>
                {t("companies.workLocation") || "Location"}:
              </span> {company.workLocation}
            </p>
          )}
          {(company.hourlyWage !== undefined && company.hourlyWage !== null) && (
            <p className="text-sm" style={{ color: '#6B7280' }}>
              <span className="font-semibold" style={{ color: '#374151' }}>
                {t("companies.hourlyWage") || "Hourly Wage"}:
              </span> ¥{Number(company.hourlyWage).toLocaleString()}
            </p>
          )}
          {(company.weeklyHours !== undefined && company.weeklyHours !== null) && (
            <p className="text-sm" style={{ color: '#6B7280' }}>
              <span className="font-semibold" style={{ color: '#374151' }}>
                {t("companies.weeklyHours") || "Weekly Hours"}:
              </span> {company.weeklyHours}
            </p>
          )}
        </div>

        {company.sellingPoints && (
          <div>
            <p className="text-xs font-semibold mb-1" style={{ color: '#374151' }}>
              {t("companies.sellingPoints") || "Selling Points"}:
            </p>
            <p className="text-sm line-clamp-2" style={{ color: '#6B7280' }}>
              {translate(company.sellingPoints)}
            </p>
          </div>
        )}
      </motion.div>
    </Link>
  );
}
