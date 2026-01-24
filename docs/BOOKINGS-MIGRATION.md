# Bookings Migration Guide

## Overview

This migration simplifies the booking system by removing the separate `meetings` and `meeting_operation_logs` tables and storing all meeting-related data directly in the `bookings` table.

## Changes

### Database Changes

1. **New columns added to `bookings` table:**
   - `meeting_url` (TEXT) - Meeting URL (e.g., Google Meet, Zoom)
   - `meeting_status` (TEXT) - Meeting status: 'unconfirmed', 'confirmed', 'completed', 'cancelled', 'no-show'
   - `student_post_status` (TEXT) - Student's post-meeting status: 'completed' or 'no-show'
   - `obog_post_status` (TEXT) - OB/OG's post-meeting status: 'completed' or 'no-show'
   - `student_post_status_at` (TIMESTAMPTZ) - When student marked status
   - `obog_post_status_at` (TIMESTAMPTZ) - When OB/OG marked status

2. **Removed:**
   - `meeting_id` foreign key column (no longer needed)
   - Dependencies on `meetings` table
   - Dependencies on `meeting_operation_logs` table

### API Changes

1. **`/api/bookings` POST:**
   - Now saves `meeting_url` and `notes` directly to `bookings` table
   - No longer creates separate `meetings` record
   - Returns booking with meeting data included

2. **`/api/bookings` GET:**
   - Reads meeting data directly from `bookings` table
   - No longer queries `meetings` table

3. **`/api/bookings/[id]` PUT:**
   - Updates `meeting_status` and `obog_post_status` directly in `bookings` table
   - Actions: `accept`, `complete`, `cancel`, `mark_no_show`

### Frontend Changes

1. **Booking Interface:**
   - `meetingUrl` and `notes` are now direct properties of booking
   - `meetingStatus` and `meetingPostStatus` read from booking

2. **Bookings Page:**
   - Displays meeting URL and notes from booking data
   - Status logic updated to use `meeting_status` from bookings

## Migration Steps

1. **Run the migration script:**
   ```sql
   -- Execute in Supabase SQL Editor
   -- File: scripts/migrate-meetings-to-bookings.sql
   ```

2. **Verify migration:**
   ```sql
   -- Check that data was migrated
   SELECT COUNT(*) as total_bookings FROM bookings;
   SELECT COUNT(*) as bookings_with_meeting_url FROM bookings WHERE meeting_url IS NOT NULL;
   SELECT meeting_status, COUNT(*) FROM bookings GROUP BY meeting_status;
   ```

3. **Optional - Drop old tables (after verifying everything works):**
   ```sql
   DROP TABLE IF EXISTS meeting_operation_logs CASCADE;
   DROP TABLE IF EXISTS meetings CASCADE;
   ```

## Benefits

- **Simplified data model:** One table instead of three
- **Better performance:** Fewer joins needed
- **Easier maintenance:** All booking data in one place
- **No foreign key issues:** Removed dependency on threads table for meetings

## Notes

- The `notes` field in bookings serves as the meeting description
- Meeting URL is stored when booking is created
- Meeting status tracks the lifecycle: unconfirmed → confirmed → completed/no-show
- Post-status allows both parties to independently mark completion/no-show
