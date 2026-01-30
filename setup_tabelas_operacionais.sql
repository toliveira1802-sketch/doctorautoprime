-- =============================================
-- DOCTOR AUTO PRIME - TABELAS OPERACIONAIS
-- Setup das tabelas mutáveis/operacionais
-- IMPORTANTE: Execute setup_tabelas_principais.sql primeiro!
-- =============================================

-- =============================================
-- GRUPO 1: USUÁRIOS E PERFIS
-- =============================================

-- Perfis de usuário
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  cpf TEXT,
  birth_date DATE,
  address TEXT,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Relacionamento usuário-papel
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE NOT NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role_id, company_id)
);

-- Acesso do usuário a empresas
CREATE TABLE public.user_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, company_id)
);

-- =============================================
-- GRUPO 2: VEÍCULOS
-- =============================================

-- Veículos dos clientes
CREATE TABLE public.vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  model TEXT NOT NULL,
  plate TEXT NOT NULL,
  year TEXT,
  brand TEXT,
  color TEXT,
  chassis TEXT,
  renavam TEXT,
  km_current INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (plate)
);

-- Histórico do veículo
CREATE TABLE public.vehicle_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL,
  description TEXT,
  km_at_event INTEGER,
  cost DECIMAL(10,2),
  date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- GRUPO 3: AGENDAMENTOS
-- =============================================

-- Agendamentos
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME,
  status TEXT NOT NULL DEFAULT 'pendente',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Serviços do agendamento
CREATE TABLE public.appointment_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE NOT NULL,
  service_id UUID REFERENCES public.services(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (appointment_id, service_id)
);

-- Funil de conversão
CREATE TABLE public.appointment_funnel (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  step TEXT NOT NULL,
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
  selected_services JSONB DEFAULT '[]',
  selected_date DATE,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- GRUPO 4: ORDENS DE SERVIÇO
-- =============================================

-- Ordem de serviço principal
CREATE TABLE public.ordens_servico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_os TEXT NOT NULL UNIQUE,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  plate TEXT NOT NULL,
  vehicle TEXT NOT NULL,
  client_name TEXT,
  client_phone TEXT,
  status TEXT NOT NULL DEFAULT 'diagnostico',
  mechanic_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  data_entrada DATE,
  data_orcamento DATE,
  data_aprovacao DATE,
  data_conclusao DATE,
  data_entrega DATE,
  valor_orcado DECIMAL(10,2),
  valor_aprovado DECIMAL(10,2),
  valor_final DECIMAL(10,2),
  descricao_problema TEXT,
  diagnostico TEXT,
  observacoes TEXT,
  motivo_recusa TEXT,
  checklist_entrada JSONB DEFAULT '{}',
  checklist_dinamometro JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Itens da OS (peças e serviços)
CREATE TABLE public.ordem_servico_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ordem_servico_id UUID REFERENCES public.ordens_servico(id) ON DELETE CASCADE NOT NULL,
  descricao TEXT NOT NULL,
  tipo TEXT NOT NULL,
  quantidade INTEGER NOT NULL DEFAULT 1,
  valor_unitario DECIMAL(10,2) NOT NULL DEFAULT 0,
  valor_total DECIMAL(10,2) NOT NULL DEFAULT 0,
  valor_custo DECIMAL(10,2),
  valor_venda_sugerido DECIMAL(10,2),
  margem_aplicada DECIMAL(5,2),
  justificativa_desconto TEXT,
  status TEXT NOT NULL DEFAULT 'pendente',
  motivo_recusa TEXT,
  prioridade TEXT,
  data_retorno_estimada DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Histórico da OS
CREATE TABLE public.ordem_servico_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ordem_servico_id UUID REFERENCES public.ordens_servico(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  old_value JSONB,
  new_value JSONB,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- GRUPO 5: FINANCEIRO
-- =============================================

-- Pagamentos
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ordem_servico_id UUID REFERENCES public.ordens_servico(id) ON DELETE CASCADE,
  payment_method_id UUID REFERENCES public.payment_methods(id) ON DELETE SET NULL NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  payment_date DATE NOT NULL,
  installments INTEGER DEFAULT 1,
  fee_amount DECIMAL(10,2) DEFAULT 0,
  net_amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Notas fiscais
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ordem_servico_id UUID REFERENCES public.ordens_servico(id) ON DELETE CASCADE NOT NULL,
  invoice_number TEXT NOT NULL UNIQUE,
  issue_date DATE NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  pdf_url TEXT,
  xml_url TEXT,
  status TEXT NOT NULL DEFAULT 'issued',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- GRUPO 6: ESTOQUE
-- =============================================

-- Peças em estoque
CREATE TABLE public.parts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.parts_categories(id) ON DELETE SET NULL,
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  code TEXT,
  brand TEXT,
  unit TEXT NOT NULL DEFAULT 'UN',
  quantity_current DECIMAL(10,2) NOT NULL DEFAULT 0,
  quantity_min DECIMAL(10,2) NOT NULL DEFAULT 0,
  cost_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  sale_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  margin_percent DECIMAL(5,2),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Movimentações de estoque
CREATE TABLE public.stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  part_id UUID REFERENCES public.parts(id) ON DELETE CASCADE NOT NULL,
  ordem_servico_id UUID REFERENCES public.ordens_servico(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  movement_type TEXT NOT NULL,
  quantity DECIMAL(10,2) NOT NULL,
  unit_cost DECIMAL(10,2),
  total_cost DECIMAL(10,2),
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- GRUPO 7: PÁTIO KANBAN
-- =============================================

-- Estágios do pátio
CREATE TABLE public.patio_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  color TEXT,
  order_position INTEGER NOT NULL,
  duration_avg_hours INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Dados iniciais dos estágios
INSERT INTO public.patio_stages (name, description, color, order_position, duration_avg_hours) VALUES
  ('Aguardando', 'Veículo aguardando início do atendimento', '#6B7280', 1, 2),
  ('Em Diagnóstico', 'Diagnóstico em andamento', '#3B82F6', 2, 4),
  ('Orçamento', 'Elaboração do orçamento', '#EAB308', 3, 2),
  ('Aguardando Aprovação', 'Aguardando aprovação do cliente', '#F97316', 4, 24),
  ('Aguardando Peças', 'Aguardando chegada de peças', '#8B5CF6', 5, 48),
  ('Em Execução', 'Serviços sendo executados', '#10B981', 6, 8),
  ('Em Teste', 'Testes finais e verificação', '#06B6D4', 7, 2),
  ('Pronto para Retirada', 'Veículo pronto para entrega', '#059669', 8, 4),
  ('Entregue', 'Veículo entregue ao cliente', '#374151', 9, 0);

-- Movimentações no pátio
CREATE TABLE public.patio_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ordem_servico_id UUID REFERENCES public.ordens_servico(id) ON DELETE CASCADE NOT NULL,
  stage_id UUID REFERENCES public.patio_stages(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  entered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  exited_at TIMESTAMPTZ,
  duration_minutes INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================
-- GRUPO 8: PROMOÇÕES E EVENTOS
-- =============================================

-- Promoções
CREATE TABLE public.promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  discount_label TEXT NOT NULL,
  discount_percent DECIMAL(5,2) NOT NULL DEFAULT 0,
  discount_fixed DECIMAL(10,2) NOT NULL DEFAULT 0,
  valid_from DATE NOT NULL,
  valid_to DATE NOT NULL,
  vehicle_models TEXT[] DEFAULT '{}',
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  available_dates DATE[] DEFAULT '{}',
  max_uses INTEGER,
  current_uses INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Eventos
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL DEFAULT 'other',
  event_date DATE NOT NULL,
  event_time TIME,
  location TEXT,
  max_participants INTEGER,
  current_participants INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Participantes de eventos
CREATE TABLE public.event_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed',
  registered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (event_id, user_id)
);

-- =============================================
-- ÍNDICES PARA PERFORMANCE
-- =============================================

-- Perfis
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_phone ON public.profiles(phone);
CREATE INDEX idx_profiles_cpf ON public.profiles(cpf);

-- User Roles
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role_id ON public.user_roles(role_id);
CREATE INDEX idx_user_roles_company_id ON public.user_roles(company_id);

-- User Companies
CREATE INDEX idx_user_companies_user_id ON public.user_companies(user_id);
CREATE INDEX idx_user_companies_company_id ON public.user_companies(company_id);

-- Vehicles
CREATE INDEX idx_vehicles_user_id ON public.vehicles(user_id);
CREATE INDEX idx_vehicles_plate ON public.vehicles(plate);
CREATE INDEX idx_vehicles_active ON public.vehicles(is_active);

-- Vehicle History
CREATE INDEX idx_vehicle_history_vehicle_id ON public.vehicle_history(vehicle_id);
CREATE INDEX idx_vehicle_history_date ON public.vehicle_history(date);

-- Appointments
CREATE INDEX idx_appointments_user_id ON public.appointments(user_id);
CREATE INDEX idx_appointments_vehicle_id ON public.appointments(vehicle_id);
CREATE INDEX idx_appointments_company_id ON public.appointments(company_id);
CREATE INDEX idx_appointments_date ON public.appointments(appointment_date);
CREATE INDEX idx_appointments_status ON public.appointments(status);

-- Appointment Services
CREATE INDEX idx_appointment_services_appointment_id ON public.appointment_services(appointment_id);
CREATE INDEX idx_appointment_services_service_id ON public.appointment_services(service_id);

-- Ordens de Serviço
CREATE INDEX idx_ordens_servico_numero_os ON public.ordens_servico(numero_os);
CREATE INDEX idx_ordens_servico_company_id ON public.ordens_servico(company_id);
CREATE INDEX idx_ordens_servico_user_id ON public.ordens_servico(user_id);
CREATE INDEX idx_ordens_servico_plate ON public.ordens_servico(plate);
CREATE INDEX idx_ordens_servico_status ON public.ordens_servico(status);
CREATE INDEX idx_ordens_servico_mechanic_id ON public.ordens_servico(mechanic_id);
CREATE INDEX idx_ordens_servico_data_entrada ON public.ordens_servico(data_entrada);

-- Ordem Servico Items
CREATE INDEX idx_ordem_servico_items_ordem_id ON public.ordem_servico_items(ordem_servico_id);
CREATE INDEX idx_ordem_servico_items_tipo ON public.ordem_servico_items(tipo);
CREATE INDEX idx_ordem_servico_items_status ON public.ordem_servico_items(status);

-- Payments
CREATE INDEX idx_payments_ordem_servico_id ON public.payments(ordem_servico_id);
CREATE INDEX idx_payments_payment_method_id ON public.payments(payment_method_id);
CREATE INDEX idx_payments_payment_date ON public.payments(payment_date);
CREATE INDEX idx_payments_status ON public.payments(status);

-- Parts
CREATE INDEX idx_parts_category_id ON public.parts(category_id);
CREATE INDEX idx_parts_company_id ON public.parts(company_id);
CREATE INDEX idx_parts_code ON public.parts(code);
CREATE INDEX idx_parts_active ON public.parts(is_active);

-- Stock Movements
CREATE INDEX idx_stock_movements_part_id ON public.stock_movements(part_id);
CREATE INDEX idx_stock_movements_ordem_servico_id ON public.stock_movements(ordem_servico_id);
CREATE INDEX idx_stock_movements_type ON public.stock_movements(movement_type);
CREATE INDEX idx_stock_movements_created_at ON public.stock_movements(created_at);

-- Patio Movements
CREATE INDEX idx_patio_movements_ordem_servico_id ON public.patio_movements(ordem_servico_id);
CREATE INDEX idx_patio_movements_stage_id ON public.patio_movements(stage_id);
CREATE INDEX idx_patio_movements_entered_at ON public.patio_movements(entered_at);

-- Promotions
CREATE INDEX idx_promotions_service_id ON public.promotions(service_id);
CREATE INDEX idx_promotions_valid_dates ON public.promotions(valid_from, valid_to);
CREATE INDEX idx_promotions_active ON public.promotions(is_active);

-- Events
CREATE INDEX idx_events_company_id ON public.events(company_id);
CREATE INDEX idx_events_event_date ON public.events(event_date);
CREATE INDEX idx_events_active ON public.events(is_active);

-- Event Participants
CREATE INDEX idx_event_participants_event_id ON public.event_participants(event_id);
CREATE INDEX idx_event_participants_user_id ON public.event_participants(user_id);

-- =============================================
-- COMENTÁRIOS NAS TABELAS
-- =============================================

COMMENT ON TABLE public.profiles IS 'Perfis e dados pessoais dos usuários';
COMMENT ON TABLE public.user_roles IS 'Relacionamento entre usuários e papéis (RBAC)';
COMMENT ON TABLE public.user_companies IS 'Empresas que o usuário tem acesso';
COMMENT ON TABLE public.vehicles IS 'Veículos cadastrados pelos clientes';
COMMENT ON TABLE public.vehicle_history IS 'Histórico de serviços por veículo';
COMMENT ON TABLE public.appointments IS 'Agendamentos de serviços';
COMMENT ON TABLE public.appointment_services IS 'Serviços incluídos em cada agendamento';
COMMENT ON TABLE public.appointment_funnel IS 'Análise do funil de conversão';
COMMENT ON TABLE public.ordens_servico IS 'Ordens de serviço principais';
COMMENT ON TABLE public.ordem_servico_items IS 'Itens (peças/serviços) de cada OS';
COMMENT ON TABLE public.ordem_servico_history IS 'Histórico de alterações nas OS';
COMMENT ON TABLE public.payments IS 'Pagamentos recebidos';
COMMENT ON TABLE public.invoices IS 'Notas fiscais emitidas';
COMMENT ON TABLE public.parts IS 'Peças em estoque';
COMMENT ON TABLE public.stock_movements IS 'Movimentações de entrada/saída de estoque';
COMMENT ON TABLE public.patio_stages IS 'Estágios do Kanban do pátio';
COMMENT ON TABLE public.patio_movements IS 'Movimentações dos veículos no pátio';
COMMENT ON TABLE public.promotions IS 'Promoções e ofertas especiais';
COMMENT ON TABLE public.events IS 'Eventos (workshops, meetups, etc)';
COMMENT ON TABLE public.event_participants IS 'Participantes inscritos nos eventos';

-- =============================================
-- VERIFICAÇÃO FINAL
-- =============================================

SELECT 'Tabelas Operacionais Criadas:' as info, COUNT(*) as total 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
AND table_name IN (
  'profiles', 'user_roles', 'user_companies',
  'vehicles', 'vehicle_history',
  'appointments', 'appointment_services', 'appointment_funnel',
  'ordens_servico', 'ordem_servico_items', 'ordem_servico_history',
  'payments', 'invoices',
  'parts', 'stock_movements',
  'patio_stages', 'patio_movements',
  'promotions', 'events', 'event_participants'
);

-- =============================================
-- FIM DO SCRIPT
-- =============================================
