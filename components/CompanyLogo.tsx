"use client";

interface CompanyLogoProps {
  src?: string | null;
  alt: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function CompanyLogo({ 
  src, 
  alt, 
  size = "md", 
  className = ""
}: CompanyLogoProps) {
  // Size classes
  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-16 h-16",
    lg: "w-20 h-20",
  };

  // Placeholder SVG data URI (gradient square with company icon)
  const placeholderSvg = () => {
    const svg = `
      <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="companyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#f26aa3;stop-opacity:1" />
            <stop offset="35%" style="stop-color:#f59fc1;stop-opacity:1" />
            <stop offset="70%" style="stop-color:#6fd3ee;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#4cc3e6;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="100" height="100" rx="8" fill="url(#companyGradient)"/>
        <path d="M30 30 L50 20 L70 30 L70 50 L50 60 L30 50 Z" fill="white" opacity="0.9"/>
        <circle cx="50" cy="40" r="8" fill="white" opacity="0.9"/>
      </svg>
    `;
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  };

  return (
    <div className={`${sizeClasses[size]} flex items-center justify-center flex-shrink-0 overflow-hidden ${className}`}>
      {src ? (
        <img 
          src={src} 
          alt={alt} 
          className="w-full h-full object-contain rounded"
          onError={(e) => {
            // Fallback to placeholder if image fails to load
            const target = e.target as HTMLImageElement;
            target.src = placeholderSvg();
          }}
        />
      ) : (
        <img 
          src={placeholderSvg()} 
          alt={alt}
          className="w-full h-full object-contain rounded"
        />
      )}
    </div>
  );
}

