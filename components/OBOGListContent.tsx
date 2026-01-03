"use client";

import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslated } from "@/lib/translation-helpers";
import Avatar from "./Avatar";

interface OBOGUser {
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
  profilePhoto?: string;
}

interface OBOGListContentProps {
  obogUsers: OBOGUser[];
}

export default function OBOGListContent({ obogUsers }: OBOGListContentProps) {
  const { t } = useLanguage();
  const { translate } = useTranslated();

  return (
    <>
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2" style={{ color: '#000000' }}>{t("obogList.title")}</h2>
        <p className="!text-black">
          {t("obogList.subtitle")}
        </p>
      </div>

      {obogUsers.length === 0 ? (
        <div className="card-gradient p-8 text-center">
          <p className="text-gray-700 text-lg">{t("obogList.empty.title")}</p>
          <p className="text-gray-600 mt-2">{t("obogList.empty.desc")}</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {obogUsers.map((obog) => (
            <Link 
              key={obog.id} 
              href={`/obog/${obog.id}`}
              className="card-gradient p-6 hover:shadow-xl transition-all duration-300 block"
            >
              <div className="flex items-start mb-4">
                <Avatar 
                  src={obog.profilePhoto} 
                  alt={obog.nickname || obog.name}
                  size="lg"
                  fallbackText={obog.nickname || obog.name}
                  className="mr-4"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-semibold whitespace-nowrap ${
                      obog.type === "working-professional" 
                        ? "bg-blue-100 text-blue-800" 
                        : "bg-green-100 text-green-800"
                    }`}>
                      {obog.type === "working-professional" ? t("obogList.card.workingProfessional") : t("obogList.card.jobOfferHolder")}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold truncate">{obog.nickname || obog.name}</h3>
                  <p className="text-sm text-gray-600 truncate">{obog.university}</p>
                  <p className="text-sm text-gray-600 truncate">{obog.company}</p>
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-700 mb-3 line-clamp-2">{obog.oneLineMessage ? translate(obog.oneLineMessage) : ""}</p>
                {obog.topics && obog.topics.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {obog.topics.slice(0, 3).map((topic, idx) => (
                      <span key={idx} className="px-2 py-1 bg-gray-100 rounded text-xs">
                        {topic}
                      </span>
                    ))}
                    {obog.topics.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                        +{obog.topics.length - 3} {t("obogList.card.more")}
                      </span>
                    )}
                  </div>
                )}
              </div>
              
              <div className="text-sm text-gray-600 space-y-1">
                {obog.languages && obog.languages.length > 0 && (
                  <p className="truncate">{t("obogList.card.languages")} {obog.languages.slice(0, 2).join(", ")}{obog.languages.length > 2 ? "..." : ""}</p>
                )}
                {obog.nationality && (
                  <p>{t("obogList.card.nationality")} {obog.nationality}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}

