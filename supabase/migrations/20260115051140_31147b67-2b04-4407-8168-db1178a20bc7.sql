-- Sistema de Gestão Operacional Doctor Auto Prime

-- Tabela de configuração da oficina
CREATE TABLE IF NOT EXISTS public.oficina_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL DEFAULT 'Doctor Auto Prime',
  logo_url TEXT,
  capacidade_maxima INTEGER NOT NULL DEFAULT 20,
  horario_entrada TIME NOT NULL DEFAULT '08:00',
  horario_saida_semana TIME NOT NULL DEFAULT '17:30',
  horario_saida_sabado TIME NOT NULL DEFAULT '12:00',
  horario_almoco_inicio TIME NOT NULL DEFAULT '12:15',
  horario_almoco_fim TIME NOT NULL DEFAULT '13:30',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de recursos físicos (boxes, elevadores, vagas)
CREATE TABLE IF NOT EXISTS public.recursos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tipo TEXT NOT NULL CHECK (tipo IN ('box', 'elevador', 'vaga_espera')),
  nome TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'livre' CHECK (status IN ('livre', 'ocupado', 'manutencao')),
  vehicle_id UUID REFERENCES public.vehicles(id),
  ocupado_desde TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de agenda dos mecânicos
CREATE TABLE IF NOT EXISTS public.agenda_mecanicos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mechanic_id UUID NOT NULL REFERENCES public.mechanics(id),
  data DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fim TIME NOT NULL,
  vehicle_id UUID REFERENCES public.vehicles(id),
  appointment_id UUID REFERENCES public.appointments(id),
  tipo TEXT NOT NULL DEFAULT 'normal' CHECK (tipo IN ('normal', 'encaixe')),
  status TEXT NOT NULL DEFAULT 'agendado' CHECK (status IN ('agendado', 'em_andamento', 'concluido', 'cancelado')),
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(mechanic_id, data, hora_inicio)
);

-- Tabela de etapas do fluxo de trabalho
CREATE TABLE IF NOT EXISTS public.workflow_etapas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  ordem INTEGER NOT NULL,
  cor TEXT NOT NULL DEFAULT '#6b7280',
  icone TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de histórico de movimentações de veículos
CREATE TABLE IF NOT EXISTS public.vehicle_workflow_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id),
  appointment_id UUID REFERENCES public.appointments(id),
  etapa_anterior_id UUID REFERENCES public.workflow_etapas(id),
  etapa_atual_id UUID REFERENCES public.workflow_etapas(id),
  changed_by UUID,
  notas TEXT,
  tempo_na_etapa_minutos INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de metas financeiras
CREATE TABLE IF NOT EXISTS public.metas_financeiras (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mes INTEGER NOT NULL,
  ano INTEGER NOT NULL,
  meta_faturamento DECIMAL(12,2) NOT NULL DEFAULT 0,
  dias_uteis INTEGER NOT NULL DEFAULT 22,
  dias_trabalhados INTEGER NOT NULL DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(mes, ano)
);

-- Tabela de metas por mecânico
CREATE TABLE IF NOT EXISTS public.metas_mecanicos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mechanic_id UUID NOT NULL REFERENCES public.mechanics(id),
  mes INTEGER NOT NULL,
  ano INTEGER NOT NULL,
  meta_semanal DECIMAL(12,2) NOT NULL DEFAULT 0,
  meta_mensal DECIMAL(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(mechanic_id, mes, ano)
);

-- Tabela de faturamento (entregas)
CREATE TABLE IF NOT EXISTS public.faturamento (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id UUID NOT NULL REFERENCES public.appointments(id),
  vehicle_id UUID NOT NULL REFERENCES public.vehicles(id),
  mechanic_id UUID REFERENCES public.mechanics(id),
  valor DECIMAL(12,2) NOT NULL,
  data_entrega DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de feedback diário do pátio
CREATE TABLE IF NOT EXISTS public.patio_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  data DATE NOT NULL UNIQUE,
  observacoes TEXT,
  problemas TEXT,
  sugestoes TEXT,
  given_by UUID,
  capacidade_media INTEGER,
  gargalos_identificados TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Inserir etapas padrão do workflow
INSERT INTO public.workflow_etapas (nome, ordem, cor, icone) VALUES
  ('Diagnóstico', 1, '#3b82f6', 'search'),
  ('Orçamento', 2, '#8b5cf6', 'file-text'),
  ('Aguardando Aprovação', 3, '#f59e0b', 'clock'),
  ('Aguardando Peças', 4, '#f97316', 'package'),
  ('Pronto para Iniciar', 5, '#14b8a6', 'check-circle'),
  ('Em Execução', 6, '#6366f1', 'wrench'),
  ('Pronto para Entrega', 7, '#22c55e', 'car')
ON CONFLICT DO NOTHING;

-- Inserir recursos padrão
INSERT INTO public.recursos (tipo, nome) VALUES
  ('box', 'Box 1'),
  ('box', 'Box 2'),
  ('box', 'Box 3'),
  ('elevador', 'Elevador 1'),
  ('elevador', 'Elevador 2'),
  ('vaga_espera', 'Vaga 1'),
  ('vaga_espera', 'Vaga 2'),
  ('vaga_espera', 'Vaga 3')
ON CONFLICT DO NOTHING;

-- Enable RLS
ALTER TABLE public.oficina_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recursos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agenda_mecanicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_etapas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_workflow_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metas_financeiras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.metas_mecanicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faturamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patio_feedback ENABLE ROW LEVEL SECURITY;

-- Policies para admins (leitura e escrita)
CREATE POLICY "Admins can manage oficina_config" ON public.oficina_config FOR ALL USING (public.is_admin());
CREATE POLICY "Admins can manage recursos" ON public.recursos FOR ALL USING (public.is_admin());
CREATE POLICY "Admins can manage agenda_mecanicos" ON public.agenda_mecanicos FOR ALL USING (public.is_admin());
CREATE POLICY "Admins can manage workflow_etapas" ON public.workflow_etapas FOR ALL USING (public.is_admin());
CREATE POLICY "Admins can manage vehicle_workflow_history" ON public.vehicle_workflow_history FOR ALL USING (public.is_admin());
CREATE POLICY "Admins can manage metas_financeiras" ON public.metas_financeiras FOR ALL USING (public.is_admin());
CREATE POLICY "Admins can manage metas_mecanicos" ON public.metas_mecanicos FOR ALL USING (public.is_admin());
CREATE POLICY "Admins can manage faturamento" ON public.faturamento FOR ALL USING (public.is_admin());
CREATE POLICY "Admins can manage patio_feedback" ON public.patio_feedback FOR ALL USING (public.is_admin());

-- Policies de leitura para todos autenticados (algumas tabelas)
CREATE POLICY "Authenticated users can view workflow_etapas" ON public.workflow_etapas FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can view recursos" ON public.recursos FOR SELECT USING (auth.role() = 'authenticated');

-- Trigger para updated_at
CREATE TRIGGER update_oficina_config_updated_at BEFORE UPDATE ON public.oficina_config FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_recursos_updated_at BEFORE UPDATE ON public.recursos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_agenda_mecanicos_updated_at BEFORE UPDATE ON public.agenda_mecanicos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_metas_financeiras_updated_at BEFORE UPDATE ON public.metas_financeiras FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_metas_mecanicos_updated_at BEFORE UPDATE ON public.metas_mecanicos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();