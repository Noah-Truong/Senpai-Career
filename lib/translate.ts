/**
 * Translation utility for user-generated content
 * Supports multiple translation providers with fallback
 */

type Language = "en" | "ja";

interface TranslationResult {
  translated: string;
  sourceLang: string;
  targetLang: string;
}

// Simple translation cache to avoid re-translating the same text
const translationCache = new Map<string, string>();

/**
 * Detect the language of the input text
 */
function detectLanguage(text: string): Language {
  // Simple heuristic: if text contains Japanese characters, it's Japanese
  const japaneseRegex = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/;
  return japaneseRegex.test(text) ? "ja" : "en";
}

/**
 * Translate text using Google Translate API (free tier available)
 * Falls back to a simple approach if API key is not configured
 */
export async function translateText(
  text: string,
  targetLang: Language,
  sourceLang?: Language
): Promise<string> {
  if (!text || text.trim().length === 0) {
    return text;
  }

  // Detect source language if not provided
  const detectedSourceLang = sourceLang || detectLanguage(text);

  // If source and target are the same, return original
  if (detectedSourceLang === targetLang) {
    return text;
  }

  // Check cache first
  const cacheKey = `${text}:${detectedSourceLang}:${targetLang}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)!;
  }

  try {
    // Try Google Translate API if configured
    const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
    if (apiKey) {
      const translated = await translateWithGoogle(text, targetLang, detectedSourceLang, apiKey);
      translationCache.set(cacheKey, translated);
      return translated;
    }
  } catch (error) {
    console.error("Google Translate API error:", error);
  }

  // Fallback: Return original text with a note (or implement a simpler translation)
  // In production, you might want to use a different free service or implement
  // a basic translation dictionary
  console.warn(`Translation not available. Returning original text.`);
  return text;
}

/**
 * Translate using Google Translate API
 */
async function translateWithGoogle(
  text: string,
  targetLang: Language,
  sourceLang: Language,
  apiKey: string
): Promise<string> {
  const response = await fetch(
    `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q: text,
        target: targetLang,
        source: sourceLang,
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Translation API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data.translations[0].translatedText;
}

/**
 * Translate multiple texts in parallel
 */
export async function translateMultiple(
  texts: string[],
  targetLang: Language,
  sourceLang?: Language
): Promise<string[]> {
  return Promise.all(texts.map((text) => translateText(text, targetLang, sourceLang)));
}

/**
 * Create a multilingual content object
 * Stores both English and Japanese versions
 */
export interface MultilingualContent {
  en: string;
  ja: string;
}

/**
 * Translate content and create multilingual object
 */
export async function createMultilingualContent(
  content: string,
  sourceLang?: Language
): Promise<MultilingualContent> {
  const detectedLang = sourceLang || detectLanguage(content);

  if (detectedLang === "en") {
    const ja = await translateText(content, "ja", "en");
    return { en: content, ja };
  } else {
    const en = await translateText(content, "en", "ja");
    return { en, ja: content };
  }
}

/**
 * Get translated content based on current language
 */
export function getTranslatedContent(
  content: MultilingualContent | string,
  language: Language
): string {
  if (typeof content === "string") {
    // Legacy: if it's just a string, return as-is
    return content;
  }

  return content[language] || content.en || content.ja || "";
}

/**
 * Batch translate multiple fields of an object
 */
export async function translateObjectFields<T extends Record<string, any>>(
  obj: T,
  fields: (keyof T)[],
  targetLang: Language
): Promise<Partial<T>> {
  const translations: Partial<T> = {};

  for (const field of fields) {
    const value = obj[field];
    if (typeof value === "string" && value.trim()) {
      (translations as any)[field] = await translateText(value, targetLang);
    }
  }

  return translations;
}

