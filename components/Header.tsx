"use client";

import Link from "next/link";
import { useState, useEffect, useRef, useCallback, useMemo, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "@/contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import Logo from "./Logo";
import { useLanguage } from "@/contexts/LanguageContext";
import Avatar from "./Avatar";
import { createClient } from "@/lib/supabase/client";

interface Notification {
  id: string;
  userId: string;
  type: "internship" | "new-grad" | "message" | "system";
  title: string;
  content: string;
  link?: string;
  read: boolean;
  createdAt: string;
}

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
};

// Dropdown component for navigation
function NavDropdown({ 
  label, 
  items, 
  isActive 
}: { 
  label: string; 
  items: { href: string; label: string }[];
  isActive: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const dropdownVariants = {
    hidden: { opacity: 0, y: 6, scale: 0.98, pointerEvents: "none" as const },
    visible: { opacity: 1, y: 0, scale: 1, pointerEvents: "auto" as const, transition: { duration: 0.18, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] } },
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative flex" ref={dropdownRef}>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileTap={{ scale: 0.97 }}
        className={`flex items-center gap-1 px-3 py-2 font-medium rounded transition-colors ${
          isActive 
            ? 'text-navy nav-active' 
            : 'text-gray-600 hover:text-navy hover:bg-gray-50'
        }`}
        style={{ color: isActive ? '#0F2A44' : '#374151', fontSize: '1.09375rem' }}
      >
        {label}
        <svg 
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </motion.button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            key="dropdown"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={dropdownVariants}
            className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded shadow-lg z-50 origin-top"
            style={{ borderRadius: '6px' }}
          >
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-navy transition-colors whitespace-nowrap"
                style={{ color: '#374151', fontSize: '0.975rem' }}
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface HeaderProps {
  minimal?: boolean; // For logged-in users with sidebar - only show notifications/messages
}

export default function Header({ minimal = false }: HeaderProps) {
  const { data: session } = useSession();
  const { t, language } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [userCredits, setUserCredits] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  const isLoggedIn = !!session?.user;
  const userRole = session?.user?.role as "student" | "obog" | "company" | "admin" | undefined;
  const userId = session?.user?.id;

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    // Use window.location for a hard redirect to ensure clean state
    window.location.href = "/login";
  };

  // Generate navigation items matching Sidebar structure
  const getMobileNavItems = useCallback(() => {
    if (!isLoggedIn || !userRole || !userId) return [];

    const commonItems = [
      {
        href: `/user/${userId}`,
        label: t("nav.myPage"),
      },
    ];

    if (userRole === "student") {
      return [
        ...commonItems,
        { href: "/ob-list", label: t("nav.alumniVisits") || "Alumni Visits" },
        { href: "/internships", label: t("nav.internships") || "Internships" },
        { href: "/recruiting", label: t("nav.newGrad") || "New Grad" },
        { href: "/companies", label: t("nav.companies") || "Companies" },
        { href: "/student/saved", label: t("nav.saved") || "Saved" },
        { href: "/student/history", label: t("nav.browsingHistory") || "Browsing History" },
      ];
    }

    if (userRole === "obog") {
      return [
        ...commonItems,
        { href: "/ob-list", label: t("nav.alumniVisits") || "Alumni Visits" },
        { href: "/internships", label: t("nav.internships") || "Internships" },
        { href: "/recruiting", label: t("nav.newGrad") || "New Grad" },
        { href: "/companies", label: t("nav.companies") || "Companies" },
        { href: "/profile?open=availability", label: t("nav.configureAvailability") || "Configure Availability" },
        { href: "/obog/bookings", label: t("nav.bookedMeetings") || "Booked Meetings" },
      ];
    }

    if (userRole === "company") {
      return [
        ...commonItems,
        { href: "/ob-list", label: t("nav.alumniVisits") || "Alumni Visits" },
        { href: "/internships", label: t("nav.internships") || "Internships" },
        { href: "/recruiting", label: t("nav.newGrad") || "New Grad" },
        { href: "/company/internships", label: t("nav.jobListings") || "Job Listings" },
        { href: "/company/profile", label: t("nav.companyProfile") || "Company Profile" },
      ];
    }

    if (userRole === "admin") {
      return [
        { href: "/dashboard/admin", label: t("nav.adminDashboard") },
        { href: "/admin/reports", label: t("nav.admin/reports") },
        { href: "/admin/student-actions", label: t("nav.admin/studentActions") || "Student Actions" },
        { href: "/admin/chats", label: t("nav.admin.chatHistory") || "Chat History" },
        { href: "/admin/compliance", label: t("admin.nav.compliance") || "Compliance Review" },
        { href: "/admin/meetings", label: t("admin.nav.meetings") || "Meeting Reviews" },
      ];
    }

    return [];
  }, [isLoggedIn, userRole, userId, t]);

  // Memoized helper functions to prevent unnecessary recalculations
  const isActiveLink = useCallback((href: string) => {
    if (href === "/") return pathname === "/";
    // For /about, only match exact path (not /about/ob-visit which belongs to "For Students" dropdown)
    if (href === "/about") return pathname === "/about";
    return pathname === href || pathname.startsWith(href + "/");
  }, [pathname]);

  const getLinkClasses = useCallback((href: string) => {
    const baseClasses = "px-3 py-2 font-medium flex items-center justify-center rounded transition-colors";
    if (isActiveLink(href)) {
      return `${baseClasses} nav-active`;
    }
    return `${baseClasses} text-gray-600 hover:text-navy hover:bg-gray-50`;
  }, [isActiveLink]);

  const loadUserCredits = useCallback(async () => {
    if (!isLoggedIn) return;
    try {
      const response = await fetch("/api/user");
      if (response.ok) {
        // Check if response is JSON before parsing
        const contentType = response.headers.get("content-type");
        const isJson = contentType && contentType.includes("application/json");
        
        if (isJson) {
          try {
            const text = await response.text();
            const trimmedText = text.trim();
            
            if (trimmedText.startsWith("{") || trimmedText.startsWith("[")) {
              const data = JSON.parse(text);
              setUserCredits(data.user?.credits ?? 0);
            } else {
              console.warn("User API returned non-JSON response");
            }
          } catch (jsonError) {
            console.error("Failed to parse user JSON:", jsonError);
          }
        } else {
          console.warn("User API returned non-JSON content type");
        }
      }
    } catch (error) {
      console.error("Error loading user credits:", error);
    }
  }, [isLoggedIn]);

  const loadNotifications = useCallback(async () => {
    if (!isLoggedIn) return;
    setLoadingNotifications(true);
    try {
      const response = await fetch("/api/notifications");
      if (response.ok) {
        // Check if response is JSON before parsing
        const contentType = response.headers.get("content-type");
        const isJson = contentType && contentType.includes("application/json");
        
        if (isJson) {
          try {
            const text = await response.text();
            const trimmedText = text.trim();
            
            if (trimmedText.startsWith("{") || trimmedText.startsWith("[")) {
              const data = JSON.parse(text);
              setNotifications(data.notifications || []);
              setUnreadCount(data.unreadCount || 0);
            } else {
              console.warn("Notifications API returned non-JSON response");
            }
          } catch (jsonError) {
            console.error("Failed to parse notifications JSON:", jsonError);
          }
        } else {
          console.warn("Notifications API returned non-JSON content type");
        }
      }
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setLoadingNotifications(false);
    }
  }, [isLoggedIn]);

  // Fetch notifications and user credits when logged in; refresh credits on send/purchase
  useEffect(() => {
    if (isLoggedIn && userId) {
      loadNotifications();
      loadUserCredits();
      const interval = setInterval(loadNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn, userId, loadNotifications, loadUserCredits]);

  // Set up credits refresh listener (always active, checks login inside)
  useEffect(() => {
    const onRefresh = () => {
      loadUserCredits();
    };
    window.addEventListener("credits-refresh", onRefresh);
    return () => window.removeEventListener("credits-refresh", onRefresh);
  }, [loadUserCredits]);

  // Close notifications dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    if (showNotifications) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showNotifications]);

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.read) {
      try {
        await fetch("/api/notifications", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notificationId: notification.id }),
        });
        setNotifications(prev => 
          prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    }
    if (notification.link) {
      setShowNotifications(false);
      router.push(notification.link);
    } else {
      setShowNotifications(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  // Navigation items for dropdown menus (before login)
  const studentMenuItems = [
    { href: "/for-students/ob-visit", label: t("nav.obAbout") || "About Alumni Visits" },
    { href: "/for-students/internships", label: t("nav.internships") || "Long-Term Internships" },
    { href: "/for-students/recruiting", label: t("nav.recruiting") || "New Graduate Recruitment" },
  ];

  const companyMenuItems = [
    { href: "/for-companies/corporate-services", label: t("nav.corporateServices") || "Corporate Services" },
    { href: "/for-companies/recruitment", label: t("nav.recruitmentProcess") || "Recruitment Process" },
    { href: "/for-companies/foreign-nationals", label: t("nav.foreignRecruitment") || "Foreign National Recruitment" },
  ];

  // Minimal mode for logged-in users with sidebar - only notifications and messages
  if (minimal && isLoggedIn) {
    return (
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Notifications */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              if (!showNotifications) loadNotifications();
            }}
            className="tap-target p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-500 hover:text-navy hover:bg-gray-100 rounded-lg transition-colors"
            style={{ color: '#6B7280' }}
            title={t("nav.notifications")}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            {unreadCount > 0 && (
              <span
                className="absolute top-0.5 right-0.5 sm:top-0 sm:right-0 h-4 w-4 rounded-full text-xs flex items-center justify-center text-white"
                style={{ backgroundColor: '#DC2626', fontSize: '10px' }}
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications dropdown */}
          {showNotifications && (
            <div
              className="absolute right-0 mt-2 w-72 sm:w-80 max-w-[calc(100vw-2rem)] bg-white border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
              style={{ borderColor: '#E5E7EB' }}
            >
              <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: '#E5E7EB' }}>
                <h3 className="font-semibold text-gray-900">{t("nav.notifications")}</h3>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-sm hover:underline"
                    style={{ color: '#2563EB' }}
                  >
                    {t("nav.markAllRead") || "Mark all as read"}
                  </button>
                )}
              </div>
              {loadingNotifications ? (
                <div className="p-4 text-center text-gray-500">{t("common.loading")}</div>
              ) : notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500">{t("nav.noNotifications")}</div>
              ) : (
                <div>
                  {notifications.map((notification) => (
                    <button
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      className={`w-full text-left p-4 hover:bg-gray-50 transition-colors border-b ${
                        !notification.read ? 'bg-blue-50' : ''
                      }`}
                      style={{ borderColor: '#E5E7EB' }}
                    >
                      <p className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                        {notification.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {notification.content}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Messages */}
        <button
          onClick={() => router.push("/messages")}
          className="tap-target p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-500 hover:text-navy hover:bg-gray-100 rounded-lg transition-colors"
          style={{ color: '#6B7280' }}
          title={t("nav.messages")}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <>
    <header
      className="fixed top-0 left-0 right-0 z-50 bg-white border-b"
      style={{
        borderColor: '#E5E7EB',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
      }}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-[74px] min-h-[56px]">
          {/* Logo */}
          <Link href="/" className="flex items-center flex-shrink-0 max-w-[60px] sm:max-w-[80px] md:max-w-none">
            <Logo />
          </Link>

          {/* Desktop Navigation - Only shown when NOT logged in */}
          {!isLoggedIn && (
            <nav className="hidden md:flex items-center gap-1">
              <Link
                href="/"
                className={getLinkClasses("/")}
                style={{ color: isActiveLink("/") ? '#0F2A44' : '#374151', fontSize: '1.09375rem' }}
              >
                {t("nav.home") || "Home"}
              </Link>
              <Link
                href="/about"
                className={getLinkClasses("/about")}
                style={{ color: isActiveLink("/about") ? '#0F2A44' : '#374151', fontSize: '1.09375rem' }}
              >
                {t("nav.about") || "Service Overview"}
              </Link>
              <Link
                href="/how-to-use"
                className={getLinkClasses("/how-to-use")}
                style={{ color: isActiveLink("/how-to-use") ? '#0F2A44' : '#374151', fontSize: '1.09375rem' }}
              >
                {t("nav.howToUse") || "How to Use"}
              </Link>
              <NavDropdown
                label={t("nav.forStudents") || "For Students"}
                items={studentMenuItems}
                isActive={pathname.startsWith("/for-students")}
              />
              <NavDropdown
                label={t("nav.forCompaniesNav") || "For Companies"}
                items={companyMenuItems}
                isActive={pathname.startsWith("/for-companies")}
              />
            </nav>
          )}

          {/* Right side actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {!isLoggedIn ? (
              <div className="flex items-center gap-1 sm:gap-2">
                <Link
                  href="/login"
                  className="flex items-center justify-center px-2 sm:px-4 py-1.5 sm:py-2 font-medium text-gray-700 hover:text-navy transition-colors whitespace-nowrap"
                  style={{ color: '#374151', fontSize: 'clamp(0.8625rem, 2vw, 1.00625rem)' }}
                >
                  {t("nav.logIn") || "Login"}
                </Link>
                <Link
                  href="/register"
                  className="btn-primary flex items-center justify-center px-2 sm:px-4 py-1.5 sm:py-2 whitespace-nowrap"
                  style={{ fontSize: 'clamp(0.8625rem, 2vw, 1.00625rem)' }}
                >
                  {t("nav.register") || "Register"}
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {/* Notifications - Top right corner */}
                <div className="relative" ref={notificationRef}>
                  <button
                    onClick={() => {
                      setShowNotifications(!showNotifications);
                      if (!showNotifications) loadNotifications();
                    }}
                    className="p-2 text-gray-500 hover:text-navy hover:bg-gray-100 rounded-lg transition-colors"
                    style={{ color: '#6B7280' }}
                    title={t("nav.notifications")}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {unreadCount > 0 && (
                      <span
                        className="absolute top-0 right-0 h-4 w-4 rounded-full text-xs flex items-center justify-center text-white"
                        style={{ backgroundColor: '#DC2626', fontSize: '10px' }}
                      >
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications dropdown */}
                  {showNotifications && (
                    <div
                      className="absolute right-0 mt-2 w-80 bg-white border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
                      style={{ borderColor: '#E5E7EB' }}
                    >
                      <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: '#E5E7EB' }}>
                        <h3 className="font-semibold text-gray-900">{t("nav.notifications")}</h3>
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllAsRead}
                            className="text-sm hover:underline"
                            style={{ color: '#2563EB' }}
                          >
                            {t("nav.markAllRead") || "Mark all as read"}
                          </button>
                        )}
                      </div>
                      {loadingNotifications ? (
                        <div className="p-4 text-center text-gray-500">{t("common.loading")}</div>
                      ) : notifications.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">{t("nav.noNotifications")}</div>
                      ) : (
                        <div>
                          {notifications.map((notification) => (
                            <button
                              key={notification.id}
                              onClick={() => handleNotificationClick(notification)}
                              className={`w-full text-left p-4 hover:bg-gray-50 transition-colors border-b ${
                                !notification.read ? 'bg-blue-50' : ''
                              }`}
                              style={{ borderColor: '#E5E7EB' }}
                            >
                              <p className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                                {notification.title}
                              </p>
                              <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                {notification.content}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {new Date(notification.createdAt).toLocaleDateString()}
                              </p>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Messages - Top right corner */}
                <button
                  onClick={() => router.push("/messages")}
                  className="p-2 text-gray-500 hover:text-navy hover:bg-gray-100 rounded-lg transition-colors"
                  style={{ color: '#6B7280' }}
                  title={t("nav.messages")}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden tap-target p-2 min-w-[44px] min-h-[44px] flex items-center justify-center text-gray-500 hover:text-navy rounded-lg"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t py-2" style={{ borderColor: '#E5E7EB' }}>
            <div className="space-y-1.5">
              {!isLoggedIn ? (
                <>
                  <Link href="/" className="block px-4 py-3 min-h-[44px] flex items-center text-gray-700 hover:bg-gray-50 rounded" 
                  onClick={() => setMobileMenuOpen(false)}>{t("nav.home") || "Home"}</Link>

                  <Link href="/about" className="block px-4 py-3 min-h-[44px] flex items-center text-gray-700 hover:bg-gray-50 rounded" 
                  onClick={() => setMobileMenuOpen(false)}>{t("nav.about") || "Service Overview"}</Link>
                  
                  <Link href="/how-to-use" className="block px-4 py-3 min-h-[44px] flex items-center text-gray-700 hover:bg-gray-50 rounded" 
                  onClick={() => setMobileMenuOpen(false)}>{t("nav.howToUse") || "How to Use"}</Link>
                  
                  {/* For Students section */}
                  <div className="px-4 py-2">
                    <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#6B7280' }}>
                      {t("nav.forStudents") || "For Students"}
                    </p>
                  </div>
                  {studentMenuItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block px-4 py-3 min-h-[44px] flex items-center text-gray-700 hover:bg-gray-50 rounded pl-8"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                  
                  {/* For Companies section */}
                  <div className="px-4 py-2 mt-2">
                    <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#6B7280' }}>
                      {t("nav.forCompaniesNav") || "For Companies"}
                    </p>
                  </div>
                  {companyMenuItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block px-4 py-3 min-h-[44px] flex items-center text-gray-700 hover:bg-gray-50 rounded pl-8"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                  
                  
                  <div className="border-t mt-2 pt-2 space-y-1.5" style={{ borderColor: '#E5E7EB' }}>
                    <Link href="/login" className="block px-4 py-3 min-h-[44px] flex items-center text-gray-700 hover:bg-gray-50 rounded" onClick={() => setMobileMenuOpen(false)}>{t("nav.logIn")}</Link>
                    <Link href="/register" className="block px-4 py-3 min-h-[44px] flex items-center justify-center text-white rounded" style={{ backgroundColor: '#2563EB' }} onClick={() => setMobileMenuOpen(false)}>{t("nav.register")}</Link>
                  </div>
                </>
              ) : (
                <>
                  {/* Main navigation items matching Sidebar */}
                  {getMobileNavItems().map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block px-4 py-3 min-h-[44px] flex items-center text-gray-700 hover:bg-gray-50 rounded"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                  
                  {/* Messages - matches Sidebar structure */}
                  <Link
                    href="/messages"
                    className="block px-4 py-3 min-h-[44px] flex items-center text-gray-700 hover:bg-gray-50 rounded"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t("nav.messages")}
                  </Link>

                  {/* Profile - matches Sidebar structure */}
                  <Link
                    href="/profile"
                    className="block px-4 py-3 min-h-[44px] flex items-center text-gray-700 hover:bg-gray-50 rounded"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t("nav.profile")}
                  </Link>

                  {/* Report (for non-admin) - matches Sidebar bottom section */}
                  {userRole !== "admin" && (
                    <Link
                      href="/report"
                      className="block px-4 py-3 min-h-[44px] flex items-center text-gray-700 hover:bg-gray-50 rounded"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {t("nav.report")}
                    </Link>
                  )}

                  {/* Sign Out - matches Sidebar bottom section */}
                  <div className="border-t mt-2 pt-2 space-y-1.5" style={{ borderColor: '#E5E7EB' }}>
                    <button
                      onClick={() => { handleSignOut(); setMobileMenuOpen(false); }}
                      className="block w-full text-left px-4 py-3 min-h-[44px] flex items-center text-red-600 hover:bg-red-50 rounded"
                    >
                      {t("nav.signOut")}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
    {/* Spacer for fixed header */}
    <div className="h-14 sm:h-[74px]" />
    {/* Breadcrumb */}
    <div className="bg-gray-50 border-b" style={{ borderColor: '#E5E7EB' }}>
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <nav className="flex items-center py-2 text-sm" aria-label="Breadcrumb">
          {pathname === "/" ? (
            <>
              <svg className="w-4 h-4 text-gray-900" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              <span className="ml-2 text-gray-900 font-medium">{language === "ja" ? "ホーム" : "Home"}</span>
            </>
          ) : (
            <>
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
            </>
          )}
        </nav>
      </div>
    </div>
  </>
  );
}
