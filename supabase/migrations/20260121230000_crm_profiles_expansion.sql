-- =============================================
-- EXPANSÃO DO CRM: PROFILES + VEHICLES
-- =============================================

-- =============================================
-- 1. EXPANSÃO DA TABELA PROFILES
-- =============================================

-- Adicionar campos de CRM à tabela profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS cpf TEXT,
ADD COLUMN IF NOT EXISTS birthday DATE,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS zip_code TEXT,
ADD COLUMN IF NOT EXISTS loyalty_points INTEGER NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS loyalty_level TEXT DEFAULT 'bronze',
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS internal_notes TEXT,
ADD COLUMN IF NOT EXISTS last_visit_date DATE,
ADD COLUMN IF NOT EXISTS total_spent DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_visits INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

-- Criar índices para melhorar performance de busca
CREATE INDEX IF NOT EXISTS idx_profiles_cpf ON public.profiles(cpf);
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_loyalty_level ON public.profiles(loyalty_level);
CREATE INDEX IF NOT EXISTS idx_profiles_last_visit ON public.profiles(last_visit_date);
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON public.profiles(is_active);

-- Criar índice de busca full-text para nome
CREATE INDEX IF NOT EXISTS idx_profiles_full_name_search ON public.profiles 
USING gin(to_tsvector('portuguese', COALESCE(full_name, '')));

-- Comentários para documentação
COMMENT ON COLUMN public.profiles.cpf IS 'CPF do cliente (formato: 000.000.000-00)';
COMMENT ON COLUMN public.profiles.loyalty_points IS 'Pontos de fidelidade acumulados';
COMMENT ON COLUMN public.profiles.loyalty_level IS 'Nível de fidelidade: bronze, prata, ouro, platina';
COMMENT ON COLUMN public.profiles.tags IS 'Tags para categorização (ex: vip, inadimplente, etc)';
COMMENT ON COLUMN public.profiles.internal_notes IS 'Observações internas da oficina';
COMMENT ON COLUMN public.profiles.last_visit_date IS 'Data da última visita/OS';
COMMENT ON COLUMN public.profiles.total_spent IS 'Valor total gasto pelo cliente';
COMMENT ON COLUMN public.profiles.total_visits IS 'Número total de visitas/OSs';

-- =============================================
-- 2. MELHORIAS NA TABELA VEHICLES
-- =============================================

-- Adicionar campos úteis para gestão de veículos
ALTER TABLE public.vehicles
ADD COLUMN IF NOT EXISTS km_atual INTEGER,
ADD COLUMN IF NOT EXISTS chassi TEXT,
ADD COLUMN IF NOT EXISTS renavam TEXT,
ADD COLUMN IF NOT EXISTS fuel_type TEXT DEFAULT 'gasolina',
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS last_service_date DATE,
ADD COLUMN IF NOT EXISTS next_service_km INTEGER;

-- Criar índices para busca de veículos
CREATE INDEX IF NOT EXISTS idx_vehicles_plate ON public.vehicles(plate);
CREATE INDEX IF NOT EXISTS idx_vehicles_brand_model ON public.vehicles(brand, model);
CREATE INDEX IF NOT EXISTS idx_vehicles_is_active ON public.vehicles(is_active);

-- Comentários
COMMENT ON COLUMN public.vehicles.km_atual IS 'Quilometragem atual do veículo';
COMMENT ON COLUMN public.vehicles.chassi IS 'Número do chassi';
COMMENT ON COLUMN public.vehicles.renavam IS 'Número do RENAVAM';
COMMENT ON COLUMN public.vehicles.fuel_type IS 'Tipo de combustível: gasolina, etanol, flex, diesel, gnv, eletrico';
COMMENT ON COLUMN public.vehicles.notes IS 'Observações sobre o veículo';
COMMENT ON COLUMN public.vehicles.last_service_date IS 'Data do último serviço';
COMMENT ON COLUMN public.vehicles.next_service_km IS 'Próxima revisão em KM';

-- =============================================
-- 3. VIEW PARA CLIENTES COM VEÍCULOS
-- =============================================

-- View que junta clientes com seus veículos (facilita queries)
CREATE OR REPLACE VIEW public.clientes_completo AS
SELECT 
  p.id as cliente_id,
  p.user_id,
  p.full_name,
  p.phone,
  p.cpf,
  p.email,
  p.birthday,
  p.address,
  p.city,
  p.state,
  p.zip_code,
  p.loyalty_points,
  p.loyalty_level,
  p.tags,
  p.internal_notes,
  p.last_visit_date,
  p.total_spent,
  p.total_visits,
  p.is_active,
  p.created_at,
  p.updated_at,
  -- Contar veículos do cliente
  (SELECT COUNT(*) FROM public.vehicles v WHERE v.user_id = p.user_id AND v.is_active = true) as total_vehicles,
  -- Pegar veículos como array JSON
  (SELECT json_agg(json_build_object(
    'id', v.id,
    'model', v.model,
    'plate', v.plate,
    'brand', v.brand,
    'year', v.year,
    'color', v.color,
    'km_atual', v.km_atual,
    'fuel_type', v.fuel_type
  )) FROM public.vehicles v WHERE v.user_id = p.user_id AND v.is_active = true) as vehicles
FROM public.profiles p
WHERE p.is_active = true;

-- Permitir que admins vejam a view
GRANT SELECT ON public.clientes_completo TO authenticated;
