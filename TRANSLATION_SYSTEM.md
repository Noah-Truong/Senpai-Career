# Translation System for User-Generated Content

## Overview

The translation system automatically translates user-generated content (messages, company profiles, OB/OG profiles, application answers) and stores both English and Japanese versions. Content is displayed based on the user's selected language.

## How It Works

### 1. **Automatic Translation on Save**

When users create or update content, the system:
- Detects the source language (English or Japanese)
- Translates to the other language using Google Translate API
- Stores both versions as a `MultilingualContent` object: `{ en: string, ja: string }`

### 2. **Content Types Translated**

- **Messages**: Message content is automatically translated
- **Company Profiles**: `overview`, `internshipDetails`, `newGradDetails`, `idealCandidate`, `sellingPoints`, `oneLineMessage`
- **OB/OG Profiles**: `oneLineMessage`, `studentEraSummary`
- **Application Answers**: All application question answers

### 3. **Display Logic**

Components use the `useTranslated()` hook to get the correct language version:

```typescript
import { useTranslated } from "@/lib/translation-helpers";

const { translate } = useTranslated();

// In your component
<p>{translate(message.content)}</p>
<p>{translate(company.overview)}</p>
```

The `translate()` function automatically:
- Returns the correct language based on user's current language setting
- Falls back to English if translation is missing
- Handles both legacy string content and new multilingual content

## Setup

### 1. **Google Translate API (Optional but Recommended)**

For automatic translation, add your Google Translate API key to `.env.local`:

```bash
GOOGLE_TRANSLATE_API_KEY=your-api-key-here
```

**Getting an API Key:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable "Cloud Translation API"
4. Create credentials (API Key)
5. Add the key to `.env.local`

**Free Tier:** Google Translate API offers a free tier (500,000 characters/month)

### 2. **Without API Key**

If no API key is configured, the system will:
- Store content as plain text (no translation)
- Display the original content regardless of language setting
- Log warnings in the console

## API Endpoints

### Translation happens automatically in:

- `POST /api/messages` - Translates message content
- `POST /api/auth/signup` - Translates company/OB/OG profile fields on signup
- `PUT /api/profile` - Translates multilingual fields on profile update
- `PUT /api/company/profile` - Translates company fields on update
- `POST /api/applications` - Translates application answers

## Data Structure

### MultilingualContent Type

```typescript
interface MultilingualContent {
  en: string;
  ja: string;
}
```

### Example in Database

```json
{
  "id": "msg_123",
  "content": {
    "en": "Hello, I'm interested in your company.",
    "ja": "こんにちは、あなたの会社に興味があります。"
  }
}
```

## Usage in Components

### Basic Usage

```typescript
import { useTranslated } from "@/lib/translation-helpers";

function MyComponent() {
  const { translate } = useTranslated();
  const company = { overview: { en: "...", ja: "..." } };
  
  return <p>{translate(company.overview)}</p>;
}
```

### With useLanguage

```typescript
import { useLanguage } from "@/contexts/LanguageContext";
import { useTranslated } from "@/lib/translation-helpers";

function MyComponent() {
  const { language } = useLanguage();
  const { translate } = useTranslated();
  
  // translate() automatically uses the current language
  return <p>{translate(content)}</p>;
}
```

## Migration Notes

### Legacy Content

The system is backward-compatible:
- Old content stored as plain strings will display as-is
- New content will be stored as multilingual objects
- Components handle both formats automatically

### Updating Existing Content

To translate existing content:
1. Update the content through the profile/editor pages
2. The system will automatically create translations
3. Both versions will be stored going forward

## Troubleshooting

### Translation Not Working

1. **Check API Key**: Ensure `GOOGLE_TRANSLATE_API_KEY` is set in `.env.local`
2. **Check API Quota**: Verify you haven't exceeded Google Translate API limits
3. **Check Console**: Look for translation errors in server logs
4. **Fallback Behavior**: System falls back to original text if translation fails

### Content Not Displaying in Correct Language

1. **Check Language Setting**: Verify user's language preference in `LanguageContext`
2. **Check Content Format**: Ensure content is stored as `MultilingualContent` object
3. **Check Component**: Verify component uses `translate()` helper function

## Future Enhancements

- Add caching for frequently translated content
- Support for additional languages
- Manual translation editing interface
- Translation quality review system

