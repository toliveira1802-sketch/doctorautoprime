
-- Enum para tipos de aviso
CREATE TYPE alert_type AS ENUM (
  'pending_items',    -- Itens pendentes da última visita
  'oil_change',       -- Troca de óleo automática (6 meses)
  'seasonal',         -- Avisos sazonais (AC, pneus, etc.)
  'custom'            -- Aviso manual personalizado
);

-- Enum para status do aviso
CREATE TYPE alert_status AS ENUM (
  'scheduled',        -- Agendado para enviar
  'sent',             -- Enviado ao cliente
  'read',             -- Lido pelo cliente
  'dismissed',        -- Dispensado/ignorado
  'completed'         -- Cliente agendou/resolveu
);

-- Enum para prioridade dos itens
CREATE TYPE item_priority AS ENUM (
  'critical',         -- Crítico - precisa fazer
  'half_life',        -- Meia vida - em breve
  'good'              -- Bom - pode esperar
);

-- Tabela principal de avisos
CREATE TABLE public.alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  
  alert_type alert_type NOT NULL,
  status alert_status NOT NULL DEFAULT 'scheduled',
  
  title TEXT NOT NULL,
  message TEXT,
  
  -- Para itens pendentes
  pending_items JSONB DEFAULT '[]',  -- [{name, priority, estimated_price}]
  
  -- Datas
  due_date DATE NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadados
  is_automatic BOOLEAN NOT NULL DEFAULT false,
  seasonal_tag TEXT,  -- 'summer_ac', 'winter_battery', etc.
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Trigger para updated_at
CREATE TRIGGER update_alerts_updated_at
  BEFORE UPDATE ON public.alerts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own alerts"
  ON public.alerts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own alerts"
  ON public.alerts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all alerts"
  ON public.alerts FOR ALL
  USING (is_admin());

-- Índices para performance
CREATE INDEX idx_alerts_user_id ON public.alerts(user_id);
CREATE INDEX idx_alerts_due_date ON public.alerts(due_date);
CREATE INDEX idx_alerts_status ON public.alerts(status);
CREATE INDEX idx_alerts_type ON public.alerts(alert_type);
