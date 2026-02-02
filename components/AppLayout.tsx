"use client";

import { useSession } from "@/contexts/AuthContext";
import { useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { useLanguage } from "@/contexts/LanguageContext";

const CREDITS_REFRESH_EVENT = "credits-refresh";

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
  "users": { en: "Users", ja: "ユーザー" },
  "reports": { en: "Reports", ja: "レポート" },
  "student-actions": { en: "Student Actions", ja: "学生アクション" },
  "meetings": { en: "Meetings", ja: "ミーティング" },
  "compliance": { en: "Compliance", ja: "コンプライアンス" },
  "new": { en: "New", ja: "新規" },
  "edit": { en: "Edit", ja: "編集" },
  "applications": { en: "Applications", ja: "応募" },
  "inquiry": { en: "Inquiry", ja: "お問い合わせ" },
  "students": { en: "Students", ja: "学生" },
};

interface AppLayoutProps {
  children: React.ReactNode;
}

export function dispatchCreditsRefresh() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(CREDITS_REFRESH_EVENT));
  }
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { data: session, status } = useSession();
  const { language } = useLanguage();
  const pathname = usePathname();
  const [userCredits, setUserCredits] = useState<number | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 1023px)");

  const isLoggedIn = !!session;
  // Use stable reference for user ID
  const userId = session?.user?.id;

  useEffect(() => {
    if (!isMobile) setMobileMenuOpen(false);
  }, [isMobile]);

  const loadUserCredits = useCallback(async () => {
    try {
      const response = await fetch("/api/user");
      if (response.ok) {
        const contentType = response.headers.get("content-type");
        const isJson = contentType && contentType.includes("application/json");
        if (isJson) {
          try {
            const text = await response.text();
            const trimmedText = text.trim();
            if (trimmedText.startsWith("{") || trimmedText.startsWith("[")) {
              const data = JSON.parse(text);
              setUserCredits(data.user?.credits ?? 0);
            }
          } catch (jsonError) {
            console.error("Failed to parse user JSON:", jsonError);
          }
        }
      }
    } catch (error) {
      console.error("Error loading user credits:", error);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn && userId) {
      loadUserCredits();
    }
  }, [isLoggedIn, userId, loadUserCredits]);

  // Set up event listener for credits refresh (always active, checks login inside)
  useEffect(() => {
    const onRefresh = () => {
      loadUserCredits();
    };
    window.addEventListener(CREDITS_REFRESH_EVENT, onRefresh);
    return () => window.removeEventListener(CREDITS_REFRESH_EVENT, onRefresh);
  }, [loadUserCredits]);

  // Show loading state while checking auth
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-74px)] px-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" aria-hidden />
        </div>
      </div>
    );
  }

  // Non-logged in users: just show header and content
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-white overflow-x-hidden">
        <Header />
        <main className="min-h-[50vh] overflow-x-hidden">{children}</main>
      </div>
    );
  }

  // Logged-in users: show sidebar layout with minimal header
  return (
    <div className="min-h-screen overflow-x-hidden" style={{ backgroundColor: '#F8FFFC' }}>
      {/* Sidebar: desktop always visible; mobile as overlay drawer */}
      <Sidebar
        userCredits={userCredits}
        onCollapse={setSidebarCollapsed}
        isMobile={isMobile}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      {/* Fixed header - stays at top of screen */}
      <header
        className={`fixed top-0 right-0 z-30 bg-white border-b h-14 sm:h-16 flex items-center justify-between gap-2 px-3 sm:px-6 transition-all duration-300 ${
          isMobile ? "left-0" : sidebarCollapsed ? "left-16" : "left-64"
        }`}
        style={{ borderColor: 'var(--border-default)', boxShadow: 'var(--shadow-sm)' }}
      >
        {isMobile && (
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="tap-target p-2 -ml-1 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-navy transition-colors"
            aria-label="Open menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        <div className="flex-1 flex items-center justify-end min-w-0">
          <Header minimal />
        </div>
      </header>

      {/* Main content area - offset for sidebar and header */}
      <div
        className={`min-h-screen flex flex-col transition-all duration-300 pt-14 sm:pt-16 ${
          isMobile ? "ml-0" : sidebarCollapsed ? "ml-16" : "ml-64"
        }`}
      >
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

        {/* Page content */}
        <main className="flex-1 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
