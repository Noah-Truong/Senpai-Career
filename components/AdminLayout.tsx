"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Header from "./Header";
import { useLanguage } from "@/contexts/LanguageContext";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const { t } = useLanguage();

  const navItems = [
    {
      href: "/admin/users",
      label: t("admin.nav.users") || "Users",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      href: "/admin/reports",
      label: t("admin.nav.reports") || "Reports",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
    },
    {
      href: "/admin/student-actions",
      label: t("admin.nav.studentActions") || "Student Actions",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
    },
  ];

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        {/* Side Navigation */}
        <aside 
          className="w-64 min-h-[calc(100vh-64px)] bg-white border-r"
          style={{ borderColor: '#E5E7EB' }}
        >
          <div className="p-4">
            <h2 
              className="text-sm font-semibold uppercase tracking-wider mb-4"
              style={{ color: '#6B7280' }}
            >
              {t("admin.nav.title") || "Admin Panel"}
            </h2>
            <nav className="space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? "bg-gray-100"
                      : "hover:bg-gray-50"
                  }`}
                  style={{ 
                    color: isActive(item.href) ? '#0F2A44' : '#374151',
                    borderRadius: '6px',
                    backgroundColor: isActive(item.href) ? '#F5F7FA' : undefined
                  }}
                >
                  <span style={{ color: isActive(item.href) ? '#0F2A44' : '#6B7280' }}>
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Quick Stats */}
          <div className="p-4 mt-4 border-t" style={{ borderColor: '#E5E7EB' }}>
            <h3 
              className="text-xs font-semibold uppercase tracking-wider mb-3"
              style={{ color: '#9CA3AF' }}
            >
              {t("admin.nav.quickLinks") || "Quick Links"}
            </h3>
            <div className="space-y-2">
              <Link
                href="/"
                className="flex items-center gap-2 text-sm hover:underline"
                style={{ color: '#2563EB' }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                {t("nav.home") || "Home"}
              </Link>
              <Link
                href="/profile"
                className="flex items-center gap-2 text-sm hover:underline"
                style={{ color: '#2563EB' }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {t("nav.profile") || "Profile"}
              </Link>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

