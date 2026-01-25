-- =====================================================
-- LIMPAR E RECRIAR TABELAS KOMMO
-- =====================================================
-- ATENÇÃO: Este script vai DELETAR todas as tabelas Kommo existentes
-- Execute apenas se tiver certeza!
-- =====================================================

-- PASSO 1: REMOVER TABELAS EXISTENTES (se existirem)
-- =====================================================

DROP TABLE IF EXISTS kommo_webhooks CASCADE;
DROP TABLE IF EXISTS kommo_sync_log CASCADE;
DROP TABLE IF EXISTS kommo_contact_mapping CASCADE;
DROP TABLE IF EXISTS kommo_os_mapping CASCADE;
DROP TABLE IF EXISTS kommo_config CASCADE;

-- PASSO 2: REMOVER FUNÇÃO (se existir)
-- =====================================================

DROP FUNCTION IF EXISTS cleanup_old_kommo_logs();

-- =====================================================
-- PASSO 3: RECRIAR TODAS AS TABELAS
-- =====================================================

-- 1. TABELA DE CONFIGURAÇÃO
-- =====================================================
CREATE TABLE kommo_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subdomain TEXT NOT NULL,
    client_id TEXT NOT NULL,
    client_secret TEXT NOT NULL,
    redirect_uri TEXT NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_kommo_config_active ON kommo_config(is_active) WHERE is_active = true;

-- RLS
ALTER TABLE kommo_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Apenas admins podem gerenciar config Kommo"
    ON kommo_config
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_roles.user_id = auth.uid()
            AND user_roles.role::text IN ('admin', 'gestao', 'dev')
        )
    );

-- =====================================================
-- 2. MAPEAMENTO OS → LEAD
-- =====================================================
CREATE TABLE kommo_os_mapping (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    os_id UUID NOT NULL,
    kommo_lead_id BIGINT NOT NULL,
    synced_at TIMESTAMPTZ DEFAULT NOW(),
    last_sync_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(os_id),
    UNIQUE(kommo_lead_id)
);

-- Índices
CREATE INDEX idx_kommo_os_mapping_os ON kommo_os_mapping(os_id);
CREATE INDEX idx_kommo_os_mapping_lead ON kommo_os_mapping(kommo_lead_id);

-- RLS
ALTER TABLE kommo_os_mapping ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos podem ver mapeamentos"
    ON kommo_os_mapping
    FOR SELECT
    USING (true);

CREATE POLICY "Apenas sistema pode criar/atualizar mapeamentos"
    ON kommo_os_mapping
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_roles.user_id = auth.uid()
            AND user_roles.role::text IN ('admin', 'gestao', 'dev')
        )
    );

-- =====================================================
-- 3. MAPEAMENTO CLIENTE → CONTATO
-- =====================================================
CREATE TABLE kommo_contact_mapping (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_phone TEXT NOT NULL,
    client_name TEXT,
    kommo_contact_id BIGINT NOT NULL,
    synced_at TIMESTAMPTZ DEFAULT NOW(),
    last_sync_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(client_phone),
    UNIQUE(kommo_contact_id)
);

-- Índices
CREATE INDEX idx_kommo_contact_mapping_phone ON kommo_contact_mapping(client_phone);
CREATE INDEX idx_kommo_contact_mapping_contact ON kommo_contact_mapping(kommo_contact_id);

-- RLS
ALTER TABLE kommo_contact_mapping ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos podem ver mapeamentos de contatos"
    ON kommo_contact_mapping
    FOR SELECT
    USING (true);

CREATE POLICY "Apenas sistema pode criar/atualizar contatos"
    ON kommo_contact_mapping
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_roles.user_id = auth.uid()
            AND user_roles.role::text IN ('admin', 'gestao', 'dev')
        )
    );

-- =====================================================
-- 4. LOG DE SINCRONIZAÇÕES
-- =====================================================
CREATE TABLE kommo_sync_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    os_id UUID,
    action TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('success', 'error')),
    error_message TEXT,
    request_data JSONB,
    response_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_kommo_sync_log_os ON kommo_sync_log(os_id);
CREATE INDEX idx_kommo_sync_log_status ON kommo_sync_log(status);
CREATE INDEX idx_kommo_sync_log_created ON kommo_sync_log(created_at DESC);

-- RLS
ALTER TABLE kommo_sync_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins podem ver logs"
    ON kommo_sync_log
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_roles.user_id = auth.uid()
            AND user_roles.role::text IN ('admin', 'gestao', 'dev')
        )
    );

CREATE POLICY "Sistema pode criar logs"
    ON kommo_sync_log
    FOR INSERT
    WITH CHECK (true);

-- =====================================================
-- 5. WEBHOOKS RECEBIDOS
-- =====================================================
CREATE TABLE kommo_webhooks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    processed BOOLEAN DEFAULT false,
    processed_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_kommo_webhooks_processed ON kommo_webhooks(processed) WHERE processed = false;
CREATE INDEX idx_kommo_webhooks_created ON kommo_webhooks(created_at DESC);

-- RLS
ALTER TABLE kommo_webhooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins podem ver webhooks"
    ON kommo_webhooks
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_roles.user_id = auth.uid()
            AND user_roles.role::text IN ('admin', 'gestao', 'dev')
        )
    );

CREATE POLICY "Sistema pode criar webhooks"
    ON kommo_webhooks
    FOR INSERT
    WITH CHECK (true);

-- =====================================================
-- 6. FUNÇÃO PARA LIMPAR LOGS ANTIGOS
-- =====================================================
CREATE OR REPLACE FUNCTION cleanup_old_kommo_logs()
RETURNS void AS $$
BEGIN
    DELETE FROM kommo_sync_log
    WHERE created_at < NOW() - INTERVAL '90 days';
    
    DELETE FROM kommo_webhooks
    WHERE created_at < NOW() - INTERVAL '90 days'
    AND processed = true;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 7. COMENTÁRIOS
-- =====================================================
COMMENT ON TABLE kommo_config IS 'Configuração OAuth e credenciais da integração Kommo';
COMMENT ON TABLE kommo_os_mapping IS 'Mapeamento entre OSs locais e Leads no Kommo';
COMMENT ON TABLE kommo_contact_mapping IS 'Mapeamento entre Clientes locais e Contatos no Kommo';
COMMENT ON TABLE kommo_sync_log IS 'Log de todas as sincronizações realizadas';
COMMENT ON TABLE kommo_webhooks IS 'Webhooks recebidos do Kommo para processamento';

-- =====================================================
-- ✅ VERIFICAÇÃO FINAL
-- =====================================================
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'public' AND table_name = t.table_name) as num_columns
FROM information_schema.tables t
WHERE table_schema = 'public' 
AND table_name LIKE 'kommo%'
ORDER BY table_name;

-- Deve retornar 5 tabelas:
-- kommo_config (10 colunas)
-- kommo_contact_mapping (6 colunas)
-- kommo_os_mapping (6 colunas)
-- kommo_sync_log (8 colunas)
-- kommo_webhooks (7 colunas)
-- =====================================================
