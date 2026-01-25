-- Fix SECURITY DEFINER functions by adding authorization checks
-- This prevents any authenticated user from accessing sensitive functions

-- 1. Fix get_active_kommo_config - CRITICAL: exposes API credentials
CREATE OR REPLACE FUNCTION public.get_active_kommo_config()
RETURNS TABLE (
  subdomain TEXT,
  client_id TEXT,
  client_secret TEXT,
  redirect_uri TEXT,
  access_token TEXT,
  refresh_token TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check authorization - only admin users can access
  IF NOT public.has_admin_access() THEN
    RAISE EXCEPTION 'Forbidden - Admin access required';
  END IF;
  
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
  LIMIT 1;
END;
$$;

-- 2. Fix buscar_diagnosticos_similares - returns diagnostic data
CREATE OR REPLACE FUNCTION public.buscar_diagnosticos_similares(
  p_modelo TEXT DEFAULT NULL,
  p_sintomas TEXT DEFAULT NULL,
  p_limite INTEGER DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  modelo_veiculo TEXT,
  sintomas TEXT,
  diagnostico TEXT,
  solucao TEXT,
  tempo_medio_minutos INTEGER,
  custo_estimado NUMERIC,
  similaridade REAL
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check authorization - only admin users can access
  IF NOT public.has_admin_access() THEN
    RAISE EXCEPTION 'Forbidden - Admin access required';
  END IF;

  RETURN QUERY
  SELECT 
    d.id,
    d.modelo_veiculo,
    d.sintomas,
    d.diagnostico,
    d.solucao,
    d.tempo_medio_minutos,
    d.custo_estimado,
    1.0::REAL as similaridade
  FROM public.diagnosticos_base d
  WHERE d.validado = true
    AND (p_modelo IS NULL OR d.modelo_veiculo ILIKE '%' || p_modelo || '%')
    AND (p_sintomas IS NULL OR d.sintomas ILIKE '%' || p_sintomas || '%')
  ORDER BY d.created_at DESC
  LIMIT p_limite;
END;
$$;

-- 3. Fix aplicar_regras_automacao - applies automation rules
CREATE OR REPLACE FUNCTION public.aplicar_regras_automacao(p_os_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_resultado JSONB := '[]'::JSONB;
  v_regra RECORD;
  v_os RECORD;
BEGIN
  -- Check authorization - only admin users can access
  IF NOT public.has_admin_access() THEN
    RAISE EXCEPTION 'Forbidden - Admin access required';
  END IF;

  -- Get the OS data
  SELECT * INTO v_os FROM public.ordens_servico WHERE id = p_os_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'OS not found');
  END IF;
  
  -- Apply active rules
  FOR v_regra IN 
    SELECT * FROM public.regras_automacao 
    WHERE ativo = true 
    ORDER BY prioridade DESC
  LOOP
    -- Rule application logic would go here
    v_resultado := v_resultado || jsonb_build_object(
      'regra_id', v_regra.id,
      'nome', v_regra.nome,
      'aplicada', true
    );
  END LOOP;
  
  RETURN v_resultado;
END;
$$;

-- 4. Fix log_kommo_sync - insert logs with validation
CREATE OR REPLACE FUNCTION public.log_kommo_sync(
  p_tipo TEXT,
  p_detalhes JSONB DEFAULT NULL,
  p_erro TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_log_id UUID;
BEGIN
  -- Check authorization - only admin users can access
  IF NOT public.has_admin_access() THEN
    RAISE EXCEPTION 'Forbidden - Admin access required';
  END IF;

  -- Validate input type
  IF p_tipo NOT IN ('sync_start', 'sync_complete', 'sync_error', 'lead_created', 'lead_updated', 'webhook_received') THEN
    RAISE EXCEPTION 'Invalid log type: %', p_tipo;
  END IF;

  INSERT INTO public.kommo_sync_logs (tipo, detalhes, erro, user_id)
  VALUES (p_tipo, p_detalhes, p_erro, auth.uid())
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$;

-- Grant execute to authenticated users (authorization is checked inside)
GRANT EXECUTE ON FUNCTION public.get_active_kommo_config() TO authenticated;
GRANT EXECUTE ON FUNCTION public.buscar_diagnosticos_similares(TEXT, TEXT, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.aplicar_regras_automacao(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_kommo_sync(TEXT, JSONB, TEXT) TO authenticated;