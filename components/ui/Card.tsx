"use client";

import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "muted" | "outlined";
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
  onClick?: () => void;
}

export default function Card({
  children,
  className = "",
  variant = "default",
  padding = "md",
  hover = false,
  onClick,
}: CardProps) {
  const baseStyles = "rounded transition-all";
  
  const variantStyles = {
    default: "bg-white border border-gray-200 shadow-sm",
    muted: "bg-gray-50 border border-gray-200",
    outlined: "bg-white border border-gray-300",
  };
  
  const paddingStyles = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };
  
  const hoverStyles = hover ? "cursor-pointer hover:shadow-md hover:border-gray-300" : "";
  
  const combinedStyles = `${baseStyles} ${variantStyles[variant]} ${paddingStyles[padding]} ${hoverStyles} ${className}`;
  
  if (onClick) {
    return (
      <div className={combinedStyles} onClick={onClick} role="button" tabIndex={0}>
        {children}
      </div>
    );
  }
  
  return <div className={combinedStyles}>{children}</div>;
}

// Card Header
interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export function CardHeader({ children, className = "" }: CardHeaderProps) {
  return (
    <div className={`mb-4 ${className}`}>
      {children}
    </div>
  );
}

// Card Title
interface CardTitleProps {
  children: ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

export function CardTitle({ children, className = "", as: Component = "h3" }: CardTitleProps) {
  return (
    <Component 
      className={`font-semibold text-gray-900 ${className}`}
      style={{ color: '#111827' }}
    >
      {children}
    </Component>
  );
}

// Card Description
interface CardDescriptionProps {
  children: ReactNode;
  className?: string;
}

export function CardDescription({ children, className = "" }: CardDescriptionProps) {
  return (
    <p className={`text-sm text-gray-600 ${className}`} style={{ color: '#6B7280' }}>
      {children}
    </p>
  );
}

// Card Content
interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children, className = "" }: CardContentProps) {
  return <div className={className}>{children}</div>;
}

// Card Footer
interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

export function CardFooter({ children, className = "" }: CardFooterProps) {
  return (
    <div className={`mt-4 pt-4 border-t border-gray-200 ${className}`}>
      {children}
    </div>
  );
}

