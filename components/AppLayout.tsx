"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { data: session, status } = useSession();
  const [userCredits, setUserCredits] = useState<number | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const isLoggedIn = !!session;

  // Load user credits
  useEffect(() => {
    if (isLoggedIn && session?.user?.id) {
      loadUserCredits();
    }
  }, [isLoggedIn, session?.user?.id]);

  const loadUserCredits = async () => {
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

  // Show loading state while checking auth
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center h-[calc(100vh-74px)]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  // Non-logged in users: just show header and content
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main>{children}</main>
      </div>
    );
  }

  // Logged-in users: show sidebar layout with minimal header
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F8FFFC' }}>
      {/* Sidebar */}
      <Sidebar userCredits={userCredits} onCollapse={setSidebarCollapsed} />

      {/* Main content area - offset by sidebar width, expands when collapsed */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? "ml-16" : "ml-64"}`}>
        {/* Top bar with notifications/messages */}
        <header
          className="sticky top-0 z-30 bg-white border-b h-16 flex items-center justify-end px-6"
          style={{ borderColor: '#E5E7EB', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)' }}
        >
          <Header minimal />
        </header>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
