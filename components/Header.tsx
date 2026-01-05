"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Logo from "./Logo";
import { useLanguage } from "@/contexts/LanguageContext";
import Avatar from "./Avatar";

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

export default function Header() {
  const { data: session } = useSession();
  const { t } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [userCredits, setUserCredits] = useState<number | null>(null);

  const isLoggedIn = !!session;
  const userRole = session?.user?.role as "student" | "obog" | "company" | "admin" | undefined;

  // Helper function to check if a link is active
  const isActiveLink = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  };

  // Get link classes based on active state
  const getLinkClasses = (href: string) => {
    const baseClasses = "inline-flex items-center px-2 py-1 rounded-lg border-2 transition-all whitespace-nowrap flex-shrink-0";
    if (isActiveLink(href)) {
      return `${baseClasses} nav-active font-semibold text-black`;
    }
    return `${baseClasses} border-gray-300 hover:border-gray-400 link-gradient`;
  };

  // Fetch notifications and user credits when logged in
  useEffect(() => {
    if (isLoggedIn && session?.user?.id) {
      loadNotifications();
      loadUserCredits();
      // Refresh notifications every 30 seconds
      const interval = setInterval(loadNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn, session?.user?.id]);

  const loadUserCredits = async () => {
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
  };

  const loadNotifications = async () => {
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
  };

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read if unread
    if (!notification.read) {
      try {
        await fetch("/api/notifications", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notificationId: notification.id }),
        });
        // Update local state
        setNotifications(prev => 
          prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    }

    // Navigate to link if available
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

  return (
    <header className="sticky top-0 z-50 bg-white border-b shadow-sm" style={{
      borderImage: 'linear-gradient(90deg, rgba(242, 106, 163, 0.2) 0%, rgba(245, 159, 193, 0.2) 35%, rgba(111, 211, 238, 0.2) 70%, rgba(76, 195, 230, 0.2) 100%) 1',
      background: 'linear-gradient(135deg, rgba(255, 255, 255, 1) 0%, rgba(247, 252, 254, 1) 100%)'
    }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center flex-shrink-0" style={{ marginLeft: '-100px', marginRight: '40px' }}>
            <Logo />
          </Link>

          {/* Navigation */}
          {!isLoggedIn ? (
            <nav
            className="hidden md:flex flex-wrap items-center gap-2 flex-1 overflow-x-auto"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', marginLeft: '-25px' }}
          >
              <Link href="/about" className={getLinkClasses("/about")} style={{ minHeight: '32px', lineHeight: '1.2' }}>
                {t("nav.about")}
              </Link>
              <Link href="/ob-list" className={getLinkClasses("/ob-list")} style={{ minHeight: '32px', lineHeight: '1.2' }}>
                {t("nav.ob-list")}
              </Link>
              <Link href="/internships" className={getLinkClasses("/internships")} style={{ minHeight: '32px', lineHeight: '1.2' }}>
                {t("nav.internship")}
              </Link>
            </nav>
          ) : (
            <nav
            className="hidden md:flex flex-wrap items-center gap-2 flex-1 overflow-x-auto"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', marginLeft: '-25px' }}
          >
              {userRole === "company" && (
                <>
                  <Link href="/company/profile" className={getLinkClasses("/company/profile")} style={{ minHeight: '32px', lineHeight: '1.2' }}>
                    {t("nav.companyProfile") || "Company Profile"}
                  </Link>
                  <Link href="/company/internships" className={getLinkClasses("/company/internships")} style={{ minHeight: '32px', lineHeight: '1.2' }}>
                    {t("nav.jobListings") || "Job Listings"}
                  </Link>
                  <Link href="/companies" className={getLinkClasses("/companies")} style={{ minHeight: '32px', lineHeight: '1.2' }}>
                    {t("nav.companies") || "Companies"}
                  </Link>
                  <Link href="/company/students" className={getLinkClasses("/company/students")} style={{ minHeight: '32px', lineHeight: '1.2' }}>
                    {t("nav.studentList")}
                  </Link>
                  <Link href="/company/inquiry" className={getLinkClasses("/company/inquiry")} style={{ minHeight: '32px', lineHeight: '1.2' }}>
                    {t("nav.contact")}
                  </Link>
                  <Link href="/for-companies" className={getLinkClasses("/for-companies")} style={{ minHeight: '32px', lineHeight: '1.2' }}>
                    {t("nav.forCompanies")}
                  </Link>
                </>
              )}
              {userRole === "student" && (
                <>
                  <Link href="/about" className={getLinkClasses("/about")} style={{ minHeight: '32px', lineHeight: '1.2' }}>
                    {t("nav.about")}
                  </Link>
                  <Link href="/ob-list" className={getLinkClasses("/ob-list")} style={{ minHeight: '32px', lineHeight: '1.2' }}>
                    {t("nav.ob-list")}
                  </Link>
                  <Link href="/internships" className={getLinkClasses("/internships")} style={{ minHeight: '32px', lineHeight: '1.2' }}>
                    {t("nav.internships")}
                  </Link>
                  <Link href="/companies" className={getLinkClasses("/companies")} style={{ minHeight: '32px', lineHeight: '1.2' }}>
                    {t("nav.companies") || "Companies"}
                  </Link>
                  <Link href = "/report" className={getLinkClasses("/report")} style={{ minHeight: '32px', lineHeight: '1.2' }}>
                    {t("nav.report")}
                  </Link>
                </>
              )}
              {userRole === "obog" && (
                <>
                <Link href="/about" className={getLinkClasses("/about")} style={{ minHeight: '32px', lineHeight: '1.2' }}>
                  {t("nav.about")}
                </Link>
                <Link href = "/report" className={getLinkClasses("/report")} style={{ minHeight: '32px', lineHeight: '1.2' }}>
                    {t("nav.report")}
                  </Link>
              </>
              )}
              {userRole === "admin" && (
                <>
                  <Link href="/admin/reports" className={getLinkClasses("/admin/reports")} style={{ minHeight: '32px', lineHeight: '1.2' }}>
                    {t("nav.admin/reports")}
                  </Link>
                  <Link href="/admin/student-actions" className={getLinkClasses("/admin/student-actions")} style={{ minHeight: '32px', lineHeight: '1.2' }}>
                    {t("nav.admin/studentActions") || "Student Actions"}
                  </Link>
                </>
              )}
            </nav>
          )}

          {/* Right side actions */}
          <div className="flex items-center space-x-4 flex-shrink-0" style={{ marginRight: '-125px' }}>
            

            {/* Auth buttons */}
            {!isLoggedIn ? (
              <div className="flex items-center space-x-2">
                <Link
                  href="/register"
                  className="btn-secondary text-sm whitespace-nowrap"
                  style={{ paddingTop: '6px', paddingBottom: '6px', lineHeight: '1.2', minHeight: '32px', display: 'inline-flex', alignItems: 'center' }}
                >
                  {t("nav.register")}
                </Link>
                <Link
                  href="/login"
                  className="btn-primary text-sm whitespace-nowrap"
                  style={{ paddingTop: '6px', paddingBottom: '6px', lineHeight: '1.2', minHeight: '32px', display: 'inline-flex', alignItems: 'center' }}
                >
                  {t("nav.logIn")}
                </Link>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/profile"
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium link-gradient"
                >
                  <Avatar
                    src={session.user?.profilePhoto}
                    alt={session.user?.name || "Profile"}
                    size="sm"
                    fallbackText={session.user?.name}
                  />
                  <span className="text-base font-semibold">{session.user?.name || t("nav.profile")}</span>
                </Link>
                {session.user?.role && (
                  <>
                    <span className="px-2.5 py-1 text-xs font-bold text-white bg-gray-500 rounded whitespace-nowrap shadow-md" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.2)', WebkitTextFillColor: '#ffffff', color: '#ffffff', marginRight: '20px'}}>
                      {t(`role.${session.user.role}`) || session.user.role}
                    </span>
                    {userCredits !== null && (
                      <button
                        onClick={() => router.push("/credits")}
                        className={`px-2.5 py-1 text-xs font-bold rounded whitespace-nowrap shadow-md ${
                          userCredits === 0 
                            ? "gradient-bg text-white" 
                            : "bg-gray-200 text-gray-800"
                        }`}
                        style={{ 
                          marginRight: '20px',
                          textShadow: userCredits === 0 ? '0 1px 2px rgba(0,0,0,0.2)' : 'none'
                        }}
                      >
                        {userCredits === 0 ? t("nav.buyCredits") || "Buy Credits" : `Credits: ${userCredits}`}
                      </button>
                    )}
                  </>
                )}
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="btn-secondary text-sm whitespace-nowrap"
                  style={{ paddingTop: '6px', paddingBottom: '6px', lineHeight: '1.2', minHeight: '32px', display: 'inline-flex', alignItems: 'center' }}
                >
                  {t("nav.signOut")}
                </button>
              </div>
            )}
            {/* Notifications */}
            {isLoggedIn && (
              <div className="relative">
                <button
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    if (!showNotifications) {
                      loadNotifications();
                    }
                  }}
                  className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center" style={{ fontSize: '10px', lineHeight: '1' }}>
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
                    <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">{t("nav.notifications")}</h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllAsRead}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          {t("nav.markAllRead") || "Mark all as read"}
                        </button>
                      )}
                    </div>
                    {loadingNotifications ? (
                      <div className="p-4 text-center">
                        <p className="text-sm text-gray-500">{t("common.loading")}</p>
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="p-4 text-center">
                        <p className="text-sm text-gray-500">{t("nav.noNotifications")}</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-200">
                        {notifications.map((notification) => (
                          <button
                            key={notification.id}
                            onClick={() => handleNotificationClick(notification)}
                            className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                              !notification.read ? 'bg-blue-50' : ''
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                                  {notification.title}
                                </p>
                                <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                  {notification.content}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {new Date(notification.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                              {!notification.read && (
                                <span className="ml-2 h-2 w-2 rounded-full bg-blue-600 flex-shrink-0 mt-1"></span>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Messages */}
            {isLoggedIn && (
              <button
                onClick={() => router.push("/messages")}
                className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

