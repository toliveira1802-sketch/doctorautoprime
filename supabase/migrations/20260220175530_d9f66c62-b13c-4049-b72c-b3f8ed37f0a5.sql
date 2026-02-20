-- Grant necessary permissions on profiles table
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;

-- Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';