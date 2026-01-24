# RLS (Row Level Security) — When to Disable

**Recommendation:** Prefer **fixing policies** over disabling RLS. Disabling RLS weakens security. Only disable for specific tables where you’ve confirmed RLS is blocking valid access and you enforce auth in your app.

---

## Tables That Use RLS

| Table | Schema | Access |
|-------|--------|--------|
| `users` | master | API + auth |
| `student_profiles` | master | API + client (profile) |
| `obog_profiles` | master | API + client |
| `company_profiles` | master | API + client |
| `internships` | master | API |
| `threads` | master | API (note: app also uses file-based threads) |
| `messages` | master | API |
| `notifications` | master | API + client |
| `reports` | master | API |
| `applications` | master | API |
| `reviews` | master | API |
| `availability` | availability-schema | **Client (AvailabilityCalendar)** + API |
| `bookings` | bookings-schema | API |
| `meetings` | meetings-schema | API |
| `meeting_operation_logs` | meetings-schema | API |
| `notification_settings` | notification-settings | API |
| `email_notification_queue` | notification-settings | API (cron) |
| `user_settings` | user-settings | API |
| `saved_items` | student-history | API |
| `browsing_history` | student-history | API |

---

## Tables to Consider Disabling RLS For

### 1. **`meetings`** and **`meeting_operation_logs`** (highest priority)

- **Why:** Meeting INSERT policy requires `EXISTS (SELECT 1 FROM threads WHERE threads.id = thread_id ...)`. The app uses **file-based** threads (`data/threads.json`) with IDs like `thread_1769213262375_xxx`. Those IDs are not in the DB `threads` table, so the policy fails and meeting creation is denied.
- **When:** You see `supabase is not defined`-type errors fixed but still get permission denied when creating/updating meetings.
- **Trade-off:** All meeting access goes through your API; you enforce auth there. Disabling RLS on these two tables is a pragmatic way to unblock.

### 2. **`availability`** (if you see denials)

- **Why:** Used from the **client** (AvailabilityCalendar) and has policies that do subqueries on `users` / `obog_profiles`. Easier to hit edge cases (e.g. session, anon vs authenticated).
- **When:** OB/OGs can’t save availability or students can’t view it, and you’ve ruled out other bugs.
- **Trade-off:** More sensitive; anyone could read/write availability if you disable. Prefer fixing policies (e.g. simplify or use a small RPC) before disabling.

### 3. **`threads`** (only if you fully use DB threads)

- **Why:** Mix of file-based and DB threads can make policies confusing. Meetings policy already depends on `threads`.
- **When:** You fully migrate to DB-backed threads and still get RLS denials.
- **Trade-off:** Affects messages and meetings. Prefer fixing the model and policies.

---

## Tables to Keep RLS On

- **`users`**, **`student_profiles`**, **`obog_profiles`**, **`company_profiles`** — core identity; keep RLS.
- **`messages`**, **`notifications`**, **`applications`**, **`reports`** — sensitive; keep RLS.
- **`saved_items`**, **`browsing_history`** — policies are simple (`auth.uid() = student_id`); keep RLS unless you’ve proved otherwise.

---

## Optional: SQL to Disable RLS on Select Tables

Run **only** on the tables you’ve decided to relax. Start with `meetings` and `meeting_operation_logs` if meeting create/update is failing.

```sql
-- Use only for tables you've decided to disable RLS for.
-- Start with meetings if you're hitting meeting creation permission errors.

-- Meetings (policy references DB threads; app uses file-based threads)
ALTER TABLE meetings DISABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_operation_logs DISABLE ROW LEVEL SECURITY;

-- Optional: only if availability still fails after fixing other issues
-- ALTER TABLE availability DISABLE ROW LEVEL SECURITY;
```

To **re-enable** later:

```sql
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_operation_logs ENABLE ROW LEVEL SECURITY;
-- Then recreate policies as needed.
```

---

## Summary

| Action | Tables |
|--------|--------|
| **Consider disabling first** | `meetings`, `meeting_operation_logs` |
| **Consider only if needed** | `availability` |
| **Keep RLS on** | `users`, profiles, `messages`, `notifications`, `applications`, `reports`, `saved_items`, `browsing_history`, etc. |

Prefer updating the `meetings` INSERT policy (e.g. allow when `auth.uid() = student_id` without requiring `threads` EXISTS) over disabling RLS, if you can.
