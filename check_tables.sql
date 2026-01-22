-- Verificar se as tabelas do sistema de pátio/workflow existem
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'public' AND table_name = t.table_name) as num_columns
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_name IN (
    'ordens_servico',
    'workflow_etapas',
    'mechanics',
    'oficina_config',
    'kommo_config',
    'kommo_os_mapping',
    'companies',
    'user_company_access',
    'invite_codes'
  )
ORDER BY table_name;
