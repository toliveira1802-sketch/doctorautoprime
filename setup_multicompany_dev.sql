-- =============================================
-- SCRIPT COMPLETO: MULTI-COMPANY + DEV USERS
-- Execute este script no SQL Editor do Supabase
-- =============================================

-- 1. CRIAR TABELA DE EMPRESAS
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#1e40af',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. INSERIR AS 3 EMPRESAS
INSERT INTO public.companies (name, slug, primary_color) VALUES
  ('Doctor Auto Prime', 'doctor-auto-prime', '#1e40af'),
  ('Doctor Auto Bosch', 'doctor-auto-bosch', '#dc2626'),
  ('Garage 347', 'garage-347', '#15803d')
ON CONFLICT (slug) DO NOTHING;

-- 3. ADICIONAR company_id NAS TABELAS
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
ALTER TABLE public.user_roles ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
ALTER TABLE public.services ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);
ALTER TABLE public.appointments ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);

-- 4. CRIAR TABELA DE CÓDIGOS DE CONVITE
CREATE TABLE IF NOT EXISTS public.invite_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL,
  max_uses INTEGER NOT NULL DEFAULT 1,
  current_uses INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. INSERIR CÓDIGOS DE CONVITE PARA DEV
INSERT INTO public.invite_codes (code, role, max_uses, expires_at)
VALUES 
  ('THALES-DEV-MASTER-2026', 'dev', 1, NOW() + INTERVAL '90 days'),
  ('SOPHIA-DEV-MASTER-2026', 'dev', 1, NOW() + INTERVAL '90 days')
ON CONFLICT (code) DO NOTHING;

-- 6. CRIAR USUÁRIOS DEV (se ainda não existirem)
DO $$
DECLARE
  thales_id UUID;
  sophia_id UUID;
  default_company_id UUID;
BEGIN
  -- Pegar ID da empresa padrão
  SELECT id INTO default_company_id FROM public.companies WHERE slug = 'doctor-auto-prime' LIMIT 1;
  
  -- Buscar usuários (se existirem)
  SELECT id INTO thales_id FROM auth.users WHERE email = 'toliveira1802@gmail.com';
  SELECT id INTO sophia_id FROM auth.users WHERE email = 'sophia.duarte1@hotmail.com';
  
  -- Se Thales existir, adicionar role DEV
  IF thales_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role, company_id)
    VALUES (thales_id, 'dev', default_company_id)
    ON CONFLICT (user_id, role) DO NOTHING;
    
    UPDATE public.profiles 
    SET company_id = default_company_id 
    WHERE user_id = thales_id AND company_id IS NULL;
  END IF;
  
  -- Se Sophia existir, adicionar role DEV
  IF sophia_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role, company_id)
    VALUES (sophia_id, 'dev', default_company_id)
    ON CONFLICT (user_id, role) DO NOTHING;
    
    UPDATE public.profiles 
    SET company_id = default_company_id 
    WHERE user_id = sophia_id AND company_id IS NULL;
  END IF;
  
  RAISE NOTICE 'Setup concluído!';
END $$;

-- 7. ENABLE RLS
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invite_codes ENABLE ROW LEVEL SECURITY;

-- 8. POLICIES
DROP POLICY IF EXISTS "Anyone can view active companies" ON public.companies;
CREATE POLICY "Anyone can view active companies" ON public.companies
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Anyone can view valid invite codes" ON public.invite_codes;
CREATE POLICY "Anyone can view valid invite codes" ON public.invite_codes
  FOR SELECT USING (current_uses < max_uses AND (expires_at IS NULL OR expires_at > NOW()));

-- PRONTO! ✅
SELECT 'Setup Multi-Company + DEV concluído com sucesso!' as status;
