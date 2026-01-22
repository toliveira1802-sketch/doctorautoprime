-- Integração com Kommo (ex-amoCRM)
-- Data: 2026-01-22

-- Tabela para armazenar tokens do Kommo
CREATE TABLE public.kommo_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subdomain TEXT NOT NULL,
  client_id TEXT NOT NULL,
  client_secret TEXT NOT NULL,
  redirect_uri TEXT NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Mapeamento entre OSs e Leads do Kommo
CREATE TABLE public.kommo_os_mapping (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  os_id UUID NOT NULL REFERENCES public.ordens_servico(id) ON DELETE CASCADE,
  kommo_lead_id BIGINT NOT NULL,
  synced_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_sync_at TIMESTAMP WITH TIME ZONE,
  sync_status TEXT DEFAULT 'synced', -- synced, pending, error
  sync_error TEXT,
  UNIQUE(os_id),
  UNIQUE(kommo_lead_id)
);

-- Mapeamento entre Clientes e Contatos do Kommo
CREATE TABLE public.kommo_contact_mapping (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  kommo_contact_id BIGINT NOT NULL,
  synced_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_sync_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(client_phone),
  UNIQUE(kommo_contact_id)
);

-- Log de sincronizações
CREATE TABLE public.kommo_sync_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entity_type TEXT NOT NULL, -- os, client
  entity_id TEXT NOT NULL,
  action TEXT NOT NULL, -- create, update, delete
  kommo_id BIGINT,
  success BOOLEAN NOT NULL,
  error_message TEXT,
  payload JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Webhooks recebidos do Kommo
CREATE TABLE public.kommo_webhooks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX idx_kommo_os_mapping_os_id ON public.kommo_os_mapping(os_id);
CREATE INDEX idx_kommo_os_mapping_lead_id ON public.kommo_os_mapping(kommo_lead_id);
CREATE INDEX idx_kommo_contact_mapping_phone ON public.kommo_contact_mapping(client_phone);
CREATE INDEX idx_kommo_sync_log_entity ON public.kommo_sync_log(entity_type, entity_id);
CREATE INDEX idx_kommo_webhooks_processed ON public.kommo_webhooks(processed) WHERE processed = false;

-- Trigger para atualizar updated_at
CREATE TRIGGER update_kommo_config_updated_at
  BEFORE UPDATE ON public.kommo_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Função para obter configuração ativa do Kommo
CREATE OR REPLACE FUNCTION public.get_active_kommo_config()
RETURNS TABLE (
  subdomain TEXT,
  client_id TEXT,
  client_secret TEXT,
  redirect_uri TEXT,
  access_token TEXT,
  refresh_token TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    k.subdomain,
    k.client_id,
    k.client_secret,
    k.redirect_uri,
    k.access_token,
    k.refresh_token
  FROM public.kommo_config k
  WHERE k.is_active = true
  ORDER BY k.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para registrar sincronização
CREATE OR REPLACE FUNCTION public.log_kommo_sync(
  p_entity_type TEXT,
  p_entity_id TEXT,
  p_action TEXT,
  p_kommo_id BIGINT,
  p_success BOOLEAN,
  p_error_message TEXT DEFAULT NULL,
  p_payload JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO public.kommo_sync_log (
    entity_type,
    entity_id,
    action,
    kommo_id,
    success,
    error_message,
    payload
  ) VALUES (
    p_entity_type,
    p_entity_id,
    p_action,
    p_kommo_id,
    p_success,
    p_error_message,
    p_payload
  ) RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para sincronizar OS automaticamente quando criada/atualizada
CREATE OR REPLACE FUNCTION public.trigger_kommo_sync_os()
RETURNS TRIGGER AS $$
BEGIN
  -- Marca para sincronização assíncrona
  -- (você implementará a sincronização real via webhook ou job)
  INSERT INTO public.kommo_sync_log (
    entity_type,
    entity_id,
    action,
    success,
    payload
  ) VALUES (
    'os',
    NEW.id::TEXT,
    CASE 
      WHEN TG_OP = 'INSERT' THEN 'create'
      WHEN TG_OP = 'UPDATE' THEN 'update'
    END,
    false, -- pending
    jsonb_build_object(
      'numero_os', NEW.numero_os,
      'plate', NEW.plate,
      'vehicle', NEW.vehicle,
      'status', NEW.status,
      'valor_aprovado', NEW.valor_aprovado
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger (comentado por padrão, ativar quando configurar Kommo)
-- CREATE TRIGGER trigger_sync_os_to_kommo
--   AFTER INSERT OR UPDATE ON public.ordens_servico
--   FOR EACH ROW
--   EXECUTE FUNCTION public.trigger_kommo_sync_os();

-- Enable RLS
ALTER TABLE public.kommo_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kommo_os_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kommo_contact_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kommo_sync_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kommo_webhooks ENABLE ROW LEVEL SECURITY;

-- Policies (apenas dev e gestao podem ver/editar)
CREATE POLICY "Dev e gestao podem ver config Kommo"
  ON public.kommo_config FOR SELECT
  USING (public.has_admin_access());

CREATE POLICY "Dev e gestao podem editar config Kommo"
  ON public.kommo_config FOR ALL
  USING (public.has_admin_access());

CREATE POLICY "Admin pode ver mapeamentos"
  ON public.kommo_os_mapping FOR SELECT
  USING (public.has_admin_access());

CREATE POLICY "Admin pode ver contatos"
  ON public.kommo_contact_mapping FOR SELECT
  USING (public.has_admin_access());

CREATE POLICY "Admin pode ver logs"
  ON public.kommo_sync_log FOR SELECT
  USING (public.has_admin_access());

CREATE POLICY "Sistema pode criar logs"
  ON public.kommo_sync_log FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Sistema pode receber webhooks"
  ON public.kommo_webhooks FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admin pode ver webhooks"
  ON public.kommo_webhooks FOR SELECT
  USING (public.has_admin_access());

COMMENT ON TABLE public.kommo_config IS 'Configuração da integração com Kommo (tokens, credenciais)';
COMMENT ON TABLE public.kommo_os_mapping IS 'Mapeamento entre Ordens de Serviço e Leads do Kommo';
COMMENT ON TABLE public.kommo_contact_mapping IS 'Mapeamento entre Clientes e Contatos do Kommo';
COMMENT ON TABLE public.kommo_sync_log IS 'Log de todas as sincronizações com Kommo';
COMMENT ON TABLE public.kommo_webhooks IS 'Webhooks recebidos do Kommo para processamento';
