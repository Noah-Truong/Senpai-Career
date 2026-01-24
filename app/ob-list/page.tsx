"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState, useCallback } from "react";
import { useSession } from "@/contexts/AuthContext";
import OBOGListContent from "@/components/OBOGListContent";
import SidebarLayout from "@/components/SidebarLayout";
import { motion } from "framer-motion";
import { fadeIn, slideUp, staggerContainer, staggerItem, buttonVariants } from "@/lib/animations";

export default function OBVisitPage() {
  const { t } = useLanguage();
  const { data: session } = useSession();
  const isLoggedIn = !!session;
  const isStudent = session?.user?.role === "student";
  const [obogUsers, setObogUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRules, setShowRules] = useState(false);
  const [complianceAgreed, setComplianceAgreed] = useState(false);
  const [complianceStatus, setComplianceStatus] = useState<string>("pending");
  const [showComplianceButton, setShowComplianceButton] = useState(false);
  const [checkingCompliance, setCheckingCompliance] = useState(true);
  const [viewedRules, setViewedRules] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isAccepting, setIsAccepting] = useState(false);

  // Check compliance status and viewed_rules on load
  const checkCompliance = useCallback(async () => {
      if (session?.user?.id) {
        try {
          // Check profile for viewed_rules
          const profileResponse = await fetch("/api/profile");
          if (profileResponse.ok) {
            const contentType = profileResponse.headers.get("content-type");
            const isJson = contentType && contentType.includes("application/json");
            
            if (isJson) {
              try {
                const text = await profileResponse.text();
                const trimmedText = text.trim();
                
                if (trimmedText.startsWith("{") || trimmedText.startsWith("[")) {
                  const profileData = JSON.parse(text);
                  const user = profileData.user || profileData;
                  const hasViewedRules = user.viewedRules || false;
                  setViewedRules(hasViewedRules);
                  
                  if (isStudent) {
                    // For students, also check compliance status
                    const complianceResponse = await fetch("/api/profile/compliance");
                    if (complianceResponse.ok) {
                      const complianceContentType = complianceResponse.headers.get("content-type");
                      const complianceIsJson = complianceContentType && complianceContentType.includes("application/json");
                      
                      if (complianceIsJson) {
                        const complianceText = await complianceResponse.text();
                        const complianceTrimmed = complianceText.trim();
                        
                        if (complianceTrimmed.startsWith("{") || complianceTrimmed.startsWith("[")) {
                          const complianceData = JSON.parse(complianceText);
                          setComplianceAgreed(complianceData.complianceAgreed || false);
                          setComplianceStatus(complianceData.complianceStatus || "pending");
                          
                          // Only show popup if user hasn't viewed rules AND compliance is not approved
                          if (!hasViewedRules && complianceData.complianceStatus !== "approved") {
                            setShowRules(true);
                          }
                        }
                      }
                    }
                  } else {
                    // For non-students, show popup if they haven't viewed rules
                    if (!hasViewedRules) {
                      setShowRules(true);
                    }
                  }
                }
              } catch (jsonError) {
                console.error("Failed to parse profile JSON:", jsonError);
              }
            }
          }
        } catch (err) {
          console.error("Error checking profile:", err);
        }
      }
      setCheckingCompliance(false);
  }, [isStudent, session?.user?.id]);

  useEffect(() => {
    if (session?.user?.id) {
      checkCompliance();
    }
  }, [session?.user?.id, checkCompliance]);

  const loadObogUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/obog");
      if (res.ok) {
        const contentType = res.headers.get("content-type");
        const isJson = contentType && contentType.includes("application/json");
        
        if (isJson) {
          try {
            const text = await res.text();
            const trimmedText = text.trim();
            
            if (trimmedText.startsWith("{") || trimmedText.startsWith("[")) {
              const data = JSON.parse(text);
              setObogUsers(data.users || []);
            } else {
              setObogUsers([]);
            }
          } catch (jsonError) {
            console.error("Failed to parse OB/OG JSON:", jsonError);
            setObogUsers([]);
          }
        } else {
          setObogUsers([]);
        }
      } else {
        setObogUsers([]);
      }
    } catch (err) {
      console.error("Error loading OB/OG users:", err);
      setObogUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Progress bar animation - fills up over 5 seconds
  useEffect(() => {
    if (showRules && !showComplianceButton) {
      setProgress(0);
      const interval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + 2; // Increment by 2% every 100ms (5 seconds total)
          if (newProgress >= 100) {
            setShowComplianceButton(true);
            clearInterval(interval);
            return 100;
          }
          return newProgress;
        });
      }, 100); // Update every 100ms
      
      return () => clearInterval(interval);
    } else if (!showRules) {
      setProgress(0);
      setShowComplianceButton(false);
    }
  }, [showRules, showComplianceButton]);

  const handleAcceptRules = async () => {
    if (isAccepting) return; // Prevent double-click
    
    setIsAccepting(true);
    try {
      // Update viewed_rules to true
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          viewedRules: true,
        }),
      });

      if (response.ok) {
        setViewedRules(true);
        setShowRules(false);
      } else {
        console.error("Failed to update viewed_rules");
        // Still close the popup even if API call fails
        setShowRules(false);
      }
    } catch (error) {
      console.error("Error updating viewed_rules:", error);
      // Still close the popup even if API call fails
      setShowRules(false);
    } finally {
      setIsAccepting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <motion.section 
        className="py-16" 
        style={{ backgroundColor: '#D7FFEF' }}
        initial="initial"
        animate="animate"
        variants={fadeIn}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 
            className="text-3xl md:text-4xl font-bold mb-6" 
            style={{ color: '#111827' }}
            variants={slideUp}
          >
            {t("obvisit.hero.title")}
          </motion.h1>
          <motion.p 
            className="text-lg max-w-2xl mx-auto" 
            style={{ color: '#6B7280' }}
            variants={slideUp}
          >
            {t("obvisit.hero.subtitle")}
          </motion.p>
        </div>
      </motion.section>

      
      {/* OB/OG List Section */}
      <motion.section
        className="py-16 bg-white"
        initial="initial"
        animate="animate"
        variants={fadeIn}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <motion.div 
              className="text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25 }}
            >
              <p style={{ color: '#6B7280' }}>{t("common.loading")}</p>
            </motion.div>
          ) : complianceStatus === "approved" || !isStudent ? (
            <OBOGListContent obogUsers={obogUsers} />
          ) : (
            <div className="text-center py-12">
              <p className="text-lg mb-4" style={{ color: '#374151' }}>
                Compliance approval required to view OB/OG profiles
              </p>
              <p className="text-sm mb-6" style={{ color: '#6B7280' }}>
                Please submit your compliance documents and wait for admin approval.
              </p>
              <Link
                href="/student/profile?tab=compliance"
                className="btn-primary inline-block"
              >
                Go to Compliance Submission
              </Link>
            </div>
          )}
        </div>
      </motion.section>

      {/* CTA Section */}
      {!isLoggedIn && (
        <motion.section
          className="py-16 text-white"
          style={{ backgroundColor: '#0F2A44' }}
          initial="initial"
          animate="animate"
          variants={fadeIn}
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.h2 
              className="text-2xl font-bold mb-4"
              variants={slideUp}
            >
              {t("obvisit.cta.title")}
            </motion.h2>
            <motion.p 
              className="text-lg mb-8 opacity-90"
              variants={slideUp}
            >
              {t("obvisit.cta.subtitle")}
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                <Link
                  href="/signup/student"
                  className="btn-primary px-8 py-3"
                >
                  {t("obvisit.cta.signUpStudent")}
                </Link>
              </motion.div>
              <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                <Link
                  href="/signup/obog"
                  className="px-8 py-3 bg-white/20 backdrop-blur-sm border-2 border-white text-white rounded font-semibold hover:bg-white hover:text-gray-900 transition-all"
                  style={{ borderRadius: '6px' }}
                >
                  {t("obvisit.cta.signUpObog")}
                </Link>
              </motion.div>
            </motion.div>
            <motion.p 
              className="mt-8 text-lg opacity-90"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 0.9 }}
              viewport={{ once: true }}
              transition={{ duration: 0.25, delay: 0.2 }}
            >
              {t("obvisit.cta.login")}{" "}
              <motion.span
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <Link href="/login" className="underline hover:opacity-80">
                  {t("obvisit.cta.loginLink")}
                </Link>
              </motion.span>
            </motion.p>
          </div>
        </motion.section>
      )}
      
      {/* Safety Rules Button - Always visible for students */}
      {isStudent && complianceStatus !== "approved" && (
        <div className="flex justify-center py-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-2xl">
            <p className="text-sm text-yellow-800 mb-2">
              <strong>Compliance Required:</strong> To access OB/OG profiles, you must submit compliance documents and receive admin approval.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowRules(true)}
                className="bg-navy text-white px-6 py-3 rounded-lg hover:bg-blue-600 font-medium shadow-md transition-all"
              >
                {t("obvisit.safety.title")}
              </button>
              <Link
                href="/student/profile?tab=compliance"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium shadow-md transition-all"
              >
                Submit Compliance Documents
              </Link>
            </div>
          </div>
        </div>
      )}
      
      {/* Safety and Rules Popup */}
      {showRules && (
        <div className="fixed inset-0 backdrop-blur-md bg-black/30 flex items-center justify-center z-50 scrollbar-visible">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto scrollbar-visible">
            {/* Safety Rules */}
      <motion.section
        className="pt-2 pb-4 bg-white"
        initial="initial"
        animate="animate"
        variants={fadeIn}
      >
        <div className="max-w-4xl mx-auto">
          <motion.h2 
            className="text-2xl font-bold mb-8" 
            style={{ color: '#111827' }}
            variants={slideUp}
          >
            {t("obvisit.safety.title")}
          </motion.h2>
          <motion.div 
            className="p-6 mb-6 border-l-4"
            style={{ backgroundColor: '#FEF3C7', borderLeftColor: '#F59E0B' }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25 }}
          >
            <p className="font-semibold mb-2" style={{ color: '#374151' }}>{t("obvisit.safety.important")}</p>
            <motion.ul
              className="space-y-2 text-sm"
              style={{ color: '#374151' }}
              variants={staggerContainer}
              initial="initial"
              animate="animate"
            >
              {[
                t("obvisit.safety.1"),
                t("obvisit.safety.2"),
                t("obvisit.safety.3"),
                t("obvisit.safety.4"),
                t("obvisit.safety.5"),
                t("obvisit.safety.6"),
                t("obvisit.safety.7"),
                t("obvisit.safety.8"),
              ].map((item, index) => (
                <motion.li key={index} variants={staggerItem}>
                  • {item}
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>
          <motion.p 
            style={{ color: '#6B7280' }}
            variants={slideUp}
          >
            {t("obvisit.safety.desc")}
          </motion.p>
        </div>
      </motion.section>

            
            <div className="flex justify-end mt-4">
              {showComplianceButton ? (
                <button
                  onClick={handleAcceptRules}
                  disabled={isAccepting}
                  className="relative overflow-hidden px-8 py-3 rounded font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ 
                    backgroundColor: '#0F2A44', // Navy color
                    minWidth: '120px'
                  }}
                >
                  {isAccepting ? t("common.loading") || "Accepting..." : t("button.accept") || "Accept"}
                </button>
              ) : (
                <div className="w-full">
                  <div className="text-sm text-gray-500 italic mb-2 text-center">
                    {t("obvisit.safety.reading") || "Please read the rules carefully..."}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden" style={{ backgroundColor: '#E5E7EB' }}>
                    <div
                      className="h-full rounded-full transition-all duration-100 ease-linear"
                      style={{
                        backgroundColor: '#0F2A44', // Navy color
                        width: `${progress}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
