"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { avatarVariants } from "@/lib/animations";

interface AvatarProps {
  src?: string | null;
  alt: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  fallbackText?: string;
}

export default function Avatar({ 
  src, 
  alt, 
  size = "md", 
  className = "",
  fallbackText 
}: AvatarProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Size classes
  const sizeClasses = {
    sm: "w-8 h-8 text-sm",
    md: "w-12 h-12 text-base",
    lg: "w-16 h-16 text-xl",
    xl: "w-24 h-24 text-4xl",
  };

  // Get first letter for fallback
  const getInitial = () => {
    if (fallbackText) {
      return fallbackText.charAt(0).toUpperCase();
    }
    if (alt) {
      return alt.charAt(0).toUpperCase();
    }
    return "?";
  };

  // Placeholder SVG data URI (gradient circle with initial)
  const placeholderSvg = (initial: string) => {
    const svg = `
      <svg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="avatarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#f26aa3;stop-opacity:1" />
            <stop offset="35%" style="stop-color:#f59fc1;stop-opacity:1" />
            <stop offset="70%" style="stop-color:#6fd3ee;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#4cc3e6;stop-opacity:1" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="50" fill="url(#avatarGradient)"/>
        <text x="50" y="50" font-family="Arial, sans-serif" font-size="40" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="central">${initial}</text>
      </svg>
    `;
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  };

  // Check if src is valid (not empty, not undefined, not null)
  const hasValidSrc = src && src.trim() !== "" && !imageError;

  return (
    <motion.div 
      className={`${sizeClasses[size]} rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 overflow-hidden ${className}`}
      variants={avatarVariants}
      initial="initial"
      animate="animate"
      whileHover={{ scale: 1.1 }}
      transition={{ type: "spring", stiffness: 200, damping: 15 }}
    >
      {hasValidSrc ? (
        <motion.img 
          src={src} 
          alt={alt} 
          className="w-full h-full rounded-full object-cover"
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            console.error("Avatar image failed to load:", src);
            setImageError(true);
          }}
          style={{ display: imageLoaded ? 'block' : 'none' }}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        />
      ) : null}
      {/* Show placeholder while loading or on error */}
      {(!hasValidSrc || !imageLoaded) && (
        <motion.img 
          src={placeholderSvg(getInitial())} 
          alt={alt}
          className="w-full h-full rounded-full object-cover"
          style={{ display: hasValidSrc && imageLoaded ? 'none' : 'block' }}
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        />
      )}
    </motion.div>
  );
}

