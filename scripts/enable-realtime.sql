-- Enable Realtime for messages and threads tables
-- Run this in Supabase SQL Editor to enable Realtime subscriptions

-- Add tables to the supabase_realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE threads;

-- Verify tables are in the publication
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
AND tablename IN ('messages', 'threads');
