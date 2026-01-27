"use client";

import { useLanguage } from "@/contexts/LanguageContext";

interface CorporateOBBadgeProps {
  companyName?: string;
  companyLogo?: string;
  isVerified?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function CorporateOBBadge({
  companyName,
  companyLogo,
  isVerified = false,
  size = "md",
  className = "",
}: CorporateOBBadgeProps) {
  const { t } = useLanguage();

  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  const textSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {companyLogo ? (
        <img
          src={companyLogo}
          alt={companyName || "Company"}
          className={`${sizeClasses[size]} object-contain rounded`}
        />
      ) : (
        <img
          src="/assets/corporateOB.png"
          alt="Corporate OB"
          className={`${sizeClasses[size]} object-contain`}
        />
      )}
      <div className="flex items-center gap-1">
        <span className={`${textSizes[size]} font-semibold`} style={{ color: '#0F2A44' }}>
          {t("corporateOb.badge") || "Corporate OB"}
        </span>
        {isVerified && (
          <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        )}
      </div>
    </div>
  );
}
