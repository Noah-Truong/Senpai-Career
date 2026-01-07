"use client";

import Header from "@/components/Header";
import { useLanguage } from "@/contexts/LanguageContext";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { fadeIn, slideUp, staggerContainer, staggerItem, cardVariants, buttonVariants } from "@/lib/animations";

export default function RegisterPage() {
  const { t } = useLanguage();
  const { data: session } = useSession();
  const router = useRouter();
  
  useEffect(() => {
    if (session) {
      router.push("/");
    }
  }, [session, router]);

  const accountTypes = [
    {
      type: "student",
      href: "/signup/student",
      title: t("nav.studentSignUp"),
      description: t("register.studentDesc"),
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
        </svg>
      ),
      features: [
        t("register.studentFeature1"),
        t("register.studentFeature2"),
        t("register.studentFeature3"),
      ],
    },
    {
      type: "obog",
      href: "/signup/obog",
      title: t("nav.obogSignUp"),
      description: t("register.obogDesc"),
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      features: [
        t("register.obogFeature1"),
        t("register.obogFeature2"),
        t("register.obogFeature3"),
      ],
    },
    {
      type: "company",
      href: "/signup/company",
      title: t("nav.companySignUp"),
      description: t("register.companyDesc"),
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      features: [
        t("register.companyFeature1"),
        t("register.companyFeature2"),
        t("register.companyFeature3"),
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <motion.section 
        className="py-12 md:py-16" 
        style={{ backgroundColor: '#F5F7FA' }}
        initial="initial"
        animate="animate"
        variants={fadeIn}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-10"
            variants={slideUp}
          >
            <h1 
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{ color: '#111827' }}
            >
              {t("register.title")}
            </h1>
            <p 
              className="text-lg max-w-2xl mx-auto"
              style={{ color: '#6B7280' }}
            >
              {t("register.subtitle")}
            </p>
          </motion.div>

          {/* Account Type Cards */}
          <motion.div 
            className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {accountTypes.map((account) => (
              <motion.div
                key={account.type}
                variants={staggerItem}
              >
                <Link
                  href={account.href}
                  className="group bg-white border rounded shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col h-full"
                  style={{ borderColor: '#E5E7EB', borderRadius: '6px' }}
                >
                {/* Card Header */}
                <motion.div 
                  className="p-6 text-center text-white"
                  style={{ backgroundColor: '#0F2A44' }}
                  whileHover={{ backgroundColor: '#1A3A5C' }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.div 
                    className="w-14 h-14 rounded flex items-center justify-center mx-auto mb-3 text-white"
                    style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    {account.icon}
                  </motion.div>
                  <h2 className="text-xl font-semibold text-white">
                    {account.title}
                  </h2>
                </motion.div>

                {/* Card Content */}
                <div className="p-6 flex flex-col flex-1">
                  <p 
                    className="mb-6 text-center text-sm"
                    style={{ color: '#6B7280' }}
                  >
                    {account.description}
                  </p>

                  {/* Features List */}
                  <motion.ul 
                    className="space-y-3 flex-1"
                    variants={staggerContainer}
                    initial="initial"
                    whileInView="animate"
                    viewport={{ once: true }}
                  >
                    {account.features.map((feature, index) => (
                      <motion.li 
                        key={index} 
                        className="flex items-start"
                        variants={staggerItem}
                        whileHover={{ x: 4 }}
                        transition={{ duration: 0.2 }}
                      >
                        <motion.svg 
                          className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" 
                          fill="none" 
                          stroke="#059669" 
                          viewBox="0 0 24 24"
                          initial={{ scale: 0 }}
                          whileInView={{ scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.2, delay: index * 0.05 }}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </motion.svg>
                        <span style={{ color: '#374151', fontSize: '14px' }}>{feature}</span>
                      </motion.li>
                    ))}
                  </motion.ul>

                  {/* CTA Button */}
                  <motion.div 
                    className="w-full py-3 px-6 rounded text-white font-medium text-center group-hover:opacity-90 transition-opacity mt-6 flex items-center justify-center"
                    style={{ backgroundColor: '#2563EB', borderRadius: '6px' }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                  >
                    {t("register.getStarted")}
                    <motion.svg 
                      className="w-4 h-4 ml-2" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </motion.svg>
                  </motion.div>
                </div>
              </Link>
              </motion.div>
            ))}
          </motion.div>

          {/* Already have account */}
          <motion.div 
            className="text-center mt-10"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.25, delay: 0.3 }}
          >
            <p style={{ color: '#6B7280' }}>
              {t("register.haveAccount")}{" "}
              <motion.span
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <Link 
                  href="/login" 
                  className="font-medium hover:underline"
                  style={{ color: '#2563EB' }}
                >
                  {t("nav.logIn")}
                </Link>
              </motion.span>
            </p>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
}
