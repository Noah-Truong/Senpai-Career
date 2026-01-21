"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState } from "react";
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
  const [showComplianceButton, setShowComplianceButton] = useState(false);
  const [checkingCompliance, setCheckingCompliance] = useState(true);

  // Check compliance status on load
  useEffect(() => {
    const checkCompliance = async () => {
      if (isStudent && session?.user?.id) {
        try {
          const response = await fetch("/api/profile/compliance");
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
                  setComplianceAgreed(data.complianceAgreed || false);
                  // Only show popup automatically if compliance is not agreed
                  if (!data.complianceAgreed) {
                    setShowRules(true);
                  }
                } else {
                  console.warn("Compliance API returned non-JSON response");
                  // If error, show popup to be safe
                  setShowRules(true);
                }
              } catch (jsonError) {
                console.error("Failed to parse compliance JSON:", jsonError);
                // If error, show popup to be safe
                setShowRules(true);
              }
            } else {
              console.warn("Compliance API returned non-JSON content type");
              // If error, show popup to be safe
              setShowRules(true);
            }
          }
        } catch (err) {
          console.error("Error checking compliance:", err);
          // If error, show popup to be safe
          setShowRules(true);
        }
      }
      setCheckingCompliance(false);
    };

    checkCompliance();
  }, [isStudent, session?.user?.id]);

  useEffect(() => {
    fetch("/api/obog")
      .then(async res => {
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
                console.error("OB/OG API returned non-JSON response");
                setObogUsers([]);
              }
            } catch (jsonError) {
              console.error("Failed to parse OB/OG JSON:", jsonError);
              setObogUsers([]);
            }
          } else {
            console.error("OB/OG API returned non-JSON content type");
            setObogUsers([]);
          }
        } else {
          console.error("OB/OG API returned error status:", res.status);
          setObogUsers([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading OB/OG users:", err);
        setLoading(false);
        setObogUsers([]);
      });
  }, []);

  // Show close button after a delay when popup is open (to encourage reading)
  useEffect(() => {
    if (showRules && isStudent && !complianceAgreed) {
      // Reset button visibility when popup opens
      setShowComplianceButton(false);
      const timer = setTimeout(() => {
        setShowComplianceButton(true);
      }, 5000); // 5 second delay before close button appears
      return () => clearTimeout(timer);
    } else if (showRules && (complianceAgreed || !isStudent)) {
      // If compliance already agreed or not a student, show button immediately
      setShowComplianceButton(true);
    } else {
      setShowComplianceButton(false);
    }
  }, [showRules, isStudent, complianceAgreed]);

  const handleCloseRules = async () => {
    // If user is a student and hasn't agreed to compliance yet, update it
    if (isStudent && !complianceAgreed && session?.user?.id) {
      try {
        const response = await fetch("/api/profile/compliance", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            complianceAgreed: true,
            complianceDocuments: [],
          }),
        });

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
                setComplianceAgreed(true);
              } else {
                console.warn("Compliance update returned non-JSON response");
                // Still mark as agreed locally even if parsing fails
                setComplianceAgreed(true);
              }
            } catch (jsonError) {
              console.error("Failed to parse compliance update JSON:", jsonError);
              // Still mark as agreed locally even if parsing fails
              setComplianceAgreed(true);
            }
          } else {
            // Response OK but not JSON, still mark as agreed
            setComplianceAgreed(true);
          }
        } else {
          console.error("Failed to update compliance");
        }
      } catch (err) {
        console.error("Error updating compliance:", err);
      }
    }
    setShowRules(false);
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
          ) : (
            <OBOGListContent obogUsers={obogUsers} />
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
      {isStudent && (
        <div className="flex justify-center py-4">
          <button
            onClick={() => setShowRules(true)}
            className="bg-navy text-white px-6 py-3 rounded-lg hover:bg-blue-600 font-medium shadow-md transition-all"
          >
            {t("obvisit.safety.title")}
          </button>
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
                  onClick={handleCloseRules}
                  className="bg-red-500 text-white px-6 py-2 rounded hover:bg-red-600 transition-colors"
                >
                  {t("button.close")}
                </button>
              ) : (
                <div className="text-sm text-gray-500 italic">
                  {t("obvisit.safety.reading") || "Please read the rules carefully..."}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
