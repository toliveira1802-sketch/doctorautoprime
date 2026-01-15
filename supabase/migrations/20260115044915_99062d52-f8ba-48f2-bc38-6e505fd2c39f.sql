
-- Tabela de mecânicos
CREATE TABLE public.mechanics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  specialty TEXT,
  phone TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Histórico de status (mudanças de status nos atendimentos)
CREATE TABLE public.status_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE,
  previous_status TEXT,
  new_status TEXT NOT NULL,
  changed_by UUID,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Feedback dos clientes sobre atendimentos
CREATE TABLE public.feedbacks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Feedback diário de mecânicos (performance, observações)
CREATE TABLE public.mechanic_daily_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mechanic_id UUID REFERENCES public.mechanics(id) ON DELETE CASCADE,
  feedback_date DATE NOT NULL DEFAULT CURRENT_DATE,
  given_by UUID,
  performance_score INTEGER CHECK (performance_score >= 1 AND performance_score <= 5),
  punctuality_score INTEGER CHECK (punctuality_score >= 1 AND punctuality_score <= 5),
  quality_score INTEGER CHECK (quality_score >= 1 AND quality_score <= 5),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Feedback diário do pátio (operação geral)
CREATE TABLE public.patio_daily_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  feedback_date DATE NOT NULL DEFAULT CURRENT_DATE,
  given_by UUID,
  organization_score INTEGER CHECK (organization_score >= 1 AND organization_score <= 5),
  flow_score INTEGER CHECK (flow_score >= 1 AND flow_score <= 5),
  incidents_count INTEGER DEFAULT 0,
  bottlenecks TEXT,
  highlights TEXT,
  improvements TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Log de ações gerais (auditoria)
CREATE TABLE public.action_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  action_type TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Campos extras na tabela appointments
ALTER TABLE public.appointments
ADD COLUMN IF NOT EXISTS mechanic_id UUID REFERENCES public.mechanics(id),
ADD COLUMN IF NOT EXISTS estimated_completion TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS actual_completion TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS mechanic_notes TEXT,
ADD COLUMN IF NOT EXISTS checklist_photos TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS client_notified BOOLEAN DEFAULT false;

-- RLS policies
ALTER TABLE public.mechanics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mechanic_daily_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patio_daily_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.action_logs ENABLE ROW LEVEL SECURITY;

-- Mechanics: admins manage, everyone can view active
CREATE POLICY "Admins can manage mechanics" ON public.mechanics FOR ALL USING (is_admin());
CREATE POLICY "Anyone can view active mechanics" ON public.mechanics FOR SELECT USING (is_active = true);

-- Status history: admins full access, users can view own
CREATE POLICY "Admins can manage status history" ON public.status_history FOR ALL USING (is_admin());
CREATE POLICY "Users can view own status history" ON public.status_history FOR SELECT 
  USING (EXISTS (SELECT 1 FROM appointments WHERE appointments.id = status_history.appointment_id AND appointments.user_id = auth.uid()));

-- Feedbacks: admins full access, users can manage own
CREATE POLICY "Admins can manage all feedbacks" ON public.feedbacks FOR ALL USING (is_admin());
CREATE POLICY "Users can view own feedbacks" ON public.feedbacks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own feedbacks" ON public.feedbacks FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Mechanic daily feedback: admins only
CREATE POLICY "Admins can manage mechanic feedback" ON public.mechanic_daily_feedback FOR ALL USING (is_admin());

-- Patio daily feedback: admins only
CREATE POLICY "Admins can manage patio feedback" ON public.patio_daily_feedback FOR ALL USING (is_admin());

-- Action logs: admins can view all
CREATE POLICY "Admins can view action logs" ON public.action_logs FOR ALL USING (is_admin());

-- Triggers para updated_at
CREATE TRIGGER update_mechanics_updated_at BEFORE UPDATE ON public.mechanics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir mecânicos de exemplo
INSERT INTO public.mechanics (name, specialty, phone) VALUES
  ('João Silva', 'Motor e transmissão', '11999990001'),
  ('Carlos Santos', 'Elétrica e injeção', '11999990002'),
  ('Pedro Oliveira', 'Suspensão e freios', '11999990003');
