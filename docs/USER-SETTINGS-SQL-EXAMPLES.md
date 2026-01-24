# User Settings SQL Examples

This document provides SQL queries for saving and managing user preferences in the `user_settings` table.

## Table Structure

The `user_settings` table stores general user preferences:
- Display & UI (language, theme, timezone)
- Privacy (profile visibility, message permissions)
- Account preferences (email updates, 2FA)

## Example SQL Queries

### 1. Create or Update User Settings (Upsert)

This is the recommended approach - it will create settings if they don't exist, or update them if they do:

```sql
INSERT INTO user_settings (
  user_id,
  language_preference,
  theme_preference,
  timezone,
  profile_visibility,
  show_email,
  show_phone,
  allow_messages_from,
  email_updates,
  two_factor_enabled
)
VALUES (
  'user_id_here',           -- Replace with actual user ID
  'ja',                      -- Language: 'en' or 'ja'
  'light',                   -- Theme: 'light' or 'dark'
  'Asia/Tokyo',              -- Timezone
  'public',                  -- Profile visibility: 'public', 'private', 'contacts'
  false,                     -- Show email on profile
  false,                     -- Show phone on profile
  'all',                     -- Allow messages from: 'all', 'contacts', 'none'
  true,                      -- Email updates enabled
  false                      -- Two-factor authentication
)
ON CONFLICT (user_id) 
DO UPDATE SET 
  language_preference = EXCLUDED.language_preference,
  theme_preference = EXCLUDED.theme_preference,
  timezone = EXCLUDED.timezone,
  profile_visibility = EXCLUDED.profile_visibility,
  show_email = EXCLUDED.show_email,
  show_phone = EXCLUDED.show_phone,
  allow_messages_from = EXCLUDED.allow_messages_from,
  email_updates = EXCLUDED.email_updates,
  two_factor_enabled = EXCLUDED.two_factor_enabled,
  updated_at = NOW();
```

### 2. Update Specific Setting

Update only the language preference:

```sql
UPDATE user_settings
SET 
  language_preference = 'ja',
  updated_at = NOW()
WHERE user_id = 'user_id_here';
```

### 3. Update Multiple Settings

Update privacy-related settings:

```sql
UPDATE user_settings
SET 
  profile_visibility = 'private',
  show_email = false,
  show_phone = false,
  allow_messages_from = 'contacts',
  updated_at = NOW()
WHERE user_id = 'user_id_here';
```

### 4. Get User Settings

Retrieve all settings for a user:

```sql
SELECT * 
FROM user_settings 
WHERE user_id = 'user_id_here';
```

### 5. Get or Create Settings (Using Helper Function)

The schema includes a helper function that automatically creates default settings if they don't exist:

```sql
SELECT * FROM get_or_create_user_settings('user_id_here');
```

### 6. Get All Users with Specific Preference

Find all users who prefer Japanese:

```sql
SELECT u.id, u.email, u.name, us.language_preference
FROM users u
JOIN user_settings us ON u.id = us.user_id
WHERE us.language_preference = 'ja';
```

### 7. Get Users with Private Profiles

Find all users with private profile visibility:

```sql
SELECT u.id, u.email, u.name
FROM users u
JOIN user_settings us ON u.id = us.user_id
WHERE us.profile_visibility = 'private';
```

### 8. Bulk Update Timezone

Update timezone for all users in a specific region:

```sql
UPDATE user_settings
SET 
  timezone = 'Asia/Tokyo',
  updated_at = NOW()
WHERE timezone IS NULL OR timezone = 'UTC';
```

### 9. Reset Settings to Defaults

Reset a user's settings to default values:

```sql
UPDATE user_settings
SET 
  language_preference = 'en',
  theme_preference = 'light',
  timezone = 'Asia/Tokyo',
  profile_visibility = 'public',
  show_email = false,
  show_phone = false,
  allow_messages_from = 'all',
  email_updates = true,
  two_factor_enabled = false,
  updated_at = NOW()
WHERE user_id = 'user_id_here';
```

### 10. Delete User Settings

Remove settings for a user (usually done automatically via CASCADE when user is deleted):

```sql
DELETE FROM user_settings
WHERE user_id = 'user_id_here';
```

## Field Reference

| Field | Type | Default | Options |
|-------|------|---------|---------|
| `language_preference` | TEXT | 'en' | 'en', 'ja' |
| `theme_preference` | TEXT | 'light' | 'light', 'dark' |
| `timezone` | TEXT | 'Asia/Tokyo' | Any valid timezone |
| `profile_visibility` | TEXT | 'public' | 'public', 'private', 'contacts' |
| `show_email` | BOOLEAN | false | true, false |
| `show_phone` | BOOLEAN | false | true, false |
| `allow_messages_from` | TEXT | 'all' | 'all', 'contacts', 'none' |
| `email_updates` | BOOLEAN | true | true, false |
| `two_factor_enabled` | BOOLEAN | false | true, false |

## Notes

1. **Automatic Timestamps**: The `updated_at` field is automatically updated via trigger when any field changes.

2. **RLS Policies**: Row Level Security ensures users can only access their own settings.

3. **Default Values**: If settings don't exist, the API will create them with defaults automatically.

4. **Cascade Delete**: When a user is deleted, their settings are automatically deleted via CASCADE.

5. **Unique Constraint**: Each user can only have one settings record (enforced by UNIQUE constraint on `user_id`).

## Integration with Application

The application provides API endpoints at `/api/user-settings`:
- `GET`: Fetch user settings (creates defaults if missing)
- `POST`: Create default settings
- `PUT`: Update user settings

The settings are accessible in the UI via the Profile → Settings tab.
