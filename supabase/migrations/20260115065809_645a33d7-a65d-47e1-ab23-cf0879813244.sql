-- Tabela de leads de recuperação (clientes que cancelaram)
CREATE TABLE public.recovery_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  user_id UUID NOT NULL,
  client_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  vehicle_info TEXT,
  original_service TEXT,
  original_date DATE,
  cancellation_reason TEXT,
  recovery_status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  contacted_at TIMESTAMP WITH TIME ZONE,
  recovered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.recovery_leads ENABLE ROW LEVEL SECURITY;

-- RLS: Admin/Oficina can manage recovery leads
CREATE POLICY "Admin and oficina can view recovery leads"
ON public.recovery_leads
FOR SELECT
TO authenticated
USING (public.has_admin_access());

CREATE POLICY "Admin and oficina can insert recovery leads"
ON public.recovery_leads
FOR INSERT
TO authenticated
WITH CHECK (public.has_admin_access());

CREATE POLICY "Admin and oficina can update recovery leads"
ON public.recovery_leads
FOR UPDATE
TO authenticated
USING (public.has_admin_access());

-- Trigger for updated_at
CREATE TRIGGER update_recovery_leads_updated_at
BEFORE UPDATE ON public.recovery_leads
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();