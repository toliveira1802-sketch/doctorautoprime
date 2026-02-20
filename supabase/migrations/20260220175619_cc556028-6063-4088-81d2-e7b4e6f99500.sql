-- Revoke anon access to profiles (sensitive data requires authentication)
REVOKE SELECT ON public.profiles FROM anon;

NOTIFY pgrst, 'reload schema';