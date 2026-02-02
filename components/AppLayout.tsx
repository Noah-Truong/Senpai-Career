"use client";

import { useSession } from "@/contexts/AuthContext";
import { useState, useEffect, useCallback } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { useMediaQuery } from "@/lib/useMediaQuery";

const CREDITS_REFRESH_EVENT = "credits-refresh";

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

      {/* Main content area - no offset on mobile; sidebar width on desktop */}
      <div
        className={`transition-all duration-300 ${
          isMobile ? "ml-0" : sidebarCollapsed ? "ml-16" : "ml-64"
        }`}
      >
        {/* Top bar with notifications/messages */}
        <header
          className="sticky top-0 z-30 bg-white border-b h-14 sm:h-16 flex items-center justify-between gap-2 px-3 sm:px-6"
          style={{ borderColor: '#E5E7EB', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)' }}
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

        {/* Page content */}
        <main className="p-4 sm:p-6 min-h-[calc(100vh-3.5rem)] sm:min-h-[calc(100vh-4rem)] overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
