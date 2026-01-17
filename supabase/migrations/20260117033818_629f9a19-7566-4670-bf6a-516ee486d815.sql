-- Fix invite codes security issue
-- 1. Expire the exposed invite codes immediately
UPDATE public.invites 
SET expires_at = now() - interval '1 day'
WHERE code IN ('ADMIN2025', 'GESTAO2025');

-- 2. Drop the insecure public SELECT policy
DROP POLICY IF EXISTS "Anyone can validate invite codes" ON public.invites;

-- 3. Create a secure validation function that doesn't expose all codes
CREATE OR REPLACE FUNCTION public.validate_invite_code(check_code TEXT)
RETURNS TABLE(is_valid BOOLEAN, invite_role app_role)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    TRUE as is_valid,
    i.role as invite_role
  FROM public.invites i
  WHERE i.code = check_code
    AND i.used_by IS NULL
    AND i.expires_at > now()
  LIMIT 1;
END;
$$;