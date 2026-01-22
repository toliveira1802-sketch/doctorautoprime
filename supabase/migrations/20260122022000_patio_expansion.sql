-- Expansão da tabela ordens_servico para substituir Trello e melhorar controle do Pátio
-- Data: 2026-01-22

-- Adicionar campos para controle visual do Pátio (substituindo Trello)
ALTER TABLE public.ordens_servico
ADD COLUMN IF NOT EXISTS posicao_patio TEXT DEFAULT 'entrada',
ADD COLUMN IF NOT EXISTS prioridade TEXT DEFAULT 'media',
ADD COLUMN IF NOT EXISTS cor_card TEXT DEFAULT '#3b82f6',
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS elevador TEXT,
ADD COLUMN IF NOT EXISTS box TEXT,
ADD COLUMN IF NOT EXISTS mecanico_responsavel TEXT,
ADD COLUMN IF NOT EXISTS tempo_estimado_horas INTEGER,
ADD COLUMN IF NOT EXISTS data_previsao_entrega TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS km_entrada INTEGER,
ADD COLUMN IF NOT EXISTS nivel_combustivel TEXT,
ADD COLUMN IF NOT EXISTS observacoes_patio TEXT,
ADD COLUMN IF NOT EXISTS fotos_entrada TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS checklist_entrada JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS historico_movimentacao JSONB DEFAULT '[]';

-- Comentários para documentação
COMMENT ON COLUMN public.ordens_servico.posicao_patio IS 'Posição atual no pátio: entrada, aguardando_orcamento, aguardando_aprovacao, aguardando_pecas, em_execucao, pronto, entregue';
COMMENT ON COLUMN public.ordens_servico.prioridade IS 'Prioridade da OS: baixa, media, alta, urgente';
COMMENT ON COLUMN public.ordens_servico.cor_card IS 'Cor do card no Kanban (hex color)';
COMMENT ON COLUMN public.ordens_servico.tags IS 'Tags/labels para categorização (ex: garantia, retorno, cliente_vip)';
COMMENT ON COLUMN public.ordens_servico.elevador IS 'Número do elevador ocupado';
COMMENT ON COLUMN public.ordens_servico.box IS 'Número do box ocupado';
COMMENT ON COLUMN public.ordens_servico.mecanico_responsavel IS 'Nome do mecânico responsável';
COMMENT ON COLUMN public.ordens_servico.tempo_estimado_horas IS 'Tempo estimado em horas para conclusão';
COMMENT ON COLUMN public.ordens_servico.data_previsao_entrega IS 'Data prevista para entrega';
COMMENT ON COLUMN public.ordens_servico.km_entrada IS 'Quilometragem na entrada';
COMMENT ON COLUMN public.ordens_servico.nivel_combustivel IS 'Nível de combustível na entrada (vazio, 1/4, 1/2, 3/4, cheio)';
COMMENT ON COLUMN public.ordens_servico.observacoes_patio IS 'Observações do pátio (avarias, objetos pessoais, etc)';
COMMENT ON COLUMN public.ordens_servico.fotos_entrada IS 'URLs das fotos tiradas na entrada';
COMMENT ON COLUMN public.ordens_servico.checklist_entrada IS 'Checklist de entrada em formato JSON';
COMMENT ON COLUMN public.ordens_servico.historico_movimentacao IS 'Histórico de movimentações no pátio';

-- Índices para melhorar performance nas queries do Pátio
CREATE INDEX IF NOT EXISTS idx_ordens_servico_posicao_patio ON public.ordens_servico(posicao_patio);
CREATE INDEX IF NOT EXISTS idx_ordens_servico_prioridade ON public.ordens_servico(prioridade);
CREATE INDEX IF NOT EXISTS idx_ordens_servico_elevador ON public.ordens_servico(elevador) WHERE elevador IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ordens_servico_box ON public.ordens_servico(box) WHERE box IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ordens_servico_data_previsao ON public.ordens_servico(data_previsao_entrega) WHERE data_previsao_entrega IS NOT NULL;

-- Função para registrar movimentação no histórico
CREATE OR REPLACE FUNCTION public.registrar_movimentacao_patio()
RETURNS TRIGGER AS $$
BEGIN
  -- Se a posição do pátio mudou, registra no histórico
  IF OLD.posicao_patio IS DISTINCT FROM NEW.posicao_patio THEN
    NEW.historico_movimentacao = COALESCE(NEW.historico_movimentacao, '[]'::jsonb) || 
      jsonb_build_object(
        'timestamp', NOW(),
        'de', OLD.posicao_patio,
        'para', NEW.posicao_patio,
        'usuario', auth.uid()
      );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para registrar movimentações automaticamente
DROP TRIGGER IF EXISTS trigger_registrar_movimentacao_patio ON public.ordens_servico;
CREATE TRIGGER trigger_registrar_movimentacao_patio
  BEFORE UPDATE ON public.ordens_servico
  FOR EACH ROW
  EXECUTE FUNCTION public.registrar_movimentacao_patio();

-- View para dashboard do Pátio
CREATE OR REPLACE VIEW public.patio_overview AS
SELECT 
  posicao_patio,
  COUNT(*) as total_veiculos,
  COUNT(*) FILTER (WHERE prioridade = 'urgente') as urgentes,
  COUNT(*) FILTER (WHERE prioridade = 'alta') as alta_prioridade,
  COUNT(*) FILTER (WHERE elevador IS NOT NULL) as em_elevadores,
  COUNT(*) FILTER (WHERE box IS NOT NULL) as em_boxes,
  SUM(valor_aprovado) FILTER (WHERE posicao_patio = 'pronto') as valor_pronto_entrega,
  AVG(EXTRACT(EPOCH FROM (NOW() - data_entrada))/3600)::INTEGER as tempo_medio_horas
FROM public.ordens_servico
WHERE status NOT IN ('entregue', 'cancelado')
GROUP BY posicao_patio;

-- View para indicadores do Dashboard Admin
CREATE OR REPLACE VIEW public.dashboard_indicators AS
SELECT
  -- Faturado no mês
  (SELECT COALESCE(SUM(valor_final), 0) 
   FROM public.ordens_servico 
   WHERE status = 'entregue' 
   AND EXTRACT(MONTH FROM data_entrega) = EXTRACT(MONTH FROM NOW())
   AND EXTRACT(YEAR FROM data_entrega) = EXTRACT(YEAR FROM NOW())
  ) as faturado_mes,
  
  -- Agendamentos hoje
  (SELECT COUNT(*) 
   FROM public.appointments 
   WHERE DATE(appointment_date) = CURRENT_DATE
  ) as agendamentos_hoje,
  
  -- Novos clientes no mês
  (SELECT COUNT(DISTINCT client_name)
   FROM public.ordens_servico
   WHERE EXTRACT(MONTH FROM data_entrada) = EXTRACT(MONTH FROM NOW())
   AND EXTRACT(YEAR FROM data_entrada) = EXTRACT(YEAR FROM NOW())
   AND client_name NOT IN (
     SELECT DISTINCT client_name 
     FROM public.ordens_servico 
     WHERE data_entrada < DATE_TRUNC('month', NOW())
   )
  ) as novos_clientes_mes,
  
  -- Retorno do mês (clientes que já vieram antes)
  (SELECT COUNT(DISTINCT client_name)
   FROM public.ordens_servico
   WHERE EXTRACT(MONTH FROM data_entrada) = EXTRACT(MONTH FROM NOW())
   AND EXTRACT(YEAR FROM data_entrada) = EXTRACT(YEAR FROM NOW())
   AND client_name IN (
     SELECT DISTINCT client_name 
     FROM public.ordens_servico 
     WHERE data_entrada < DATE_TRUNC('month', NOW())
   )
  ) as retorno_mes,
  
  -- Valor para sair hoje (OSs prontas)
  (SELECT COALESCE(SUM(valor_aprovado), 0)
   FROM public.ordens_servico
   WHERE posicao_patio = 'pronto'
   OR status = 'concluido'
  ) as valor_sair_hoje,
  
  -- Cancelados no mês
  (SELECT COUNT(*)
   FROM public.ordens_servico
   WHERE status = 'recusado'
   AND EXTRACT(MONTH FROM updated_at) = EXTRACT(MONTH FROM NOW())
   AND EXTRACT(YEAR FROM updated_at) = EXTRACT(YEAR FROM NOW())
  ) as cancelados_mes,
  
  -- Ocupação do pátio
  (SELECT COUNT(*) 
   FROM public.ordens_servico 
   WHERE status NOT IN ('entregue', 'cancelado')
  ) as veiculos_patio,
  
  -- Elevadores ocupados
  (SELECT COUNT(DISTINCT elevador)
   FROM public.ordens_servico
   WHERE elevador IS NOT NULL
   AND status NOT IN ('entregue', 'cancelado')
  ) as elevadores_ocupados,
  
  -- Boxes ocupados
  (SELECT COUNT(DISTINCT box)
   FROM public.ordens_servico
   WHERE box IS NOT NULL
   AND status NOT IN ('entregue', 'cancelado')
  ) as boxes_ocupados;

-- Atualizar OSs existentes com valores padrão baseados no status atual
UPDATE public.ordens_servico
SET posicao_patio = CASE
  WHEN status = 'orcamento' THEN 'aguardando_orcamento'
  WHEN status = 'aprovado' THEN 'aguardando_pecas'
  WHEN status = 'em_execucao' THEN 'em_execucao'
  WHEN status = 'concluido' THEN 'pronto'
  WHEN status = 'entregue' THEN 'entregue'
  ELSE 'entrada'
END
WHERE posicao_patio IS NULL OR posicao_patio = 'entrada';

-- Grant permissions para as views
GRANT SELECT ON public.patio_overview TO authenticated;
GRANT SELECT ON public.dashboard_indicators TO authenticated;
