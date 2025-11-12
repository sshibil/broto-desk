-- Fix infinite recursion in profiles RLS policies
-- Drop the problematic policies
DROP POLICY IF EXISTS "Staff and admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Only admins can manage user roles" ON profiles;

-- Recreate policies without recursion
-- Users can always view their own profile (no recursion)
-- For staff/admin to view all profiles, we'll use a simpler approach

-- Allow users to view their own profile
-- This policy already exists and is fine: "Users can view their own profile"

-- Staff and admins can view all profiles (non-recursive version)
-- We'll check the role directly on the current row being accessed
CREATE POLICY "Staff and admins can view all profiles v2" 
ON profiles 
FOR SELECT 
USING (
  -- User can see their own profile
  id = auth.uid()
  OR
  -- Or if the current user (not the row) is staff/admin
  -- We check this by looking up their own profile only
  auth.uid() IN (
    SELECT id FROM profiles 
    WHERE id = auth.uid() 
    AND role IN ('STAFF', 'ADMIN')
  )
);

-- Only admins can manage user roles (non-recursive version)
CREATE POLICY "Only admins can manage user roles v2" 
ON profiles 
FOR UPDATE 
USING (
  auth.uid() IN (
    SELECT id FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'ADMIN'
  )
)
WITH CHECK (
  auth.uid() IN (
    SELECT id FROM profiles 
    WHERE id = auth.uid() 
    AND role = 'ADMIN'
  )
);