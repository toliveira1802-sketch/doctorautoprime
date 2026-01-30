-- =============================================
-- DOCTOR AUTO PRIME - TABELAS PRINCIPAIS
-- Setup inicial das tabelas imutáveis/estruturais
-- =============================================

-- =============================================
-- 1. TIPOS ENUM
-- =============================================

CREATE TYPE public.service_type AS ENUM ('revisao', 'diagnostico');

CREATE TYPE public.ordem_servico_status AS ENUM (
  'diagnostico',
  'orcamento', 
  'aguardando_aprovacao',
  'aguardando_pecas',
  'em_execucao',
  'em_teste',
  'pronto_retirada',
  'entregue',
  'cancelado'
);

-- =============================================
-- 2. TABELA: EMPRESAS
-- =============================================

CREATE TABLE public.companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  cnpj TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  logo_url TEXT,
  primary_color TEXT DEFAULT '#dc2626',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Dados iniciais das empresas
INSERT INTO public.companies (name, slug, cnpj, phone, email) VALUES
  ('Doctor Auto Prime', 'doctor-auto-prime', '12.345.678/0001-90', '(11) 98765-4321', 'contato@doctorautoprime.com.br'),
  ('Doctor Auto Bosch', 'doctor-auto-bosch', '12.345.678/0002-71', '(11) 98765-4322', 'bosch@doctorautoprime.com.br'),
  ('Garage 347', 'garage-347', '12.345.678/0003-52', '(11) 98765-4323', 'garage347@doctorautoprime.com.br'),
  ('GERAL', 'geral', NULL, NULL, NULL);

-- =============================================
-- 3. TABELA: ROLES (PAPÉIS)
-- =============================================

CREATE TABLE public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  level INTEGER NOT NULL DEFAULT 0,
  permissions JSONB DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Dados iniciais dos papéis
INSERT INTO public.roles (name, display_name, description, level, is_active) VALUES
  ('dev', 'Desenvolvedor', 'Acesso total ao sistema + IA', 100, true),
  ('gestao', 'Gestão', 'BI + Estratégia + Todos os departamentos', 80, true),
  ('admin', 'Administrador', 'Operações (POMBAL + Pátio)', 60, true),
  ('cliente', 'Cliente', 'Somente leitura (Dados pessoais)', 10, true),
  ('master', 'Master', 'Super Admin (Inativo)', 90, false),
  ('vendedor', 'Vendedor', 'Vendas (Inativo)', 40, false),
  ('atendente', 'Atendente', 'Atendimento (Inativo)', 30, false),
  ('mecanico', 'Mecânico', 'Execução (Inativo)', 20, false);

-- =============================================
-- 4. TABELA: SERVIÇOS
-- =============================================

CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  service_type service_type NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  is_full_day BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Dados iniciais dos serviços
INSERT INTO public.services (name, description, service_type, duration_minutes, price, is_full_day, display_order) VALUES
  -- Revisões
  ('Revisão 10.000km', 'Revisão periódica completa de 10 mil quilômetros', 'revisao', 120, 350.00, false, 1),
  ('Revisão 20.000km', 'Revisão periódica completa de 20 mil quilômetros', 'revisao', 180, 550.00, false, 2),
  ('Revisão 30.000km', 'Revisão periódica completa de 30 mil quilômetros', 'revisao', 240, 750.00, false, 3),
  
  -- Serviços básicos
  ('Troca de Óleo', 'Troca de óleo lubrificante do motor + filtro', 'revisao', 60, 200.00, false, 4),
  ('Alinhamento e Balanceamento', 'Alinhamento de direção e balanceamento das 4 rodas', 'revisao', 90, 180.00, false, 5),
  ('Troca de Pastilhas de Freio', 'Substituição de pastilhas dianteiras ou traseiras', 'revisao', 120, 350.00, false, 6),
  
  -- Diagnósticos
  ('Diagnóstico Completo', 'Diagnóstico completo do veículo com scanner', 'diagnostico', 240, 300.00, true, 7),
  ('Diagnóstico de Motor', 'Análise específica do motor e sistemas relacionados', 'diagnostico', 180, 250.00, false, 8),
  ('Diagnóstico Eletrônico', 'Verificação de sistemas eletrônicos e sensores', 'diagnostico', 120, 200.00, false, 9),
  
  -- Serviços especializados
  ('Limpeza de Bicos Injetores', 'Limpeza ultrassônica dos bicos injetores', 'revisao', 120, 350.00, false, 10),
  ('Troca de Correia Dentada', 'Substituição da correia dentada + tensionadores', 'revisao', 300, 850.00, true, 11),
  ('Revisão de Suspensão', 'Verificação e substituição de componentes da suspensão', 'revisao', 180, 600.00, false, 12),
  ('Geometria Completa', 'Alinhamento, balanceamento e geometria das rodas', 'revisao', 120, 250.00, false, 13),
  ('Troca de Embreagem', 'Substituição do kit de embreagem completo', 'revisao', 480, 1500.00, true, 14);

-- =============================================
-- 5. TABELA: MÉTODOS DE PAGAMENTO
-- =============================================

CREATE TABLE public.payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  icon TEXT,
  fee_percent DECIMAL(5,2) DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Dados iniciais dos métodos de pagamento
INSERT INTO public.payment_methods (name, code, icon, fee_percent, display_order) VALUES
  ('Dinheiro', 'cash', '💵', 0.00, 1),
  ('PIX', 'pix', '🔲', 0.00, 2),
  ('Cartão de Débito', 'debit_card', '💳', 2.00, 3),
  ('Cartão de Crédito', 'credit_card', '💳', 4.50, 4),
  ('Boleto Bancário', 'boleto', '📄', 2.50, 5),
  ('Transferência Bancária', 'transfer', '🏦', 0.00, 6);

-- =============================================
-- 6. TABELA: CATEGORIAS DE PEÇAS
-- =============================================

CREATE TABLE public.parts_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES public.parts_categories(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Dados iniciais das categorias de peças
INSERT INTO public.parts_categories (name, description) VALUES
  ('Filtros', 'Filtros de ar, óleo, combustível e cabine'),
  ('Óleos e Lubrificantes', 'Óleos para motor, câmbio, direção e diferencial'),
  ('Suspensão', 'Amortecedores, molas, buchas e batentes'),
  ('Freios', 'Pastilhas, discos, fluidos e componentes do sistema de freios'),
  ('Ignição', 'Velas, bobinas, cabos e módulos de ignição'),
  ('Sistema Elétrico', 'Baterias, alternadores, sensores e componentes elétricos'),
  ('Correias e Correntes', 'Correias dentadas, poli-V e correntes de distribuição'),
  ('Embreagem', 'Discos, platôs e rolamentos de embreagem'),
  ('Arrefecimento', 'Radiadores, mangueiras, válvulas e fluidos de arrefecimento'),
  ('Escapamento', 'Silenciosos, catalisadores e componentes do sistema de escape');

-- =============================================
-- 7. ÍNDICES PARA PERFORMANCE
-- =============================================

-- Índices para companies
CREATE INDEX idx_companies_slug ON public.companies(slug);
CREATE INDEX idx_companies_active ON public.companies(is_active);

-- Índices para roles
CREATE INDEX idx_roles_name ON public.roles(name);
CREATE INDEX idx_roles_active ON public.roles(is_active);

-- Índices para services
CREATE INDEX idx_services_type ON public.services(service_type);
CREATE INDEX idx_services_active ON public.services(is_active);
CREATE INDEX idx_services_order ON public.services(display_order);

-- Índices para payment_methods
CREATE INDEX idx_payment_methods_code ON public.payment_methods(code);
CREATE INDEX idx_payment_methods_active ON public.payment_methods(is_active);

-- Índices para parts_categories
CREATE INDEX idx_parts_categories_parent ON public.parts_categories(parent_id);
CREATE INDEX idx_parts_categories_active ON public.parts_categories(is_active);

-- =============================================
-- 8. COMENTÁRIOS NAS TABELAS
-- =============================================

COMMENT ON TABLE public.companies IS 'Empresas do grupo Doctor Auto Prime';
COMMENT ON TABLE public.roles IS 'Papéis e permissões do sistema (RBAC)';
COMMENT ON TABLE public.services IS 'Catálogo de serviços oferecidos';
COMMENT ON TABLE public.payment_methods IS 'Métodos de pagamento disponíveis';
COMMENT ON TABLE public.parts_categories IS 'Categorias de peças e componentes';

-- =============================================
-- FIM DO SCRIPT
-- =============================================

-- Verificar dados inseridos
SELECT 'Empresas:' as tabela, COUNT(*) as total FROM public.companies
UNION ALL
SELECT 'Roles:' as tabela, COUNT(*) as total FROM public.roles
UNION ALL
SELECT 'Serviços:' as tabela, COUNT(*) as total FROM public.services
UNION ALL
SELECT 'Métodos de Pagamento:' as tabela, COUNT(*) as total FROM public.payment_methods
UNION ALL
SELECT 'Categorias de Peças:' as tabela, COUNT(*) as total FROM public.parts_categories;
