"use client";

import { ReactNode, ButtonHTMLAttributes } from "react";
import Link from "next/link";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "tertiary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  href?: string;
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  loading = false,
  leftIcon,
  rightIcon,
  href,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variantStyles = {
    primary: "bg-accent text-white hover:bg-accent-hover focus:ring-accent-light disabled:bg-gray-300 disabled:cursor-not-allowed",
    secondary: "bg-white text-navy border border-navy hover:bg-navy hover:text-white focus:ring-navy disabled:opacity-50 disabled:cursor-not-allowed",
    tertiary: "bg-transparent text-accent hover:bg-gray-50 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:bg-gray-300 disabled:cursor-not-allowed",
    ghost: "bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed",
  };
  
  const sizeStyles = {
    sm: "px-3 py-1.5 text-sm rounded",
    md: "px-4 py-2 text-sm rounded-md",
    lg: "px-6 py-3 text-base rounded-md",
  };
  
  const widthStyles = fullWidth ? "w-full" : "";
  
  const combinedStyles = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyles} ${className}`;
  
  const content = (
    <>
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {leftIcon && !loading && <span className="mr-2">{leftIcon}</span>}
      {children}
      {rightIcon && <span className="ml-2">{rightIcon}</span>}
    </>
  );
  
  if (href && !disabled) {
    return (
      <Link href={href} className={combinedStyles}>
        {content}
      </Link>
    );
  }
  
  return (
    <button
      className={combinedStyles}
      disabled={disabled || loading}
      style={{
        backgroundColor: variant === "primary" ? "#2563EB" : undefined,
        borderColor: variant === "secondary" ? "#0F2A44" : undefined,
        color: variant === "secondary" ? "#0F2A44" : undefined,
      }}
      {...props}
    >
      {content}
    </button>
  );
}

// Icon Button variant
interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  label: string;
}

export function IconButton({
  icon,
  variant = "ghost",
  size = "md",
  label,
  className = "",
  ...props
}: IconButtonProps) {
  const baseStyles = "inline-flex items-center justify-center rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variantStyles = {
    primary: "bg-accent text-white hover:bg-accent-hover focus:ring-accent-light",
    secondary: "bg-white text-navy border border-navy hover:bg-navy hover:text-white focus:ring-navy",
    ghost: "bg-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus:ring-gray-500",
  };
  
  const sizeStyles = {
    sm: "p-1",
    md: "p-2",
    lg: "p-3",
  };
  
  const combinedStyles = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;
  
  return (
    <button
      className={combinedStyles}
      aria-label={label}
      title={label}
      {...props}
    >
      {icon}
    </button>
  );
}

