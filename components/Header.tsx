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
    <div className="relative" ref={dropdownRef}>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileTap={{ scale: 0.97 }}
        className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded transition-colors ${
          isActive 
            ? 'text-navy bg-surface-light' 
            : 'text-text-body hover:text-navy hover:bg-surface-light'
        }`}
        style={{ color: isActive ? '#0F2A44' : '#374151' }}
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
            className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded shadow-lg z-50 origin-top"
            style={{ borderRadius: '6px' }}
          >
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-navy transition-colors"
                style={{ color: '#374151' }}
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
  const { t } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [userCredits, setUserCredits] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const supabase = createClient();

  const isLoggedIn = !!session?.user;
  const userRole = session?.user?.role as "student" | "obog" | "company" | "admin" | undefined;

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  // Memoized helper functions to prevent unnecessary recalculations
  const isActiveLink = useCallback((href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  }, [pathname]);

  const getLinkClasses = useCallback((href: string) => {
    const baseClasses = "px-3 py-2 text-sm font-medium rounded transition-colors";
    if (isActiveLink(href)) {
      return `${baseClasses} nav-active`;
    }
    return `${baseClasses} text-gray-600 hover:text-navy hover:bg-gray-50`;
  }, [isActiveLink]);

  // Fetch notifications and user credits when logged in - reduced polling frequency
  useEffect(() => {
    if (isLoggedIn && session?.user?.id) {
      loadNotifications();
      loadUserCredits();
      // Reduced polling frequency from 30s to 60s for better performance
      const interval = setInterval(loadNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn, session?.user?.id]);

  const loadUserCredits = useCallback(async () => {
    if (!isLoggedIn) return;
    try {
      const response = await fetch("/api/user");
      if (response.ok) {
        const data = await response.json();
        setUserCredits(data.user?.credits ?? 0);
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
        const data = await response.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setLoadingNotifications(false);
    }
  }, [isLoggedIn]);

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
    { href: "/about/ob-visit", label: t("nav.aboutObVisit") || "About Alumni Visits" },
    { href: "/internships", label: t("nav.internships") || "Long-Term Internships" },
    { href: "/recruiting", label: t("nav.recruiting") || "New Graduate Recruitment" },
  ];

  const companyMenuItems = [
    { href: "/for-companies", label: t("nav.corporateServices") || "Corporate Services" },
    { href: "/for-companies/recruitment", label: t("nav.recruitmentProcess") || "Recruitment Process" },
    { href: "/for-companies/foreign-nationals", label: t("nav.foreignRecruitment") || "Foreign National Recruitment" },
  ];

  // Minimal mode for logged-in users with sidebar - only notifications and messages
  if (minimal && isLoggedIn) {
    return (
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <div className="relative">
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

        {/* Messages */}
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
    );
  }

  return (
    <header
      className="sticky top-0 z-50 bg-white border-b"
      style={{
        borderColor: '#E5E7EB',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[74px]">
          {/* Logo */}
          <Link href="/" className="flex items-center flex-shrink-0">
            <Logo />
          </Link>

          {/* Desktop Navigation - Only shown when NOT logged in */}
          {!isLoggedIn && (
            <nav className="hidden md:flex items-center gap-1">
              <Link
                href="/"
                className={getLinkClasses("/")}
                style={{ color: isActiveLink("/") ? '#0F2A44' : '#374151' }}
              >
                {t("nav.home") || "Home"}
              </Link>
              <Link
                href="/about"
                className={getLinkClasses("/about")}
                style={{ color: isActiveLink("/about") ? '#0F2A44' : '#374151' }}
              >
                {t("nav.about") || "Service Overview"}
              </Link>
              <NavDropdown
                label={t("nav.forStudents") || "For Students"}
                items={studentMenuItems}
                isActive={pathname.startsWith("/about/ob-visit") || pathname.startsWith("/internships") || pathname.startsWith("/recruiting")}
              />
              <NavDropdown
                label={t("nav.forCompaniesNav") || "For Companies"}
                items={companyMenuItems}
                isActive={pathname.startsWith("/for-companies")}
              />
              <Link
                href="/how-to-use"
                className={getLinkClasses("/how-to-use")}
                style={{ color: isActiveLink("/how-to-use") ? '#0F2A44' : '#374151' }}
              >
                {t("nav.howToUse") || "How to Use"}
              </Link>
            </nav>
          )}

          {/* Right side actions */}
          <div className="flex items-center gap-3">
            {!isLoggedIn ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-navy transition-colors"
                  style={{ color: '#374151' }}
                >
                  {t("nav.logIn") || "Login"}
                </Link>
                <Link
                  href="/register"
                  className="btn-primary text-sm"
                >
                  {t("nav.register") || "Register"}
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {/* Notifications - Top right corner */}
                <div className="relative">
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
              className="md:hidden p-2 text-gray-500 hover:text-navy rounded"
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
          <div className="md:hidden border-t py-4" style={{ borderColor: '#E5E7EB' }}>
            <div className="space-y-2">
              {!isLoggedIn ? (
                <>
                  <Link href="/" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded">{t("nav.home") || "Home"}</Link>
                  <Link href="/about" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded">{t("nav.about")}</Link>
                  <Link href="/how-to-use" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded">{t("nav.howToUse")}</Link>
                  <Link href="/internships" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded">{t("nav.internships")}</Link>
                  <Link href="/for-companies" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded">{t("nav.forCompanies")}</Link>
                  <div className="border-t mt-2 pt-2" style={{ borderColor: '#E5E7EB' }}>
                    <Link href="/login" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded">{t("nav.logIn")}</Link>
                    <Link href="/register" className="block px-4 py-2 text-white rounded mt-2 text-center" style={{ backgroundColor: '#2563EB' }}>{t("nav.register")}</Link>
                  </div>
                </>
              ) : (
                <>
                  <Link href="/" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded">{t("nav.home") || "Home"}</Link>
                  <Link href={`/user/${(session?.user as any)?.id}`} className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded">{t("nav.myPage")}</Link>
                  <Link href="/profile" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded">{t("nav.profile")}</Link>
                  <Link href="/messages" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded">{t("nav.messages")}</Link>
                  {userRole === "student" && (
                    <>
                      <Link href="/ob-list" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded">{t("nav.alumniVisits") || "Alumni Visits"}</Link>
                      <Link href="/internships" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded">{t("nav.internships")}</Link>
                      <Link href="/recruiting" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded">{t("nav.newGrad") || "New Grad"}</Link>
                      <Link href="/companies" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded">{t("nav.companies") || "Companies"}</Link>
                    </>
                  )}
                  {userRole === "obog" && (
                    <>
                      <Link href="/about" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded">{t("nav.about")}</Link>
                      <Link href="/report" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded">{t("nav.report")}</Link>
                    </>
                  )}
                  {userRole === "company" && (
                    <>
                      <Link href="/company/profile" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded">{t("nav.companyProfile") || "Company Profile"}</Link>
                      <Link href="/company/internships" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded">{t("nav.jobListings") || "Job Listings"}</Link>
                      <Link href="/companies" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded">{t("nav.companies") || "Companies"}</Link>
                      <Link href="/company/students" className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded">{t("nav.studentList")}</Link>
                    </>
                  )}
                  <div className="border-t mt-2 pt-2" style={{ borderColor: '#E5E7EB' }}>
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded"
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
  );
}
