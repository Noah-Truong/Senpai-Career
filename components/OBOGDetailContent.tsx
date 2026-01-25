"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { getTranslated } from "@/lib/translation-helpers";
import { useSession } from "@/contexts/AuthContext";
import MessageButton from "./MessageButton";
import Avatar from "./Avatar";
import ReportButton from "./ReportButton";
import AvailabilityCalendar from "./AvailabilityCalendar";

interface OBOGDetailContentProps {
  obog: {
    id: string;
    name: string;
    nickname?: string;
    type: "working-professional" | "job-offer-holder";
    university?: string;
    company?: string;
    oneLineMessage?: string;
    topics?: string[];
    languages?: string[];
    nationality?: string;
    studentEraSummary?: string;
    profilePhoto?: string;
  };
  averageRating?: number;
}

export default function OBOGDetailContent({ obog, averageRating }: OBOGDetailContentProps) {
  const { t, language } = useLanguage();
  const { data: session } = useSession();
  const [showCalendar, setShowCalendar] = useState(false);
  
  const isOwner = session?.user?.id === obog.id && session?.user?.role === "obog";
  
  // Format rating to 1 decimal place
  const formattedRating = averageRating && averageRating > 0 
    ? averageRating.toFixed(1) 
    : null;

  return (
    <div className="card-gradient p-8">
      {/* Profile Header */}
      <div className="flex items-start mb-6">
        <Avatar 
          src={obog.profilePhoto} 
          alt={obog.nickname || obog.name}
          size="xl"
          fallbackText={obog.nickname || obog.name}
          className="mr-8"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span
              className="px-3 py-1 rounded text-sm font-semibold"
              style={{
                backgroundColor: obog.type === "working-professional" ? '#D7FFEF' : '#D1FAE5',
                color: obog.type === "working-professional" ? '#0F2A44' : '#059669'
              }}
            >
              {obog.type === "working-professional" ? t("obogDetail.workingProfessional") : t("obogDetail.jobOfferHolder")}
            </span>
            {formattedRating && (
              <div className="flex items-center gap-1 px-3 py-1 rounded text-sm font-semibold bg-yellow-50 border border-yellow-200">
                <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-yellow-700 font-semibold">{formattedRating}</span>
                <span className="text-yellow-600 text-xs">({t("review.averageRating") || "rating"})</span>
              </div>
            )}
          </div>
          <h1 className="text-3xl font-bold mb-2 text-gray-600">{obog.nickname || obog.name}</h1>
          <p className="text-lg text-gray-600">{obog.university}</p>
          <p className="text-lg text-gray-600">{obog.company}</p>
        </div>
      </div>

      {/* One-line Message */}
      {obog.oneLineMessage && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border-l-4" style={{
          borderImage: 'linear-gradient(135deg, #f26aa3 0%, #f59fc1 35%, #6fd3ee 70%, #4cc3e6 100%) 1'
        }}>
          <p className="text-lg italic text-gray-800">{getTranslated(obog.oneLineMessage, language)}</p>
        </div>
      )}

      {/* Details */}
      <div className="space-y-6 mb-6">
        {obog.nationality && (
          <div>
            <h3 className="font-semibold mb-2 text-gray-900">{t("obogDetail.nationality")}</h3>
            <p className="text-gray-700">{obog.nationality}</p>
          </div>
        )}
        
        {obog.languages && obog.languages.length > 0 && (
          <div>
            <h3 className="font-semibold mb-2 text-gray-900">{t("obogDetail.languages")}</h3>
            <div className="flex flex-wrap gap-2">
              {obog.languages.map((lang, idx) => (
                <span key={idx} className="px-3 py-1 bg-gray-100 rounded text-gray-700">
                  {lang}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {obog.topics && obog.topics.length > 0 && (
          <div>
            <h3 className="font-semibold mb-2 text-gray-900">{t("obogDetail.topics")}</h3>
            <div className="flex flex-wrap gap-2">
              {obog.topics.map((topic, idx) => (
                <span key={idx} className="px-3 py-1 bg-[#0F2A44] text-white rounded font-medium">
                  {topic}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {obog.studentEraSummary && (
          <div>
            <h3 className="font-semibold mb-2 text-gray-900">{t("obogDetail.studentEraSummary")}</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{getTranslated(obog.studentEraSummary, language)}</p>
          </div>
        )}
      </div>

      {/* Message Button, Availability Button, and Report Button */}
      <div className="mt-8 flex items-center gap-4 flex-wrap">
        {!isOwner && (
          <MessageButton obogId={obog.id} obogName={obog.nickname || obog.name} />
        )}
        <button
          onClick={() => setShowCalendar(true)}
          className="btn-primary px-6 py-2 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {isOwner ? t("profile.availability.configure") : t("profile.availability.view")}
        </button>
        {!isOwner && (
          <ReportButton reportedUserId={obog.id} reportedUserName={obog.nickname || obog.name} />
        )}
      </div>

      {/* Availability Calendar Modal */}
      <AvailabilityCalendar
        obogId={obog.id}
        obogName={obog.nickname || obog.name}
        isOpen={showCalendar}
        onClose={() => setShowCalendar(false)}
        isOwner={isOwner}
      />
    </div>
  );
}

