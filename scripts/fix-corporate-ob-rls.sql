-- Fix RLS policies for corporate_obs table to allow service role access
-- Service role should bypass RLS, but if policies are blocking, this ensures admins can access

-- Drop existing admin policy
DROP POLICY IF EXISTS "Admins can manage corporate OBs" ON corporate_obs;

-- Create a more permissive policy that allows service role (which has no auth.uid())
-- Service role should bypass RLS entirely, but this policy ensures admin access works
CREATE POLICY "Admins can manage corporate OBs" ON corporate_obs 
FOR ALL 
USING (
  -- Allow if using service role (auth.uid() is null) OR if user is admin
  (SELECT auth.uid()) IS NULL OR
  (SELECT auth.uid())::text IN (SELECT id FROM users WHERE role = 'admin')
);

-- Also ensure the SELECT policy allows service role
DROP POLICY IF EXISTS "Anyone can read corporate OBs" ON corporate_obs;
CREATE POLICY "Anyone can read corporate OBs" ON corporate_obs 
FOR SELECT 
USING (true);

-- Grant necessary permissions
GRANT ALL ON corporate_obs TO service_role;
GRANT SELECT ON corporate_obs TO authenticated, anon;
