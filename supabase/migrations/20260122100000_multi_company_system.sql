-- =============================================
-- SISTEMA MULTI-COMPANY
-- Data: 2026-01-22
-- =============================================

-- =============================================
-- 1. CRIAR TABELA DE EMPRESAS
-- =============================================

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

-- Comentários
COMMENT ON TABLE public.companies IS 'Empresas do grupo Doctor Auto Prime';
COMMENT ON COLUMN public.companies.slug IS 'Identificador único para URLs e código (ex: doctor-auto-prime)';
COMMENT ON COLUMN public.companies.primary_color IS 'Cor primária da marca (hex)';

-- =============================================
-- 2. INSERIR AS 3 EMPRESAS
-- =============================================

INSERT INTO public.companies (name, slug, primary_color) VALUES
  ('Doctor Auto Prime', 'doctor-auto-prime', '#1e40af'),
  ('Doctor Auto Bosch', 'doctor-auto-bosch', '#dc2626'),
  ('Garage 347', 'garage-347', '#15803d')
ON CONFLICT (slug) DO NOTHING;

-- =============================================
-- 3. ADICIONAR company_id NAS TABELAS EXISTENTES
-- =============================================

-- Profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL;

-- User Roles (para controlar acesso por empresa)
ALTER TABLE public.user_roles
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;

-- Vehicles
ALTER TABLE public.vehicles
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL;

-- Services
ALTER TABLE public.services
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;

-- Promotions
ALTER TABLE public.promotions
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;

-- Events
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;

-- Appointments
ALTER TABLE public.appointments
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL;

-- Ordens de Serviço (se existir)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'ordens_servico') THEN
    ALTER TABLE public.ordens_servico
    ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Mechanics (se existir)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'mechanics') THEN
    ALTER TABLE public.mechanics
    ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Workflow Etapas (se existir)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'workflow_etapas') THEN
    ALTER TABLE public.workflow_etapas
    ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;
  END IF;
END $$;

-- =============================================
-- 4. CRIAR ÍNDICES
-- =============================================

CREATE INDEX IF NOT EXISTS idx_profiles_company ON public.profiles(company_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_company ON public.user_roles(company_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_company ON public.vehicles(company_id);
CREATE INDEX IF NOT EXISTS idx_services_company ON public.services(company_id);
CREATE INDEX IF NOT EXISTS idx_promotions_company ON public.promotions(company_id);
CREATE INDEX IF NOT EXISTS idx_events_company ON public.events(company_id);
CREATE INDEX IF NOT EXISTS idx_appointments_company ON public.appointments(company_id);

-- =============================================
-- 5. ATUALIZAR DADOS EXISTENTES
-- =============================================

-- Definir Doctor Auto Prime como empresa padrão para dados existentes
DO $$
DECLARE
  default_company_id UUID;
BEGIN
  -- Pegar ID da Doctor Auto Prime
  SELECT id INTO default_company_id FROM public.companies WHERE slug = 'doctor-auto-prime' LIMIT 1;
  
  -- Atualizar tabelas existentes
  UPDATE public.profiles SET company_id = default_company_id WHERE company_id IS NULL;
  UPDATE public.vehicles SET company_id = default_company_id WHERE company_id IS NULL;
  UPDATE public.services SET company_id = default_company_id WHERE company_id IS NULL;
  UPDATE public.promotions SET company_id = default_company_id WHERE company_id IS NULL;
  UPDATE public.events SET company_id = default_company_id WHERE company_id IS NULL;
  UPDATE public.appointments SET company_id = default_company_id WHERE company_id IS NULL;
  
  -- Atualizar user_roles existentes
  UPDATE public.user_roles SET company_id = default_company_id WHERE company_id IS NULL;
  
  -- Atualizar outras tabelas se existirem
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'ordens_servico') THEN
    EXECUTE 'UPDATE public.ordens_servico SET company_id = $1 WHERE company_id IS NULL' USING default_company_id;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'mechanics') THEN
    EXECUTE 'UPDATE public.mechanics SET company_id = $1 WHERE company_id IS NULL' USING default_company_id;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'workflow_etapas') THEN
    EXECUTE 'UPDATE public.workflow_etapas SET company_id = $1 WHERE company_id IS NULL' USING default_company_id;
  END IF;
END $$;

-- =============================================
-- 6. CRIAR TABELA DE ACESSO MULTI-COMPANY
-- =============================================

-- Tabela para usuários que têm acesso a múltiplas empresas (DEV, GESTAO)
CREATE TABLE IF NOT EXISTS public.user_company_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  can_view BOOLEAN NOT NULL DEFAULT true,
  can_edit BOOLEAN NOT NULL DEFAULT false,
  can_manage BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, company_id)
);

CREATE INDEX IF NOT EXISTS idx_user_company_access_user ON public.user_company_access(user_id);
CREATE INDEX IF NOT EXISTS idx_user_company_access_company ON public.user_company_access(company_id);

COMMENT ON TABLE public.user_company_access IS 'Controle de acesso de usuários a múltiplas empresas';
COMMENT ON COLUMN public.user_company_access.can_view IS 'Pode visualizar dados da empresa';
COMMENT ON COLUMN public.user_company_access.can_edit IS 'Pode editar dados da empresa';
COMMENT ON COLUMN public.user_company_access.can_manage IS 'Pode gerenciar configurações da empresa';

-- =============================================
-- 7. CRIAR TABELA DE CÓDIGOS DE CONVITE (SE NÃO EXISTIR)
-- =============================================

CREATE TABLE IF NOT EXISTS public.invite_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL,
  max_uses INTEGER NOT NULL DEFAULT 1,
  current_uses INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_invite_codes_code ON public.invite_codes(code);
CREATE INDEX IF NOT EXISTS idx_invite_codes_expires ON public.invite_codes(expires_at);

COMMENT ON TABLE public.invite_codes IS 'Códigos de convite para registro de usuários com roles específicas';

-- Enable RLS
ALTER TABLE public.invite_codes ENABLE ROW LEVEL SECURITY;

-- Qualquer um pode ler códigos válidos (para validação no frontend)
CREATE POLICY "Anyone can view valid invite codes" ON public.invite_codes
  FOR SELECT USING (
    current_uses < max_uses 
    AND (expires_at IS NULL OR expires_at > NOW())
  );

-- Apenas DEV e GESTAO podem gerenciar códigos
CREATE POLICY "DEV and GESTAO can manage invite codes" ON public.invite_codes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role IN ('dev', 'gestao')
    )
  );

-- =============================================
-- 8. CRIAR CÓDIGOS DE CONVITE PARA DEV
-- =============================================

INSERT INTO public.invite_codes (code, role, max_uses, expires_at)
VALUES 
  ('THALES-DEV-MASTER-2026', 'dev', 1, NOW() + INTERVAL '90 days'),
  ('SOPHIA-DEV-MASTER-2026', 'dev', 1, NOW() + INTERVAL '90 days')
ON CONFLICT (code) DO NOTHING;

-- =============================================
-- 9. FUNÇÕES AUXILIARES
-- =============================================

-- Função para verificar se usuário tem acesso a uma empresa
CREATE OR REPLACE FUNCTION public.user_has_company_access(_user_id UUID, _company_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_company_access
    WHERE user_id = _user_id
      AND company_id = _company_id
      AND can_view = true
  )
  OR EXISTS (
    -- DEV e GESTAO têm acesso a todas as empresas
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('dev', 'gestao')
  )
$$;

-- Função para pegar empresas do usuário
CREATE OR REPLACE FUNCTION public.get_user_companies(_user_id UUID)
RETURNS TABLE (
  company_id UUID,
  company_name TEXT,
  company_slug TEXT,
  can_view BOOLEAN,
  can_edit BOOLEAN,
  can_manage BOOLEAN
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  -- Se for DEV ou GESTAO, retorna todas as empresas
  SELECT 
    c.id,
    c.name,
    c.slug,
    true as can_view,
    true as can_edit,
    true as can_manage
  FROM public.companies c
  WHERE c.is_active = true
    AND EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = _user_id
        AND ur.role IN ('dev', 'gestao')
    )
  
  UNION
  
  -- Caso contrário, retorna apenas empresas com acesso explícito
  SELECT 
    c.id,
    c.name,
    c.slug,
    uca.can_view,
    uca.can_edit,
    uca.can_manage
  FROM public.companies c
  INNER JOIN public.user_company_access uca ON uca.company_id = c.id
  WHERE c.is_active = true
    AND uca.user_id = _user_id
    AND uca.can_view = true
    AND NOT EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = _user_id
        AND ur.role IN ('dev', 'gestao')
    )
$$;

-- =============================================
-- 10. ATUALIZAR RLS POLICIES
-- =============================================

-- Companies (apenas DEV e GESTAO podem gerenciar)
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active companies" ON public.companies
  FOR SELECT USING (is_active = true);

CREATE POLICY "DEV and GESTAO can manage companies" ON public.companies
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role IN ('dev', 'gestao')
    )
  );

-- User Company Access
ALTER TABLE public.user_company_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company access" ON public.user_company_access
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "DEV and GESTAO can manage all company access" ON public.user_company_access
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = auth.uid()
        AND role IN ('dev', 'gestao')
    )
  );

-- =============================================
-- 11. TRIGGER PARA updated_at
-- =============================================

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- 12. INSTRUÇÕES PARA CRIAR USUÁRIOS DEV
-- =============================================

COMMENT ON TABLE public.companies IS 
'INSTRUÇÕES PARA CRIAR USUÁRIOS DEV:

1. Acesse: https://supabase.com/dashboard/project/acuufrgoyjwzlyhopaus/auth/users

2. Clique em "Add user" → "Create new user"

3. USUÁRIO 1 - THALES:
   Email: toliveira1802@gmail.com
   Password: Dev@2026!Prime
   Auto Confirm User: YES

4. USUÁRIO 2 - SOPHIA:
   Email: sophia.duarte1@hotmail.com
   Password: Dev@2026!Prime
   Auto Confirm User: YES

5. Após criar, cada um deve fazer login em: https://doctorautoprime.vercel.app

6. Ir em Perfil e usar o código correspondente:
   - Thales: THALES-DEV-MASTER-2026
   - Sophia: SOPHIA-DEV-MASTER-2026

7. Ambos terão acesso automático a todas as 3 empresas:
   - Doctor Auto Prime
   - Doctor Auto Bosch
   - Garage 347

8. Você pode ajustar os nomes e configurações depois!
';
