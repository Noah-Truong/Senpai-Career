/**
 * Helper functions for working with translated content in components
 */

import { MultilingualContent } from "@/types";
import { useLanguage } from "@/contexts/LanguageContext";

type Language = "en" | "ja";

/**
 * Get translated content from multilingual object or string
 * This is a utility function that can be used in components
 */
export function getTranslated(
  content: string | MultilingualContent | undefined | null,
  language: Language
): string {
  if (!content) {
    return "";
  }

  if (typeof content === "string") {
    // Legacy: if it's just a string, return as-is
    return content;
  }

  // Return the appropriate language, with fallback to English
  return content[language] || content.en || content.ja || "";
}

/**
 * React hook to get translated content
 */
export function useTranslated() {
  const { language, t } = useLanguage();

  const translate = (content: string | MultilingualContent | undefined | null): string => {
    return getTranslated(content, language);
  };

  return { translate, language };
}

/**
 * Check if content is multilingual
 */
export function isMultilingual(
  content: string | MultilingualContent | undefined | null
): content is MultilingualContent {
  return (
    typeof content === "object" &&
    content !== null &&
    "en" in content &&
    "ja" in content
  );
}

