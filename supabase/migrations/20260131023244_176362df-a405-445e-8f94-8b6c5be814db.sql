
-- =============================================
-- 1. CRIAR TABELA COMPANIES (base de tudo)
-- =============================================
CREATE TABLE IF NOT EXISTS public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  razao_social TEXT,
  nome TEXT NOT NULL,
  cnpj TEXT,
  telefone TEXT,
  email TEXT,
  endereco TEXT,
  logo_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS para companies
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage companies" ON public.companies
  FOR ALL USING (public.has_admin_access());

CREATE POLICY "Authenticated users can view active companies" ON public.companies
  FOR SELECT USING (is_active = true);

-- Inserir as 3 empresas
INSERT INTO public.companies (razao_social, nome) VALUES
  ('DOCTOR AUTO PRIME', 'DOCTOR AUTO PRIME'),
  ('POMBAL', 'DOCTOR AUTO BOSCH'),
  ('GARAGEM 1347', 'GARAGE 347');

-- =============================================
-- 2. ADICIONAR CAMPOS EM MECHANICS
-- =============================================
ALTER TABLE public.mechanics 
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id),
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS cpf TEXT,
  ADD COLUMN IF NOT EXISTS grau_conhecimento TEXT,
  ADD COLUMN IF NOT EXISTS qtde_positivos INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS qtde_negativos INTEGER DEFAULT 0;

-- =============================================
-- 3. ADICIONAR CAMPOS EM RECURSOS
-- =============================================
ALTER TABLE public.recursos
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id),
  ADD COLUMN IF NOT EXISTS ultima_manutencao DATE,
  ADD COLUMN IF NOT EXISTS horas_mes NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS valor_produzido NUMERIC DEFAULT 0;

-- =============================================
-- 4. ADICIONAR CAMPOS EM PROFILES
-- =============================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS endereco TEXT,
  ADD COLUMN IF NOT EXISTS cep TEXT,
  ADD COLUMN IF NOT EXISTS cidade TEXT,
  ADD COLUMN IF NOT EXISTS estado TEXT,
  ADD COLUMN IF NOT EXISTS origem_cadastro TEXT,
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES public.companies(id);

-- =============================================
-- 5. ADICIONAR CAMPOS EM VEHICLES
-- =============================================
ALTER TABLE public.vehicles
  ADD COLUMN IF NOT EXISTS versao TEXT,
  ADD COLUMN IF NOT EXISTS combustivel TEXT,
  ADD COLUMN IF NOT EXISTS ultimo_km INTEGER,
  ADD COLUMN IF NOT EXISTS km_atual INTEGER,
  ADD COLUMN IF NOT EXISTS origem_contato TEXT;

-- =============================================
-- 6. TRIGGER PARA UPDATED_AT EM COMPANIES
-- =============================================
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
