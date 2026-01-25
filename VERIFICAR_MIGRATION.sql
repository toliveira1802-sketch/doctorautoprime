-- =====================================================
-- QUERY DE VERIFICAÇÃO - MIGRATION KOMMO
-- =====================================================
-- Execute esta query APÓS aplicar a migration
-- para verificar se tudo foi criado corretamente
-- =====================================================

-- 1. VERIFICAR TABELAS CRIADAS
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'kommo%'
ORDER BY table_name;

-- Resultado esperado: 5 tabelas
-- kommo_config
-- kommo_contact_mapping
-- kommo_os_mapping
-- kommo_sync_log
-- kommo_webhooks

-- =====================================================

-- 2. VERIFICAR COLUNAS DA TABELA kommo_config
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'kommo_config'
ORDER BY ordinal_position;

-- =====================================================

-- 3. VERIFICAR ÍNDICES CRIADOS
SELECT 
    indexname,
    tablename
FROM pg_indexes
WHERE tablename LIKE 'kommo%'
ORDER BY tablename, indexname;

-- =====================================================

-- 4. VERIFICAR POLÍTICAS RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename LIKE 'kommo%'
ORDER BY tablename, policyname;

-- =====================================================

-- 5. VERIFICAR FUNÇÃO DE LIMPEZA
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_name = 'cleanup_old_kommo_logs';

-- =====================================================

-- 6. TESTAR INSERÇÃO (OPCIONAL)
-- Descomente para testar se as tabelas estão funcionando

-- INSERT INTO kommo_config (subdomain, client_id, client_secret, redirect_uri)
-- VALUES ('teste', 'test-id', 'test-secret', 'http://localhost/callback');

-- SELECT * FROM kommo_config;

-- DELETE FROM kommo_config WHERE subdomain = 'teste';

-- =====================================================
-- ✅ SE TUDO RETORNAR DADOS, A MIGRATION FOI APLICADA COM SUCESSO!
-- =====================================================
