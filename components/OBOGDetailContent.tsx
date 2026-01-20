"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { getTranslated } from "@/lib/translation-helpers";
import { useSession } from "next-auth/react";
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
}

export default function OBOGDetailContent({ obog }: OBOGDetailContentProps) {
  const { t, language } = useLanguage();
  const { data: session } = useSession();
  const [showCalendar, setShowCalendar] = useState(false);
  
  const isOwner = session?.user?.id === obog.id && session?.user?.role === "obog";

  return (
    <div className="card-gradient p-8">
      {/* Profile Header */}
      <div className="flex items-start mb-6">
        <Avatar 
          src={obog.profilePhoto} 
          alt={obog.nickname || obog.name}
          size="xl"
          fallbackText={obog.nickname || obog.name}
          className="mr-6"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-3 py-1 rounded text-sm font-semibold ${
              obog.type === "working-professional" 
                ? "bg-blue-100 text-blue-800" 
                : "bg-green-100 text-green-800"
            }`}>
              {obog.type === "working-professional" ? t("obogDetail.workingProfessional") : t("obogDetail.jobOfferHolder")}
            </span>
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
          <p className="text-lg italic text-gray-800">{translate(obog.oneLineMessage)}</p>
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
            <p className="text-gray-700 whitespace-pre-wrap">{translate(obog.studentEraSummary)}</p>
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
          {isOwner ? "Configure Availability" : "View Availability"}
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

