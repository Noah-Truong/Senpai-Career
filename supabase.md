-- Ensure pgcrypto extension for gen_random_uuid CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create notifications table CREATE TABLE IF NOT EXISTS public.notifications LP id UUID PRIMARY KEY DEFAULT gen_random_uuid() , user_id UUID NOT NULL REFERENCES public.users id ON DELETE CASCADE , type VARCHAR 50 CHECK type IN 'internship', 'new-grad', 'message', 'system' , title VARCHAR 255 NOT NULL , content TEXT , link TEXT , read BOOLEAN DEFAULT FALSE , created_at TIMESTAMPTZ DEFAULT NOW() RP ;

-- Indexes user lookup and unread count CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications user_id ; CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications user_id, read ;

-- Enable Row Level Security ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY ;

-- Helper SECURITY DEFINER function to return auth.uid as uuid CREATE OR REPLACE FUNCTION public.current_user_id RETURN uuid LANGUAGE sql STABLE SECURITY DEFINER AS $$ SELECT auth.uid()::uuid ;


-- Policies -- Allow authenticated users to SELECT their own notifications CREATE POLICY notifications_select_own ON public.notifications FOR SELECT TO authenticated USING user_id = public.current_user_id() ;

-- Allow authenticated users to INSERT notifications where user_id matches their id CREATE POLICY notifications_insert_own ON public.notifications FOR INSERT TO authenticated WITH CHECK user_id = public.current_user_id() ;

-- Allow authenticated users to UPDATE their own notifications e.g. mark read CREATE POLICY notifications_update_own ON public.notifications FOR UPDATE TO authenticated USING user_id = public.current_user_id() WITH CHECK user_id = public.current_user_id() ;

-- Allow authenticated users to DELETE their own notifications CREATE POLICY notifications_delete_own ON public.notifications FOR DELETE TO authenticated USING user_id = public.current_user_id() ;

-- Grant minimal table privileges GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated ;

-- Trigger to set created_at on insert optional CREATE OR REPLACE FUNCTION public.notifications_set_created_at RETURN trigger LANGUAGE plpgsql SECURITY DEFINER AS $$ BEGIN IF NEW.created_at IS NULL THEN NEW.created_at := NOW() ; END IF ; RETURN NEW ; END ;
​

CREATE TRIGGER notifications_set_created_at_trigger BEFORE INSERT ON public.notifications FOR EACH ROW EXECUTE FUNCTION public.notifications_set_created_at() ;

