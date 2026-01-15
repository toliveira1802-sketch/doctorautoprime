-- Add CRM fields to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS cpf text,
ADD COLUMN IF NOT EXISTS is_recurrent boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS lifetime_value numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS priority_score integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS internal_notes text,
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}'::text[];

-- Create a client-facing view that hides internal CRM fields
CREATE OR REPLACE VIEW public.profiles_client_view
WITH (security_invoker = on) AS
SELECT 
  id,
  user_id,
  full_name,
  phone,
  avatar_url,
  cpf,
  created_at,
  updated_at
FROM public.profiles;

-- Grant access to the view
GRANT SELECT ON public.profiles_client_view TO authenticated;

-- Add RLS policy for admins to view all vehicles (they currently can't)
CREATE POLICY "Admins can view all vehicles"
ON public.vehicles
FOR SELECT
TO authenticated
USING (public.is_admin());