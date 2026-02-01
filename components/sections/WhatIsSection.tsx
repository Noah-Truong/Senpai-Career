"use client";

import { useLanguage } from "@/contexts/LanguageContext";

const WhatIsSection = () => {
  const { t } = useLanguage();

  return (
    <section
      className="py-16 md:py-20 bg-white"
      
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2
          className="text-2xl md:text-3xl font-bold text-center mb-12"
          style={{ color: '#111827' }}
          
        >
          {t("home.whatIs.title")}
        </h2>
        <div
          className="grid md:grid-cols-3 gap-8"
          style={{ pointerEvents: 'auto' }}
        >
          {/* Card 1 */}
          <div
            className="text-center p-6 no-hover"
            style={{ 
              transition: 'none', 
              transform: 'none', 
              willChange: 'auto',
              boxShadow: 'none'
            }}
          >
            <div
              className="w-14 h-14 rounded flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: '#0F2A44' }}
            >
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: '#111827' }}>
              {t("home.whatIs.obog")}
            </h3>
            <p style={{ color: '#6B7280' }}>
              {t("home.whatIs.obogDesc")}
            </p>
          </div>

          {/* Card 2 */}
          <div
            className="text-center p-6 no-hover"
            style={{ 
              transition: 'none', 
              transform: 'none', 
              willChange: 'auto',
              boxShadow: 'none'
            }}
          >
            <div
              className="w-14 h-14 rounded flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: '#0F2A44' }}
            >
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: '#111827' }}>
              {t("home.whatIs.internship")}
            </h3>
            <p style={{ color: '#6B7280' }}>
              {t("home.whatIs.internshipDesc")}
            </p>
          </div>

          {/* Card 3 */}
          <div
            className="text-center p-6 no-hover"
            style={{ 
              transition: 'none', 
              transform: 'none', 
              willChange: 'auto',
              boxShadow: 'none'
            }}
          >
            <div
              className="w-14 h-14 rounded flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: '#0F2A44' }}
            >
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: '#111827' }}>
              {t("home.whatIs.connect")}
            </h3>
            <p style={{ color: '#6B7280' }}>
              {t("home.whatIs.connectDesc")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhatIsSection;