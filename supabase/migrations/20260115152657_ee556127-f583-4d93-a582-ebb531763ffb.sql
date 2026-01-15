-- Create invites table
CREATE TABLE public.invites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(20) NOT NULL UNIQUE,
  role public.app_role NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  used_by UUID REFERENCES auth.users(id),
  used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;

-- Admins can manage invites
CREATE POLICY "Admins can manage invites" 
ON public.invites 
FOR ALL 
TO authenticated 
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'gestao'));

-- Anyone can read invites to validate codes (but only active ones)
CREATE POLICY "Anyone can validate invite codes" 
ON public.invites 
FOR SELECT 
TO anon, authenticated 
USING (used_by IS NULL AND expires_at > now());

-- Function to use an invite
CREATE OR REPLACE FUNCTION public.use_invite(invite_code VARCHAR, user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  invite_record RECORD;
BEGIN
  -- Find valid invite
  SELECT * INTO invite_record 
  FROM public.invites 
  WHERE code = invite_code 
    AND used_by IS NULL 
    AND expires_at > now();
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Mark invite as used
  UPDATE public.invites 
  SET used_by = user_uuid, used_at = now() 
  WHERE id = invite_record.id;
  
  -- Assign role to user
  INSERT INTO public.user_roles (user_id, role) 
  VALUES (user_uuid, invite_record.role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN TRUE;
END;
$$;