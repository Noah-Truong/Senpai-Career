"use client";

import { useSession } from "@/contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { fadeIn, slideUp } from "@/lib/animations";
import Avatar from "./Avatar";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

// Breadcrumb path name mappings
const pathNameMap: Record<string, { en: string; ja: string }> = {
  "": { en: "Home", ja: "ホーム" },
  "about": { en: "About Us", ja: "サービス概要" },
  "ob-visit": { en: "OB/OG Visit", ja: "OB/OG訪問とは" },
  "how-to-use": { en: "How to Use", ja: "使い方" },
  "login": { en: "Login", ja: "ログイン" },
  "register": { en: "Register", ja: "登録" },
  "signup": { en: "Sign Up", ja: "会員登録" },
  "student": { en: "Student", ja: "学生" },
  "obog": { en: "Alumni", ja: "OBOG" },
  "company": { en: "Company", ja: "企業" },
  "for-companies": { en: "For Companies", ja: "企業向け" },
  "corporate-services": { en: "Corporate Services", ja: "法人サービス" },
  "foreign-nationals": { en: "Foreign Nationals", ja: "外国人採用" },
  "recruitment": { en: "Recruitment", ja: "新卒採用" },
  "for-students": { en: "For Students", ja: "学生向け" },
  "internships": { en: "Internships", ja: "長期インターン" },
  "recruiting": { en: "New Grad Recruitment", ja: "新卒採用" },
  "for-obog": { en: "For Alumni", ja: "OBOG向け" },
  "profile": { en: "Profile", ja: "プロフィール" },
  "messages": { en: "Messages", ja: "メッセージ" },
  "ob-list": { en: "Alumni List", ja: "OBOG一覧" },
  "student-list": { en: "Student List", ja: "学生一覧" },
  "companies": { en: "Companies", ja: "企業一覧" },
  "dashboard": { en: "Dashboard", ja: "ダッシュボード" },
  "admin": { en: "Admin", ja: "管理者" },
  "settings": { en: "Settings", ja: "設定" },
  "report": { en: "Report", ja: "通報" },
  "user": { en: "User", ja: "ユーザー" },
  "history": { en: "Browsing History", ja: "閲覧履歴" },
  "bookings": { en: "Bookings", ja: "予約" },
  "billing": { en: "Billing", ja: "請求" },
  "payment-methods": { en: "Payment Methods", ja: "お支払い方法" },
  "corporate-ob": { en: "Corporate OB", ja: "法人OB" },
  "credits": { en: "Credits", ja: "クレジット" },
};

interface SidebarLayoutProps {
  children: React.ReactNode;
  role: "student" | "obog" | "company" | "admin" | "corporate_ob";
}

export default function SidebarLayout({ children, role }: SidebarLayoutProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const { t, language } = useLanguage();
  const supabase = createClient();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    // Use window.location for a hard redirect to ensure clean state
    window.location.href = "/login";
  };

  const userRole = session?.user?.role as string;
  const userName = session?.user?.name || "";
  const userEmail = session?.user?.email || "";

  // Navigation items based on role
  const getNavItems = () => {
    switch (role) {
      case "student":
        return [
          { href: "/ob-list", label: t("nav.obVisit") || "OB/OG Visits", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" },
          { href: "/internships", label: t("nav.internship") || "Internships", icon: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
          { href: "/recruiting", label: t("nav.recruiting") || "Recruiting", icon: "M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" },
          { href: "/messages", label: t("nav.messages") || "Messages", icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" },
          { href: "/profile", label: t("nav.profile") || "Profile", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
        ];
      case "obog":
        return [
          { href: "/profile", label: t("nav.profile") || "Profile", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
          { href: "/messages", label: t("nav.messages") || "Messages", icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" },
        ];
      case "company":
        return [
          { href: "/company/profile", label: t("nav.companyProfile") || "Company Profile", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
          { href: "/company/internships", label: t("nav.internships") || "Internships", icon: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
          { href: "/company/students", label: t("nav.students") || "Students", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
          { href: "/messages", label: t("nav.messages") || "Messages", icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" },
        ];
      case "admin":
        return [
          { href: "/dashboard/admin", label: t("nav.adminDashboard") || "Admin Dashboard", icon: "M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" },
          { href: "/admin/users", label: t("admin.nav.users") || "Users", icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" },
          { href: "/admin/reports", label: t("admin.nav.reports") || "Reports", icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" },
          { href: "/admin/student-actions", label: t("admin.nav.studentActions") || "Student Actions", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" },
          { href: "/admin/corporate-ob", label: t("admin.nav.corporateOb") || "Corporate OB", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <div className="min-h-screen bg-white flex">
      {/* Sidebar */}
      <motion.aside
        className="hidden lg:flex flex-col w-64 border-r"
        style={{ borderColor: '#E5E7EB', backgroundColor: '#F9FAFB' }}
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* User Profile Section */}
        <div className="p-6 border-b" style={{ borderColor: '#E5E7EB' }}>
          <div className="flex items-center mb-4">
            <Avatar
              src={session?.user?.profilePhoto}
              alt={userName}
              size="md"
              fallbackText={userName}
            />
            <div className="ml-5 flex-1 min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: '#111827' }}>
                {userName}
              </p>
              <p className="text-xs truncate" style={{ color: '#6B7280' }}>
                {userEmail}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item, index) => (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05, duration: 0.2 }}
            >
              <Link
                href={item.href}
                className={`flex items-center px-4 py-3 rounded-lg transition-all ${
                  isActive(item.href)
                    ? "bg-white shadow-sm"
                    : "hover:bg-white/50"
                }`}
                style={{
                  color: isActive(item.href) ? '#0F2A44' : '#374151',
                }}
              >
                <svg
                  className="w-5 h-5 mr-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
                <span className="font-medium">{item.label}</span>
              </Link>
            </motion.div>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t" style={{ borderColor: '#E5E7EB' }}>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center px-4 py-3 rounded-lg hover:bg-red-50 transition-all"
            style={{ color: '#DC2626' }}
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="font-medium">{t("nav.logout") || "Logout"}</span>
          </button>
        </div>
      </motion.aside>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
        style={{ borderColor: '#E5E7EB' }}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile Sidebar */}
      {mobileMenuOpen && (
        <motion.div
          className="lg:hidden fixed inset-0 z-40 flex"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setMobileMenuOpen(false)}
          />
          <motion.aside
            className="relative flex flex-col w-64 bg-white"
            initial={{ x: -100 }}
            animate={{ x: 0 }}
            exit={{ x: -100 }}
            transition={{ duration: 0.3 }}
          >
            {/* Mobile User Profile */}
            <div className="p-6 border-b" style={{ borderColor: '#E5E7EB' }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Avatar
                    src={session?.user?.profilePhoto}
                    alt={userName}
                    size="md"
                    fallbackText={userName}
                  />
                  <div className="ml-5">
                    <p className="text-sm font-semibold" style={{ color: '#111827' }}>
                      {userName}
                    </p>
                    <p className="text-xs" style={{ color: '#6B7280' }}>
                      {userEmail}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Mobile Navigation */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center px-4 py-3 rounded-lg ${
                    isActive(item.href) ? "bg-gray-100" : "hover:bg-gray-50"
                  }`}
                  style={{
                    color: isActive(item.href) ? '#0F2A44' : '#374151',
                  }}
                >
                  <svg
                    className="w-5 h-5 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </nav>

            {/* Mobile Logout */}
            <div className="p-4 border-t" style={{ borderColor: '#E5E7EB' }}>
              <button
                onClick={() => {
                  handleSignOut();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center px-4 py-3 rounded-lg hover:bg-red-50"
                style={{ color: '#DC2626' }}
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="font-medium">{t("nav.logout") || "Logout"}</span>
              </button>
            </div>
          </motion.aside>
        </motion.div>
      )}

      {/* Main Content */}
      <main className="flex-1 lg:ml-0">
        {/* Breadcrumb */}
        <div className="bg-gray-50 border-b" style={{ borderColor: '#E5E7EB' }}>
          <div className="px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center py-2 text-sm" aria-label="Breadcrumb">
              <Link 
                href="/" 
                className="text-gray-500 hover:text-navy transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
              </Link>
              {pathname.split("/").filter(Boolean).map((segment, index, arr) => {
                const path = "/" + arr.slice(0, index + 1).join("/");
                const isLast = index === arr.length - 1;
                // Check if segment is a UUID (dynamic route parameter)
                const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment);
                const displayName = isUUID 
                  ? (language === "ja" ? "詳細" : "Details")
                  : (pathNameMap[segment]?.[language] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " "));
                
                return (
                  <span key={path} className="flex items-center">
                    <svg className="w-4 h-4 mx-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    {isLast ? (
                      <span className="text-gray-900 font-medium">{displayName}</span>
                    ) : (
                      <Link 
                        href={path} 
                        className="text-gray-500 hover:text-navy transition-colors"
                      >
                        {displayName}
                      </Link>
                    )}
                  </span>
                );
              })}
            </nav>
          </div>
        </div>
        <motion.div
          className="min-h-screen"
          initial="initial"
          animate="animate"
          variants={fadeIn}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}

