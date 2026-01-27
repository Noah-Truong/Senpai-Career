-- Fix RLS policies for companies table to allow service role access
-- Service role should bypass RLS, but if policies are blocking, this ensures admins can access

-- Drop existing admin policy
DROP POLICY IF EXISTS "Admins can manage companies" ON companies;

-- Create a more permissive policy that allows service role (which has no auth.uid())
-- Service role should bypass RLS entirely, but this policy ensures admin access works
CREATE POLICY "Admins can manage companies" ON companies 
FOR ALL 
USING (
  -- Allow if using service role (auth.uid() is null) OR if user is admin
  (SELECT auth.uid()) IS NULL OR
  (SELECT auth.uid())::text IN (SELECT id FROM users WHERE role = 'admin')
);

-- Also ensure the SELECT policy allows service role
DROP POLICY IF EXISTS "Anyone can read companies" ON companies;
CREATE POLICY "Anyone can read companies" ON companies 
FOR SELECT 
USING (true);

-- Grant necessary permissions (should already exist, but ensure they're there)
GRANT ALL ON companies TO service_role;
GRANT SELECT ON companies TO authenticated, anon;
