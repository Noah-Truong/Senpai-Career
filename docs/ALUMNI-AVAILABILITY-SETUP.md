# Alumni Availability System Setup

## Overview

When an alumni signs in, their profile automatically appears in the Alumni Visits section, and they can configure their availability calendar. The data is stored in two Supabase tables:

1. **`obog_profiles`** - Contains the alumni profile information (name, university, company, etc.)
2. **`availability`** - Contains the alumni's available time slots in CSV format

## How It Works

### 1. Profile Display in Alumni Visits

- When an alumni signs up, their profile is automatically created in:
  - `users` table (with role = 'obog')
  - `obog_profiles` table (with nickname, university, company, etc.)
- The Alumni Visits page (`/ob-list`) fetches all OBOG users via `/api/obog`
- This API calls `getOBOGUsers()` which:
  - Fetches all users with `role = 'obog'` from `users` table
  - Merges each user with their profile from `obog_profiles` table
  - Returns the complete profile data

### 2. Calendar Configuration

- When an alumni views their own profile, they see a "Configure Availability" button
- Clicking it opens the availability calendar modal
- The calendar:
  - Loads existing availability from `availability` table using `alumni_name`
  - Uses `nickname || name` from `obog_profiles` to match the `alumni_name` in `availability` table
  - Allows clicking time slots to mark availability
  - Saves selected slots as CSV format: `"2024-12-20 09:00,2024-12-20 10:00,..."`

### 3. Data Storage

**Profile Data (`obog_profiles` table):**
- Created automatically during signup
- Contains: nickname, type, university, company, nationality, languages, topics, etc.
- Updated when alumni edits their profile

**Availability Data (`availability` table):**
- Created/updated when alumni configures their calendar
- Structure:
  - `alumni_name` - Matches `nickname` or `name` from `obog_profiles`
  - `times_csv` - Comma-separated list of available times: `"YYYY-MM-DD HH:MM,YYYY-MM-DD HH:MM,..."`

## Name Matching

The system uses the following logic to match alumni names:

1. **Primary**: Uses `nickname` from `obog_profiles` (if set)
2. **Fallback**: Uses `name` from `users` table (if nickname is not set)
3. **Calendar**: Uses `obog.nickname || obog.name` to match `availability.alumni_name`

## Security (RLS Policies)

- **View**: Anyone can view availability (students need to see when alumni are available)
- **Insert/Update/Delete**: Only OBOGs can manage their own availability
  - Checks that user role = 'obog'
  - Checks that `alumni_name` matches their nickname or name

## Testing

1. **Sign in as an alumni** (e.g., Mayumi Ayuko or any OBOG account)
2. **Go to Alumni Visits** (`/ob-list`) - Your profile should appear in the list
3. **Click on your profile** - Opens your profile detail page
4. **Click "Configure Availability"** - Opens the calendar modal
5. **Select time slots** - Click on dates/times to mark availability
6. **Click "Save Availability"** - Saves to `availability` table in Supabase
7. **Verify in Supabase**:
   - Check `obog_profiles` table - Your profile should be there
   - Check `availability` table - Your availability should be saved with your name

## Troubleshooting

**Profile not showing in Alumni Visits:**
- Check that `users.role = 'obog'`
- Check that `obog_profiles` entry exists for your user ID
- Verify the API endpoint `/api/obog` is working

**Calendar not saving:**
- Check that your `nickname` or `name` matches the `alumni_name` in `availability` table
- Verify RLS policies allow you to insert/update
- Check browser console for errors

**Name mismatch:**
- The calendar uses `obog.nickname || obog.name` as the `alumni_name`
- Make sure this matches exactly in the `availability` table
- If using nickname, ensure it's set in `obog_profiles.nickname`
