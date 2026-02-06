
-- Fix profiles_client_view: recreate with security_invoker = true
-- This ensures the view respects the underlying profiles table's RLS policies
DROP VIEW IF EXISTS public.profiles_client_view;

CREATE VIEW public.profiles_client_view
WITH (security_invoker = true)
AS
SELECT 
  id, user_id, full_name, phone, avatar_url, cpf, created_at, updated_at
FROM public.profiles;

-- Also enable RLS on the view for extra safety
ALTER VIEW public.profiles_client_view SET (security_invoker = true);

-- Grant access only to authenticated users (not anon/public)
REVOKE ALL ON public.profiles_client_view FROM anon;
GRANT SELECT ON public.profiles_client_view TO authenticated;

-- Also ensure profiles table denies anon access explicitly
REVOKE ALL ON public.profiles FROM anon;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
