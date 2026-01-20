# Dummy OBOG Profiles Setup

This script adds 5 dummy alumni profiles to your database that match the dummy availability data.

## Alumni Added

1. **John Smith** - Software Engineer at Sony Corporation
2. **Sarah Johnson** - Business Strategist at Rakuten
3. **Michael Chen** - Job Offer Holder at Google Japan
4. **Emily Davis** - Game Developer at Nintendo
5. **David Kim** - Engineer at Toyota

## Setup Instructions

1. **Run the availability schema first** (if not already done):
   ```sql
   -- Run scripts/availability-schema.sql
   ```

2. **Run the dummy OBOG profiles script**:
   ```sql
   -- Run scripts/dummy-obog-profiles.sql in Supabase SQL Editor
   ```

3. **Verify the data**:
   - Check that all 5 alumni appear in the Alumni Visits page (`/ob-list`)
   - Each alumni should have their availability calendar populated
   - Names in `availability` table should match `nickname` in `obog_profiles`

## Notes

- These are **dummy/test accounts** - they use placeholder password hashes
- The names in `obog_profiles.nickname` must match `availability.alumni_name` exactly
- All alumni have role `'obog'` in the `users` table
- Each alumni has realistic profile data (university, company, topics, etc.)

## Matching Names

The calendar component uses `obog.nickname || obog.name` to match with `availability.alumni_name`:
- ✅ John Smith
- ✅ Sarah Johnson  
- ✅ Michael Chen
- ✅ Emily Davis
- ✅ David Kim

All names match between the two tables.
