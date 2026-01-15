-- Create function to check if user is dev (highest level) - using text comparison
CREATE OR REPLACE FUNCTION public.is_dev(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role::text = 'dev'
  )
$$;

-- Create function to check if user can manage roles (only dev and gestao)
CREATE OR REPLACE FUNCTION public.can_manage_roles(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role::text IN ('dev', 'gestao')
  )
$$;

-- Update has_admin_access to include dev
CREATE OR REPLACE FUNCTION public.has_admin_access()
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = auth.uid()
      AND role::text IN ('dev', 'admin', 'gestao', 'oficina')
  );
END;
$$;

-- Drop existing policies on user_roles if they exist
DROP POLICY IF EXISTS "Users can view their own role" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Dev and Gestao can manage roles" ON public.user_roles;
DROP POLICY IF EXISTS "Dev and Gestao can view all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Dev and Gestao can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Dev and Gestao can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Dev and Gestao can delete roles" ON public.user_roles;

-- Create new RLS policies for user_roles
-- Everyone can view their own role
CREATE POLICY "Users can view their own role"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Dev and Gestao can view all roles
CREATE POLICY "Dev and Gestao can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.can_manage_roles(auth.uid()));

-- Only Dev and Gestao can insert roles
CREATE POLICY "Dev and Gestao can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.can_manage_roles(auth.uid()));

-- Only Dev and Gestao can update roles
CREATE POLICY "Dev and Gestao can update roles"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (public.can_manage_roles(auth.uid()));

-- Only Dev and Gestao can delete roles
CREATE POLICY "Dev and Gestao can delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (public.can_manage_roles(auth.uid()));