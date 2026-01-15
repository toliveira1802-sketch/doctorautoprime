
-- Add referral tracking columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS referral_source text,
ADD COLUMN IF NOT EXISTS referral_cashback_applied boolean DEFAULT false;

-- Create referral campaigns table
CREATE TABLE IF NOT EXISTS public.referral_campaigns (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  cashback_points integer NOT NULL DEFAULT 100,
  is_active boolean NOT NULL DEFAULT false,
  max_uses integer,
  current_uses integer NOT NULL DEFAULT 0,
  valid_from date NOT NULL DEFAULT CURRENT_DATE,
  valid_to date,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.referral_campaigns ENABLE ROW LEVEL SECURITY;

-- Anyone can view active campaigns (for validation)
CREATE POLICY "Anyone can view active campaigns"
ON public.referral_campaigns
FOR SELECT
USING (is_active = true AND (valid_to IS NULL OR valid_to >= CURRENT_DATE));

-- Admins can manage all campaigns
CREATE POLICY "Admins can manage campaigns"
ON public.referral_campaigns
FOR ALL
USING (is_admin());

-- Add trigger for updated_at
CREATE TRIGGER update_referral_campaigns_updated_at
BEFORE UPDATE ON public.referral_campaigns
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample campaigns (all inactive by default)
INSERT INTO public.referral_campaigns (code, name, cashback_points, is_active) VALUES
  ('AMIGO50', 'Indicação de Amigo', 50, false),
  ('BEMVINDO', 'Boas-vindas', 30, false),
  ('PROMO100', 'Promoção Especial', 100, false);
