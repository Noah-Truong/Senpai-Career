"use client";

import { useSession } from "@/contexts/AuthContext";
import { useState, useEffect, useCallback, useRef } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { createClient } from "@/lib/supabase/client";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { data: session, status } = useSession();
  const [userCredits, setUserCredits] = useState<number | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const isLoggedIn = !!session;

  const loadUserCredits = useCallback(async () => {
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
  }, []);

  // Load user credits and set up real-time subscription
  useEffect(() => {
    if (isLoggedIn && session?.user?.id) {
      loadUserCredits();
      
      // Set up Supabase real-time subscription for credits updates
      const supabase = createClient();
      const channel = supabase
        .channel(`user-credits-${session.user.id}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'users',
            filter: `id=eq.${session.user.id}`
          },
          (payload) => {
            console.log('Credits updated via real-time:', payload);
            if (payload.new && 'credits' in payload.new) {
              const newCredits = payload.new.credits as number;
              setUserCredits(newCredits ?? 0);
              console.log(`Credits updated: ${newCredits}`);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isLoggedIn, session?.user?.id, loadUserCredits]);

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
