-- Fix the use_invite function to use auth.uid() instead of accepting user_uuid parameter
-- This prevents privilege escalation where users could assign roles to arbitrary users

CREATE OR REPLACE FUNCTION public.use_invite(invite_code character varying)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  invite_record RECORD;
  current_user_id UUID;
BEGIN
  -- Get current authenticated user
  current_user_id := auth.uid();
  
  -- Ensure user is authenticated
  IF current_user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Find valid invite
  SELECT * INTO invite_record 
  FROM public.invites 
  WHERE code = invite_code 
    AND used_by IS NULL 
    AND expires_at > now();
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Mark invite as used by current user only
  UPDATE public.invites 
  SET used_by = current_user_id, used_at = now() 
  WHERE id = invite_record.id;
  
  -- Assign role to current user only
  INSERT INTO public.user_roles (user_id, role) 
  VALUES (current_user_id, invite_record.role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN TRUE;
END;
$$;