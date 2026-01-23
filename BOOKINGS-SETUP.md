# Bookings System Setup

## Database Setup

The bookings system requires the `bookings` table to be created in your Supabase database.

### Steps:

1. **Open Supabase SQL Editor**
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor

2. **Run the Bookings Schema**
   - Copy the contents of `scripts/bookings-schema.sql`
   - Paste into the SQL Editor
   - Click "Run" to execute

3. **Verify Table Creation**
   - Go to Table Editor in Supabase
   - You should see the `bookings` table with the following columns:
     - `id` (TEXT, Primary Key)
     - `student_id` (TEXT, Foreign Key to users)
     - `obog_id` (TEXT, Foreign Key to users)
     - `thread_id` (TEXT, nullable)
     - `meeting_id` (TEXT, Foreign Key to meetings)
     - `booking_date_time` (TEXT)
     - `duration_minutes` (INTEGER)
     - `status` (booking_status enum)
     - `notes` (TEXT, nullable)
     - `created_at`, `updated_at`, `cancelled_at` (TIMESTAMPTZ)
     - `cancelled_by` (TEXT, nullable)
     - `cancellation_reason` (TEXT, nullable)

## How It Works

1. **Students book time slots** from OB/OG availability calendars
2. **Bookings create meetings** automatically in the message thread
3. **OB/OG can confirm or cancel** bookings
4. **Booked slots are marked** in the availability calendar (blue color)

## Troubleshooting

If you see errors like "Could not find the table 'public.bookings'":
- Make sure you've run the `scripts/bookings-schema.sql` script
- Check that the table exists in Supabase Table Editor
- Verify RLS policies are enabled and correct
