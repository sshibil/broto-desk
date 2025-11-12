-- Fix infinite recursion in profiles RLS policies
-- Drop ALL existing policies on profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Staff and admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Staff and admins can view all profiles v2" ON profiles;
DROP POLICY IF EXISTS "Only admins can manage user roles" ON profiles;
DROP POLICY IF EXISTS "Only admins can manage user roles v2" ON profiles;

-- Create a security definer function to check roles without recursion
CREATE OR REPLACE FUNCTION public.current_user_role()
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM profiles WHERE id = auth.uid()
$$;

-- Create simple, non-recursive policies
-- Everyone can view all profiles (internal system)
CREATE POLICY "Anyone can view profiles"
ON profiles
FOR SELECT
TO authenticated
USING (true);

-- Users can update their own basic info (not role)
CREATE POLICY "Users can update own profile"
ON profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (
  id = auth.uid() 
  AND role = (SELECT role FROM profiles WHERE id = auth.uid())
);

-- Only admins can update any profile including roles
CREATE POLICY "Admins can update any profile"
ON profiles
FOR UPDATE
TO authenticated
USING (public.current_user_role() = 'ADMIN')
WITH CHECK (public.current_user_role() = 'ADMIN');