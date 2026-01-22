-- Sistema de IA Híbrida - Base de Conhecimento
-- Data: 2026-01-22

-- Tabela de diagnósticos validados (base de conhecimento para RAG)
CREATE TABLE public.diagnosticos_ia (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Entrada (sintomas/problema)
  sintomas TEXT NOT NULL,
  sintomas_normalizados TEXT, -- versão limpa para busca
  categoria TEXT, -- freio, motor, suspensao, eletrica, etc
  
  -- Diagnóstico
  diagnostico TEXT NOT NULL,
  causa_provavel TEXT,
  
  -- Solução
  solucao TEXT NOT NULL,
  pecas_necessarias TEXT[] DEFAULT '{}',
  servicos_necessarios TEXT[] DEFAULT '{}',
  
  -- Estimativas
  tempo_estimado_horas NUMERIC,
  custo_estimado_pecas NUMERIC,
  custo_estimado_servico NUMERIC,
  
  -- Prioridade sugerida
  prioridade_sugerida TEXT, -- baixa, media, alta, urgente
  
  -- Validação
  validado BOOLEAN DEFAULT false,
  validado_por UUID REFERENCES auth.users(id),
  validado_em TIMESTAMP WITH TIME ZONE,
  feedback_mecanico TEXT,
  
  -- Uso e efetividade
  vezes_usado INTEGER DEFAULT 0,
  taxa_acerto NUMERIC DEFAULT 0, -- 0 a 1
  
  -- Metadados
  origem TEXT DEFAULT 'manual', -- manual, ia, importacao
  modelo_ia TEXT, -- qual modelo gerou (se origem=ia)
  confianca NUMERIC, -- confiança da IA (0 a 1)
  
  -- Auditoria
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Tabela de sugestões da IA (histórico)
CREATE TABLE public.sugestoes_ia (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Referência
  ordem_servico_id UUID REFERENCES public.ordens_servico(id) ON DELETE CASCADE,
  diagnostico_ia_id UUID REFERENCES public.diagnosticos_ia(id),
  
  -- Input
  sintomas_input TEXT NOT NULL,
  contexto JSONB, -- dados adicionais (histórico do cliente, veículo, etc)
  
  -- Output da IA
  sugestao_diagnostico TEXT,
  sugestao_solucao TEXT,
  sugestao_pecas TEXT[],
  sugestao_prioridade TEXT,
  confianca NUMERIC,
  
  -- Modelo usado
  modelo_ia TEXT NOT NULL, -- ollama:llama3, openai:gpt-4, gemini:pro, etc
  tempo_resposta_ms INTEGER,
  
  -- Feedback
  aceita BOOLEAN,
  feedback_mecanico TEXT,
  diagnostico_real TEXT,
  
  -- Auditoria
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Tabela de regras automáticas
CREATE TABLE public.regras_automacao (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  
  nome TEXT NOT NULL,
  descricao TEXT,
  tipo TEXT NOT NULL, -- prioridade, alerta, validacao, calculo
  
  -- Condições (JSON)
  condicoes JSONB NOT NULL,
  -- Exemplo: {"campo": "tempo_no_patio_horas", "operador": ">", "valor": 48}
  
  -- Ações (JSON)
  acoes JSONB NOT NULL,
  -- Exemplo: {"campo": "prioridade", "valor": "urgente"}
  
  -- Controle
  ativa BOOLEAN DEFAULT true,
  ordem_execucao INTEGER DEFAULT 0,
  
  -- Auditoria
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Índices para performance
CREATE INDEX idx_diagnosticos_ia_categoria ON public.diagnosticos_ia(categoria);
CREATE INDEX idx_diagnosticos_ia_validado ON public.diagnosticos_ia(validado);
CREATE INDEX idx_diagnosticos_ia_sintomas ON public.diagnosticos_ia USING gin(to_tsvector('portuguese', sintomas));
CREATE INDEX idx_sugestoes_ia_os ON public.sugestoes_ia(ordem_servico_id);
CREATE INDEX idx_sugestoes_ia_aceita ON public.sugestoes_ia(aceita);
CREATE INDEX idx_regras_automacao_tipo ON public.regras_automacao(tipo) WHERE ativa = true;

-- Trigger para atualizar updated_at
CREATE TRIGGER update_diagnosticos_ia_updated_at
  BEFORE UPDATE ON public.diagnosticos_ia
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_regras_automacao_updated_at
  BEFORE UPDATE ON public.regras_automacao
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Função para buscar diagnósticos similares (RAG)
CREATE OR REPLACE FUNCTION public.buscar_diagnosticos_similares(
  p_sintomas TEXT,
  p_limite INTEGER DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  sintomas TEXT,
  diagnostico TEXT,
  solucao TEXT,
  pecas_necessarias TEXT[],
  tempo_estimado_horas NUMERIC,
  similaridade NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.id,
    d.sintomas,
    d.diagnostico,
    d.solucao,
    d.pecas_necessarias,
    d.tempo_estimado_horas,
    similarity(d.sintomas, p_sintomas) as similaridade
  FROM public.diagnosticos_ia d
  WHERE d.validado = true
  AND similarity(d.sintomas, p_sintomas) > 0.3
  ORDER BY similaridade DESC
  LIMIT p_limite;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para aplicar regras automáticas
CREATE OR REPLACE FUNCTION public.aplicar_regras_automacao(
  p_ordem_servico_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_os RECORD;
  v_regra RECORD;
  v_resultado JSONB := '[]'::jsonb;
  v_condicao_atendida BOOLEAN;
BEGIN
  -- Busca a OS
  SELECT * INTO v_os FROM public.ordens_servico WHERE id = p_ordem_servico_id;
  
  -- Aplica cada regra ativa
  FOR v_regra IN 
    SELECT * FROM public.regras_automacao 
    WHERE ativa = true 
    ORDER BY ordem_execucao
  LOOP
    -- Aqui você implementaria a lógica de avaliação das condições
    -- Por simplicidade, vou deixar um placeholder
    v_condicao_atendida := true;
    
    IF v_condicao_atendida THEN
      v_resultado := v_resultado || jsonb_build_object(
        'regra_id', v_regra.id,
        'regra_nome', v_regra.nome,
        'acoes', v_regra.acoes
      );
    END IF;
  END LOOP;
  
  RETURN v_resultado;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS
ALTER TABLE public.diagnosticos_ia ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sugestoes_ia ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regras_automacao ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admin e gestao podem ver diagnósticos"
  ON public.diagnosticos_ia FOR SELECT
  USING (public.has_admin_access());

CREATE POLICY "Admin e gestao podem criar diagnósticos"
  ON public.diagnosticos_ia FOR INSERT
  WITH CHECK (public.has_admin_access());

CREATE POLICY "Admin e gestao podem atualizar diagnósticos"
  ON public.diagnosticos_ia FOR UPDATE
  USING (public.has_admin_access());

CREATE POLICY "Admin e gestao podem ver sugestões"
  ON public.sugestoes_ia FOR SELECT
  USING (public.has_admin_access());

CREATE POLICY "Admin e gestao podem criar sugestões"
  ON public.sugestoes_ia FOR INSERT
  WITH CHECK (public.has_admin_access());

CREATE POLICY "Admin e gestao podem gerenciar regras"
  ON public.regras_automacao FOR ALL
  USING (public.has_admin_access());

-- Inserir regras padrão
INSERT INTO public.regras_automacao (nome, descricao, tipo, condicoes, acoes, ordem_execucao) VALUES
('Prioridade Alta - Cliente VIP', 'Aumenta prioridade para clientes VIP', 'prioridade', 
 '{"campo": "tags", "operador": "contains", "valor": "vip"}'::jsonb,
 '{"campo": "prioridade", "valor": "alta"}'::jsonb,
 1),
 
('Prioridade Urgente - Tempo no Pátio', 'Marca como urgente após 48h no pátio', 'prioridade',
 '{"campo": "tempo_no_patio_horas", "operador": ">", "valor": 48}'::jsonb,
 '{"campo": "prioridade", "valor": "urgente"}'::jsonb,
 2),
 
('Prioridade Alta - Valor Alto', 'Aumenta prioridade para OSs acima de R$ 5000', 'prioridade',
 '{"campo": "valor_aprovado", "operador": ">", "valor": 5000}'::jsonb,
 '{"campo": "prioridade", "valor": "alta"}'::jsonb,
 3),

('Alerta - Aguardando Peças', 'Alerta quando veículo está há mais de 24h aguardando peças', 'alerta',
 '{"campo": "posicao_patio", "operador": "=", "valor": "aguardando_pecas", "tempo_horas": 24}'::jsonb,
 '{"tipo": "alerta", "mensagem": "Veículo aguardando peças há mais de 24h"}'::jsonb,
 4);

-- Inserir alguns diagnósticos exemplo
INSERT INTO public.diagnosticos_ia (
  sintomas, categoria, diagnostico, solucao, 
  pecas_necessarias, tempo_estimado_horas, 
  prioridade_sugerida, validado, origem
) VALUES
('Barulho ao frear, pedal vibrando', 'freio', 
 'Pastilhas de freio desgastadas e disco empenado', 
 'Substituir pastilhas e retificar ou trocar discos',
 ARRAY['Jogo de pastilhas', 'Discos de freio (se necessário)'],
 2.5, 'alta', true, 'manual'),

('Motor falhando em marcha lenta', 'motor',
 'Velas de ignição desgastadas ou bobina com defeito',
 'Verificar velas e bobina, substituir se necessário',
 ARRAY['Jogo de velas', 'Bobina de ignição'],
 1.5, 'media', true, 'manual'),

('Ar condicionado não gela', 'ar_condicionado',
 'Gás refrigerante baixo ou compressor com defeito',
 'Verificar vazamentos, recarregar gás, testar compressor',
 ARRAY['Gás R134a', 'Óleo do compressor'],
 2.0, 'media', true, 'manual');

COMMENT ON TABLE public.diagnosticos_ia IS 'Base de conhecimento de diagnósticos validados para sistema RAG';
COMMENT ON TABLE public.sugestoes_ia IS 'Histórico de sugestões geradas pela IA';
COMMENT ON TABLE public.regras_automacao IS 'Regras automáticas para priorização e alertas';
