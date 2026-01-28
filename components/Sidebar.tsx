"use client";

import Link from "next/link";
import { useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "@/contexts/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import Avatar from "./Avatar";
import Logo from "./Logo";
import { createClient } from "@/lib/supabase/client";
import { UserRole } from "@/types";
import StudentIcon from "./icons/StudentIcon";
import CompanyIcon from "./icons/CompanyIcon";
import AlumIcon from "./icons/AlumIcon";
import CorporateOBIcon from "./icons/CorporateOBIcon";

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

interface SidebarProps {
  userCredits?: number | null;
  creditChange?: { type: 'add' | 'deduct' | null; amount: number };
  onCollapse?: (collapsed: boolean) => void;
  isMobile?: boolean;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function Sidebar({ userCredits, creditChange, onCollapse, isMobile, mobileOpen, onMobileClose }: SidebarProps) {
  const { data: session, status } = useSession();
  const { t } = useLanguage();
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    // Use window.location for a hard redirect to ensure clean state
    window.location.href = "/login";
  };
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);

  const handleCollapse = () => {
    if (isMobile) return;
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    onCollapse?.(newState);
  };

  const closeIfMobile = () => {
    if (isMobile) onMobileClose?.();
  };

  const userRole = session?.user?.role as UserRole | undefined;
  const userId = session?.user?.id;
  const userName = session?.user?.name || session?.user?.email?.split("@")[0] || "User";
  const userEmail = session?.user?.email || "";
  const userProfilePhoto = session?.user?.profilePhoto;

  // Handle click outside notifications dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showNotifications &&
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNotifications]);
  // Fetch notifications
  const loadNotifications = useCallback(async () => {
    if (!session?.user?.id) return;
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
  }, [session?.user?.id]);

  useEffect(() => {
    if (session?.user?.id) {
      loadNotifications();
      const interval = setInterval(loadNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [session?.user?.id, loadNotifications]);

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

  const isActiveLink = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(href + "/");
  };

  const getLinkClasses = (href: string) => {
    const baseClasses = "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200";
    if (isActiveLink(href)) {
      return `${baseClasses} font-medium`;
    }
    return `${baseClasses} text-gray-600 hover:text-gray-900`;
  };

  const getActiveStyle = (href: string) => {
    if (isActiveLink(href)) {
      return { backgroundColor: '#D7FFEF', color: '#0D7A4D' };
    }
    return {};
  };

  const getHoverStyle = { backgroundColor: '#F0FFF8' };

  // Navigation items based on role
  const getNavItems = () => {
    const commonItems = [
      {
        href: `/user/${userId}`,
        label: t("nav.myPage"),
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        ),
      },
    ];

    if (userRole === "student") {
      return [
        ...commonItems,
        {
          href: "/ob-list",
          label: t("nav.alumniVisits") || "Alumni Visits",
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          ),
        },
        {
          href: "/internships",
          label: t("nav.internships") || "Internships",
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          ),
        },
        {
          href: "/recruiting",
          label: t("nav.newGrad") || "New Grad",
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
          ),
        },
        {
          href: "/companies",
          label: t("nav.companies") || "Companies",
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          ),
        },
        {
          href: "/student/saved",
          label: t("nav.saved") || "Saved",
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          ),
        },
        {
          href: "/student/history",
          label: t("nav.browsingHistory") || "Browsing History",
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
        },
      ];
    }

    if (userRole === "obog") {
      return [
        ...commonItems,
        {
          href: "/ob-list",
          label: t("nav.alumniVisits") || "Alumni Visits",
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          ),
        },
        {
          href: "/internships",
          label: t("nav.internships") || "Internships",
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          ),
        },
        {
          href: "/recruiting",
          label: t("nav.newGrad") || "New Grad",
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
          ),
        },
        {
          href: "/companies",
          label: t("nav.companies") || "Companies",
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          ),
        },
        {
          href: "/profile?open=availability",
          label: t("nav.configureAvailability") || "Configure Availability",
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          ),
        },
        {
          href: "/obog/bookings",
          label: t("nav.bookedMeetings") || "Booked Meetings",
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          ),
        },
      ];
    }

    if (userRole === "company") {
      return [
        ...commonItems,
        
        {
          href: "/ob-list",
          label: t("nav.alumniVisits") || "Alumni Visits",
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          ),
        },
        {
          href: "/internships",
          label: t("nav.internships") || "Internships",
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          ),
        },
        {
          href: "/recruiting",
          label: t("nav.newGrad") || "New Grad",
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            </svg>
          ),
        },
        {
          href: "/company/internships",
          label: t("nav.jobListings") || "Job Listings",
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          ),
        },
        {
          href: "/company/profile",
          label: t("nav.companyProfile") || "Company Profile",
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          ),
        },
        {
          href: "/company/students",
          label: t("nav.students") || "Students",
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ),
        },
     
      ];
    }

    if (userRole === "admin") {
      return [
        {
          href: "/dashboard/admin",
          label: t("nav.adminDashboard"),
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
          ),
        },
        {
          href: "/admin/reports",
          label: t("nav.admin/reports"),
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          ),
        },
        {
          href: "/admin/student-actions",
          label: t("nav.admin/studentActions") || "Student Actions",
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ),
        },
        {
          href: "/admin/corporate-ob",
          label: t("admin.nav.corporateOb") || "Corporate OB",
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          ),
        },
        {
          href: "/admin/chats",
          label: t("nav.admin.chatHistory") || "Chat History",
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          ),
        },
        {
          href: "/admin/compliance",
          label: t("admin.nav.compliance") || "Compliance Review",
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          ),
        },
        {
          href: "/admin/meetings",
          label: t("admin.nav.meetings") || "Meeting Reviews",
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          ),
        },
      ];
    }

    return commonItems;
  };

  const navItems = getNavItems();

  const drawerWidth = isMobile ? "w-64" : isCollapsed ? "w-16" : "w-64";
  const showCollapse = !isMobile;
  const translated = isMobile && !mobileOpen;

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && mobileOpen && (
        <button
          type="button"
          onClick={onMobileClose}
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          aria-label="Close menu"
        />
      )}
      <aside
        className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 z-40 transition-all duration-300 ease-out ${drawerWidth} ${
          translated ? "-translate-x-full" : "translate-x-0"
        }`}
        style={{ boxShadow: "2px 0 8px rgba(0, 0, 0, 0.05)" }}
      >
        <div className="flex flex-col h-full w-full">
          {/* Logo and collapse button */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            {(!isCollapsed || isMobile) && (
              <Link href="/" className="flex items-center" onClick={closeIfMobile}>
                <Logo />
                {userRole === "student" && <StudentIcon />}
                {userRole === "company" && <CompanyIcon />}
                {userRole === "obog" && <AlumIcon />}
                {userRole === "corporate_ob" && <CorporateOBIcon />}
              </Link>
            )}
            {showCollapse ? (
              <button
                onClick={handleCollapse}
                className="tap-target p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg
                  className={`w-5 h-5 transition-transform ${isCollapsed ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              </button>
            ) : (
              <button
                type="button"
                onClick={onMobileClose}
                className="tap-target p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

        {/* User info */}
        {status !== "loading" && session?.user && (
          <div className={`p-4 border-b border-gray-200 ${isCollapsed && !isMobile ? "flex justify-center" : ""}`}>
            <Link 
              href="/profile"
              className={`flex items-center gap-3 ${isCollapsed && !isMobile ? "justify-center" : ""}`}
              onClick={closeIfMobile}
            >
              <Avatar
                src={userProfilePhoto}
                alt={userName}
                size="md"
                fallbackText={userName}
              />
              {(!isCollapsed || isMobile) && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {userName}
                  </p>
                  {userRole && (
                    <p className="text-xs text-gray-500">
                      {userRole === "corporate_ob" 
                        ? t("role.corporateOb") || "Corporate OB"
                        : userRole === "obog"
                        ? t("role.obog") || "Alumni"
                        : t(`role.${userRole}`) || userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                    </p>
                  )}
                </div>
              )}
            </Link>
          </div>
        )}
        {status === "loading" && (
          <div className={`p-4 border-b border-gray-200 ${isCollapsed && !isMobile ? "flex justify-center" : ""}`}>
            <div className={`flex items-center gap-3 ${isCollapsed && !isMobile ? "justify-center" : ""}`}>
              <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
              {(!isCollapsed || isMobile) && (
                <div className="flex-1 min-w-0">
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-1" />
                  <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Credits (for non-admin users) */}
        {userCredits !== null && userRole !== "admin" && (
          <div className={`px-4 py-3 border-b border-gray-200 ${isCollapsed && !isMobile ? "flex justify-center" : ""}`}>
            <Link
              href="/credits"
              onClick={closeIfMobile}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 relative overflow-hidden ${
                userCredits === 0
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "text-gray-700"
              } ${
                creditChange?.type === 'add' ? 'animate-pulse bg-green-50' :
                creditChange?.type === 'deduct' ? 'animate-pulse bg-red-50' : ''
              }`}
              style={userCredits !== 0 ? {color: '#10B981' } : {}}
            >
              <motion.svg 
                className="w-5 h-5" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                animate={creditChange?.type ? {
                  scale: creditChange.type === 'add' ? [1, 1.2, 1] : [1, 0.8, 1],
                  rotate: creditChange.type === 'add' ? [0, 360] : [0, -360]
                } : {}}
                transition={{ duration: 0.5 }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </motion.svg>
              {(!isCollapsed || isMobile) && (
                <div className="flex items-center gap-2">
                  <motion.span 
                    className="text-sm font-medium"
                    key={userCredits}
                    initial={{ scale: 1 }}
                    animate={creditChange?.type ? {
                      scale: creditChange.type === 'add' ? [1, 1.3, 1] : [1, 0.9, 1],
                      color: creditChange.type === 'add' ? '#10B981' : '#DC2626'
                    } : {}}
                    transition={{ duration: 0.5 }}
                  >
                    {userCredits === 0 ? (t("nav.buyCredits") || "Buy Credits") : `${userCredits} Credits`}
                  </motion.span>
                  <AnimatePresence>
                    {creditChange?.type && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className={`text-xs font-bold ${
                          creditChange.type === 'add' ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {creditChange.type === 'add' ? '+' : '-'}{creditChange.amount}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </Link>
          </div>
        )}

        {/* Notifications */}
        <div className={`px-4 py-3 border-b border-gray-200`}>
          <div className={`relative ${isCollapsed && !isMobile ? "flex justify-center" : ""}`} ref={notificationsRef}>
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                if (!showNotifications) loadNotifications();
              }}
              className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg transition-colors text-gray-700 hover:bg-[#F0FFF8] ${isCollapsed && !isMobile ? "justify-center" : ""}`}
              title={isCollapsed && !isMobile ? t("nav.notifications") : undefined}
            >
              <div className="relative">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 h-4 w-4 rounded-full text-xs flex items-center justify-center text-white"
                    style={{ backgroundColor: '#DC2626', fontSize: '10px' }}
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </div>
              {(!isCollapsed || isMobile) && (
                <span className="text-sm font-medium">{t("nav.notifications")}</span>
              )}
            </button>

            {/* Notifications dropdown */}
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className={`absolute ${isCollapsed && !isMobile ? "left-full ml-2" : "left-0"} top-full mt-1 w-72 sm:w-80 max-w-[calc(100vw-2rem)] bg-white border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto`}
                  style={{ borderColor: '#E5E7EB' }}
                >
                  <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: '#E5E7EB' }}>
                    <h3 className="font-semibold text-gray-900">{t("nav.notifications")}</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllAsRead}
                        className="text-sm hover:underline"
                        style={{ color: '#0F2A44' }}
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
                          className={`w-full text-left p-4 hover:bg-[#D7FFEF] transition-colors border-b ${
                            !notification.read ? '' : ''
                          }`}
                          style={{
                            borderColor: '#E5E7EB',
                            backgroundColor: !notification.read ? '#D7FFEF' : 'transparent'
                          }}
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
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        
          <div className={`relative ${isCollapsed && !isMobile ? "flex justify-center" : ""}`}>
          <Link href="/messages" 
        className={`${getLinkClasses('/messages')} hover:bg-[#F0FFF8]`}
        style={getActiveStyle('/messages')}
        title={isCollapsed && !isMobile ? t("nav.messages") || "Messages" : undefined}
        onClick={closeIfMobile}
        >
           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
           </svg>
          {(!isCollapsed || isMobile) && <span>{t("nav.messages") || "Messages"}</span>}
        </Link>
        </div>
        </div>

        
        

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`${getLinkClasses(item.href)} hover:bg-[#F0FFF8] tap-target min-h-[44px]`}
                  style={getActiveStyle(item.href)}
                  title={isCollapsed && !isMobile ? item.label : undefined}
                  onClick={closeIfMobile}
                >
                  {item.icon}
                  {(!isCollapsed || isMobile) && <span>{item.label}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Bottom section */}
        <div className="p-3 border-t border-gray-200 space-y-1">
          {/* Report */}
          {userRole !== "admin" && (
          <Link href="/report" 
          className={`${getLinkClasses('/report')} hover:bg-[#F0FFF8] tap-target min-h-[44px]`}
          style={getActiveStyle('/report')}
          title={isCollapsed && !isMobile ? t("nav.report") : undefined}
          onClick={closeIfMobile}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {(!isCollapsed || isMobile) && <span>{t("nav.report")}</span>}
          </Link>
          )}
   
          {/* Sign out */}
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
            title={isCollapsed ? t("nav.signOut") : undefined}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {!isCollapsed && <span>{t("nav.signOut")}</span>}
          </button>
        </div>
      </div>
    </aside>
    </>
  );
}
