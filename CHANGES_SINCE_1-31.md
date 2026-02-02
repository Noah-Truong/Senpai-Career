# Full Report: Changes Since January 31, 2026

This report summarizes all commits and changes made to the SenpaiCareer project from **January 31, 2026** through **February 2, 2026**.

---

## Summary by Date

| Date       | Commits | Highlights |
|-----------|---------|-------------|
| Jan 31    | 2       | Major changes #2, duplicate sign-out/delete removed |
| Feb 1     | 6       | Font/style changes, deployment fixes, profile page, translations |
| Feb 2     | 4       | Admin changes, long descriptions fix, company profile photo upload |

**Total: 12 commits** across **50+ files** (including new and modified).

---

## Detailed Commit Log (Chronological)

### January 31, 2026

#### 1. `e7e3256` — major changes #2
- **API**: `app/api/browsing-history/route.ts`, `app/api/saved-items/route.ts`, `app/api/students/route.ts` (new), `app/api/billing/export/route.ts` (new)
- **Pages**: `app/companies/page.tsx`, `app/how-to-use/page.tsx`, `app/internships/page.tsx`, `app/ob-list/page.tsx`, `app/page.tsx`, `app/student-list/page.tsx` (new), `app/student/history/page.tsx`, `app/user/[id]/page.tsx`, `app/providers.tsx`
- **Components**: New — `BillingWidget.tsx`, `CompanyCard.tsx`, `ConversationList.tsx`, `FilterPanel.tsx`, `MessageBubble.tsx`, `MessageInput.tsx`, `StudentListContent.tsx`; Modified — `AvailabilityCalendar.tsx`, `CompanyDetailContent.tsx`, `SaveButton.tsx`, `Sidebar.tsx`; Removed — `AnimatedButton.tsx`, `ScrollProgress.tsx`
- **Sections**: `MissionSection.tsx`, `WhatIsSection.tsx`
- **Other**: `app/globals.css`, `contexts/LanguageContext.tsx`, `scripts/schema.sql`

#### 2. `54cae18` — removed duplicate sign out and delete account
- **Files**: `app/profile/page.tsx`, `app/user/[id]/page.tsx`, `components/OBOGDetailContent.tsx`

---

### February 1, 2026

#### 3. `1450dba` — font changes
- **Pages**: `app/about/page.tsx`, `app/companies/page.tsx`, `app/dashboard/admin/page.tsx`, `app/for-companies/*`, `app/for-obog/page.tsx`, `app/how-to-use/page.tsx`, `app/internships/page.tsx`, `app/ob-list/page.tsx`, `app/page.tsx`, `app/profile/page.tsx`, `app/recruiting/page.tsx`, `app/signup/student/page.tsx`, `app/student-list/page.tsx`, `app/student/profile/page.tsx`, `app/user/[id]/page.tsx`
- **Components**: `AppLayout.tsx`, `AvailabilityCalendar.tsx`, `FilterPanel.tsx`, `Header.tsx`, `OBOGListContent.tsx`, `StudentListContent.tsx`
- **Other**: `app/globals.css`, `contexts/LanguageContext.tsx`

#### 4. `d6c1c33` — style changes
- **New pages**: `app/for-companies/corporate-services/page.tsx`, `app/for-students/internships/page.tsx`, `app/for-students/recruiting/page.tsx`; Renamed: `app/about/ob-visit/page.tsx` → `app/for-students/ob-visit/page.tsx`
- **Pages**: Auth, forgot-password, login, register, reset-password, signup flows, internships/recruiting [id], student history/saved, subsidy, etc.
- **Components**: `AppLayout.tsx`, `Footer.tsx` (new), `Header.tsx`, `LanguageSwitcher.tsx`, `Logo.tsx`, icons (AlumIcon, CompanyIcon, CorporateOBIcon, StudentIcon)
- **Other**: `app/globals.css`, `contexts/LanguageContext.tsx`, `tailwind.config.ts`

#### 5. `2aaf56c` — fixed deployment#2
- **File**: `app/reset-password/[token]/page.tsx`

#### 6. `d8c296b` — new changes
- **Pages**: `app/about/page.tsx`, `app/admin/compliance/page.tsx`, `app/for-students/*`, `app/how-to-use/page.tsx`, `app/page.tsx`, `app/register/page.tsx`, signup pages, `app/student/history/page.tsx`, `app/student/profile/page.tsx`
- **Components**: `AppLayout.tsx`, `MultiSelectDropdown.tsx`
- **Other**: `contexts/LanguageContext.tsx`

#### 7. `7e7f4ef` — Fix Japanese translations and pricing inconsistencies
- **File**: `contexts/LanguageContext.tsx`

#### 8. `fdf3ad0` — profile page
- **Pages**: Auth (auth, verify-email), for-companies, for-students, forgot-password, how-to-use, internships, login, messages/[threadId], page, profile, recruiting, reset-password, signup (company, obog, student)
- **Components**: `AppLayout.tsx`, `Footer.tsx`, `Header.tsx`, `MessageBubble.tsx`, `NotificationSettings.tsx`, `Sidebar.tsx`, `SidebarLayout.tsx`, `UserSettings.tsx`
- **Other**: `app/globals.css`, `contexts/LanguageContext.tsx`, `tailwind.config.ts`

---

### February 2, 2026

#### 9. `7bbd727` — major changes admin side
- **Admin**: `app/admin/meetings/page.tsx`, `app/admin/users/page.tsx`
- **API**: `app/api/messages/route.ts` (e.g. free messaging for students)
- **Pages**: `app/company/profile/page.tsx`, `app/company/students/page.tsx`, `app/credits/page.tsx`, `app/dashboard/admin/page.tsx`, `app/for-companies/*`, `app/for-students/internships/page.tsx`, `app/for-students/recruiting/page.tsx`, `app/internships/page.tsx`, `app/messages/page.tsx`, `app/ob-list/page.tsx`, `app/recruiting/page.tsx`
- **Components**: `AppLayout.tsx`, `Header.tsx`, `OBOGListContent.tsx`, `Pagination.tsx` (new), `Sidebar.tsx`, `StudentListContent.tsx`
- **Other**: `app/globals.css`, `contexts/LanguageContext.tsx`, `next.config.js`, `vercel.json`, `cursor-commands.md` (new)

#### 10. `96a50b2` — style changes
- **File**: `app/for-companies/corporate-services/page.tsx` (e.g. arrows under steps)

#### 11. `aa1e25e` — fixed long descriptions
- **API**: Removed automatic multilingual JSON translation on save — `app/api/company/profile/route.ts`, `app/api/profile/route.ts`
- **Pages**: `app/student/history/page.tsx`, `app/student/saved/page.tsx` (use `getTranslated` for display)
- **Other**: `next.config.js`, `vercel.json`

#### 12. `084a17f` — fixed file upload for company profile photo
- **API**: `app/api/upload/route.ts` — use `createAdminClient()` for storage uploads; `upsert: true`; better error messages
- **Profile/upload**: `app/profile/page.tsx`, `app/student/profile/page.tsx` — auto-save photo/logo after upload; update both `user` and `formData`; call `refreshUser()` after upload; company uses `logo`, non-company uses `profilePhoto`; company logo section at top of edit form; duplicate logo block removed
- **Application uploads**: `app/internships/[id]/page.tsx`, `app/recruiting/[id]/page.tsx`, `components/AdditionalQuestionForm.tsx` — hidden file inputs with translated “Choose File” labels
- **Avatar**: `components/Avatar.tsx` — loading/error state; placeholder while loading; key by src for re-render
- **Auth**: `contexts/AuthContext.tsx` — for company role, set `profilePhoto` from `userData.logo` so sidebar shows company logo

---

## Themes and Feature Summary

### Profile & file upload
- Profile photo and company logo upload fixed end-to-end (storage + DB).
- Upload API uses admin Supabase client for reliable storage writes.
- Profile/student profile: auto-save photo/logo after upload and refresh auth so sidebar avatar updates.
- Company profile: single “Company Logo” block at top of edit form; view mode uses `user.logo` for avatar.
- All file upload buttons use translated labels (no native “Choose File”); resume and screenshot uploads use same pattern.

### Admin
- Admin users: search, role filter, View Profile / Message links, avatars, mobile card layout, aligned action links.
- Admin meetings: flagged meetings show user details (email, role, university/company, profile photo) and links to profile/message.
- Admin dashboard: quick action cards aligned; manage users / view reports / manage corporate OB leveled.

### UI/UX & styling
- Global font and card styling via CSS variables in `globals.css`.
- Header fixed at top for signed-in users (`AppLayout`).
- Uniform card heights on listing pages (internships, recruiting, OB list, company students) via flex and `mt-auto`.
- Pagination and filter indicators on list pages.
- Corporate services “How it works” arrows under each step.
- Removed profile icon tilt; consistent button/link styling.

### i18n & content
- Long descriptions no longer stored as auto-translated JSON; plain string only on save.
- Student history and saved pages use `getTranslated()` so existing JSON content still displays correctly.
- New/updated translation keys for admin (users, meetings), forms, and buttons.

### Billing & credits
- Students do not pay for messages (free messaging for students in `app/api/messages/route.ts`).
- Credits page and Stripe flow adjusted as needed; back button handling for Stripe.

### Deployment (Vercel)
- `next.config.js`: image optimization (Supabase remotes, AVIF/WebP), turbopack root, `optimizePackageImports` for Supabase, compression, no `x-powered-by`.
- `vercel.json`: region `hnd1`, API `maxDuration: 30`, security and cache headers for static assets.

---

## Files Touched (High Level)

**App (pages):** profile, student/profile, company/profile, company/students, admin (users, meetings, dashboard, compliance), auth, for-companies (including corporate-services), for-students, internships (list + [id]), recruiting (list + [id]), ob-list, student-list, student/history, student/saved, messages, credits, reset-password, signup flows, register, how-to-use, about, etc.

**API:** profile, company/profile, upload, messages, users, billing/export, etc.

**Components:** Avatar, Sidebar, Header, AppLayout, Footer, OBOGListContent, StudentListContent, Pagination, AdditionalQuestionForm, UserSettings, NotificationSettings, MultiSelectDropdown, and others.

**Contexts:** LanguageContext, AuthContext.

**Config:** next.config.js, vercel.json, tailwind.config.ts, globals.css.

---

*Report generated from git history since 2026-01-31. Working tree is clean; all changes are committed.*
