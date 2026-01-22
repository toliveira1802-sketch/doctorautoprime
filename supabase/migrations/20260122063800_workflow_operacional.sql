-- =====================================================
-- MIGRATION: Dashboard Operacional - Workflow & Config
-- =====================================================
-- Criação das tabelas necessárias para o AdminOperacional
-- Data: 2026-01-22

-- =====================================================
-- 1. TABELA: workflow_etapas
-- =====================================================
-- Etapas do fluxo de trabalho da oficina
CREATE TABLE IF NOT EXISTS workflow_etapas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(100) NOT NULL,
  ordem INTEGER NOT NULL UNIQUE,
  cor VARCHAR(20) NOT NULL DEFAULT '#3B82F6',
  icone VARCHAR(50) NOT NULL DEFAULT 'clock',
  descricao TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_workflow_etapas_ordem ON workflow_etapas(ordem);
CREATE INDEX IF NOT EXISTS idx_workflow_etapas_active ON workflow_etapas(is_active);

-- =====================================================
-- 2. TABELA: mechanics
-- =====================================================
-- Cadastro de mecânicos da oficina
CREATE TABLE IF NOT EXISTS mechanics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  specialty VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_mechanics_active ON mechanics(is_active);
CREATE INDEX IF NOT EXISTS idx_mechanics_name ON mechanics(name);

-- =====================================================
-- 3. TABELA: oficina_config
-- =====================================================
-- Configurações gerais da oficina
CREATE TABLE IF NOT EXISTS oficina_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  capacidade_maxima INTEGER NOT NULL DEFAULT 20,
  tempo_medio_diagnostico_dias DECIMAL(4,2) DEFAULT 1.5,
  tempo_medio_execucao_dias DECIMAL(4,2) DEFAULT 3.2,
  dias_alerta_atraso INTEGER DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 4. DADOS INICIAIS: workflow_etapas
-- =====================================================
-- Inserir etapas padrão do fluxo de trabalho
INSERT INTO workflow_etapas (nome, ordem, cor, icone, descricao) VALUES
  ('Diagnóstico', 1, '#3B82F6', 'search', 'Análise inicial do problema'),
  ('Orçamento', 2, '#8B5CF6', 'file-text', 'Elaboração do orçamento'),
  ('Aguard. Aprovação', 3, '#F59E0B', 'clock', 'Aguardando aprovação do cliente'),
  ('Aguard. Peças', 4, '#EF4444', 'package', 'Aguardando chegada de peças'),
  ('Pronto p/ Iniciar', 5, '#10B981', 'check-circle', 'Pronto para iniciar serviço'),
  ('Em Execução', 6, '#06B6D4', 'wrench', 'Serviço em andamento'),
  ('Pronto p/ Retirada', 7, '#22C55E', 'car', 'Veículo pronto para retirada')
ON CONFLICT (ordem) DO NOTHING;

-- =====================================================
-- 5. DADOS INICIAIS: oficina_config
-- =====================================================
-- Inserir configuração padrão
INSERT INTO oficina_config (capacidade_maxima, tempo_medio_diagnostico_dias, tempo_medio_execucao_dias, dias_alerta_atraso)
VALUES (20, 1.5, 3.2, 5)
ON CONFLICT DO NOTHING;

-- =====================================================
-- 6. DADOS INICIAIS: mechanics (exemplos)
-- =====================================================
-- Inserir mecânicos de exemplo
INSERT INTO mechanics (name, specialty, is_active) VALUES
  ('João Silva', 'Mecânica Geral', true),
  ('Carlos Santos', 'Elétrica Automotiva', true),
  ('Pedro Oliveira', 'Suspensão e Freios', true),
  ('Lucas Ferreira', 'Motor e Injeção', true)
ON CONFLICT DO NOTHING;

-- =====================================================
-- 7. RLS (Row Level Security)
-- =====================================================
-- Habilitar RLS nas tabelas
ALTER TABLE workflow_etapas ENABLE ROW LEVEL SECURITY;
ALTER TABLE mechanics ENABLE ROW LEVEL SECURITY;
ALTER TABLE oficina_config ENABLE ROW LEVEL SECURITY;

-- Políticas: Permitir leitura para usuários autenticados
CREATE POLICY "workflow_etapas_read" ON workflow_etapas FOR SELECT TO authenticated USING (true);
CREATE POLICY "mechanics_read" ON mechanics FOR SELECT TO authenticated USING (true);
CREATE POLICY "oficina_config_read" ON oficina_config FOR SELECT TO authenticated USING (true);

-- Políticas: Permitir escrita apenas para admins/gestão
CREATE POLICY "workflow_etapas_write" ON workflow_etapas FOR ALL TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role IN ('dev', 'gestao', 'admin')
    )
  );

CREATE POLICY "mechanics_write" ON mechanics FOR ALL TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role IN ('dev', 'gestao', 'admin')
    )
  );

CREATE POLICY "oficina_config_write" ON oficina_config FOR ALL TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.user_id = auth.uid() 
      AND profiles.role IN ('dev', 'gestao')
    )
  );

-- =====================================================
-- 8. TRIGGERS: updated_at
-- =====================================================
-- Atualizar automaticamente o campo updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER workflow_etapas_updated_at BEFORE UPDATE ON workflow_etapas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER mechanics_updated_at BEFORE UPDATE ON mechanics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER oficina_config_updated_at BEFORE UPDATE ON oficina_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
